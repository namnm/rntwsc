import type { TSESLint } from '@typescript-eslint/utils'

// Characters that have a direct ASCII replacement - auto-fixable
const FIXABLE_MAP: Record<string, string> = {
  '\u2500': '-', // box drawing light horizontal
  '\u2013': '-', // en dash
  '\u2014': '-', // em dash
  '\u2015': '-', // horizontal bar
  '\u201E': '"', // double low-9 quotation mark
  '\u201A': "'", // single low-9 quotation mark
  '\u201F': '"', // double high-reversed-9 quotation mark
  '\u00AB': '"', // left double angle quotation mark
  '\u00BB': '"', // right double angle quotation mark
  '\u2039': "'", // single left-pointing angle quotation mark
  '\u203A': "'", // single right-pointing angle quotation mark
  '\u2022': '-', // bullet
  '\u00D7': '*', // multiplication sign
  '\u00F7': '/', // division sign
  '\u2212': '-', // minus sign
  '\u2026': '..', // horizontal ellipsis
  '\u00A9': '(c)', // copyright sign
}

// prettier-ignore
const FIXABLE_RE = /[\u2500\u2013\u2014\u2015\u201E\u201A\u201F\u00AB\u00BB\u2039\u203A\u2022\u00D7\u00F7\u2212\u2026\u00A9]/gu

// Characters with no ASCII counterpart - report only, no auto-fix
// Covers: arrows (2190-21FF), supplemental arrows A (27F0-27FF),
// supplemental arrows B (2900-297F), geometric shapes (25B2-25BF, 25C6-25C8, 25CA, 2666),
// check marks (2713, 2714), emoji (1F300-1F9FF, 1FA00-1FAFF),
// misc symbols (2600-26FF), dingbats (2700-27BF)
// prettier-ignore
const NON_FIXABLE_RE = /[\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F\u25B2-\u25BF\u25C6-\u25C8\u25CA\u2666\u2713\u2714\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF]/gu

const createRule = (
  fixable: boolean,
): TSESLint.RuleModule<'fixable' | 'noFix', []> => ({
  meta: {
    type: 'problem',
    fixable: fixable ? 'code' : undefined,
    docs: {
      description: fixable
        ? 'Disallow non-ASCII Unicode characters that have ASCII replacements (auto-fixable)'
        : 'Disallow non-ASCII Unicode characters without ASCII replacements',
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
