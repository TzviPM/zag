import { dispatchInputEvent } from "@ui-machines/dom-utils"
import { clamp, percentToValue, snapToStep, transform, valueToPercent } from "@ui-machines/number-utils"
import type { Point } from "@ui-machines/rect-utils"
import { relativeToNode } from "@ui-machines/rect-utils"
import type { Style } from "@ui-machines/types"
import type { SharedContext, MachineContext as Ctx } from "./slider.types"

/**
 * To ensure the slider thumb is always within the track (on the y-axis)
 */
function getVerticalThumbOffset(ctx: SharedContext) {
  const { height } = ctx.thumbSize
  const getValue = transform([ctx.min, ctx.max], [-height / 2, height / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

/**
 * To ensure the slider thumb is always within the track (on the x-axis)
 */
function getHorizontalThumbOffset(ctx: SharedContext) {
  const { width } = ctx.thumbSize

  if (ctx.isRtl) {
    const getValue = transform([ctx.max, ctx.min], [-width * 1.5, -width / 2])
    return -1 * parseFloat(getValue(ctx.value).toFixed(2))
  }

  const getValue = transform([ctx.min, ctx.max], [-width / 2, width / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

function getThumbStyle(ctx: SharedContext): Style {
  const percent = valueToPercent(ctx.value, ctx)
  const offset = ctx.isVertical ? getVerticalThumbOffset(ctx) : getHorizontalThumbOffset(ctx)

  const style: Style = {
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    "--slider-thumb-placement": `calc(${percent}% - ${offset}px)`,
  }

  if (ctx.isVertical) {
    style.bottom = "var(--slider-thumb-placement)"
  } else {
    style[ctx.isRtl ? "right" : "left"] = "var(--slider-thumb-placement)"
  }

  return style
}

function getRangeStyle(ctx: Ctx): Style {
  const percent = valueToPercent(ctx.value, ctx)

  const style: Style = {
    position: "absolute",
  }

  let startValue = "0%"
  let endValue = `${100 - percent}%`

  if (ctx.origin === "center") {
    const isNegative = percent < 50
    startValue = isNegative ? `${percent}%` : "50%"
    endValue = isNegative ? "50%" : endValue
  }

  if (ctx.isVertical) {
    return {
      ...style,
      bottom: startValue,
      top: endValue,
    }
  }

  return {
    ...style,
    [ctx.isRtl ? "right" : "left"]: startValue,
    [ctx.isRtl ? "left" : "right"]: endValue,
  }
}

function getRootStyle(ctx: Pick<Ctx, "isVertical">): Style {
  return {
    touchAction: "none",
    userSelect: "none",
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    position: "relative",
  }
}

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getThumbId: (ctx: Ctx) => `slider-thumb-${ctx.uid}`,
  getRootId: (ctx: Ctx) => `slider-root-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `slider-input-${ctx.uid}`,
  getOutputId: (ctx: Ctx) => `slider-output-${ctx.uid}`,
  getTrackId: (ctx: Ctx) => `slider-track-${ctx.uid}`,
  getRangeId: (ctx: Ctx) => `slider-range-${ctx.uid}`,
  getLabelId: (ctx: Ctx) => `slider-label-${ctx.uid}`,
  getMarkerId: (ctx: Ctx, value: number) => `slider-marker-${ctx.uid}-${value}`,

  getThumbEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getThumbId(ctx)),
  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)),

  getRootStyle,
  getThumbStyle,
  getRangeStyle,
  getTrackStyle: (): Style => ({
    position: "relative",
  }),

  getValueFromPoint(ctx: Ctx, point: Point): number | undefined {
    // get the slider root element
    const root = dom.getRootEl(ctx)
    if (!root) return

    // get the position/progress % of the point relative to the root's width/height
    const { progress } = relativeToNode(point, root)

    // get the progress % depending on the orientation
    let percent = ctx.isHorizontal ? progress.x : progress.y
    // get the rtl equivalent of the progress
    if (ctx.isRtl) {
      percent = 1 - percent
    }
    // clamp the progress % between 0 and 1
    percent = clamp(percent, { min: 0, max: 1 })

    // get the computed value from the progress %
    return parseFloat(snapToStep(percentToValue(percent, ctx), ctx.step))
  },

  dispatchChangeEvent(ctx: Ctx) {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputEvent(input, { value: ctx.value })
  },

  getMarkerStyle(ctx: Ctx, percent: number): Style {
    const style: Style = {
      position: "absolute",
      pointerEvents: "none",
    }

    if (ctx.isHorizontal) {
      percent = ctx.isRtl ? 100 - percent : percent
      style.left = `${percent}%`
    } else {
      style.bottom = `${percent}%`
    }

    return style
  },
}
