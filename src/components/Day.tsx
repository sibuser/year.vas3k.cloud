import { isToday, isWeekend } from "date-fns"
import React, { useState } from "react"
import { ColorCode, COLORS, ColorTextureCode, TEXTURES, UI_COLORS, WEEKEND_COLOR } from "../utils/colors"
import CustomText from "./CustomText"

interface DayProps {
  date: Date
  // Single-layer mode (backward compat for active layer painting)
  isColored?: boolean
  colorTextureCode?: ColorTextureCode
  // Multi-layer stacking
  layerColors?: ColorCode[]
  onClick?: () => void
  onMouseDown?: () => void
  onMouseEnter?: () => void
  customText?: string
  onCustomTextChange?: (text: string) => void
  customTextOverflow?: "overflow-x" | "overflow-y" | "no-overflow"
}

const Day: React.FC<DayProps> = ({
  date,
  isColored = false,
  colorTextureCode,
  layerColors = [],
  onClick,
  onMouseDown,
  onMouseEnter,
  customText = "",
  onCustomTextChange,
  customTextOverflow = "overflow-x",
}) => {
  const dayNumber = date.getDate()
  const [isHovered, setIsHovered] = useState(false)
  const [isCreatingCustomText, setIsCreatingCustomText] = useState(false)

  const hasLayerColors = layerColors.length > 0

  const getBackgroundColor = (): string => {
    // If we have stacked layer colors, the background is handled by strips
    if (hasLayerColors) {
      return "transparent"
    }

    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return isHovered ? UI_COLORS.background.quaternary : UI_COLORS.background.primary
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    if (!color) return UI_COLORS.background.primary

    if (isHovered) {
      const match = color.match(/oklch\(([^)]+)\)/)
      if (match) {
        const values = match[1].split(" ")
        if (values.length >= 3) {
          const L = parseFloat(values[0])
          const C = parseFloat(values[1])
          const H = values[2]
          const hoverL = Math.min(0.99, L * 1.01)
          const hoverC = C * 1.02
          return `oklch(${hoverL.toFixed(3)} ${hoverC.toFixed(3)} ${H})`
        }
      }
    }

    return color
  }

  const getBaseBackgroundColor = (): string => {
    if (hasLayerColors) {
      return COLORS[layerColors[0]]
    }
    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return UI_COLORS.background.primary
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    return color || UI_COLORS.background.primary
  }

  const getTextureStyles = (): React.CSSProperties => {
    if (hasLayerColors) return {}
    if (!isColored || !colorTextureCode || !(colorTextureCode in TEXTURES)) {
      return {}
    }

    const textureCode = colorTextureCode as keyof typeof TEXTURES
    return {
      backgroundColor: UI_COLORS.background.secondary,
      backgroundImage: TEXTURES[textureCode],
      backgroundSize: "9px 9px",
      backgroundPosition: "center 2px",
    }
  }

  const handleDayNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCustomTextChange) {
      setIsCreatingCustomText(true)
      onCustomTextChange("")
    }
  }

  const handleCustomTextChange = (text: string) => {
    if (onCustomTextChange) {
      onCustomTextChange(text)
      if (text.trim().length === 0) {
        setIsCreatingCustomText(false)
      }
    }
  }

  const hasCustomText = customText.trim().length > 0 || isCreatingCustomText

  // Determine the default background for the cell (weekend or normal)
  const defaultBg = isWeekend(date) ? WEEKEND_COLOR : UI_COLORS.background.primary
  const hoverBg = isWeekend(date) ? WEEKEND_COLOR : UI_COLORS.background.quaternary

  return (
    <div
      className="day"
      data-colored={isColored || hasLayerColors ? "true" : "false"}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        if (onClick) onClick()
      }}
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (onMouseDown) onMouseDown()
      }}
      onPointerEnter={(e) => {
        if (e.target !== e.currentTarget) return
        setIsHovered(true)
        if (onMouseEnter) onMouseEnter()
      }}
      onPointerLeave={() => setIsHovered(false)}
      style={{
        padding: "0",
        textAlign: "center",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "normal",
        backgroundColor: hasLayerColors
          ? hasCustomText
            ? COLORS[layerColors[0]]
            : isHovered ? hoverBg : defaultBg
          : getBackgroundColor(),
        position: "relative",
        cursor: "cell",
        transition: "background-color 0.2s ease",
        overflow: "visible",
        userSelect: "none",
        border: isToday(date) ? `2px inset ${UI_COLORS.border.inset}` : "none",
        boxSizing: "border-box",
        touchAction: "auto",
        ...(hasLayerColors ? {} : getTextureStyles()),
      }}
    >
      {/* Stacked layer color strips */}
      {hasLayerColors && !hasCustomText && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "none",
          }}
        >
          {layerColors.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: COLORS[color],
              }}
            />
          ))}
        </div>
      )}

      {hasCustomText ? (
        <CustomText
          text={customText}
          onTextChange={handleCustomTextChange}
          backgroundColor={getBaseBackgroundColor()}
          hoverBackgroundColor={UI_COLORS.background.quaternary}
          overflowDirection={customTextOverflow}
        />
      ) : (
        <div
          onClick={handleDayNumberClick}
          style={{
            cursor: onCustomTextChange ? "text" : "default",
            padding: "2px 4px",
            borderRadius: "3px",
            transition: "all 0.2s ease",
            display: "inline-block",
            pointerEvents: "auto",
            fontSize: "inherit",
            lineHeight: "1",
            position: "relative",
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            if (onCustomTextChange) {
              e.currentTarget.style.fontWeight = "bold"
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.7)"
            }
          }}
          onMouseLeave={(e) => {
            if (onCustomTextChange) {
              e.currentTarget.style.fontWeight = "normal"
              e.currentTarget.style.backgroundColor = "transparent"
            }
          }}
        >
          {dayNumber}
        </div>
      )}
    </div>
  )
}

export default Day
