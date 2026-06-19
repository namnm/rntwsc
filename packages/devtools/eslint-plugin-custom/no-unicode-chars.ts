import type { TSESLint } from '@typescript-eslint/utils'

// Characters that have a direct ASCII replacement - auto-fixable
const FIXABLE_MAP: Record<string, string> = {
  '\u00A9': '(c)',
  '\u00AB': '"',
  '\u00AE': '(r)',
  '\u00B0': '(deg)',
  '\u00B1': '+-',
  '\u00B2': '2',
  '\u00B3': '3',
  '\u00BB': '"',
  '\u00B4': "'",
  '\u00B5': '(micro)',
  '\u00B7': '.',
  '\u00B9': '1',
  '\u00BC': '1/4',
  '\u00BD': '1/2',
  '\u00BE': '3/4',
  '\u00BF': '?',
  '\u00D7': '*',
  '\u00F7': '/',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u201A': "'",
  '\u201E': '"',
  '\u201F': '"',
  '\u2022': '-',
  '\u2026': '..',
  '\u2039': "'",
  '\u203A': "'",
  '\u2190': '<-',
  '\u2192': '->',
  '\u2194': '<->',
  '\u21D0': '<=',
  '\u21D2': '=>',
  '\u21D4': '<=>',
  '\u2212': '-',
  '\u2500': '-',
}

const FIXABLE_RE = new RegExp(
  '[' + Object.keys(FIXABLE_MAP).join('') + ']',
  'gu',
)

// Characters with no ASCII counterpart - report only, no auto-fix
// Covers: arrows (2190-21FF), supplemental arrows A (27F0-27FF),
// supplemental arrows B (2900-297F), geometric shapes (25B2-25BF, 25C6-25C8, 25CA, 2666),
// check marks (2713, 2714), emoji (1F300-1F9FF, 1FA00-1FAFF),
// misc symbols (2600-26FF), dingbats (2700-27BF)
const NON_FIXABLE_RE =
  /[\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F\u25B2-\u25BF\u25C6-\u25C8\u25CA\u2666\u2713\u2714\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF]/gu

const createRule = (
  fixable: boolean,
): TSESLint.RuleModule<'fixable' | 'noFix', []> => ({
  meta: {
    type: 'problem',
    fixable: fixable ? 'code' : undefined,
    docs: {
      description:
        'Disallow non-ASCII Unicode characters without ASCII replacements',
    },
    messages: {
      fixable:
        'Non-ASCII char \\u{{code}} found, replace with "{{replacement}}"',
      noFix: 'Non-ASCII char \\u{{code}} found, remove or replace it manually',
    },
    schema: [],
  },

  create: c => {
    const src = c.sourceCode
    const text = src.getText()

    const lineStarts: number[] = [0]
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        lineStarts.push(i + 1)
      }
    }

    const locFromIndex = (index: number) => {
      let lo = 0
      let hi = lineStarts.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (lineStarts[mid] <= index) {
          lo = mid
        } else {
          hi = mid - 1
        }
      }
      return {
        line: lo + 1,
        column: index - lineStarts[lo],
      }
    }

    const toHex = (char: string) =>
      char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')

    const re = fixable ? FIXABLE_RE : NON_FIXABLE_RE

    return {
      Program: n => {
        let m: RegExpExecArray | null
        re.lastIndex = 0
        while ((m = re.exec(text)) !== null) {
          const char = m[0]
          const start = m.index
          const end = start + char.length
          const loc = {
            start: locFromIndex(start),
            end: locFromIndex(end),
          }
          if (fixable) {
            c.report({
              node: n,
              loc,
              messageId: 'fixable',
              data: {
                code: toHex(char),
                replacement: FIXABLE_MAP[char]!,
              },
              fix: f => f.replaceTextRange([start, end], FIXABLE_MAP[char]!),
            })
          } else {
            c.report({
              node: n,
              loc,
              messageId: 'noFix',
              data: {
                code: toHex(char),
              },
            })
          }
        }
      },
    }
  },
})

export const noUnicodeChars = createRule(true)
export const noUnicodeCharsNonFixable = createRule(false)
