import { useState, useEffect } from 'react'
import { db, CareHistory, Plant } from '../../db'
import './HistoryTimeline.css'

interface HistoryTimelineProps {
  bedId: number
}

export default function HistoryTimeline({ bedId }: HistoryTimelineProps) {
  const [history, setHistory] = useState<(CareHistory & { plantName?: string })[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [careType, setCareType] = useState<CareHistory['type']>('water')
  const [careDate, setCareDate] = useState(new Date().toISOString().split('T')[0])
  const [careNotes, setCareNotes] = useState('')

  useEffect(() => {
    loadHistory()
  }, [bedId])

  const loadHistory = async () => {
    const historyItems = await db.careHistory
      .where('bedId')
      .equals(bedId)
      .reverse()
      .sortBy('date')

    // Get plant names
    const bed = await db.beds.get(bedId)
    const historyWithPlants = await Promise.all(
      historyItems.map(async (item) => {
        let plantName = ''
        if (item.type === 'plant' && bed?.plantId) {
          const plant = await db.plants.get(bed.plantId)
          plantName = plant?.nameRu || ''
        }
        return { ...item, plantName }
      })
    )

    setHistory(historyWithPlants)
  }

  const handleAddCare = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await db.careHistory.add({
      bedId,
      type: careType,
      date: new Date(careDate).getTime(),
      notes: careNotes || undefined,
      createdAt: Date.now()
    })

    setCareType('water')
    setCareDate(new Date().toISOString().split('T')[0])
    setCareNotes('')
    setShowAddForm(false)
    loadHistory()
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    await db.careHistory.delete(id)
    loadHistory()
  }

  const careTypeLabels = {
    water: '💧 Полив',
    weed: '🌱 Прополка',
    fertilize: '🌿 Удобрение',
    harvest: '🌾 Уборка',
    plant: '🌱 Посадка'
  }

  return (
    <div className="history-timeline">
      <button
        className="add-care-btn"
        onClick={() => setShowAddForm(!showAddForm)}
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
          <button type="submit">Сохранить</button>
        </form>
      )}

      <div className="history-list">
        {history.length === 0 ? (
          <p className="empty-history">Нет записей истории</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-item-header">
                <span className="history-type">{careTypeLabels[item.type]}</span>
                <span className="history-date">
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </span>
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
