import React, { useState } from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { ColorCode, COLORS, UI_COLORS } from "../utils/colors"

const ALL_COLORS: ColorCode[] = ["red", "orange", "green", "blue", "yellow", "purple", "teal", "pink"]

const LayerPanel: React.FC = () => {
  const { layers, activeLayerId, setActiveLayerId, addLayer, removeLayer, renameLayer, toggleLayerVisibility } =
    useCalendar()
  const [isAdding, setIsAdding] = useState(false)
  const [newLayerName, setNewLayerName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const usedColors = new Set(layers.map((l) => l.color))
  const nextAvailableColor = ALL_COLORS.find((c) => !usedColors.has(c)) || ALL_COLORS[0]

  const handleAddLayer = () => {
    if (newLayerName.trim()) {
      addLayer(newLayerName.trim(), nextAvailableColor)
      setNewLayerName("")
      setIsAdding(false)
    }
  }

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const handleFinishRename = () => {
    if (editingId && editName.trim()) {
      renameLayer(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
        flexWrap: "wrap",
      }}
    >
      {layers.map((layer) => {
        const isActive = layer.id === activeLayerId
        const isEditing = editingId === layer.id

        return (
          <div
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              border: isActive ? `2px solid ${UI_COLORS.border.primary}` : `1px solid ${UI_COLORS.border.secondary}`,
              backgroundColor: isActive ? UI_COLORS.background.quaternary : UI_COLORS.background.primary,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: isActive ? "bold" : "normal",
              fontSize: "13px",
            }}
          >
            {/* Color dot */}
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: COLORS[layer.color],
                flexShrink: 0,
              }}
            />

            {/* Name */}
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFinishRename()
                  if (e.key === "Escape") {
                    setEditingId(null)
                    setEditName("")
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "13px",
                  fontWeight: isActive ? "bold" : "normal",
                  width: `${Math.max(editName.length, 3)}ch`,
                  padding: 0,
                }}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  handleStartRename(layer.id, layer.name)
                }}
              >
                {layer.name}
              </span>
            )}

            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLayerVisibility(layer.id)
              }}
              title={layer.visible ? "Hide layer" : "Show layer"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 2px",
                fontSize: "14px",
                opacity: layer.visible ? 1 : 0.3,
                lineHeight: 1,
              }}
            >
              {layer.visible ? "◉" : "◎"}
            </button>

            {/* Delete button (only if more than 1 layer) */}
            {layers.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLayer(layer.id)
                }}
                title="Delete layer"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px",
                  fontSize: "12px",
                  color: UI_COLORS.text.secondary,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        )
      })}

      {/* Add layer */}
      {isAdding ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            borderRadius: "20px",
            border: `1px solid ${UI_COLORS.border.secondary}`,
            backgroundColor: UI_COLORS.background.primary,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: COLORS[nextAvailableColor],
              flexShrink: 0,
            }}
          />
          <input
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLayer()
              if (e.key === "Escape") {
                setIsAdding(false)
                setNewLayerName("")
              }
            }}
            onBlur={() => {
              if (newLayerName.trim()) {
                handleAddLayer()
              } else {
                setIsAdding(false)
              }
            }}
            placeholder="Layer name"
            autoFocus
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "13px",
              width: "80px",
              padding: 0,
            }}
          />
        </div>
      ) : (
        layers.length < 8 && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "20px",
              border: `1px dashed ${UI_COLORS.border.secondary}`,
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "13px",
              color: UI_COLORS.text.secondary,
              transition: "all 0.2s ease",
            }}
          >
            + Layer
          </button>
        )
      )}
    </div>
  )
}

export default LayerPanel
