import Dexie, { Table } from 'dexie'

export interface Garden {
  id?: number
  width: number // метры
  height: number // метры
  updatedAt: number
}

export interface GardenObject {
  id?: number
  type: 'bed' | 'greenhouse' | 'hotbed' | 'barrel' | 'well' | 'path' | 'bush' | 'rest'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  name?: string
  properties?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface Bed {
  id?: number
  objectId: number // ссылка на GardenObject
  plantId?: string // ссылка на Plant
  plannedPlantId?: string // запланированное растение
  plannedDate?: number // дата планируемой посадки
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface Bush {
  id?: number
  objectId: number // ссылка на GardenObject
  plantId?: string // ссылка на Plant
  plannedPlantId?: string // запланированное растение
  plannedDate?: number // дата планируемой посадки
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface Plant {
  id: string
  name: string
  nameRu: string
  emoji: string
  category: 'vegetable' | 'herb' | 'fruit' | 'berry' | 'flower'
  growthType: 'bed' | 'bush' // тип роста: грядка или куст
  pack: 'stardew_valley' | 'kirov_oblast' | 'custom' // источник культуры
  incompatibleWith?: string[] // IDs несовместимых растений
  goodNeighbors?: string[] // IDs хороших соседей
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all' | string // сезон(ы) роста
  plantingMonths?: number[] // рекомендуемые месяцы посадки (1-12)
  harvestMonths?: number[] // месяцы сбора урожая (1-12)
  comment?: string // пользовательский комментарий
}

export interface CareHistory {
  id?: number
  bedId: number
  type: 'water' | 'weed' | 'fertilize' | 'harvest' | 'plant'
  date: number
  notes?: string
  createdAt: number
}

export interface PlantingPlan {
  id?: number
  bedId: number
  plantId: string
  plannedDate: number
  notes?: string
  createdAt: number
}

class GardenDatabase extends Dexie {
  garden!: Table<Garden>
  objects!: Table<GardenObject>
  beds!: Table<Bed>
  bushes!: Table<Bush>
  plants!: Table<Plant>
  careHistory!: Table<CareHistory>
  plans!: Table<PlantingPlan>

  constructor() {
    super('GardenDatabase')
    this.version(2).stores({
      garden: '++id',
      objects: '++id, type, createdAt',
      beds: '++id, objectId, plantId',
      bushes: '++id, objectId, plantId',
      plants: 'id, category, pack, growthType',
      careHistory: '++id, bedId, date',
      plans: '++id, bedId, plannedDate'
    })
  }
}

export const db = new GardenDatabase()
