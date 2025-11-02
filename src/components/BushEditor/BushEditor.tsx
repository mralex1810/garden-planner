import { useState, useEffect, useCallback } from 'react'
import { db, Bush, Plant } from '../../db'
import PlantSelector from '../PlantSelector/PlantSelector'
import HistoryTimeline from '../HistoryTimeline/HistoryTimeline'
import './BushEditor.css'

interface BushEditorProps {
  bushId: number
  onClose: () => void
  onUpdate: () => void
}

export default function BushEditor({ bushId, onClose, onUpdate }: BushEditorProps) {
  const [bush, setBush] = useState<Bush | null>(null)
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [showPlantSelector, setShowPlantSelector] = useState(false)
  const [notes, setNotes] = useState('')

  const loadPlants = useCallback(async () => {
    const allPlants = await db.plants.toArray()
    setPlants(allPlants)
  }, [])

  useEffect(() => {
    loadBush()
    loadPlants()
  }, [bushId, loadPlants])

  // Перезагружаем растения каждый раз при открытии селектора
  useEffect(() => {
    if (showPlantSelector) {
      loadPlants()
    }
  }, [showPlantSelector, loadPlants])

  // Слушаем события обновления растений от PlantManager
  useEffect(() => {
    const handlePlantsUpdate = () => {
      loadPlants()
    }
    
    window.addEventListener('plantsUpdate', handlePlantsUpdate)
    
    return () => {
      window.removeEventListener('plantsUpdate', handlePlantsUpdate)
    }
  }, [loadPlants])

  const loadBush = async () => {
    const bushData = await db.bushes.get(bushId)
    if (bushData) {
      setBush(bushData)
      setNotes(bushData.notes || '')
      
      if (bushData.plantId) {
        const plant = await db.plants.get(bushData.plantId)
        setSelectedPlant(plant || null)
      }
    }
  }

  const handlePlantSelect = async (plantId: string) => {
    await db.bushes.update(bushId, {
      plantId,
      updatedAt: Date.now()
    })
    const plant = await db.plants.get(plantId)
    setSelectedPlant(plant || null)
    setShowPlantSelector(false)
    onUpdate()
    
    // Reload canvas to show updated emoji
    if (window.location) {
      // Force canvas reload by triggering a custom event
      window.dispatchEvent(new CustomEvent('gardenUpdate'))
    }
  }

  const handleNotesSave = async () => {
    await db.bushes.update(bushId, {
      notes,
      updatedAt: Date.now()
    })
    onUpdate()
  }

  const handlePlanPlant = async (plantId: string, plannedDate: number) => {
    await db.bushes.update(bushId, {
      plannedPlantId: plantId,
      plannedDate,
      updatedAt: Date.now()
    })
    onUpdate()
    loadBush()
  }

  if (!bush) {
    return <div className="bush-editor">Загрузка...</div>
  }

  return (
    <div className="bush-editor">
      <div className="bush-editor-header">
        <h3>Редактирование куста</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="bush-editor-content">
        <div className="bush-section">
          <h4>Текущее растение</h4>
          {selectedPlant ? (
            <div className="current-plant">
              <span className="plant-emoji">{selectedPlant.emoji}</span>
              <span className="plant-name">{selectedPlant.nameRu}</span>
              <button
                className="change-plant-btn"
                onClick={() => setShowPlantSelector(true)}
              >
                Изменить
              </button>
            </div>
          ) : (
            <button
              className="select-plant-btn"
              onClick={() => setShowPlantSelector(true)}
            >
              Выбрать растение
            </button>
          )}
        </div>

        <div className="bush-section">
          <h4>Запланированная посадка</h4>
          {bush.plannedPlantId && bush.plannedDate ? (
            <div className="planned-plant">
              <span>
                {plants.find(p => p.id === bush.plannedPlantId)?.emoji} 
                {plants.find(p => p.id === bush.plannedPlantId)?.nameRu}
              </span>
              <span className="planned-date">
                {new Date(bush.plannedDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          ) : (
            <PlanPlantForm bushId={bushId} onPlan={handlePlanPlant} plants={plants} />
          )}
        </div>

        <div className="bush-section">
          <h4>Заметки</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesSave}
            placeholder="Добавьте заметки о кусте..."
            rows={4}
          />
        </div>

        <div className="bush-section">
          <h4>История ухода</h4>
          <HistoryTimeline bedId={bushId} />
        </div>
      </div>

      {showPlantSelector && (
        <PlantSelector
          plants={plants}
          onSelect={handlePlantSelect}
          onClose={() => setShowPlantSelector(false)}
          growthType="bush"
        />
      )}
    </div>
  )
}

function PlanPlantForm({ bushId, onPlan, plants }: { bushId: number; onPlan: (plantId: string, date: number) => void; plants: Plant[] }) {
  const [plantId, setPlantId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (plantId && date) {
      onPlan(plantId, new Date(date).getTime())
      setPlantId('')
      setDate(new Date().toISOString().split('T')[0])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="plan-form">
      <select value={plantId} onChange={(e) => setPlantId(e.target.value)} required>
        <option value="">Выберите растение</option>
        {plants.map(plant => (
          <option key={plant.id} value={plant.id}>
            {plant.emoji} {plant.nameRu}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <button type="submit">Запланировать</button>
    </form>
  )
}

