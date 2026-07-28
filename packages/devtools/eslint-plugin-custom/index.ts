import type { ESLint } from 'eslint'

import { concatClassnameStrings } from '#/devtools/eslint-plugin-custom/concat-classname-strings'
import { enforceArrowFunction } from '#/devtools/eslint-plugin-custom/enforce-arrow-function'
import { enforceUseClient } from '#/devtools/eslint-plugin-custom/enforce-use-client'
import { errName } from '#/devtools/eslint-plugin-custom/err-name'
import { kebabCaseImportPaths } from '#/devtools/eslint-plugin-custom/kebab-case-import-paths'
import { noAccessProperty } from '#/devtools/eslint-plugin-custom/no-access-property'
import { noForwardRef } from '#/devtools/eslint-plugin-custom/no-forward-ref'
import { noImportDefault } from '#/devtools/eslint-plugin-custom/no-import-default'
import { noImportInvalidVariant } from '#/devtools/eslint-plugin-custom/no-import-invalid-variant'
import { noImportOutside } from '#/devtools/eslint-plugin-custom/no-import-outside'
import { noInterface } from '#/devtools/eslint-plugin-custom/no-interface'
import { noJsonStringify } from '#/devtools/eslint-plugin-custom/no-json-stringify'
import { noMissingExport } from '#/devtools/eslint-plugin-custom/no-missing-export'
import { noNullishCoalescing } from '#/devtools/eslint-plugin-custom/no-nullish-coalescing'
import { noRelativeExportPaths } from '#/devtools/eslint-plugin-custom/no-relative-export-paths'
import { noRelativeImportPaths } from '#/devtools/eslint-plugin-custom/no-relative-import-paths'
import { noSingleItemArrayProp } from '#/devtools/eslint-plugin-custom/no-single-item-array-prop'
import {
  noUnicodeChars,
  noUnicodeCharsNonFixable,
} from '#/devtools/eslint-plugin-custom/no-unicode-chars'
import { noUseState } from '#/devtools/eslint-plugin-custom/no-use-state'
import { noVoidUnion } from '#/devtools/eslint-plugin-custom/no-void-union'

export const customPlugin = {
  meta: {
    name: 'custom',
  },
  rules: {
    'concat-classname-strings': concatClassnameStrings,
    'enforce-arrow-function': enforceArrowFunction,
    'enforce-use-client': enforceUseClient,
    'err-name': errName,
    'kebab-case-import-paths': kebabCaseImportPaths,
    'no-access-property': noAccessProperty,
    'no-forward-ref': noForwardRef,
    'no-import-default': noImportDefault,
    'no-import-invalid-variant': noImportInvalidVariant,
    'no-import-outside': noImportOutside,
    'no-interface': noInterface,
    'no-json-stringify': noJsonStringify,
    'no-missing-export': noMissingExport,
    'no-nullish-coalescing': noNullishCoalescing,
    'no-relative-export-paths': noRelativeExportPaths,
    'no-relative-import-paths': noRelativeImportPaths,
    'no-single-item-array-prop': noSingleItemArrayProp,
    'no-unicode-chars-non-fixable': noUnicodeCharsNonFixable,
    'no-unicode-chars': noUnicodeChars,
    'no-use-state': noUseState,
    'no-void-union': noVoidUnion,
  },
} as unknown as ESLint.Plugin
