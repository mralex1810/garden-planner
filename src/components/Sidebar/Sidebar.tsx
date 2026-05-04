import { useState, useEffect } from 'react'
import { db, Garden, Bed, Bush, Plant, GardenObject } from '../../db'
import Advisor from '../Advisor/Advisor'
import SyncManager from '../SyncManager/SyncManager'
import PlantManager from '../PlantManager/PlantManager'
import './Sidebar.css'

interface SidebarProps {
  garden: Garden
  onUpdateGarden: (updates: Partial<Garden>) => void
  activeYear: number
}

type Tab = 'beds' | 'advisor' | 'sync' | 'plants' | 'settings'

const objectTypes: Record<string, { color: string; strokeColor: string; emoji: string; name: string }> = {
  bed: { color: '#8B4513', strokeColor: '#654321', emoji: '🟫', name: 'Грядка' },
  greenhouse: { color: '#2E7D32', strokeColor: '#1B5E20', emoji: '🏠', name: 'Теплица' },
  hotbed: { color: '#66BB6A', strokeColor: '#388E3C', emoji: '🌱', name: 'Парник' },
  barrel: { color: '#1976D2', strokeColor: '#0D47A1', emoji: '🪣', name: 'Бочка для воды' },
  well: { color: '#1565C0', strokeColor: '#0D47A1', emoji: '💧', name: 'Вода' },
  path: { color: '#757575', strokeColor: '#424242', emoji: '🛤️', name: 'Дорожка' },
  bush: { color: '#1B5E20', strokeColor: '#0D4014', emoji: '🌳', name: 'Куст' },
  rest: { color: '#F57C00', strokeColor: '#E65100', emoji: '🪑', name: 'Зона отдыха' },
  building: { color: '#795548', strokeColor: '#5D4037', emoji: '🏗️', name: 'Постройка' },
  flowers: { color: '#E91E63', strokeColor: '#C2185B', emoji: '🌸', name: 'Цветы' }
}

export default function Sidebar({ garden, onUpdateGarden, activeYear }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('beds')
  const [objects, setObjects] = useState<GardenObject[]>([])
  const [beds, setBeds] = useState<Map<number, Bed>>(new Map())
  const [bushes, setBushes] = useState<Map<number, Bush>>(new Map())
  const [plants, setPlants] = useState<Map<string, Plant>>(new Map())
  const [selectedBed, setSelectedBed] = useState<number | null>(null)
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null)
  const [editingNameId, setEditingNameId] = useState<number | null>(null)
  const [editingNameValue, setEditingNameValue] = useState<string>('')

  useEffect(() => {
    loadObjects()
  }, [activeYear])

  useEffect(() => {
    loadObjects()

    const handleObjectsUpdate = async () => {
      await loadObjects()
      // After loading, check if selectedObjectId still exists and update selectedBed if needed
      setSelectedObjectId(current => {
        if (current) {
          // Check if bed exists for this objectId
          db.beds.toArray().then(allBeds => {
            const bed = allBeds.find(b => b.objectId === current)
            if (bed?.id) {
              setSelectedBed(bed.id)
            }
          })
        }
        return current
      })
    }
    
    // Listen for canvas object selection
    const handleCanvasObjectSelected = async (e: Event) => {
      const customEvent = e as CustomEvent<{ objectId: number | null }>
      const objectId = customEvent.detail?.objectId
      setSelectedObjectId(objectId ?? null)
      
      // If the selected object is a bed, also set selectedBed
      if (objectId) {
        const allBeds = await db.beds.toArray()
        const bed = allBeds.find(b => b.objectId === objectId)
        if (bed?.id) {
          setSelectedBed(bed.id)
        } else {
          // If not a bed, clear selectedBed
          setSelectedBed(null)
        }
      } else {
        // Clear selection
        setSelectedBed(null)
      }
    }
    
    window.addEventListener('objectsUpdate', handleObjectsUpdate)
    window.addEventListener('gardenUpdate', handleObjectsUpdate)
    window.addEventListener('canvasObjectSelected', handleCanvasObjectSelected as EventListener)
    
    return () => {
      window.removeEventListener('objectsUpdate', handleObjectsUpdate)
      window.removeEventListener('gardenUpdate', handleObjectsUpdate)
      window.removeEventListener('canvasObjectSelected', handleCanvasObjectSelected as EventListener)
    }
  }, [])

  const loadObjects = async () => {
    const allObjects = await db.objects.toArray()
    setObjects(allObjects)

    const allBeds = await db.beds.where('year').equals(activeYear).toArray()
    const bedsMap = new Map<number, Bed>()
    allBeds.forEach(bed => {
      if (bed.objectId) {
        bedsMap.set(bed.objectId, bed)
      }
    })
    setBeds(bedsMap)

    const allBushes = await db.bushes.where('year').equals(activeYear).toArray()
    const bushesMap = new Map<number, Bush>()
    allBushes.forEach(bush => {
      if (bush.objectId) {
        bushesMap.set(bush.objectId, bush)
      }
    })
    setBushes(bushesMap)

    const allPlants = await db.plants.toArray()
    const plantsMap = new Map<string, Plant>()
    allPlants.forEach(plant => {
      plantsMap.set(plant.id, plant)
    })
    setPlants(plantsMap)
  }

  const handleObjectClick = (object: GardenObject, event: React.MouseEvent) => {
    // Prevent editing if clicking on name input
    if ((event.target as HTMLElement).tagName === 'INPUT') {
      return
    }
    
    // If it's a bed, select it to keep state in sync (editing opens via button)
    if (object.type === 'bed' && object.id) {
      const bed = beds.get(object.id)
      if (bed?.id) {
        setSelectedBed(bed.id)
        window.dispatchEvent(new CustomEvent('selectObject', { detail: { objectId: object.id } }))
      }
    } else {
      // For other objects, try to select them on canvas
      window.dispatchEvent(new CustomEvent('selectObject', { detail: { objectId: object.id } }))
    }
  }

  const handleNameClick = (object: GardenObject, event: React.MouseEvent) => {
    event.stopPropagation()
    if (object.id) {
      setEditingNameId(object.id)
      setEditingNameValue(object.name || '')
    }
  }

  const handleNameChange = (value: string) => {
    setEditingNameValue(value)
  }

  const handleNameSave = async (objectId: number) => {
    try {
      await db.objects.update(objectId, {
        name: editingNameValue.trim() || undefined,
        updatedAt: Date.now()
      })
      setEditingNameId(null)
      await loadObjects()
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    } catch (error) {
      console.error('Error updating object name:', error)
    }
  }

  const handleNameCancel = () => {
    setEditingNameId(null)
    setEditingNameValue('')
  }

  const handleNameKeyDown = (e: React.KeyboardEvent, objectId: number) => {
    if (e.key === 'Enter') {
      handleNameSave(objectId)
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  const handleBedEditorOpen = (object: GardenObject, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!object.id) return

    const bed = beds.get(object.id)
    if (!bed?.id) return

    setSelectedBed(bed.id)
    window.dispatchEvent(new CustomEvent('selectObject', { detail: { objectId: object.id } }))
    window.dispatchEvent(new CustomEvent('openBedEditor', { detail: { bedId: bed.id } }))
  }

  const handleBushEditorOpen = async (object: GardenObject, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!object.id) return

    let bush = bushes.get(object.id)

    if (!bush) {
      await db.bushes.add({
        objectId: object.id,
        year: activeYear,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      const allBushes = await db.bushes.where('year').equals(activeYear).toArray()
      const bushesMap = new Map<number, Bush>()
      allBushes.forEach(b => {
        if (b.objectId) {
          bushesMap.set(b.objectId, b)
        }
      })
      setBushes(bushesMap)
      bush = bushesMap.get(object.id)
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    }

    if (!bush?.id) return

    window.dispatchEvent(new CustomEvent('selectObject', { detail: { objectId: object.id } }))
    window.dispatchEvent(new CustomEvent('openBushEditor', { detail: { bushId: bush.id } }))
  }
 
  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={activeTab === 'beds' ? 'active' : ''}
          onClick={() => setActiveTab('beds')}
        >
          Грядки
        </button>
        <button
          className={activeTab === 'advisor' ? 'active' : ''}
          onClick={() => setActiveTab('advisor')}
        >
          Советник
        </button>
        <button
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          Синхронизация
        </button>
        <button
          className={activeTab === 'plants' ? 'active' : ''}
          onClick={() => setActiveTab('plants')}
        >
          Растения
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Настройки
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'beds' && (
          <div className="beds-list">
            <h3>Объекты сада</h3>
            {objects.length === 0 ? (
              <p className="empty-state">Нет объектов. Создайте объекты на карте.</p>
            ) : (
              <ul>
                {objects.map((object) => {
                  const typeInfo = objectTypes[object.type]
                  const isBed = object.type === 'bed'
                  const isBush = object.type === 'bush'
                  const bed = isBed && object.id ? beds.get(object.id) : null
                  const bush = isBush && object.id ? bushes.get(object.id) : null
                  const isSelectedByBed = isBed && bed && selectedBed === bed.id
                  const isSelectedByCanvas = object.id === selectedObjectId
                  const isSelected = isSelectedByBed || isSelectedByCanvas
                  
                  // Get emoji for bed or bush with assigned plant
                  let displayEmoji = typeInfo.emoji
                  if ((isBed || isBush) && object.id) {
                    const assignedPlantId = (isBed ? bed?.plantId : bush?.plantId) || null
                    if (assignedPlantId) {
                      const plant = plants.get(assignedPlantId)
                      if (plant?.emoji) {
                        displayEmoji = plant.emoji
                      }
                    }
                  }
                  
                  const displayName = object.name || `${typeInfo.name} #${object.id}`
                  const isEditingName = editingNameId === object.id
                  
                  return (
                    <li
                      key={object.id}
                      className={isSelected ? 'active' : ''}
                      onClick={(e) => handleObjectClick(object, e)}
                    >
                      <div>
                        <span className="object-emoji">{displayEmoji}</span>
                        {isEditingName ? (
                          <input
                            type="text"
                            className="object-name-input"
                            value={editingNameValue}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={() => object.id && handleNameSave(object.id)}
                            onKeyDown={(e) => object.id && handleNameKeyDown(e, object.id)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="object-name"
                            onClick={(e) => handleNameClick(object, e)}
                            title="Кликните для редактирования имени"
                          >
                            {displayName}
                          </span>
                        )}
                      </div>
                      <div className="object-footer">
                        <span className="object-location">
                          {(object.width * object.height).toFixed(1)} м²
                        </span>
                        {isBed && bed?.id && (
                          <button
                            className="object-action-btn"
                            onClick={(e) => handleBedEditorOpen(object, e)}
                          >
                            Открыть грядку
                          </button>
                        )}
                        {isBush && (
                          <button
                            className="object-action-btn"
                            onClick={(e) => handleBushEditorOpen(object, e)}
                          >
                            Открыть куст
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'advisor' && <Advisor />}

        {activeTab === 'sync' && <SyncManager />}

        {activeTab === 'plants' && <PlantManager />}

        {activeTab === 'settings' && (
          <div className="settings">
            <h3>Настройки участка</h3>
            <div className="setting-item">
              <label>Ширина (метры):</label>
              <input
                type="number"
                value={garden.width}
                onChange={(e) => onUpdateGarden({ width: parseFloat(e.target.value) || 0 })}
                min="1"
                step="0.1"
              />
            </div>
            <div className="setting-item">
              <label>Длина (метры):</label>
              <input
                type="number"
                value={garden.height}
                onChange={(e) => onUpdateGarden({ height: parseFloat(e.target.value) || 0 })}
                min="1"
                step="0.1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
