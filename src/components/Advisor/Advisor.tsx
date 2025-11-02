import { useState, useEffect } from 'react'
import { db, Bed, Plant, GardenObject, CareHistory, PlantingPlan } from '../../db'
import './Advisor.css'

export default function Advisor() {
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    analyze()
  }, [])

  const analyze = async () => {
    setIsAnalyzing(true)
    try {
      const beds = await db.beds.toArray()
      const allObjects = await db.objects.toArray()
      const allPlants = await db.plants.toArray()
      const allPlans = await db.plans.toArray()

      const bedsWithDetails = await Promise.all(
        beds.map(async (bed) => {
          const object = allObjects.find(o => o.id === bed.objectId)
          const plant = bed.plantId ? allPlants.find(p => p.id === bed.plantId) : null
          const neighbors = await getNeighbors(bed.objectId, allObjects, beds, allPlants)
          
          // Получаем историю ухода для этой грядки
          const careHistory = await db.careHistory
            .where('bedId')
            .equals(bed.id!)
            .toArray()
          
          // Получаем планы посадки для этой грядки
          const plantingPlans = allPlans.filter(p => p.bedId === bed.id!)
          
          return {
            bed,
            object,
            plant,
            neighbors,
            careHistory,
            plantingPlans
          }
        })
      )

      const newRecommendations: string[] = []
      const newWarnings: string[] = []

      // Проверка совместимости соседей
      bedsWithDetails.forEach(({ bed, plant, neighbors }) => {
        if (!plant) return

        neighbors.forEach(neighbor => {
          if (neighbor.plant) {
            // Проверка несовместимости
            if (plant.incompatibleWith?.includes(neighbor.plant.id)) {
              newWarnings.push(
                `⚠️ ${plant.nameRu} несовместим с ${neighbor.plant.nameRu} на соседней грядке. Рекомендуется пересадить одно из растений.`
              )
            }
            
            // Проверка хороших соседей
            if (plant.goodNeighbors?.includes(neighbor.plant.id)) {
              newRecommendations.push(
                `✓ ${plant.nameRu} хорошо сочетается с ${neighbor.plant.nameRu}. Отличное соседство!`
              )
            }
          }
        })
      })

      // Проверка севооборота
      for (const { bed, plant, careHistory } of bedsWithDetails) {
        if (!plant || !bed.id) continue

        const plantingHistory = careHistory.filter(h => h.type === 'plant')
        if (plantingHistory.length > 0) {
          // Сортируем по дате посадки (от новых к старым)
          const sortedPlantings = plantingHistory.sort((a, b) => b.date - a.date)
          
          // Проверяем, не сажали ли то же растение недавно (в течение последнего сезона)
          const recentPlantings = sortedPlantings.filter(
            p => Date.now() - p.date < 90 * 24 * 60 * 60 * 1000 // последние 90 дней
          )
          
          if (recentPlantings.length > 0) {
            const lastPlanting = recentPlantings[0]
            // Предупреждение, если сажаем то же растение повторно
            newWarnings.push(
              `⚠️ На грядке недавно уже сажали растение (${new Date(lastPlanting.date).toLocaleDateString('ru-RU')}). Рекомендуется соблюдать севооборот.`
            )
          }
        }
      }

      // Проверка запланированных посадок из таблицы plans
      for (const plan of allPlans) {
        const bed = beds.find(b => b.id === plan.bedId)
        if (!bed) continue
        
        const plannedPlant = allPlants.find(p => p.id === plan.plantId)
        if (!plannedPlant) continue

        // Проверяем, не истекла ли дата планируемой посадки
        if (plan.plannedDate < Date.now()) {
          if (bed.plantId !== plan.plantId) {
            newWarnings.push(
              `⚠️ Планируемая посадка ${plannedPlant.nameRu} на грядке должна была быть выполнена ${new Date(plan.plannedDate).toLocaleDateString('ru-RU')}.`
            )
          }
        } else {
          // Будущая посадка - проверяем совместимость
          const currentPlant = bed.plantId ? allPlants.find(p => p.id === bed.plantId) : null
          if (currentPlant) {
            if (currentPlant.incompatibleWith?.includes(plan.plantId)) {
              newWarnings.push(
                `⚠️ Запланированная посадка ${plannedPlant.nameRu} несовместима с текущим растением ${currentPlant.nameRu} на грядке.`
              )
            }
          }
        }
      }

      // Проверка запланированных посадок из полей Bed (для обратной совместимости)
      bedsWithDetails.forEach(({ bed, plant }) => {
        if (bed.plannedPlantId && bed.plannedDate) {
          const plannedPlant = allPlants.find(p => p.id === bed.plannedPlantId)
          if (!plannedPlant) return

          // Проверяем, не истекла ли дата
          if (bed.plannedDate < Date.now()) {
            if (bed.plantId !== bed.plannedPlantId) {
              newWarnings.push(
                `⚠️ Планируемая посадка ${plannedPlant.nameRu} должна была быть выполнена ${new Date(bed.plannedDate).toLocaleDateString('ru-RU')}.`
              )
            } else {
              newRecommendations.push(
                `✓ План посадки ${plannedPlant.nameRu} выполнен вовремя!`
              )
            }
          } else {
            // Будущая посадка
            if (plant && plant.incompatibleWith?.includes(bed.plannedPlantId)) {
              newWarnings.push(
                `⚠️ Запланированная посадка ${plannedPlant.nameRu} несовместима с текущим растением ${plant.nameRu} на грядке.`
              )
            }
          }
        }
      })

      // Проверка пустых грядок
      const emptyBeds = bedsWithDetails.filter(({ plant }) => !plant)
      if (emptyBeds.length > 0) {
        newRecommendations.push(
          `💡 У вас ${emptyBeds.length} пустых грядок. Время для новых посадок!`
        )
      }

      setRecommendations(newRecommendations)
      setWarnings(newWarnings)
    } catch (error) {
      console.error('Error analyzing:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getNeighbors = async (
    objectId: number,
    allObjects: GardenObject[],
    allBeds: Bed[],
    allPlants: Plant[]
  ): Promise<Array<{ bed: Bed; plant: Plant | null }>> => {
    const currentObject = allObjects.find(o => o.id === objectId)
    if (!currentObject) return []

    const neighbors: Array<{ bed: Bed; plant: Plant | null }> = []

    // Находим объекты в радиусе 5 метров
    const radius = 5
    const nearbyObjects = allObjects.filter(obj => {
      if (obj.id === objectId || obj.type !== 'bed') return false
      
      const distance = Math.sqrt(
        Math.pow(obj.x - currentObject.x, 2) + 
        Math.pow(obj.y - currentObject.y, 2)
      )
      return distance <= radius
    })

    for (const obj of nearbyObjects) {
      const bed = allBeds.find(b => b.objectId === obj.id)
      if (bed) {
        const plant = bed.plantId ? allPlants.find(p => p.id === bed.plantId) || null : null
        neighbors.push({ bed, plant })
      }
    }

    return neighbors
  }

  return (
    <div className="advisor">
      <div className="advisor-header">
        <h3>Советник по посадкам</h3>
        <button
          className="refresh-btn"
          onClick={analyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Анализ...' : '🔄 Обновить'}
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="warnings-section">
          <h4>⚠️ Предупреждения</h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 Рекомендации</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length === 0 && recommendations.length === 0 && !isAnalyzing && (
        <div className="no-advice">
          <p>Все в порядке! Нет рекомендаций или предупреждений.</p>
          <p className="hint">Советник проверяет совместимость растений, севооборот и планирование посадок.</p>
        </div>
      )}
    </div>
  )
}
