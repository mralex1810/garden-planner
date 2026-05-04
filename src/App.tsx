import { useState, useEffect } from 'react'
import { db, Garden } from './db'
import GardenCanvas from './components/GardenCanvas/GardenCanvas'
import Sidebar from './components/Sidebar/Sidebar'
import YearTabs from './components/YearTabs/YearTabs'
import './App.css'

function App() {
  const [garden, setGarden] = useState<Garden | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeYear, setActiveYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadGarden()
  }, [])

  const loadGarden = async () => {
    try {
      const gardenData = await db.garden.toCollection().first()
      if (gardenData) {
        setGarden(gardenData)
      } else {
        // Создаем дефолтный участок 20 соток (примерно 40x50 метров)
        const defaultGarden: Garden = {
          width: 40,
          height: 50,
          updatedAt: Date.now()
        }
        const id = await db.garden.add(defaultGarden)
        setGarden({ ...defaultGarden, id: id as number })
      }
    } catch (error) {
      console.error('Error loading garden:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateGarden = async (updates: Partial<Garden>) => {
    if (!garden?.id) return
    
    const updated = {
      ...garden,
      ...updates,
      updatedAt: Date.now()
    }
    await db.garden.update(garden.id, updated)
    setGarden(updated)
  }

  if (isLoading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!garden) {
    return <div className="error">Ошибка загрузки данных</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Планировщик огорода</h1>
        <div className="header-info">
          <span>Участок: {garden.width}×{garden.height} м</span>
          <span className="header-year">{activeYear} г.</span>
        </div>
      </header>
      <div className="app-content">
        <GardenCanvas garden={garden} activeYear={activeYear} />
        <Sidebar garden={garden} onUpdateGarden={updateGarden} activeYear={activeYear} />
      </div>
      <YearTabs activeYear={activeYear} onYearChange={setActiveYear} />
    </div>
  )
}

export default App
