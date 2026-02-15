import React, { useRef } from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { ALL_COLOR_TEXTURE_CODES, ColorCode, COLORS, ColorTextureCode, resolveColor, TEXTURES, UI_COLORS } from "../utils/colors"

const ColorPicker: React.FC = () => {
  const { selectedColorTexture, setSelectedColorTexture, customColors, setCustomColor } = useCalendar()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const editingCodeRef = useRef<ColorCode | null>(null)

  const getBackgroundStyle = (code: ColorTextureCode): React.CSSProperties => {
    if (code in COLORS) {
      return {
        backgroundColor: resolveColor(code as ColorCode, customColors),
      }
    } else {
      const textureCode = code as keyof typeof TEXTURES
      return {
        backgroundColor: UI_COLORS.background.secondary,
        backgroundImage: TEXTURES[textureCode],
        backgroundSize: "6px 6px",
      }
    }
  }

  const handleDoubleClick = (code: ColorTextureCode) => {
    if (!(code in COLORS)) return
    editingCodeRef.current = code as ColorCode
    if (colorInputRef.current) {
      // Convert current color to hex for the input
      colorInputRef.current.value = cssToHex(resolveColor(code as ColorCode, customColors))
      colorInputRef.current.click()
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCodeRef.current) {
      setCustomColor(editingCodeRef.current, e.target.value)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {ALL_COLOR_TEXTURE_CODES.map((code) => {
        const isSelected = selectedColorTexture === code
        const backgroundStyle = getBackgroundStyle(code)
        const isColor = code in COLORS

        return (
          <button
            key={code}
            onClick={() => setSelectedColorTexture(code)}
            onDoubleClick={() => handleDoubleClick(code)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: isSelected ? `3px solid ${UI_COLORS.border.primary}` : `2px solid ${UI_COLORS.border.secondary}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
              boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.1)",
              touchAction: "auto",
              ...backgroundStyle,
            }}
            title={isColor ? `${code.replace(/-/g, " ")} (double-click to change)` : code.replace(/-/g, " ")}
          />
        )
      })}
      <input
        ref={colorInputRef}
        type="color"
        onChange={handleColorChange}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
      />
    </div>
  )
}

/** Best-effort CSS color to hex conversion using an offscreen canvas. */
function cssToHex(css: string): string {
  try {
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return "#888888"
    ctx.fillStyle = css
    return ctx.fillStyle // browsers normalise to #rrggbb
  } catch {
    return "#888888"
  }
}

export default ColorPicker
