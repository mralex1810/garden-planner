export * from './database'
export * from './plants'
export * from './packs'
import { initializePlants } from './plants'
import { initializePack } from './packs'

export async function initializeDatabase() {
  await initializePlants()
  // Инициализируем растения из паков
  await initializePack('stardew_valley').catch(err => {
    console.warn('Error initializing Stardew Valley pack:', err)
  })
  await initializePack('kirov_oblast').catch(err => {
    console.warn('Error initializing Kirov Oblast pack:', err)
  })
}
