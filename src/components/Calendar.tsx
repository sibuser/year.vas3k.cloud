import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { COLORS, UI_COLORS } from "../utils/colors"
import CalendarTitle from "./CalendarTitle"
import ColorPicker from "./ColorPicker"
import LayerPanel from "./LayerPanel"
import SaveLoadData from "./SaveLoadData"
import ClassicView from "./views/ClassicView"
import ColumnView from "./views/ColumnView"
import LinearView from "./views/LinearView"
import ViewSelector from "./ViewSelector"

const LayerLegend: React.FC = () => {
  const { layers } = useCalendar()

  if (layers.length <= 1) return null

  return (
    <div className="print-only" style={{
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      marginTop: "10px",
      flexWrap: "wrap",
    }}>
      {layers.filter(l => l.visible).map((layer) => (
        <div key={layer.id} style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "10pt",
        }}>
          <div style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: COLORS[layer.color],
            border: `1px solid ${UI_COLORS.border.secondary}`,
          }} />
          <span>{layer.name}</span>
        </div>
      ))}
    </div>
  )
}

const Calendar: React.FC = () => {
  const {
    selectedYear,
    activeLayerCells,
    setActiveLayerCells,
    selectedColorTexture,
    selectedView,
    setSelectedView,
    layers,
    allLayerData,
    activeLayerId,
  } = useCalendar()

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div className="no-print">
        <CalendarTitle />
      </div>
      <div className="no-print">
        <LayerPanel />
        <ColorPicker />
        <ViewSelector selectedView={selectedView} onViewChange={setSelectedView} />
      </div>

      <div className="calendar-view-container">
      {selectedView === "Linear" ? (
        <LinearView
          selectedYear={selectedYear}
          dateCells={activeLayerCells}
          setDateCells={setActiveLayerCells}
          selectedColorTexture={selectedColorTexture}
          layers={layers}
          allLayerData={allLayerData}
          activeLayerId={activeLayerId}
        />
      ) : selectedView === "Classic" ? (
        <ClassicView
          selectedYear={selectedYear}
          dateCells={activeLayerCells}
          setDateCells={setActiveLayerCells}
          selectedColorTexture={selectedColorTexture}
          layers={layers}
          allLayerData={allLayerData}
          activeLayerId={activeLayerId}
        />
      ) : (
        <ColumnView
          selectedYear={selectedYear}
          dateCells={activeLayerCells}
          setDateCells={setActiveLayerCells}
          selectedColorTexture={selectedColorTexture}
          layers={layers}
          allLayerData={allLayerData}
          activeLayerId={activeLayerId}
        />
      )}
      </div>
      <LayerLegend />

      <div className="no-print">
        <SaveLoadData />
      </div>
    </div>
  )
}

export default Calendar
