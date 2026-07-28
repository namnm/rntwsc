import { tw } from '#/core/tw/tw'

// overlaps the shared border between adjacent outline buttons in a group so it
// doesn't double up; flex-row mirrors visual order under rtl, so the negative
// margin must move to the other side or it pulls siblings apart instead
export const groupOverlapClassName = (
  isOutline: boolean,
  isFirst: boolean,
  rtl: boolean,
) => isOutline && !isFirst && (rtl ? tw`mr-[-1px]` : tw`ml-[-1px]`)
