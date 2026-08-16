import { tw } from '#/core/tw/tw'

// Negative margin must flip side under rtl since flex-row mirrors visual
// order but the margin doesn't. See i18n.md#direction-rtl.
export const groupOverlapClassName = (
  isOutline: boolean,
  isFirst: boolean,
  rtl: boolean,
) => isOutline && !isFirst && (rtl ? tw`mr-[-1px]` : tw`ml-[-1px]`)
