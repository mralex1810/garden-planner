import { useState, useEffect } from 'react'
import { db, Plant } from '../../db'
import './PlantManager.css'

type PackFilter = 'all' | 'stardew_valley' | 'kirov_oblast' | 'custom'
type GrowthTypeFilter = 'all' | 'bed' | 'bush'

export default function PlantManager() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([])
  const [packFilter, setPackFilter] = useState<PackFilter>('all')
  const [growthTypeFilter, setGrowthTypeFilter] = useState<GrowthTypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)

  useEffect(() => {
    loadPlants()
  }, [])

  useEffect(() => {
    filterPlants()
  }, [plants, packFilter, growthTypeFilter, categoryFilter, searchQuery])

  const loadPlants = async () => {
    const allPlants = await db.plants.toArray()
    setPlants(allPlants)
  }

  const filterPlants = () => {
    let filtered = [...plants]

    // Filter by pack
    if (packFilter !== 'all') {
      filtered = filtered.filter(p => p.pack === packFilter)
    }

    // Filter by growth type
    if (growthTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.growthType === growthTypeFilter)
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.nameRu.toLowerCase().includes(query)
      )
    }

    setFilteredPlants(filtered)
  }

  const handleDelete = async (plant: Plant) => {
    if (plant.pack !== 'custom') {
      alert('Можно удалять только пользовательские растения')
      return
    }

    if (confirm(`Удалить растение "${plant.nameRu}"?`)) {
      try {
        await db.plants.delete(plant.id)
        await loadPlants()
      } catch (error) {
        console.error('Error deleting plant:', error)
        alert('Ошибка при удалении растения')
      }
    }
  }

  const handleEdit = (plant: Plant) => {
    if (plant.pack !== 'custom') {
      alert('Можно редактировать только пользовательские растения')
      return
    }
    setEditingPlant(plant)
    setShowAddForm(true)
  }

  const packLabels: Record<string, string> = {
    all: 'Все паки',
    stardew_valley: 'Stardew Valley',
    kirov_oblast: 'Кировская область',
    custom: 'Пользовательские'
  }

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'vegetable', label: 'Овощи' },
    { value: 'herb', label: 'Зелень' },
    { value: 'berry', label: 'Ягоды' },
    { value: 'fruit', label: 'Фрукты' },
    { value: 'flower', label: 'Цветы' }
  ]

  return (
    <div className="plant-manager">
      <div className="plant-manager-header">
        <h3>Управление растениями</h3>
        <button
          className="add-plant-btn"
          onClick={() => {
            setEditingPlant(null)
            setShowAddForm(true)
          }}
        >
          + Добавить растение
        </button>
      </div>

      <div className="plant-manager-filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        <select
          value={packFilter}
          onChange={(e) => setPackFilter(e.target.value as PackFilter)}
          className="filter-select"
        >
          {Object.entries(packLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={growthTypeFilter}
          onChange={(e) => setGrowthTypeFilter(e.target.value as GrowthTypeFilter)}
          className="filter-select"
        >
          <option value="all">Все типы роста</option>
          <option value="bed">Грядки</option>
          <option value="bush">Кусты</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="plant-manager-stats">
        Всего: {plants.length} | Отображено: {filteredPlants.length}
      </div>

      <div className="plants-list">
        {filteredPlants.length === 0 ? (
          <p className="empty-state">Растения не найдены</p>
        ) : (
          <table className="plants-table">
            <thead>
              <tr>
                <th>Эмодзи</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Тип роста</th>
                <th>Пак</th>
                <th>Сезон</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlants.map(plant => (
                <tr key={plant.id}>
                  <td className="emoji-cell">{plant.emoji}</td>
                  <td>
                    <div className="plant-name">
                      <div>{plant.nameRu}</div>
                      <div className="plant-name-en">{plant.name}</div>
                      {plant.comment && (
                        <div className="plant-comment" title={plant.comment}>
                          💬 {plant.comment.length > 50 ? plant.comment.substring(0, 50) + '...' : plant.comment}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{categories.find(c => c.value === plant.category)?.label || plant.category}</td>
                  <td>{plant.growthType === 'bed' ? 'Грядка' : 'Куст'}</td>
                  <td>{packLabels[plant.pack] || plant.pack}</td>
                  <td>{plant.season || '-'}</td>
                  <td className="actions-cell">
                    {plant.pack === 'custom' && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(plant)}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(plant)}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {plant.pack !== 'custom' && (
                      <span className="readonly-badge">Только чтение</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddForm && (
        <PlantForm
          plant={editingPlant}
          onClose={() => {
            setShowAddForm(false)
            setEditingPlant(null)
          }}
          onSave={async () => {
            await loadPlants()
            setShowAddForm(false)
            setEditingPlant(null)
          }}
          allPlants={plants}
        />
      )}
    </div>
  )
}

interface PlantFormProps {
  plant: Plant | null
  onClose: () => void
  onSave: () => void
  allPlants: Plant[]
}

function PlantForm({ plant, onClose, onSave, allPlants }: PlantFormProps) {
  const [formData, setFormData] = useState<Partial<Plant>>({
    id: plant?.id || '',
    name: plant?.name || '',
    nameRu: plant?.nameRu || '',
    emoji: plant?.emoji || '🌱',
    category: plant?.category || 'vegetable',
    growthType: plant?.growthType || 'bed',
    pack: 'custom',
    season: plant?.season || '',
    goodNeighbors: plant?.goodNeighbors || [],
    incompatibleWith: plant?.incompatibleWith || [],
    plantingMonths: plant?.plantingMonths || [],
    harvestMonths: plant?.harvestMonths || [],
    comment: plant?.comment || ''
  })
  const [plantingMonthsText, setPlantingMonthsText] = useState(plant?.plantingMonths?.join(', ') || '')
  const [harvestMonthsText, setHarvestMonthsText] = useState(plant?.harvestMonths?.join(', ') || '')

  const parseMonths = (text: string): number[] => {
    return text.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m) && m >= 1 && m <= 12)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.id || !formData.name || !formData.nameRu) {
      alert('Заполните обязательные поля: ID, название (EN и RU)')
      return
    }

    // Check if ID already exists (for new plants)
    if (!plant) {
      const existing = allPlants.find(p => p.id === formData.id)
      if (existing) {
        alert('Растение с таким ID уже существует')
        return
      }
    }

    try {
      const plantData: Plant = {
        id: formData.id as string,
        name: formData.name as string,
        nameRu: formData.nameRu as string,
        emoji: formData.emoji || '🌱',
        category: formData.category as Plant['category'],
        growthType: formData.growthType as 'bed' | 'bush',
        pack: 'custom',
        season: formData.season || undefined,
        goodNeighbors: formData.goodNeighbors || undefined,
        incompatibleWith: formData.incompatibleWith || undefined,
        plantingMonths: parseMonths(plantingMonthsText).length > 0 ? parseMonths(plantingMonthsText) : undefined,
        harvestMonths: parseMonths(harvestMonthsText).length > 0 ? parseMonths(harvestMonthsText) : undefined,
        comment: formData.comment || undefined
      }

      if (plant) {
        await db.plants.update(plant.id, plantData)
      } else {
        await db.plants.add(plantData)
      }

      onSave()
      
      // Уведомляем другие компоненты об обновлении списка растений
      window.dispatchEvent(new CustomEvent('plantsUpdate'))
    } catch (error) {
      console.error('Error saving plant:', error)
      alert('Ошибка при сохранении растения')
    }
  }

  const categories = [
    { value: 'vegetable', label: 'Овощи' },
    { value: 'herb', label: 'Зелень' },
    { value: 'berry', label: 'Ягоды' },
    { value: 'fruit', label: 'Фрукты' },
    { value: 'flower', label: 'Цветы' }
  ]

  const seasons = [
    { value: '', label: 'Не указан' },
    { value: 'spring', label: 'Весна' },
    { value: 'summer', label: 'Лето' },
    { value: 'autumn', label: 'Осень' },
    { value: 'winter', label: 'Зима' },
    { value: 'all', label: 'Круглый год' }
  ]

  return (
    <div className="plant-form-overlay" onClick={onClose}>
      <div className="plant-form" onClick={(e) => e.stopPropagation()}>
        <div className="plant-form-header">
          <h3>{plant ? 'Редактировать растение' : 'Добавить растение'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>ID (уникальный идентификатор) *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                disabled={!!plant}
                placeholder="custom-plant-1"
              />
              {plant && <small>ID нельзя изменить</small>}
            </div>
            <div className="form-group">
              <label>Эмодзи</label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="🌱"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Название (EN) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Tomato"
              />
            </div>
            <div className="form-group">
              <label>Название (RU) *</label>
              <input
                type="text"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                required
                placeholder="Помидор"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Категория *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Plant['category'] })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Тип роста *</label>
              <select
                value={formData.growthType}
                onChange={(e) => setFormData({ ...formData, growthType: e.target.value as 'bed' | 'bush' })}
                required
              >
                <option value="bed">Грядка</option>
                <option value="bush">Куст</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Сезон</label>
              <select
                value={formData.season || ''}
                onChange={(e) => setFormData({ ...formData, season: e.target.value || undefined })}
              >
                {seasons.map(season => (
                  <option key={season.value} value={season.value}>{season.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Месяцы посадки (1-12, через запятую)</label>
              <input
                type="text"
                value={plantingMonthsText}
                onChange={(e) => setPlantingMonthsText(e.target.value)}
                placeholder="4, 5, 9"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Месяцы сбора урожая (1-12, через запятую)</label>
              <input
                type="text"
                value={harvestMonthsText}
                onChange={(e) => setHarvestMonthsText(e.target.value)}
                placeholder="7, 8, 9"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Хорошие соседи (ID растений, через запятую)</label>
              <input
                type="text"
                value={formData.goodNeighbors?.join(', ') || ''}
                onChange={(e) => {
                  const neighbors = e.target.value
                    .split(',')
                    .map(n => n.trim())
                    .filter(n => n.length > 0)
                  setFormData({ ...formData, goodNeighbors: neighbors.length > 0 ? neighbors : undefined })
                }}
                placeholder="tomato, basil, onion"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Несовместимые растения (ID растений, через запятую)</label>
              <input
                type="text"
                value={formData.incompatibleWith?.join(', ') || ''}
                onChange={(e) => {
                  const incompatible = e.target.value
                    .split(',')
                    .map(i => i.trim())
                    .filter(i => i.length > 0)
                  setFormData({ ...formData, incompatibleWith: incompatible.length > 0 ? incompatible : undefined })
                }}
                placeholder="cucumber, potato"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Комментарий</label>
              <textarea
                value={formData.comment || ''}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Добавьте свои заметки о растении..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="submit-btn">
              {plant ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

