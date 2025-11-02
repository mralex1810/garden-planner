import { useState } from 'react'
import { db } from '../../db'
import * as QRCode from 'qrcode'
import './SyncManager.css'

export default function SyncManager() {
  const [qrCode, setQrCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')

  const exportData = async () => {
    setIsGenerating(true)
    setImportStatus('')
    setQrCode('')
    
    try {
      const data = {
        garden: await db.garden.toArray(),
        objects: await db.objects.toArray(),
        beds: await db.beds.toArray(),
        plants: await db.plants.toArray(),
        careHistory: await db.careHistory.toArray(),
        plans: await db.plans.toArray(),
        exportDate: new Date().toISOString()
      }

      const json = JSON.stringify(data, null, 2)
      
      let qrStatus = ''
      
      // Generate QR code only if data is not too large (QR codes have size limits)
      // Typically QR codes can hold up to ~2953 bytes with high error correction
      try {
        if (json.length < 2500) {
          const qr = await QRCode.toDataURL(json, {
            errorCorrectionLevel: 'M',
            width: 300
          })
          setQrCode(qr)
        } else {
          // For large data, try compression
          try {
            const compressed = btoa(encodeURIComponent(json))
            if (compressed.length < 2500) {
              const qr = await QRCode.toDataURL(compressed, {
                errorCorrectionLevel: 'L',
                width: 300
              })
              setQrCode(qr)
              qrStatus = '⚠️ Данные слишком большие для QR-кода. Используйте файл для передачи.'
            } else {
              qrStatus = '⚠️ Данные слишком большие для QR-кода. Используйте файл для передачи.'
            }
          } catch (compressionError) {
            console.warn('Compression failed:', compressionError)
            qrStatus = '⚠️ Данные слишком большие для QR-кода. Используйте файл для передачи.'
          }
        }
      } catch (qrError) {
        console.warn('QR code generation failed:', qrError)
        qrStatus = '⚠️ Не удалось сгенерировать QR-код. Используйте файл для передачи.'
      }

      // Always provide download link
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `garden-planner-backup-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Set final status
      if (qrStatus) {
        setImportStatus(`${qrStatus} ✅ Файл скачан.`)
      } else {
        setImportStatus('✅ Данные экспортированы! Файл скачан.')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setImportStatus(`❌ Ошибка при экспорте данных: ${errorMessage}`)
      setQrCode('')
    } finally {
      setIsGenerating(false)
    }
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate data structure
      if (!data.garden || !data.objects || !data.beds) {
        throw new Error('Неверный формат файла')
      }

      // Clear existing data (optional - you might want to merge instead)
      await db.garden.clear()
      await db.objects.clear()
      await db.beds.clear()
      await db.careHistory.clear()
      await db.plans.clear()
      // Don't clear plants - keep the default ones

      // Import data
      if (data.garden && data.garden.length > 0) {
        await db.garden.bulkAdd(data.garden)
      }
      if (data.objects && data.objects.length > 0) {
        await db.objects.bulkAdd(data.objects)
      }
      if (data.beds && data.beds.length > 0) {
        await db.beds.bulkAdd(data.beds)
      }
      if (data.careHistory && data.careHistory.length > 0) {
        await db.careHistory.bulkAdd(data.careHistory)
      }
      if (data.plans && data.plans.length > 0) {
        await db.plans.bulkAdd(data.plans)
      }

      setImportStatus('Данные успешно импортированы! Страница будет перезагружена.')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error importing:', error)
      setImportStatus('Ошибка при импорте данных. Проверьте формат файла.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importData(file)
    }
  }

  const handleQRInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.trim()
    if (!text) return

    try {
      const data = JSON.parse(text)
      
      // Validate data structure
      if (!data.garden || !data.objects || !data.beds) {
        throw new Error('Неверный формат данных')
      }

      // Clear existing data
      await db.garden.clear()
      await db.objects.clear()
      await db.beds.clear()
      await db.careHistory.clear()
      await db.plans.clear()

      // Import data
      if (data.garden && data.garden.length > 0) {
        await db.garden.bulkAdd(data.garden)
      }
      if (data.objects && data.objects.length > 0) {
        await db.objects.bulkAdd(data.objects)
      }
      if (data.beds && data.beds.length > 0) {
        await db.beds.bulkAdd(data.beds)
      }
      if (data.careHistory && data.careHistory.length > 0) {
        await db.careHistory.bulkAdd(data.careHistory)
      }
      if (data.plans && data.plans.length > 0) {
        await db.plans.bulkAdd(data.plans)
      }

      setImportStatus('Данные успешно импортированы! Страница будет перезагружена.')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      // Not valid JSON or import error
      if (text.length > 100) {
        setImportStatus('Ошибка: неверный формат JSON данных')
      }
    }
  }

  return (
    <div className="sync-manager">
      <h3>Синхронизация данных</h3>

      <div className="sync-section">
        <h4>Экспорт данных</h4>
        <p className="sync-description">
          Сохраните резервную копию данных или передайте их на другое устройство
        </p>
        <button
          className="export-btn"
          onClick={exportData}
          disabled={isGenerating}
        >
          {isGenerating ? 'Генерация...' : '📥 Экспортировать'}
        </button>

        {qrCode && (
          <div className="qr-container">
            <p className="qr-label">QR-код для передачи данных:</p>
            <img src={qrCode} alt="QR Code" className="qr-code" />
            <p className="qr-hint">Отсканируйте QR-код другим устройством или вставьте данные вручную</p>
          </div>
        )}
      </div>

      <div className="sync-section">
        <h4>Импорт данных</h4>
        <p className="sync-description">
          Загрузите данные из файла или вставьте JSON-данные
        </p>
        
        <label className="file-input-label">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="file-input"
          />
          📁 Выбрать файл
        </label>

        <div className="json-input-container">
          <label htmlFor="json-input">Или вставьте JSON-данные:</label>
          <textarea
            id="json-input"
            className="json-input"
            placeholder='{"garden": [...], "objects": [...], ...}'
            onChange={handleQRInput}
            rows={6}
          />
        </div>
      </div>

      {importStatus && (
        <div className={`import-status ${importStatus.includes('Ошибка') ? 'error' : 'success'}`}>
          {importStatus}
        </div>
      )}

      <div className="sync-info">
        <p className="info-title">💡 Как использовать:</p>
        <ol>
          <li>Экспортируйте данные на одном устройстве</li>
          <li>Сохраните файл или отсканируйте QR-код</li>
          <li>Импортируйте данные на другом устройстве</li>
        </ol>
        <p className="warning-text">
          ⚠️ Внимание: импорт данных перезапишет все существующие данные на текущем устройстве!
        </p>
      </div>
    </div>
  )
}
