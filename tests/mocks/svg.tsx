/* eslint-disable import/no-default-export */
// @ts-ignore

// Stand-in for .svg imports in tests - see docs/contribution/dev.md
// "Running unit tests" for why the real SVGR transform isn't used.
import type { SvgProps } from 'react-native-svg'

const MockSvg = (props: SvgProps) => (
  <svg data-mock-icon='true' {...(props as any)} />
)

export default MockSvg
