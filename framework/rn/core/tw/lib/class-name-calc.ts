import type { ClassNameCalc } from '@/rn/core/tw/class-name'

type CalcToken =
  | {
      k: 'value'
      v: number
      ty?: 'vw' | 'vh'
    }
  | {
      k: 'op'
      op: '+' | '-' | '*' | '/'
    }

const tokenizeCalc = (expr: string): CalcToken[] | undefined => {
  const tokens: CalcToken[] = []
  let i = 0
  while (i < expr.length) {
    if (expr[i] === ' ') {
      i++
      continue
    }
    const m = /^(\d+(?:\.\d+)?)/.exec(expr.slice(i))
    if (m) {
      const v = Number(m[0])
      i += m[0].length
      const unit = expr.slice(i, i + 2)
      if (unit === 'vw' || unit === 'vh') {
        tokens.push({
          k: 'value',
          v,
          ty: unit,
        })
        i += 2
      } else if (unit === 'px') {
        tokens.push({
          k: 'value',
          v,
        })
        i += 2
      } else {
        tokens.push({
          k: 'value',
          v,
        })
      }
      continue
    }
    const op = expr[i]
    if (op === '+' || op === '-' || op === '*' || op === '/') {
      tokens.push({
        k: 'op',
        op,
      })
      i++
      continue
    }
    return undefined
  }
  return tokens
}

export const parseCalcExpr = (input: string): ClassNameCalc | undefined => {
  const tokens = tokenizeCalc(input.replace(/_/g, ' ').trim())
  if (!tokens || !tokens.length) {
    return undefined
  }
  let pos = 0

  // parse atom
  const atom = (): ClassNameCalc | undefined => {
    const t = tokens[pos]
    if (!t || t.k !== 'value') {
      return undefined
    }
    pos++
    return {
      v: t.v,
      ty: t.ty,
    }
  }

  // parse mul
  const mul = (): ClassNameCalc | undefined => {
    let l = atom()
    if (!l) {
      return undefined
    }
    while (pos < tokens.length) {
      const t = tokens[pos]
      if (!t || t.k !== 'op' || (t.op !== '*' && t.op !== '/')) {
        break
      }
      pos++
      const r = atom()
      if (!r) {
        return undefined
      }
      l = {
        l,
        r,
        op: t.op,
      }
    }
    return l
  }

  // parse add
  const add = (): ClassNameCalc | undefined => {
    let l = mul()
    if (!l) {
      return undefined
    }
    while (pos < tokens.length) {
      const t = tokens[pos]
      if (!t || t.k !== 'op' || (t.op !== '+' && t.op !== '-')) {
        break
      }
      pos++
      const r = mul()
      if (!r) {
        return undefined
      }
      l = {
        l,
        r,
        op: t.op,
      }
    }
    return l
  }

  const res = add()
  return pos === tokens.length ? res : undefined
}
