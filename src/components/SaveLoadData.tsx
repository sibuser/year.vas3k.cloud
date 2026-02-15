import React, { useRef } from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { createDefaultLayer, DateCellData, UI_COLORS } from "../utils/colors"

const SaveLoadData: React.FC = () => {
  const {
    selectedYear,
    layers,
    allLayerData,
    activeLayerId,
    selectedColorTexture,
    selectedView,
    setSelectedYear,
    setSelectedColorTexture,
    setSelectedView,
  } = useCalendar()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveData = () => {
    const serializedLayerData: Record<string, Record<string, DateCellData>> = {}
    for (const [layerId, cells] of Object.entries(allLayerData)) {
      serializedLayerData[layerId] = Object.fromEntries(cells)
    }

    const dataToSave = {
      selectedYear,
      layers,
      layerData: serializedLayerData,
      activeLayerId,
      selectedColorTexture,
      selectedView,
      exportDate: new Date().toISOString(),
      version: "3.0",
    }

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `year-planner-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoadData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string)

        if (!loadedData || typeof loadedData !== "object") {
          alert("Invalid data file format")
          return
        }

        if (loadedData.selectedYear && typeof loadedData.selectedYear === "number") {
          setSelectedYear(loadedData.selectedYear)
        }
        if (loadedData.selectedColorTexture && typeof loadedData.selectedColorTexture === "string") {
          setSelectedColorTexture(loadedData.selectedColorTexture)
        }
        if (loadedData.selectedView && ["Linear", "Classic", "Column"].includes(loadedData.selectedView)) {
          setSelectedView(loadedData.selectedView)
        }

        // Determine format and build v3 storage
        let finalLayers = layers
        let finalLayerData: Record<string, Record<string, DateCellData>> = {}
        let finalActiveLayerId = activeLayerId

        if (loadedData.version === "3.0" && loadedData.layers && loadedData.layerData) {
          // v3 format
          finalLayers = loadedData.layers
          finalLayerData = loadedData.layerData
          finalActiveLayerId = loadedData.activeLayerId || loadedData.layers[0]?.id
        } else if (loadedData.dateCells && typeof loadedData.dateCells === "object") {
          // v2 format — migrate into a default layer
          const defaultLayer = createDefaultLayer()
          finalLayers = [defaultLayer]
          finalLayerData = { [defaultLayer.id]: loadedData.dateCells }
          finalActiveLayerId = defaultLayer.id
        }

        // Save directly to localStorage as v3
        const toSave = {
          selectedYear: loadedData.selectedYear || selectedYear,
          layers: finalLayers,
          layerData: finalLayerData,
          activeLayerId: finalActiveLayerId,
          selectedColorTexture: loadedData.selectedColorTexture || selectedColorTexture,
          selectedView: loadedData.selectedView || selectedView,
          version: "3.0",
        }
        localStorage.setItem("calendar_data", JSON.stringify(toSave))

        // Reload the page to pick up the new data
        window.location.reload()
      } catch (error) {
        alert("Error loading data: Invalid JSON format")
        console.error("Error parsing loaded data:", error)
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleCleanAll = () => {
    if (window.confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      localStorage.removeItem("calendar_data")
      window.location.reload()
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "30px",
          padding: "20px",
          borderTop: `1px solid ${UI_COLORS.border.tertiary}`,
        }}
      >
        <button
          onClick={handleSaveData}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: UI_COLORS.button.primary.normal,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            touchAction: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.primary.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.primary.normal
          }}
        >
          Save Data...
        </button>

        <button
          onClick={handleLoadData}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: UI_COLORS.button.success.normal,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            touchAction: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.success.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.success.normal
          }}
        >
          Load Data
        </button>

        <button
          onClick={handleCleanAll}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: UI_COLORS.button.danger.normal,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            touchAction: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.danger.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.button.danger.normal
          }}
        >
          Clean All
        </button>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: "none" }} />
      </div>

      <div
        style={{
          color: UI_COLORS.text.secondary,
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <p style={{ fontSize: "16px" }}>
          All changes on this page are saved locally in your browser. This page doesn't use any servers and works
          offline.
        </p>
        <p style={{ fontSize: "13px", paddingTop: "20px" }}>
          However, some browsers may occasionally delete your local storage to "save space", so we strongly recommend
          saving them to your hard drive using the buttons above.
        </p>
        <p style={{ fontSize: "13px", paddingBottom: "100px" }}>
          Ideas, bugs and feature requests — <a href="https://github.com/vas3k/year.vas3k.cloud">on GitHub</a>.
        </p>
      </div>
    </>
  )
}

export default SaveLoadData
