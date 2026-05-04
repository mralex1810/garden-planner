import { useState, useEffect } from 'react'
import { db, CareHistory } from '../../db'
import './HistoryTimeline.css'

interface HistoryTimelineProps {
  objectId: number
  year?: number
}

export default function HistoryTimeline({ objectId, year }: HistoryTimelineProps) {
  const [history, setHistory] = useState<(CareHistory & { plantName?: string })[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [careType, setCareType] = useState<CareHistory['type']>('water')
  const [careDate, setCareDate] = useState(new Date().toISOString().split('T')[0])
  const [careNotes, setCareNotes] = useState('')

  useEffect(() => {
    loadHistory()
  }, [objectId, year])

  const loadHistory = async () => {
    let historyItems = await db.careHistory
      .where('bedId')
      .equals(objectId)
      .reverse()
      .sortBy('date')

    if (year) {
      const yearStart = new Date(year, 0, 1).getTime()
      const yearEnd = new Date(year + 1, 0, 1).getTime()
      historyItems = historyItems.filter(item => item.date >= yearStart && item.date < yearEnd)
    }

    const bed = await db.beds.where('objectId').equals(objectId).first()
    const bush = !bed ? await db.bushes.where('objectId').equals(objectId).first() : null
    const plantId = bed?.plantId || bush?.plantId

    const historyWithPlants = await Promise.all(
      historyItems.map(async (item) => {
        let plantName = ''
        if (item.type === 'plant' && plantId) {
          const plant = await db.plants.get(plantId)
          plantName = plant?.nameRu || ''
        }
        return { ...item, plantName }
      })
    )

    setHistory(historyWithPlants)
  }

  const resetForm = () => {
    setCareType('water')
    setCareDate(new Date().toISOString().split('T')[0])
    setCareNotes('')
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleAddCare = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      await db.careHistory.update(editingId, {
        type: careType,
        date: new Date(careDate).getTime(),
        notes: careNotes || undefined,
      })
    } else {
      await db.careHistory.add({
        bedId: objectId,
        type: careType,
        date: new Date(careDate).getTime(),
        notes: careNotes || undefined,
        createdAt: Date.now()
      })
    }

    resetForm()
    loadHistory()
  }

  const handleEdit = (item: CareHistory) => {
    setCareType(item.type)
    setCareDate(new Date(item.date).toISOString().split('T')[0])
    setCareNotes(item.notes || '')
    setEditingId(item.id ?? null)
    setShowAddForm(true)
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    await db.careHistory.delete(id)
    loadHistory()
  }

  const careTypeLabels: Record<string, string> = {
    water: '💧 Полив',
    weed: '🌱 Прополка',
    fertilize: '🌿 Удобрение',
    harvest: '🌾 Уборка',
    plant: '🌱 Посадка',
    other: '🔧 Другое'
  }

  return (
    <div className="history-timeline">
      <button
        className="add-care-btn"
        onClick={() => {
          if (showAddForm) {
            resetForm()
          } else {
            setShowAddForm(true)
          }
        }}
      >
        {showAddForm ? 'Отмена' : '+ Добавить запись'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddCare} className="care-form">
          <select
            value={careType}
            onChange={(e) => setCareType(e.target.value as CareHistory['type'])}
            required
          >
            <option value="water">💧 Полив</option>
            <option value="weed">🌱 Прополка</option>
            <option value="fertilize">🌿 Удобрение</option>
            <option value="harvest">🌾 Уборка</option>
            <option value="plant">🌱 Посадка</option>
            <option value="other">🔧 Другое</option>
          </select>
          <input
            type="date"
            value={careDate}
            onChange={(e) => setCareDate(e.target.value)}
            required
          />
          <textarea
            placeholder="Заметки (необязательно)"
            value={careNotes}
            onChange={(e) => setCareNotes(e.target.value)}
            rows={2}
          />
          <button type="submit">{editingId ? 'Обновить' : 'Сохранить'}</button>
        </form>
      )}

      <div className="history-list">
        {history.length === 0 ? (
          <p className="empty-history">Нет записей истории</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-item-header">
                <span className="history-type">{careTypeLabels[item.type] || item.type}</span>
                <span className="history-date">
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </span>
                <button
                  className="edit-history-btn"
                  onClick={() => handleEdit(item)}
                  title="Редактировать"
                >
                  ✎
                </button>
                <button
                  className="delete-history-btn"
                  onClick={() => handleDelete(item.id)}
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
              {item.plantName && (
                <div className="history-plant">
                  Растение: {item.plantName}
                </div>
              )}
              {item.notes && (
                <div className="history-notes">{item.notes}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
