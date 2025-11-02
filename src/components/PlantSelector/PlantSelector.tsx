import { useState } from 'react'
import { Plant } from '../../db'
import './PlantSelector.css'

interface PlantSelectorProps {
  plants: Plant[]
  onSelect: (plantId: string) => void
  onClose: () => void
  growthType?: 'bed' | 'bush'
}

export default function PlantSelector({ plants, onSelect, onClose, growthType }: PlantSelectorProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'vegetable', label: 'Овощи' },
    { value: 'herb', label: 'Зелень' },
    { value: 'berry', label: 'Ягоды' },
    { value: 'fruit', label: 'Фрукты' },
    { value: 'flower', label: 'Цветы' }
  ]

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.nameRu.toLowerCase().includes(search.toLowerCase()) ||
                         plant.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || plant.category === category
    const matchesGrowthType = !growthType || plant.growthType === growthType
    return matchesSearch && matchesCategory && matchesGrowthType
  })

  return (
    <div className="plant-selector-overlay" onClick={onClose}>
      <div className="plant-selector" onClick={(e) => e.stopPropagation()}>
        <div className="plant-selector-header">
          <h3>Выберите растение</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="plant-selector-filters">
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="plant-list">
          {filteredPlants.length === 0 ? (
            <p className="no-plants">Растения не найдены</p>
          ) : (
            filteredPlants.map(plant => (
              <button
                key={plant.id}
                className="plant-item"
                onClick={() => onSelect(plant.id)}
              >
                <span className="plant-emoji">{plant.emoji}</span>
                <span className="plant-name">{plant.nameRu}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
