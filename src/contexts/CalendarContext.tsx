import React, { createContext, useContext, useEffect, useState } from "react"
import { ColorCode, ColorTextureCode, createDefaultLayer, CustomColors, DateCellData, generateLayerId, Layer } from "../utils/colors"

export type CalendarView = "Linear" | "Classic" | "Column"

interface CalendarContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  // Layer state
  layers: Layer[]
  activeLayerId: string
  setActiveLayerId: (id: string) => void
  addLayer: (name: string, color: ColorCode) => void
  removeLayer: (id: string) => void
  renameLayer: (id: string, name: string) => void
  toggleLayerVisibility: (id: string) => void
  // Active layer data (for painting)
  activeLayerCells: Map<string, DateCellData>
  setActiveLayerCells: (cells: Map<string, DateCellData>) => void
  // All layer data (for rendering merged view)
  allLayerData: Record<string, Map<string, DateCellData>>
  // Color/texture & view
  selectedColorTexture: ColorTextureCode
  setSelectedColorTexture: (colorTexture: ColorTextureCode) => void
  selectedView: CalendarView
  setSelectedView: (view: CalendarView) => void
  // Custom colors
  customColors: CustomColors
  setCustomColor: (code: ColorCode, cssColor: string) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

interface CalendarProviderProps {
  children: React.ReactNode
}

const STORAGE_KEY = "calendar_data"

// v2 format (old)
interface StoredDataV2 {
  selectedYear: number
  dateCells: Record<string, DateCellData>
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  version?: string
}

// v3 format (new, with layers)
interface StoredDataV3 {
  selectedYear: number
  layers: Layer[]
  layerData: Record<string, Record<string, DateCellData>>
  activeLayerId: string
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  customColors?: CustomColors
  version: "3.0"
}

type StoredData = StoredDataV2 | StoredDataV3

const isV3 = (data: StoredData): data is StoredDataV3 => {
  return data.version === "3.0"
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYearState] = useState(currentYear)
  const [layers, setLayersState] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerIdState] = useState<string>("")
  const [allLayerData, setAllLayerDataState] = useState<Record<string, Map<string, DateCellData>>>({})
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")
  const [customColors, setCustomColorsState] = useState<CustomColors>({})
  const [initialized, setInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData)

        if (
          parsedData.selectedYear &&
          parsedData.selectedYear >= currentYear - 1 &&
          parsedData.selectedYear <= currentYear + 5
        ) {
          setSelectedYearState(parsedData.selectedYear)
        }

        if (parsedData.selectedColorTexture) {
          setSelectedColorTextureState(parsedData.selectedColorTexture)
        }

        if (parsedData.selectedView && ["Linear", "Classic", "Column"].includes(parsedData.selectedView)) {
          setSelectedViewState(parsedData.selectedView)
        }

        if (isV3(parsedData)) {
          // Load v3 data
          setLayersState(parsedData.layers)
          setActiveLayerIdState(parsedData.activeLayerId)
          if (parsedData.customColors) {
            setCustomColorsState(parsedData.customColors)
          }
          const loadedData: Record<string, Map<string, DateCellData>> = {}
          for (const [layerId, cells] of Object.entries(parsedData.layerData)) {
            loadedData[layerId] = new Map(Object.entries(cells))
          }
          setAllLayerDataState(loadedData)
        } else if ((parsedData as StoredDataV2).dateCells) {
          // Migrate v2 data to v3
          const defaultLayer = createDefaultLayer()
          setLayersState([defaultLayer])
          setActiveLayerIdState(defaultLayer.id)
          const migratedCells = new Map(Object.entries((parsedData as StoredDataV2).dateCells))
          setAllLayerDataState({ [defaultLayer.id]: migratedCells })
        }
      }

      // If no data at all, create a default layer
      if (!storedData) {
        const defaultLayer = createDefaultLayer()
        setLayersState([defaultLayer])
        setActiveLayerIdState(defaultLayer.id)
        setAllLayerDataState({ [defaultLayer.id]: new Map() })
      }
    } catch (error) {
      console.error("Error loading calendar data from localStorage:", error)
      const defaultLayer = createDefaultLayer()
      setLayersState([defaultLayer])
      setActiveLayerIdState(defaultLayer.id)
      setAllLayerDataState({ [defaultLayer.id]: new Map() })
    }
    setInitialized(true)
  }, [currentYear])

  // Persist to localStorage
  const saveToLocalStorage = (
    year: number,
    lyrs: Layer[],
    data: Record<string, Map<string, DateCellData>>,
    activeId: string,
    colorTexture: ColorTextureCode,
    view: CalendarView,
    colors: CustomColors
  ) => {
    try {
      const serializedLayerData: Record<string, Record<string, DateCellData>> = {}
      for (const [layerId, cells] of Object.entries(data)) {
        serializedLayerData[layerId] = Object.fromEntries(cells)
      }
      const toSave: StoredDataV3 = {
        selectedYear: year,
        layers: lyrs,
        layerData: serializedLayerData,
        activeLayerId: activeId,
        selectedColorTexture: colorTexture,
        selectedView: view,
        customColors: Object.keys(colors).length > 0 ? colors : undefined,
        version: "3.0",
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error("Error saving calendar data to localStorage:", error)
    }
  }

  const save = (overrides: {
    year?: number
    lyrs?: Layer[]
    data?: Record<string, Map<string, DateCellData>>
    activeId?: string
    colorTexture?: ColorTextureCode
    view?: CalendarView
    colors?: CustomColors
  } = {}) => {
    saveToLocalStorage(
      overrides.year ?? selectedYear,
      overrides.lyrs ?? layers,
      overrides.data ?? allLayerData,
      overrides.activeId ?? activeLayerId,
      overrides.colorTexture ?? selectedColorTexture,
      overrides.view ?? selectedView,
      overrides.colors ?? customColors
    )
  }

  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    save({ year })
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
    // If the selection is a color (not texture), update the active layer's color to match
    const colorCodes: ColorCode[] = ["red", "orange", "green", "blue", "yellow", "purple", "teal", "pink"]
    if (colorCodes.includes(colorTexture as ColorCode)) {
      const newLayers = layers.map((l) =>
        l.id === activeLayerId ? { ...l, color: colorTexture as ColorCode } : l
      )
      setLayersState(newLayers)
      save({ colorTexture, lyrs: newLayers })
    } else {
      save({ colorTexture })
    }
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
    save({ view })
  }

  const setActiveLayerId = (id: string) => {
    setActiveLayerIdState(id)
    // Sync the selected color to match the layer's color
    const layer = layers.find((l) => l.id === id)
    if (layer) {
      setSelectedColorTextureState(layer.color)
      save({ activeId: id, colorTexture: layer.color })
    } else {
      save({ activeId: id })
    }
  }

  // Active layer cells convenience getter/setter
  const activeLayerCells = allLayerData[activeLayerId] || new Map()

  const setActiveLayerCells = (cells: Map<string, DateCellData>) => {
    const newData = { ...allLayerData, [activeLayerId]: cells }
    setAllLayerDataState(newData)
    save({ data: newData })
  }

  const addLayer = (name: string, color: ColorCode) => {
    const newLayer: Layer = {
      id: generateLayerId(),
      name,
      color,
      visible: true,
    }
    const newLayers = [...layers, newLayer]
    const newData = { ...allLayerData, [newLayer.id]: new Map<string, DateCellData>() }
    setLayersState(newLayers)
    setAllLayerDataState(newData)
    setActiveLayerIdState(newLayer.id)
    save({ lyrs: newLayers, data: newData, activeId: newLayer.id })
  }

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return // Don't remove the last layer
    const newLayers = layers.filter((l) => l.id !== id)
    const newData = { ...allLayerData }
    delete newData[id]
    const newActiveId = activeLayerId === id ? newLayers[0].id : activeLayerId
    setLayersState(newLayers)
    setAllLayerDataState(newData)
    setActiveLayerIdState(newActiveId)
    save({ lyrs: newLayers, data: newData, activeId: newActiveId })
  }

  const renameLayer = (id: string, name: string) => {
    const newLayers = layers.map((l) => (l.id === id ? { ...l, name } : l))
    setLayersState(newLayers)
    save({ lyrs: newLayers })
  }

  const toggleLayerVisibility = (id: string) => {
    const newLayers = layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    setLayersState(newLayers)
    save({ lyrs: newLayers })
  }

  const setCustomColor = (code: ColorCode, cssColor: string) => {
    const newColors = { ...customColors, [code]: cssColor }
    setCustomColorsState(newColors)
    save({ colors: newColors })
  }

  const value: CalendarContextType = {
    selectedYear,
    setSelectedYear,
    layers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    removeLayer,
    renameLayer,
    toggleLayerVisibility,
    activeLayerCells,
    setActiveLayerCells,
    allLayerData,
    selectedColorTexture,
    setSelectedColorTexture,
    selectedView,
    setSelectedView,
    customColors,
    setCustomColor,
  }

  if (!initialized) return null

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }
  return context
}
