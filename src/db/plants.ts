import { Plant } from './database'
import { db } from './database'

export const defaultPlants: Plant[] = [
  // Овощи
  { id: 'tomato', name: 'Tomato', nameRu: 'Помидор', emoji: '🍅', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['basil', 'onion', 'carrot'], incompatibleWith: ['cucumber', 'potato'], season: 'summer' },
  { id: 'cucumber', name: 'Cucumber', nameRu: 'Огурец', emoji: '🥒', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['beans', 'peas', 'radish'], incompatibleWith: ['tomato'], season: 'summer' },
  { id: 'pepper', name: 'Pepper', nameRu: 'Перец', emoji: '🌶️', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['basil', 'onion'], incompatibleWith: [], season: 'summer' },
  { id: 'carrot', name: 'Carrot', nameRu: 'Морковь', emoji: '🥕', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['onion', 'tomato', 'lettuce'], incompatibleWith: ['dill'], season: 'summer' },
  { id: 'potato', name: 'Potato', nameRu: 'Картофель', emoji: '🥔', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['beans'], incompatibleWith: ['tomato', 'cucumber'], season: 'summer' },
  { id: 'onion', name: 'Onion', nameRu: 'Лук', emoji: '🧅', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['carrot', 'tomato', 'lettuce'], incompatibleWith: ['beans', 'peas'], season: 'all' },
  { id: 'garlic', name: 'Garlic', nameRu: 'Чеснок', emoji: '🧄', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['tomato', 'carrot'], incompatibleWith: ['beans', 'peas'], season: 'all' },
  { id: 'cabbage', name: 'Cabbage', nameRu: 'Капуста', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['beet', 'celery'], incompatibleWith: ['tomato'], season: 'summer' },
  { id: 'beet', name: 'Beet', nameRu: 'Свекла', emoji: '🍠', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['onion', 'cabbage'], incompatibleWith: [], season: 'summer' },
  { id: 'radish', name: 'Radish', nameRu: 'Редис', emoji: '🫒', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['cucumber', 'lettuce'], incompatibleWith: [], season: 'spring' },
  { id: 'lettuce', name: 'Lettuce', nameRu: 'Салат', emoji: '🥬', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['carrot', 'radish', 'onion'], incompatibleWith: [], season: 'spring' },
  
  // Зелень
  { id: 'basil', name: 'Basil', nameRu: 'Базилик', emoji: '🌿', category: 'herb', growthType: 'bed', pack: 'custom', goodNeighbors: ['tomato', 'pepper'], incompatibleWith: [], season: 'summer' },
  { id: 'dill', name: 'Dill', nameRu: 'Укроп', emoji: '🌱', category: 'herb', growthType: 'bed', pack: 'custom', goodNeighbors: ['cucumber'], incompatibleWith: ['carrot'], season: 'summer' },
  { id: 'parsley', name: 'Parsley', nameRu: 'Петрушка', emoji: '🌿', category: 'herb', growthType: 'bed', pack: 'custom', goodNeighbors: ['tomato', 'onion'], incompatibleWith: [], season: 'all' },
  
  // Бобовые
  { id: 'beans', name: 'Beans', nameRu: 'Фасоль', emoji: '🫘', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['cucumber', 'potato'], incompatibleWith: ['onion', 'garlic'], season: 'summer' },
  { id: 'peas', name: 'Peas', nameRu: 'Горох', emoji: '🫛', category: 'vegetable', growthType: 'bed', pack: 'custom', goodNeighbors: ['cucumber'], incompatibleWith: ['onion', 'garlic'], season: 'summer' },
  
  // Фрукты и ягоды
  { id: 'strawberry', name: 'Strawberry', nameRu: 'Клубника', emoji: '🍓', category: 'berry', growthType: 'bed', pack: 'custom', goodNeighbors: ['lettuce', 'onion'], incompatibleWith: [], season: 'summer' },
  { id: 'raspberry', name: 'Raspberry', nameRu: 'Малина', emoji: '🫐', category: 'berry', growthType: 'bush', pack: 'custom', goodNeighbors: [], incompatibleWith: [], season: 'summer' },
]

export async function initializePlants() {
  // Добавляем каждое предустановленное растение, если его еще нет в базе
  for (const plant of defaultPlants) {
    const existing = await db.plants.get(plant.id)
    if (!existing) {
      try {
        await db.plants.add(plant)
      } catch (error) {
        // Игнорируем ошибки дубликатов (на случай параллельного выполнения)
        console.warn(`Failed to add plant ${plant.id}:`, error)
      }
    }
  }
}
