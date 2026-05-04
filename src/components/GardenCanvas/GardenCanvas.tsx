import { useEffect, useRef, useState } from 'react'
// @ts-ignore - fabric doesn't have types
import { fabric } from 'fabric'
import { db, GardenObject } from '../../db'
import BedEditor from '../BedEditor/BedEditor'
import BushEditor from '../BushEditor/BushEditor'
import './GardenCanvas.css'

// Type for fabric objects with custom data property
type FabricObjectWithData = fabric.Object & {
  data?: { id?: number; type?: string }
  type?: string
}

interface GardenCanvasProps {
  garden: { width: number; height: number }
  activeYear: number
}

const SCALE = 10 // пикселей на метр

const objectTypes = {
  bed: { color: '#8B4513', strokeColor: '#654321', emoji: '🟫', name: 'Грядка' },
  greenhouse: { color: '#2E7D32', strokeColor: '#1B5E20', emoji: '🏠', name: 'Теплица' },
  hotbed: { color: '#66BB6A', strokeColor: '#388E3C', emoji: '🌱', name: 'Парник' },
  barrel: { color: '#1976D2', strokeColor: '#0D47A1', emoji: '🪣', name: 'Бочка для воды' },
  well: { color: '#1565C0', strokeColor: '#0D47A1', emoji: '💧', name: 'Вода' },
  path: { color: '#757575', strokeColor: '#424242', emoji: '🛤️', name: 'Дорожка' },
  bush: { color: '#1B5E20', strokeColor: '#0D4014', emoji: '🌳', name: 'Куст' },
  rest: { color: '#F57C00', strokeColor: '#E65100', emoji: '🪑', name: 'Зона отдыха' },
  building: { color: '#795548', strokeColor: '#5D4037', emoji: '🏗️', name: 'Постройка' },
  flowers: { color: '#E91E63', strokeColor: '#C2185B', emoji: '🌸', name: 'Цветы' }
}

export default function GardenCanvas({ garden, activeYear }: GardenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [selectedObject, setSelectedObject] = useState<FabricObjectWithData | null>(null)
  const [, setObjects] = useState<GardenObject[]>([])
  const [selectedType, setSelectedType] = useState<GardenObject['type']>('bed')
  const [showPlaceForm, setShowPlaceForm] = useState(false)
  const [placeFormData, setPlaceFormData] = useState({
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    rotation: 0
  })
  const [placementMode, setPlacementMode] = useState(false) // Режим размещения кликом
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: 0,
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    rotation: 0
  })
  const [showBedEditor, setShowBedEditor] = useState(false)
  const [bedEditorBedId, setBedEditorBedId] = useState<number | null>(null)
  const [showBushEditor, setShowBushEditor] = useState(false)
  const [bushEditorBushId, setBushEditorBushId] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1) // Уровень зума (1 = 100%)
  const zoomRef = useRef(1) // Ref для текущего значения зума в обработчиках

  // Helper function to get frame offset (where garden frame is positioned on canvas)
  const getFrameOffset = (canvas: fabric.Canvas) => {
    const gardenWidth = garden.width * SCALE
    const gardenHeight = garden.height * SCALE
    const canvasWidth = canvas.width || 800
    const canvasHeight = canvas.height || 600
    const frameLeft = (canvasWidth - gardenWidth) / 2
    const frameTop = (canvasHeight - gardenHeight) / 2
    return { frameLeft, frameTop, gardenWidth, gardenHeight }
  }

  // Create garden boundary frame (non-editable)
  const createGardenFrame = (canvas: fabric.Canvas) => {
    const { frameLeft, frameTop, gardenWidth, gardenHeight } = getFrameOffset(canvas)
    
    // Create frame rectangle (non-editable boundary)
    const frameRect = new fabric.Rect({
      left: frameLeft,
      top: frameTop,
      width: gardenWidth,
      height: gardenHeight,
      fill: 'transparent',
      stroke: '#4a7c59',
      strokeWidth: 4,
      strokeDashArray: [10, 5],
      rx: 4,
      ry: 4,
      selectable: false,
      evented: false,
      excludeFromExport: false,
      hoverCursor: 'default',
      name: 'garden-frame' // Mark for easy identification
    })
    
    // Add label
    const label = new fabric.Text(
      `Участок: ${garden.width}×${garden.height} м`,
      {
        left: frameLeft + gardenWidth / 2,
        top: frameTop - 25,
        fontSize: 14,
        fill: '#4a7c59',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        hoverCursor: 'default',
        name: 'garden-label'
      }
    )
    
    // Create dot grid at 1m intervals
    const dots: fabric.Circle[] = []
    for (let x = 0; x <= garden.width; x++) {
      for (let y = 0; y <= garden.height; y++) {
        const dot = new fabric.Circle({
          left: frameLeft + x * SCALE,
          top: frameTop + y * SCALE,
          radius: 1,
          fill: '#ccc',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          name: 'grid-dot'
        })
        dots.push(dot)
      }
    }

    return { frameRect, label, frameLeft, frameTop, dots }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    // Wait for canvas to be fully ready in DOM and verify context
    const initCanvas = () => {
      if (!canvasRef.current) return
      
      // Verify canvas element has context
      const canvasElement = canvasRef.current
      const context = canvasElement.getContext('2d')
      if (!context) {
        console.warn('Canvas context not available, retrying...')
        setTimeout(initCanvas, 50)
        return
      }
      
      // Dispose existing canvas if any
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose()
        } catch (e) {
          console.warn('Error disposing canvas:', e)
        }
        fabricCanvasRef.current = null
      }
      
      // Get container dimensions for canvas
      const canvasWrapper = canvasElement.parentElement
      if (!canvasWrapper) {
        console.warn('Canvas wrapper not found, retrying...')
        setTimeout(initCanvas, 50)
        return
      }

      const containerWidth = canvasWrapper.clientWidth || 800
      const containerHeight = canvasWrapper.clientHeight || 600

      try {
        const fabricCanvas = new fabric.Canvas(canvasElement, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: '#e8f5e9',
          renderOnAddRemove: true
        })

        fabricCanvasRef.current = fabricCanvas
        
        // Initialize viewport transform for zoom
        fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0]
        
        setCanvasReady(true)
        setZoom(1)
        zoomRef.current = 1
        
        // Ensure upper canvas (interactive layer) is transparent
        setTimeout(() => {
          const fabricContainer = canvasElement.parentElement
          if (fabricContainer) {
            // Canvas should fill container
            fabricContainer.style.width = '100%'
            fabricContainer.style.height = '100%'
            fabricContainer.style.margin = '0'
            fabricContainer.style.padding = '0'
            fabricContainer.style.boxSizing = 'border-box'
            
            // Find and make upper canvas transparent
            const upperCanvas = fabricContainer.querySelector('.upper-canvas') as HTMLCanvasElement
            if (upperCanvas) {
              upperCanvas.style.backgroundColor = 'transparent'
              upperCanvas.style.background = 'transparent'
              upperCanvas.style.margin = '0'
              upperCanvas.style.padding = '0'
              upperCanvas.style.width = '100%'
              upperCanvas.style.height = '100%'
            }
            
            // Ensure lower canvas also has no margins
            const lowerCanvas = fabricContainer.querySelector('.lower-canvas') as HTMLCanvasElement
            if (lowerCanvas) {
              lowerCanvas.style.margin = '0'
              lowerCanvas.style.padding = '0'
              lowerCanvas.style.width = '100%'
              lowerCanvas.style.height = '100%'
            }
            
          }
        }, 0)

        // Load objects from database
        loadObjects(fabricCanvas).catch(error => {
          console.error('Error in initial load:', error)
        })
      } catch (error) {
        console.error('Error initializing fabric canvas:', error)
      }
    }

    // Use requestAnimationFrame to ensure canvas is in DOM
    const rafId = requestAnimationFrame(() => {
      initCanvas()
    })

    return () => {
      cancelAnimationFrame(rafId)
      setCanvasReady(false)
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose()
          fabricCanvasRef.current = null
        } catch (e) {
          console.warn('Error cleaning up canvas:', e)
        }
      }
    }
  }, [garden])

  // Handle window resize to update canvas size
  useEffect(() => {
    if (!fabricCanvasRef.current || !canvasRef.current) return

    const handleResize = () => {
      const canvasWrapper = canvasRef.current?.parentElement
      if (!canvasWrapper) return

      const containerWidth = canvasWrapper.clientWidth || 800
      const containerHeight = canvasWrapper.clientHeight || 600
      const canvas = fabricCanvasRef.current

      if (canvas) {
        canvas.setWidth(containerWidth)
        canvas.setHeight(containerHeight)
        // Reload objects to update frame position
        loadObjects(canvas).catch(console.error)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [canvasReady])

  // Setup event handlers in separate effect after canvas is created
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !canvasReady) {
      return
    }

    // Helper function to extract selected object with data
    const getSelectedObject = (): FabricObjectWithData | null => {
      const activeObject = canvas.getActiveObject() as FabricObjectWithData
      if (!activeObject) return null

      // If object has data, return it
      if (activeObject.data && activeObject.data.id !== undefined) {
        return activeObject
      }

      // If it's a group, try to get data from child objects
      if (activeObject.type === 'group') {
        const group = activeObject as fabric.Group
        // Try to find rect with data
        const rect = group.getObjects().find((o: any) => {
          return (o.type === 'rect' || o.type === 'group') && o.data && o.data.id !== undefined
        })
        if (rect && (rect as any).data) {
          // Copy data to group
          activeObject.data = (rect as any).data
          return activeObject
        }
        // Also check all objects in group
        for (const obj of group.getObjects()) {
          const objWithData = obj as FabricObjectWithData
          if (objWithData.data && objWithData.data.id !== undefined) {
            activeObject.data = objWithData.data
            return activeObject
          }
        }
      }

      // Try to get data from active selection (multi-select scenario)
      const activeSelection = canvas.getActiveObjects()
      if (activeSelection.length > 0) {
        const firstObj = activeSelection[0] as FabricObjectWithData
        if (firstObj.data && firstObj.data.id !== undefined) {
          return firstObj
        }
      }

      return null
    }

    // Helper function to notify sidebar about canvas selection
    const notifySelectionChange = (selected: FabricObjectWithData | null) => {
      if (selected && selected.data && selected.data.id !== undefined) {
        // Dispatch event to notify sidebar
        window.dispatchEvent(new CustomEvent('canvasObjectSelected', { 
          detail: { objectId: selected.data.id } 
        }))
      } else {
        // Clear selection in sidebar
        window.dispatchEvent(new CustomEvent('canvasObjectSelected', { 
          detail: { objectId: null } 
        }))
      }
    }

    // Handle object selection
    const handleSelectionCreated = () => {
      const selected = getSelectedObject()
      setSelectedObject(selected)
      notifySelectionChange(selected)
    }
    
    const handleSelectionUpdated = () => {
      const selected = getSelectedObject()
      setSelectedObject(selected)
      notifySelectionChange(selected)
    }
    
    const handleSelectionCleared = () => {
      setSelectedObject(null)
      notifySelectionChange(null)
    }

    // Also handle object:selected event (fires when object is clicked)
    const handleObjectSelected = () => {
      const selected = getSelectedObject()
      setSelectedObject(selected)
      notifySelectionChange(selected)
    }

      // Helper function to extract and save object position/size
      const saveObjectChanges = async (obj: FabricObjectWithData) => {
        if (!obj || !obj.data || !obj.data.id || !fabricCanvasRef.current) return

        const fabricObject = obj as fabric.Object
        const canvas = fabricCanvasRef.current

        if (typeof fabricObject.setCoords === 'function') {
          fabricObject.setCoords()
        }

        const leftPx = fabricObject.left ?? 0
        const topPx = fabricObject.top ?? 0

        // Get scaled dimensions - need to call methods with proper context
        let widthPx: number
        let heightPx: number
        
        if (typeof (fabricObject as any).getScaledWidth === 'function') {
          try {
            widthPx = (fabricObject as any).getScaledWidth.call(fabricObject)
          } catch (e) {
            widthPx = (fabricObject.width ?? 0) * (fabricObject.scaleX ?? 1)
          }
        } else {
          widthPx = (fabricObject.width ?? 0) * (fabricObject.scaleX ?? 1)
        }
        
        if (typeof (fabricObject as any).getScaledHeight === 'function') {
          try {
            heightPx = (fabricObject as any).getScaledHeight.call(fabricObject)
          } catch (e) {
            heightPx = (fabricObject.height ?? 0) * (fabricObject.scaleY ?? 1)
          }
        } else {
          heightPx = (fabricObject.height ?? 0) * (fabricObject.scaleY ?? 1)
        }

        // Get frame offset and convert to garden coordinates
        const { frameLeft, frameTop } = getFrameOffset(canvas)
        let x = (leftPx - frameLeft) / SCALE
        let y = (topPx - frameTop) / SCALE
        let width = widthPx / SCALE
        let height = heightPx / SCALE
        const rotation = (((fabricObject.angle ?? 0) % 360) + 360) % 360

        // No validation - objects can be outside garden bounds
        // Only ensure minimum size
        width = Math.max(0.1, width)
        height = Math.max(0.1, height)

      // Save to database
      try {
        await db.objects.update(obj.data.id, {
          x,
          y,
          width,
          height,
          rotation,
          updatedAt: Date.now()
        })
        
        // Notify sidebar of the update
        window.dispatchEvent(new CustomEvent('objectsUpdate'))
      } catch (error) {
        console.error('Error updating object:', error)
      }
    }

    // Debounce timer map for delayed saves during dragging/scaling
    const debounceTimers = new Map<number, ReturnType<typeof setTimeout>>()

    // Handle object moving (with debounce for performance)
    const handleObjectMoving = (e: any) => {
      const obj = e.target as FabricObjectWithData
      if (!obj || !obj.data || !obj.data.id) return
      
      // Clear existing timer for this object
      const existingTimer = debounceTimers.get(obj.data.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      // Set new timer for debounced save (500ms delay)
      const timer = setTimeout(() => {
        saveObjectChanges(obj)
        debounceTimers.delete(obj.data.id)
      }, 500)
      
      debounceTimers.set(obj.data.id, timer)
    }

    // Handle object scaling (with debounce for performance)
    const handleObjectScaling = (e: any) => {
      const obj = e.target as FabricObjectWithData
      if (!obj || !obj.data || !obj.data.id) return
      
      // Clear existing timer for this object
      const existingTimer = debounceTimers.get(obj.data.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      // Set new timer for debounced save (500ms delay)
      const timer = setTimeout(() => {
        saveObjectChanges(obj)
        debounceTimers.delete(obj.data.id)
      }, 500)
      
      debounceTimers.set(obj.data.id, timer)
    }

    // Handle object modification (final save - immediate, no debounce)
    const handleObjectModified = async (e: any) => {
      const obj = e.target as FabricObjectWithData
      if (!obj || !obj.data || !obj.data.id) return
      
      // Clear any pending debounced save for this object
      const existingTimer = debounceTimers.get(obj.data.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
        debounceTimers.delete(obj.data.id)
      }
      
      // Save immediately (final position/size)
      await saveObjectChanges(obj)
    }

    // Handle mouse up to check selection after click
    const handleMouseUp = (e: any) => {
      // Handle placement mode - create object on canvas click
      if (placementMode && e.e && e.e.ctrlKey === false && e.e.shiftKey === false) {
        // Check if we clicked on an existing object - if so, don't create new one
        const target = e.target
        if (target && (target.data?.id !== undefined || target.type === 'group' || target.type === 'rect')) {
          // Clicked on existing object, exit placement mode
          setPlacementMode(false)
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.defaultCursor = 'default'
          }
          return
        }
        
        const pointer = canvas.getPointer(e.e)
        
        // Get frame offset and convert to garden coordinates
        const { frameLeft, frameTop } = getFrameOffset(canvas)
        const xInGarden = (pointer.x - frameLeft) / SCALE
        const yInGarden = (pointer.y - frameTop) / SCALE
        
        // Default sizes based on type
        const defaultWidth = selectedType === 'bed' ? 2 : selectedType === 'path' ? 1 : 3
        const defaultHeight = selectedType === 'bed' ? 1 : selectedType === 'path' ? 1 : 2
        
        // Create object at clicked position (no bounds checking - objects can be outside garden)
        createObject({
          type: selectedType,
          x: xInGarden - defaultWidth / 2, // Center object on click
          y: yInGarden - defaultHeight / 2,
          width: defaultWidth,
          height: defaultHeight,
          rotation: 0
        }).catch(error => {
          console.error('Error creating object:', error)
          alert(`Ошибка при создании объекта: ${error instanceof Error ? error.message : String(error)}`)
        })
        
        // Exit placement mode after creating
        setPlacementMode(false)
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.defaultCursor = 'default'
        }
        return
      }
      
      // Small delay to ensure fabric.js has updated active object
      setTimeout(() => {
        const selected = getSelectedObject()
        if (selected) {
          setSelectedObject(selected)
          notifySelectionChange(selected)
        }
      }, 10)
    }

    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionUpdated)
    canvas.on('selection:cleared', handleSelectionCleared)
    canvas.on('object:selected', handleObjectSelected)
    canvas.on('mouse:up', handleMouseUp)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:moving', handleObjectMoving)
    canvas.on('object:scaling', handleObjectScaling)

    const handleDblClick = async (opt: any) => {
      const target = opt.target as FabricObjectWithData
      if (!target?.data?.id) return
      const objectId = target.data.id
      const objType = target.data.type
      if (objType === 'bed') {
        let bed = await db.beds.where({ objectId, year: activeYear }).first()
        if (!bed) {
          const newId = await db.beds.add({ objectId, year: activeYear, createdAt: Date.now(), updatedAt: Date.now() })
          bed = await db.beds.get(newId as number) ?? undefined
        }
        if (bed?.id) {
          window.dispatchEvent(new CustomEvent('openBedEditor', { detail: { bedId: bed.id } }))
        }
      } else if (objType === 'bush') {
        let bush = await db.bushes.where({ objectId, year: activeYear }).first()
        if (!bush) {
          const newId = await db.bushes.add({ objectId, year: activeYear, createdAt: Date.now(), updatedAt: Date.now() })
          bush = await db.bushes.get(newId as number) ?? undefined
        }
        if (bush?.id) {
          window.dispatchEvent(new CustomEvent('openBushEditor', { detail: { bushId: bush.id } }))
        }
      }
    }
    canvas.on('mouse:dblclick', handleDblClick)

    // Handle mouse wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (!canvas) return
      
      // Prevent default scrolling
      e.preventDefault()
      
      // Get mouse position relative to canvas
      const pointer = canvas.getPointer(e as any)
      const delta = e.deltaY
      
      // Get current zoom from ref
      const currentZoom = zoomRef.current
      
      // Zoom factor (negative delta = zoom in, positive = zoom out)
      const zoomFactor = delta > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(5, currentZoom * zoomFactor))
      
      // Calculate zoom around mouse pointer
      const vpt = canvas.viewportTransform
      if (!vpt) return
      
      // Get current pan offset
      const panX = vpt[4] || 0
      const panY = vpt[5] || 0
      
      // Calculate zoom around mouse pointer
      const zoomChange = newZoom / currentZoom
      const mouseX = pointer.x
      const mouseY = pointer.y
      
      // Adjust pan to zoom around mouse pointer
      const newPanX = mouseX - (mouseX - panX) * zoomChange
      const newPanY = mouseY - (mouseY - panY) * zoomChange
      
      // Apply zoom and pan to viewport transform
      vpt[0] = newZoom
      vpt[3] = newZoom
      vpt[4] = newPanX
      vpt[5] = newPanY
      
      // Update zoom in both state and ref
      zoomRef.current = newZoom
      setZoom(newZoom)
      
      canvas.requestRenderAll()
    }

    const canvasElement = canvas.getElement()
    canvasElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      try {
        canvas.off('selection:created', handleSelectionCreated)
        canvas.off('selection:updated', handleSelectionUpdated)
        canvas.off('selection:cleared', handleSelectionCleared)
        canvas.off('object:selected', handleObjectSelected)
        canvas.off('mouse:up', handleMouseUp)
        canvas.off('object:modified', handleObjectModified)
        canvas.off('object:moving', handleObjectMoving)
        canvas.off('object:scaling', handleObjectScaling)
        canvas.off('mouse:dblclick', handleDblClick)

        // Remove wheel event listener
        const canvasElement = canvas.getElement()
        canvasElement.removeEventListener('wheel', handleWheel)
        
        // Clear all debounce timers
        debounceTimers.forEach((timer) => {
          clearTimeout(timer)
        })
        debounceTimers.clear()
      } catch (e) {
        // Canvas may already be disposed
      }
    }
  }, [garden, placementMode, selectedType, canvasReady, activeYear])

  // Reload objects when activeYear changes
  useEffect(() => {
    if (fabricCanvasRef.current && canvasReady) {
      loadObjects(fabricCanvasRef.current).catch(console.error)
    }
  }, [activeYear, canvasReady])

  // Listen for garden updates to reload objects
  useEffect(() => {
    const handleGardenUpdate = () => {
      if (fabricCanvasRef.current) {
        loadObjects(fabricCanvasRef.current).catch(console.error)
      }
    }
    
    const handleSelectObject = (e: Event) => {
      const customEvent = e as CustomEvent<{ objectId?: number }>
      const objectId = customEvent.detail?.objectId
      if (objectId && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current
        const targetObject = canvas.getObjects().find((obj: any) => {
          const objData = obj as FabricObjectWithData
          return objData.data?.id === objectId
        })
        if (targetObject) {
          canvas.setActiveObject(targetObject)
          // Center the object in viewport
          canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
          const center = targetObject.getCenterPoint()
          const vpt = canvas.viewportTransform
          if (vpt) {
            const canvasWidth = canvas.width || 0
            const canvasHeight = canvas.height || 0
            vpt[4] = canvasWidth / 2 - center.x * vpt[0]
            vpt[5] = canvasHeight / 2 - center.y * vpt[3]
          }
          canvas.requestRenderAll()
          setSelectedObject(targetObject as FabricObjectWithData)
        }
      }
    }
    
    const handleOpenBedEditorEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ bedId?: number }>
      const bedId = customEvent.detail?.bedId
      if (!bedId) return
      setBedEditorBedId(bedId)
      setShowBedEditor(true)
    }

    const handleOpenBushEditorEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ bushId?: number }>
      const bushId = customEvent.detail?.bushId
      if (!bushId) return
      setBushEditorBushId(bushId)
      setShowBushEditor(true)
    }

    window.addEventListener('gardenUpdate', handleGardenUpdate)
    window.addEventListener('selectObject', handleSelectObject as EventListener)
    window.addEventListener('openBedEditor', handleOpenBedEditorEvent as EventListener)
    window.addEventListener('openBushEditor', handleOpenBushEditorEvent as EventListener)
    return () => {
      window.removeEventListener('gardenUpdate', handleGardenUpdate)
      window.removeEventListener('selectObject', handleSelectObject as EventListener)
      window.removeEventListener('openBedEditor', handleOpenBedEditorEvent as EventListener)
      window.removeEventListener('openBushEditor', handleOpenBushEditorEvent as EventListener)
    }
  }, [])

  // Function to delete object by ID
  const deleteObjectById = async (id: number) => {
    if (!fabricCanvasRef.current) return
    
    try {
      // Remove object from canvas
      const objectsToRemove = fabricCanvasRef.current.getObjects().filter(
        (obj: any) => {
          const objData = obj as FabricObjectWithData
          return objData.data?.id === id
        }
      )
      
      objectsToRemove.forEach((obj: any) => {
        fabricCanvasRef.current!.remove(obj)
      })
      fabricCanvasRef.current.discardActiveObject()
      fabricCanvasRef.current.requestRenderAll()
      
      // Delete from database
      await db.objects.delete(id)

      // Delete related care history (keyed by objectId)
      await db.careHistory.where('bedId').equals(id).delete()

      // Delete related bed if exists
      const bed = await db.beds.where('objectId').equals(id).first()
      if (bed?.id) {
        await db.beds.delete(bed.id)
      }

      // Delete related bush if exists
      const bush = await db.bushes.where('objectId').equals(id).first()
      if (bush?.id) {
        await db.bushes.delete(bush.id)
      }
      
      // Clear selection if deleted object was selected
      setSelectedObject((current: FabricObjectWithData | null) => {
        if (current && current.data?.id === id) {
          return null
        }
        return current
      })
      
      // Notify sidebar of the update
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    } catch (error) {
      console.error('Error deleting object:', error)
      alert(`Ошибка при удалении объекта: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Create custom delete control
  const createDeleteControl = () => {
    const controlSize = 28
    return new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -15,
      cursorStyle: 'pointer',
      // @ts-ignore - sizeX and sizeY properties
      sizeX: controlSize,
      // @ts-ignore
      sizeY: controlSize,
      mouseUpHandler: (_eventData: MouseEvent, transformData: any) => {
        const target = transformData.target as FabricObjectWithData
        if (target && target.data && target.data.id !== undefined) {
          if (confirm('Удалить этот объект?')) {
            deleteObjectById(target.data.id)
          }
          return true
        }
        return false
      },
      render: (ctx: CanvasRenderingContext2D, left: number, top: number, _styleOverride: any, fabricObject: fabric.Object) => {
        const size = controlSize
        ctx.save()
        ctx.translate(left, top)
        // @ts-ignore - fabric.util exists but types may not be complete
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0))
        
        // Draw delete button background (red circle with shadow)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
        ctx.fillStyle = '#d32f2f'
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2.5
        ctx.stroke()
        
        // Draw X icon
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        const crossSize = size / 3
        ctx.moveTo(-crossSize, -crossSize)
        ctx.lineTo(crossSize, crossSize)
        ctx.moveTo(crossSize, -crossSize)
        ctx.lineTo(-crossSize, crossSize)
        ctx.stroke()
        
        ctx.restore()
      }
    })
  }

  const loadObjects = async (canvas: fabric.Canvas) => {
    try {
      // Verify canvas is still valid
      if (!canvas || !canvas.getContext()) {
        console.warn('Canvas is not available for loading objects')
        return
      }

      const allObjects = await db.objects.toArray()
      const allBeds = await db.beds.where('year').equals(activeYear).toArray()
      const allBushes = await db.bushes.where('year').equals(activeYear).toArray()
      const allPlants = await db.plants.toArray()
      
      setObjects(allObjects)

      // Clear canvas first (remove all objects except frame)
      try {
        const existingObjects = canvas.getObjects()
        existingObjects.forEach((obj: any) => {
          // Don't remove frame objects (they have selectable: false and evented: false)
          if (obj.name === 'garden-frame' || obj.name === 'garden-label' || obj.name === 'grid-dot') {
            return // Skip frame and grid objects
          }
          try {
            canvas.remove(obj)
          } catch (e) {
            console.warn('Error removing object:', e)
          }
        })
        canvas.backgroundColor = '#e8f5e9'
      } catch (e) {
        console.warn('Error clearing canvas:', e)
        return
      }
      
      // Add or update garden frame (so it's behind other objects)
      const existingFrame = canvas.getObjects().find((obj: any) => 
        obj.name === 'garden-frame'
      ) as fabric.Rect | undefined
      
      const existingLabel = canvas.getObjects().find((obj: any) => 
        obj.name === 'garden-label'
      ) as fabric.Text | undefined
      
      // Remove old grid dots
      canvas.getObjects().filter((obj: any) => obj.name === 'grid-dot').forEach((obj: any) => {
        canvas.remove(obj)
      })

      if (existingFrame && existingLabel) {
        const { frameRect, label, dots } = createGardenFrame(canvas)
        existingFrame.set({
          left: frameRect.left,
          top: frameRect.top,
          width: frameRect.width,
          height: frameRect.height
        })
        existingLabel.set({
          left: label.left,
          top: label.top,
          text: label.text
        })
        dots.forEach(dot => { canvas.add(dot); canvas.sendToBack(dot) })
        canvas.sendToBack(existingFrame)
        canvas.sendToBack(existingLabel)
      } else {
        const { frameRect, label, dots } = createGardenFrame(canvas)
        canvas.add(frameRect)
        canvas.add(label)
        dots.forEach(dot => { canvas.add(dot); canvas.sendToBack(dot) })
        canvas.sendToBack(frameRect)
        canvas.sendToBack(label)
      }

      if (allObjects.length === 0) {
        canvas.requestRenderAll()
        return
      }

      // Sort objects by priority: greenhouse and hotbed first (low priority), then all others (high priority including beds)
      const sortedObjects = [...allObjects].sort((a, b) => {
        const aLowPriority = a.type === 'greenhouse' || a.type === 'hotbed'
        const bLowPriority = b.type === 'greenhouse' || b.type === 'hotbed'
        if (aLowPriority && !bLowPriority) return -1 // a goes first
        if (!aLowPriority && bLowPriority) return 1  // b goes first
        return 0 // keep original order for same priority
      })

      // Get frame offset
      const { frameLeft, frameTop } = getFrameOffset(canvas)

      // Add all objects in priority order
      for (const obj of sortedObjects as GardenObject[]) {
        if (!obj.id) continue
        
        // Ensure minimum visible size
        const minSize = 20 // minimum 20 pixels for visibility
        const rectWidth = Math.max(minSize, obj.width * SCALE)
        const rectHeight = Math.max(minSize, obj.height * SCALE)
        
        // Calculate position relative to frame (frame is centered on canvas)
        const objectLeft = frameLeft + obj.x * SCALE
        const objectTop = frameTop + obj.y * SCALE
        
        // Create rectangle and text in a group so they move together
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: rectWidth,
          height: rectHeight,
          fill: objectTypes[obj.type].color,
          opacity: 0.9,
          stroke: objectTypes[obj.type].strokeColor || '#333',
          strokeWidth: 3,
          rx: obj.type === 'bed' ? 5 : 2,
          ry: obj.type === 'bed' ? 5 : 2,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          originX: 'left',
          originY: 'top',
          shadow: {
            color: 'rgba(0,0,0,0.2)',
            blur: 4,
            offsetX: 2,
            offsetY: 2
          }
        })

        rect.data = { id: obj.id, type: obj.type }

        // Determine if emoji should be shown (not for path, greenhouse, hotbed)
        const shouldShowEmoji = obj.type !== 'path' && obj.type !== 'greenhouse' && obj.type !== 'hotbed'
        let emojiToShow: string | null = null
        
        if (shouldShowEmoji) {
          emojiToShow = objectTypes[obj.type].emoji
          if (obj.type === 'bed') {
            // Check if bed has a plant
            const bed = allBeds.find(b => b.objectId === obj.id)
            if (bed && bed.plantId) {
              const plant = allPlants.find(p => p.id === bed.plantId)
              if (plant) {
                emojiToShow = plant.emoji
              }
            }
          } else if (obj.type === 'bush') {
            // Check if bush has a plant
            const bush = allBushes.find(b => b.objectId === obj.id)
            if (bush && bush.plantId) {
              const plant = allPlants.find(p => p.id === bush.plantId)
              if (plant) {
                emojiToShow = plant.emoji
              }
            }
          }
        }

        // Create group with or without text depending on whether emoji should be shown
        const groupElements: fabric.Object[] = [rect]
        
        if (shouldShowEmoji && emojiToShow) {
          // Add label with emoji positioned on top of rect (relative to group origin)
          const fontSize = Math.max(16, Math.min(24, Math.min(rectWidth, rectHeight) * 0.4))
          const text = new fabric.Text(emojiToShow, {
            left: rectWidth / 2,
            top: rectHeight / 2,
            fontSize: fontSize,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            fontWeight: 'bold'
          })
          groupElements.push(text)
        }

        // Create group so text moves with rect
        const group = new fabric.Group(groupElements, {
          left: objectLeft,
          top: objectTop,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          originX: 'left',
          originY: 'top',
          angle: obj.rotation || 0
        })

        const groupWithData = group as FabricObjectWithData
        groupWithData.data = { id: obj.id, type: obj.type }
        
        // Add delete control to the group
        const deleteControl = createDeleteControl()
        // @ts-ignore - fabric Control type
        group.controls.deleteControl = deleteControl
        
        try {
          canvas.add(group)
        } catch (e) {
          console.error(`Error adding group ${obj.id}:`, e)
          continue
        }
      }
      
      // Force canvas to render
      canvas.requestRenderAll()
      
      // Ensure container has proper dimensions
      const canvasElement = canvas.getElement()
      const fabricContainer = canvasElement.parentElement
      if (fabricContainer) {
        const containerWidth = canvas.width || canvasElement.width
        const containerHeight = canvas.height || canvasElement.height
        fabricContainer.style.width = `${containerWidth}px`
        fabricContainer.style.height = `${containerHeight}px`
        fabricContainer.style.minWidth = `${containerWidth}px`
        fabricContainer.style.minHeight = `${containerHeight}px`
        fabricContainer.style.margin = '0'
        fabricContainer.style.padding = '0'
        fabricContainer.style.boxSizing = 'border-box'
        
        // Ensure upper canvas is transparent (only for interaction, not rendering)
        const upperCanvas = fabricContainer.querySelector('.upper-canvas') as HTMLCanvasElement
        if (upperCanvas) {
          upperCanvas.style.backgroundColor = 'transparent'
          upperCanvas.style.background = 'transparent'
          upperCanvas.style.margin = '0'
          upperCanvas.style.padding = '0'
          // Clear the upper canvas if it has any content
          const upperCtx = upperCanvas.getContext('2d')
          if (upperCtx) {
            upperCtx.clearRect(0, 0, upperCanvas.width, upperCanvas.height)
          }
        }
        
        // Ensure lower canvas also has no margins
        const lowerCanvas = fabricContainer.querySelector('.lower-canvas') as HTMLCanvasElement
        if (lowerCanvas) {
          lowerCanvas.style.margin = '0'
          lowerCanvas.style.padding = '0'
        }
      }
      
      // Clean up any debug styles
      const wrapper = fabricContainer?.parentElement
      
      canvasElement.style.border = ''
      canvasElement.style.outline = ''
      canvasElement.style.margin = '0'
      canvasElement.style.padding = '0'
      if (fabricContainer) {
        fabricContainer.style.border = ''
        fabricContainer.style.backgroundColor = ''
      }
      if (wrapper) {
        wrapper.style.border = ''
        wrapper.style.backgroundColor = ''
      }
    } catch (error) {
      console.error('Error loading objects:', error)
    }
  }

  const createObject = async (obj: Omit<GardenObject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newObj: Omit<GardenObject, 'id'> = {
        ...obj,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const id = await db.objects.add(newObj as GardenObject)
      
      // If it's a bed, create bed record
      if (obj.type === 'bed') {
        await db.beds.add({
          objectId: id as number,
          year: activeYear,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      }

      // If it's a bush, create bush record
      if (obj.type === 'bush') {
        await db.bushes.add({
          objectId: id as number,
          year: activeYear,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      }

      // Reload canvas - use setTimeout to ensure DB write is complete
      if (fabricCanvasRef.current) {
        // Small delay to ensure DB write is committed
        await new Promise(resolve => setTimeout(resolve, 100))
        await loadObjects(fabricCanvasRef.current)
      }
      
      // Notify sidebar of the update
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    } catch (error) {
      console.error('Error creating object:', error)
      throw error
    }
  }

  const updateObject = async (id: number | undefined, updates: Partial<GardenObject>) => {
    if (!id) return
    try {
      await db.objects.update(id, {
        ...updates,
        updatedAt: Date.now()
      })
      
      // Reload objects list
      const allObjects = await db.objects.toArray()
      setObjects(allObjects)
      
      // If updates include position/size, update canvas object directly instead of reloading
      if (fabricCanvasRef.current && (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined || updates.rotation !== undefined)) {
        const canvas = fabricCanvasRef.current
        const targetObject = canvas.getObjects().find((obj: any) => {
          const objData = obj as FabricObjectWithData
          return objData.data?.id === id
        })
        
        if (targetObject) {
          const group = targetObject as fabric.Group
          if (updates.x !== undefined) group.set('left', updates.x * SCALE)
          if (updates.y !== undefined) group.set('top', updates.y * SCALE)
          if (updates.width !== undefined) {
            const rect = group.getObjects()[0] as fabric.Rect
            if (rect) {
              rect.set('width', Math.max(20, updates.width * SCALE))
            }
            group.set('width', Math.max(20, updates.width * SCALE))
          }
          if (updates.height !== undefined) {
            const rect = group.getObjects()[0] as fabric.Rect
            if (rect) {
              rect.set('height', Math.max(20, updates.height * SCALE))
            }
            group.set('height', Math.max(20, updates.height * SCALE))
          }
          if (updates.rotation !== undefined) {
            group.set('angle', updates.rotation)
          }
          canvas.requestRenderAll()
        } else {
          // Fallback: reload if object not found
          await loadObjects(canvas)
        }
      } else if (fabricCanvasRef.current) {
        // For other updates, reload canvas
        await loadObjects(fabricCanvasRef.current)
      }
      
      // Notify sidebar of the update
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    } catch (error) {
      console.error('Error updating object:', error)
    }
  }

  const deleteSelectedObject = async () => {
    if (!selectedObject) {
      return
    }

    const objWithData = selectedObject as FabricObjectWithData
    if (!objWithData.data || objWithData.data.id === undefined) {
      return
    }

    const id = objWithData.data.id
    
    try {
      // Object can be a group, rect, or text - all have the same id
      const objectId = id
      
      // Remove object(s) with this id (could be group or separate rect/text)
      if (fabricCanvasRef.current) {
        const objectsToRemove = fabricCanvasRef.current.getObjects().filter(
          (obj: any) => {
            const objData = obj as FabricObjectWithData
            return objData.data?.id === objectId
          }
        )
        objectsToRemove.forEach((obj: any) => {
          fabricCanvasRef.current!.remove(obj)
        })
        fabricCanvasRef.current.discardActiveObject()
        fabricCanvasRef.current.requestRenderAll()
      }
      
      if (objectId !== undefined) {
        await db.objects.delete(objectId)

        // Delete related care history (keyed by objectId)
        await db.careHistory.where('bedId').equals(objectId).delete()

        // Delete related bed if exists
        const bed = await db.beds.where('objectId').equals(objectId).first()
        if (bed?.id) {
          await db.beds.delete(bed.id)
        }

        // Delete related bush if exists
        const bush = await db.bushes.where('objectId').equals(objectId).first()
        if (bush?.id) {
          await db.bushes.delete(bush.id)
        }
      }

      setSelectedObject(null)
      
      // Notify sidebar of the update
      window.dispatchEvent(new CustomEvent('objectsUpdate'))
    } catch (error) {
      console.error('Error deleting object:', error)
      alert(`Ошибка при удалении объекта: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handlePlaceObject = () => {
    setPlaceFormData({
      x: 0,
      y: 0,
      width: selectedType === 'bed' ? 2 : selectedType === 'path' ? 1 : 3,
      height: selectedType === 'bed' ? 1 : selectedType === 'path' ? 1 : 2,
      rotation: 0
    })
    setShowPlaceForm(true)
  }

  const handleStartPlacement = () => {
    setPlacementMode(true)
    setShowPlaceForm(false)
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.defaultCursor = 'crosshair'
    }
  }

  const handleCancelPlacement = () => {
    setPlacementMode(false)
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.defaultCursor = 'default'
    }
  }

  const handleOpenEditForm = () => {
    if (!selectedObject || !selectedObject.data || !selectedObject.data.id) return
    
    const objData = selectedObject as FabricObjectWithData
    let x = 0, y = 0, width = 2, height = 1, rotation = 0
    
    if (selectedObject.type === 'group') {
      const group = selectedObject as fabric.Group
      x = (group.left || 0) / SCALE
      y = (group.top || 0) / SCALE
      width = (group.width || 0) / SCALE
      height = (group.height || 0) / SCALE
      rotation = group.angle || 0
    } else if (selectedObject.type === 'rect') {
      const rect = selectedObject as fabric.Rect
      x = (rect.left || 0) / SCALE
      y = (rect.top || 0) / SCALE
      width = (rect.width || 0) / SCALE
      height = (rect.height || 0) / SCALE
      rotation = rect.angle || 0
    }
    
    setEditFormData({
      id: objData.data.id,
      x,
      y,
      width,
      height,
      rotation
    })
    setShowEditForm(true)
  }

  const handleSubmitEditForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate coordinates and sizes
    const x = Math.max(0, Math.min(editFormData.x, garden.width))
    const y = Math.max(0, Math.min(editFormData.y, garden.height))
    const width = Math.max(0.1, Math.min(editFormData.width, garden.width - x))
    const height = Math.max(0.1, Math.min(editFormData.height, garden.height - y))
    const rotation = editFormData.rotation % 360

    try {
      await updateObject(editFormData.id, {
        x,
        y,
        width,
        height,
        rotation
      })
      setShowEditForm(false)
    } catch (error) {
      console.error('Error updating object:', error)
      alert(`Ошибка при обновлении объекта: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleCancelEditForm = () => {
    setShowEditForm(false)
  }

  const handleSubmitPlaceForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate coordinates and sizes
    const x = Math.max(0, Math.min(placeFormData.x, garden.width))
    const y = Math.max(0, Math.min(placeFormData.y, garden.height))
    const width = Math.max(0.1, Math.min(placeFormData.width, garden.width - x))
    const height = Math.max(0.1, Math.min(placeFormData.height, garden.height - y))

    try {
      await createObject({
        type: selectedType,
        x,
        y,
        width,
        height,
        rotation: placeFormData.rotation || 0
      })
      setShowPlaceForm(false)
      setPlaceFormData({ x: 0, y: 0, width: 2, height: 1, rotation: 0 })
    } catch (error) {
      console.error('Error creating object:', error)
      alert(`Ошибка при создании объекта: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleCancelPlaceForm = () => {
    setShowPlaceForm(false)
    setPlaceFormData({ x: 0, y: 0, width: 2, height: 1, rotation: 0 })
  }

  // Zoom functions
  const handleZoomIn = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const currentZoom = zoomRef.current
    const newZoom = Math.min(5, currentZoom * 1.2)
    
    const vpt = canvas.viewportTransform
    if (!vpt) return
    
    // Zoom centered on canvas center
    const centerX = canvas.width! / 2
    const centerY = canvas.height! / 2
    const panX = vpt[4] || 0
    const panY = vpt[5] || 0
    
    const zoomChange = newZoom / currentZoom
    
    // Adjust pan to zoom around canvas center
    const newPanX = centerX - (centerX - panX) * zoomChange
    const newPanY = centerY - (centerY - panY) * zoomChange
    
    vpt[0] = newZoom
    vpt[3] = newZoom
    vpt[4] = newPanX
    vpt[5] = newPanY
    
    zoomRef.current = newZoom
    setZoom(newZoom)
    canvas.requestRenderAll()
  }

  const handleZoomOut = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const currentZoom = zoomRef.current
    const newZoom = Math.max(0.1, currentZoom / 1.2)
    
    const vpt = canvas.viewportTransform
    if (!vpt) return
    
    // Zoom centered on canvas center
    const centerX = canvas.width! / 2
    const centerY = canvas.height! / 2
    const panX = vpt[4] || 0
    const panY = vpt[5] || 0
    
    const zoomChange = newZoom / currentZoom
    
    // Adjust pan to zoom around canvas center
    const newPanX = centerX - (centerX - panX) * zoomChange
    const newPanY = centerY - (centerY - panY) * zoomChange
    
    vpt[0] = newZoom
    vpt[3] = newZoom
    vpt[4] = newPanX
    vpt[5] = newPanY
    
    zoomRef.current = newZoom
    setZoom(newZoom)
    canvas.requestRenderAll()
  }

  const handleResetZoom = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    
    // Reset viewport transform to default
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    zoomRef.current = 1
    setZoom(1)
    canvas.requestRenderAll()
  }

  return (
    <div className="garden-canvas-container">
      <div className="canvas-toolbar">
        <div className="object-types">
          {Object.keys(objectTypes).map((type) => (
            <button
              key={type}
              className={`type-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => {
                setSelectedType(type as GardenObject['type'])
                setShowPlaceForm(false)
                handleCancelPlacement()
              }}
              disabled={placementMode}
              title={objectTypes[type as keyof typeof objectTypes].name}
            >
              <span className="type-emoji">{objectTypes[type as keyof typeof objectTypes].emoji}</span>
              <span className="type-label">{objectTypes[type as keyof typeof objectTypes].name}</span>
            </button>
          ))}
        </div>
        {!placementMode ? (
          <>
            <button className="place-btn" onClick={handleStartPlacement} disabled={showPlaceForm || showEditForm}>
              Разместить кликом
            </button>
            <button className="place-btn" onClick={handlePlaceObject} disabled={showPlaceForm || showEditForm}>
              Разместить с формой
            </button>
          </>
        ) : (
          <button className="cancel-btn" onClick={handleCancelPlacement}>
            Отменить размещение
          </button>
        )}
        {selectedObject && selectedObject.data && (
          <>
            <button className="edit-btn" onClick={handleOpenEditForm} disabled={showPlaceForm || showEditForm || placementMode}>
              Редактировать
            </button>
            <button className="delete-btn" onClick={deleteSelectedObject}>
              Удалить
            </button>
          </>
        )}
        {placementMode && (
          <div className="placement-info">
            Режим размещения: кликните на холсте для создания объекта
          </div>
        )}
        {selectedObject && !placementMode && (
          <div className="selected-info">
            Выбран: {selectedObject.type || 'объект'}
          </div>
        )}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut} title="Отдалить" disabled={zoom <= 0.1}>
            −
          </button>
          <span className="zoom-level" title="Уровень зума">
            {Math.round(zoom * 100)}%
          </span>
          <button className="zoom-btn" onClick={handleZoomIn} title="Приблизить" disabled={zoom >= 5}>
            +
          </button>
          <button className="zoom-reset-btn" onClick={handleResetZoom} title="Сбросить зум">
            ⟲
          </button>
        </div>
      </div>
      <div className="canvas-wrapper" id="canvas-wrapper">
        <canvas ref={canvasRef} id="garden-canvas" />
      </div>
      <div className="canvas-info">
        Масштаб: 1 метр = {SCALE} пикселей | Размер участка: {garden.width}×{garden.height} м
      </div>

      {showPlaceForm && (
        <div className="place-form-overlay">
          <div className="place-form" onClick={(e) => e.stopPropagation()}>
            <div className="place-form-header">
              <h3>Разместить {objectTypes[selectedType].name}</h3>
              <button className="close-btn" onClick={handleCancelPlaceForm}>✕</button>
            </div>
            <form onSubmit={handleSubmitPlaceForm}>
              <div className="form-row">
                <div className="form-group">
                  <label>X координата (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={garden.width}
                    value={placeFormData.x}
                    onChange={(e) => setPlaceFormData({ ...placeFormData, x: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Y координата (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={garden.height}
                    value={placeFormData.y}
                    onChange={(e) => setPlaceFormData({ ...placeFormData, y: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ширина (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={garden.width}
                    value={placeFormData.width}
                    onChange={(e) => setPlaceFormData({ ...placeFormData, width: parseFloat(e.target.value) || 0.1 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Длина (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={garden.height}
                    value={placeFormData.height}
                    onChange={(e) => setPlaceFormData({ ...placeFormData, height: parseFloat(e.target.value) || 0.1 })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Поворот (градусы):</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="360"
                    value={placeFormData.rotation}
                    onChange={(e) => setPlaceFormData({ ...placeFormData, rotation: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Правая граница:</label>
                  <input
                    type="number"
                    value={(placeFormData.x + placeFormData.width).toFixed(1)}
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Нижняя граница:</label>
                  <input
                    type="number"
                    value={(placeFormData.y + placeFormData.height).toFixed(1)}
                    disabled
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Площадь:</label>
                  <input
                    type="number"
                    value={(placeFormData.width * placeFormData.height).toFixed(2)}
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelPlaceForm}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn">
                  Разместить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="place-form-overlay">
          <div className="place-form" onClick={(e) => e.stopPropagation()}>
            <div className="place-form-header">
              <h3>Редактировать объект</h3>
              <button className="close-btn" onClick={handleCancelEditForm}>✕</button>
            </div>
            <form onSubmit={handleSubmitEditForm}>
              <div className="form-row">
                <div className="form-group">
                  <label>X координата (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={garden.width}
                    value={editFormData.x}
                    onChange={(e) => setEditFormData({ ...editFormData, x: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Y координата (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={garden.height}
                    value={editFormData.y}
                    onChange={(e) => setEditFormData({ ...editFormData, y: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ширина (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={garden.width}
                    value={editFormData.width}
                    onChange={(e) => setEditFormData({ ...editFormData, width: parseFloat(e.target.value) || 0.1 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Длина (м):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={garden.height}
                    value={editFormData.height}
                    onChange={(e) => setEditFormData({ ...editFormData, height: parseFloat(e.target.value) || 0.1 })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Поворот (градусы):</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="360"
                    value={editFormData.rotation}
                    onChange={(e) => setEditFormData({ ...editFormData, rotation: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Правая граница:</label>
                  <input
                    type="number"
                    value={(editFormData.x + editFormData.width).toFixed(1)}
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Нижняя граница:</label>
                  <input
                    type="number"
                    value={(editFormData.y + editFormData.height).toFixed(1)}
                    disabled
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Площадь:</label>
                  <input
                    type="number"
                    value={(editFormData.width * editFormData.height).toFixed(2)}
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelEditForm}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBedEditor && bedEditorBedId && (
        <div className="place-form-overlay" onClick={() => setShowBedEditor(false)}>
          <div className="place-form bed-editor-modal" onClick={(e) => e.stopPropagation()}>
            <BedEditor
              bedId={bedEditorBedId}
              onClose={() => {
                setShowBedEditor(false)
                setBedEditorBedId(null)
              }}
              onUpdate={async () => {
                // Reload objects to reflect any changes
                if (fabricCanvasRef.current) {
                  await loadObjects(fabricCanvasRef.current)
                }
                window.dispatchEvent(new CustomEvent('objectsUpdate'))
              }}
            />
          </div>
        </div>
      )}

      {showBushEditor && bushEditorBushId && (
        <div className="place-form-overlay" onClick={() => setShowBushEditor(false)}>
          <div className="place-form bush-editor-modal" onClick={(e) => e.stopPropagation()}>
            <BushEditor
              bushId={bushEditorBushId}
              onClose={() => {
                setShowBushEditor(false)
                setBushEditorBushId(null)
              }}
              onUpdate={async () => {
                // Reload objects to reflect any changes
                if (fabricCanvasRef.current) {
                  await loadObjects(fabricCanvasRef.current)
                }
                window.dispatchEvent(new CustomEvent('objectsUpdate'))
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
