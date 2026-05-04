import { useState, useEffect } from 'react'
import { db } from '../../db'
import './YearTabs.css'

interface YearTabsProps {
  activeYear: number
  onYearChange: (year: number) => void
}

export default function YearTabs({ activeYear, onYearChange }: YearTabsProps) {
  const [years, setYears] = useState<number[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1)
  const [copyFromYear, setCopyFromYear] = useState<number | ''>('')

  useEffect(() => {
    loadYears()

    const handleUpdate = () => loadYears()
    window.addEventListener('objectsUpdate', handleUpdate)
    window.addEventListener('gardenUpdate', handleUpdate)
    return () => {
      window.removeEventListener('objectsUpdate', handleUpdate)
      window.removeEventListener('gardenUpdate', handleUpdate)
    }
  }, [])

  const loadYears = async () => {
    const allBeds = await db.beds.toArray()
    const allBushes = await db.bushes.toArray()
    const yearSet = new Set<number>()
    allBeds.forEach(b => { if (b.year) yearSet.add(b.year) })
    allBushes.forEach(b => { if (b.year) yearSet.add(b.year) })
    if (yearSet.size === 0) yearSet.add(new Date().getFullYear())
    const sorted = [...yearSet].sort((a, b) => a - b)
    setYears(sorted)
  }

  const handleAddYear = async () => {
    if (years.includes(newYear)) {
      onYearChange(newYear)
      setShowAddDialog(false)
      return
    }

    if (copyFromYear) {
      const sourceBeds = await db.beds.where('year').equals(copyFromYear).toArray()
      const sourceBushes = await db.bushes.where('year').equals(copyFromYear).toArray()
      const now = Date.now()

      for (const bed of sourceBeds) {
        await db.beds.add({
          objectId: bed.objectId,
          year: newYear,
          plantId: bed.plantId,
          plannedPlantId: bed.plannedPlantId,
          plannedDate: bed.plannedDate,
          notes: bed.notes,
          createdAt: now,
          updatedAt: now
        })
      }
      for (const bush of sourceBushes) {
        await db.bushes.add({
          objectId: bush.objectId,
          year: newYear,
          plantId: bush.plantId,
          plannedPlantId: bush.plannedPlantId,
          plannedDate: bush.plannedDate,
          notes: bush.notes,
          createdAt: now,
          updatedAt: now
        })
      }
    }

    await loadYears()
    onYearChange(newYear)
    setShowAddDialog(false)
    setCopyFromYear('')
    window.dispatchEvent(new CustomEvent('gardenUpdate'))
  }

  return (
    <div className="year-tabs">
      <div className="year-tabs-list">
        {years.map(year => (
          <button
            key={year}
            className={`year-tab ${year === activeYear ? 'active' : ''}`}
            onClick={() => onYearChange(year)}
          >
            {year}
          </button>
        ))}
        <button
          className="year-tab add-year-btn"
          onClick={() => {
            setNewYear(Math.max(...years) + 1)
            setShowAddDialog(true)
          }}
          title="Добавить год"
        >
          +
        </button>
      </div>

      {showAddDialog && (
        <div className="year-add-dialog">
          <div className="year-add-dialog-content">
            <h4>Добавить год</h4>
            <div className="year-add-field">
              <label>Год:</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={newYear}
                onChange={e => setNewYear(parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
            <div className="year-add-field">
              <label>Скопировать посадки из:</label>
              <select
                value={copyFromYear}
                onChange={e => setCopyFromYear(e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">Не копировать</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="year-add-actions">
              <button className="cancel-btn" onClick={() => setShowAddDialog(false)}>
                Отмена
              </button>
              <button className="submit-btn" onClick={handleAddYear}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
