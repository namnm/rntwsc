import { platform } from '@/core/platform'
import type { DimensionsSize } from '@/core/responsive/use-window-dimensions'
import type { Nullish, StrMap } from '@/core/ts-utils'
import type {
  ClassName,
  ClassNameCalc,
  ClassNameNative,
  ClassNameWithSelector,
  StyleSingle,
} from '@/core/tw/class-name'
import { getTwrnc } from '@/core/tw/config'
import { twUnminifyWeb } from '@/core/tw/lib/class-name-minified'
import { classNameToNative } from '@/core/tw/lib/class-name-to-native'
import { hexToRgba } from '@/core/utils/hex-to-rgba'

export type ClassNameToStylesOptions = {
  className: ClassName
  onSelector: (selector: ClassNameWithSelector) => ClassNameNative
  variables: StrMap | Nullish
  dimensions: DimensionsSize | Nullish
  warnOnString?: boolean
}

export const classNameToStyles = (options: ClassNameToStylesOptions) => {
  const styles: StyleWithLevel[] = []
  classNameToStylesRecursive({
    ...options,
    level: 0,
    styles,
  })
  return styles.sort((a, b) => a.level - b.level).map(s => s.style)
}

// deeper level will take precedence
type StyleWithLevel = {
  level: number
  style: StyleSingle
}

type ClassNameToStylesRecursiveOptions = ClassNameToStylesOptions & {
  level: number
  styles: StyleWithLevel[]
}

const classNameToStylesRecursive = ({
  ...options
}: ClassNameToStylesRecursiveOptions) => {
  const {
    className,
    onSelector,
    variables,
    dimensions,
    warnOnString,
    level,
    styles,
  } = options
  if (!className) {
    return
  }

  if (Array.isArray(className)) {
    className.forEach(v => {
      options.className = v
      classNameToStylesRecursive(options)
    })
    return
  }

  if (typeof className === 'string') {
    if (process.env.NODE_ENV !== 'production' && warnOnString) {
      console.error(
        `Expect className to be an object in native, found string: ${className}`,
      )
    }
    options.className = classNameToNative({
      platform,
      twrnc: getTwrnc(),
      className: twUnminifyWeb ? twUnminifyWeb(className) : className,
    })
    classNameToStylesRecursive(options)
    return
  }

  if ('selector' in className) {
    options.className = onSelector(className)
    if (!options.className) {
      return
    }
    options.level += 1
    classNameToStylesRecursive(options)
    return
  }

  if ('variable' in className) {
    const { variable, alpha, key } = className
    let v = variables?.[variable]
    if (!v) {
      return
    }
    if (typeof alpha === 'number') {
      v = hexToRgba(v, alpha)
    }
    styles.push({
      level,
      style: {
        [key]: v,
      },
    })
    return
  }

  if ('calc' in className) {
    const { calc, keys } = className
    const v = caclRecursive(calc, dimensions)
    if (v === undefined) {
      return
    }
    styles.push({
      level,
      style: keys.reduce<StrMap>((m, k) => {
        m[k] = v
        return m
      }, {}),
    })
    return
  }

  styles.push({
    level,
    style: className,
  })
}

const caclRecursive = (
  calc: ClassNameCalc,
  dimensions: DimensionsSize | Nullish,
): number | undefined => {
  if ('op' in calc) {
    const l = caclRecursive(calc.l, dimensions)
    const r = caclRecursive(calc.r, dimensions)
    if (l === undefined || r === undefined) {
      return undefined
    }
    if (calc.op === '+') {
      return l + r
    }
    if (calc.op === '-') {
      return l - r
    }
    if (calc.op === '*') {
      return l * r
    }
    if (r === 0) {
      return undefined
    }
    return l / r
  }
  const { v, unit } = calc
  if (!unit) {
    return v
  }
  if (!dimensions) {
    return undefined
  }
  const d = unit === 'vw' ? dimensions.width : dimensions.height
  return (v * d) / 100
}
