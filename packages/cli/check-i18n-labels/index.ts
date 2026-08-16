import type { Labels } from '#/devtools/babel-plugin-i18n-labels-validation'
import { i18nLabelsValidation } from '#/devtools/babel-plugin-i18n-labels-validation'
import { fs } from '#/devtools/fs'
import { globSync } from '#/devtools/glob'
import { log } from '#/devtools/log'
import { path } from '#/devtools/path'

// Validates t() usage in playground/app/src against the en label set.
// See docs/i18n.md#label-validation for why en/*.json is read directly.
export const checkI18nLabels = (repoRoot: string) => {
  const appSrc = path.join(repoRoot, 'playground/app/src')

  const files = globSync('**/*.{ts,tsx}', {
    cwd: appSrc,
  })

  const labelFiles = globSync('*.json', {
    cwd: path.join(appSrc, 'i18n/labels/en'),
  })
  const labels: Labels = {}
  for (const f of labelFiles) {
    const namespace = path.basename(f, '.json')
    labels[namespace] = fs.readJsonSync(f)
  }

  const { missing, unused } = i18nLabelsValidation({
    files,
    labels,
  })

  if (unused.length) {
    log.warn(
      `${unused.length} unused i18n label key(s) (present in en labels, never referenced):`,
      unused.map(u => `${u.namespace}.${u.key}`).join('\n'),
    )
  }

  if (missing.length) {
    log.fatal(
      `${missing.length} missing i18n label key(s) (referenced in code, absent from en labels):`,
      missing
        .map(m => `${m.namespace}.${m.key} - ${m.file}:${m.line}`)
        .join('\n'),
    )
  }
}
