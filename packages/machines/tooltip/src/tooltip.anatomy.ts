import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tooltip").parts(
  "trigger",
  "arrow",
  "arrowInner", // TODO rename innerArrow
  "positioner",
  "content",
  "label",
)
export const parts = anatomy.build()