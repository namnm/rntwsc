// Derive an npm-safe kebab-case name, a PascalCase app title, and a default
// reverse-DNS package id from whatever directory name the user passed in.

export const toKebabCase = (input: string): string =>
  input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-') || 'app'

export const toPascalCase = (kebabName: string): string =>
  kebabName
    .split('-')
    .filter(Boolean)
    .map(segment => segment[0].toUpperCase() + segment.slice(1))
    .join('') || 'App'

export const toPackageSegment = (kebabName: string): string =>
  kebabName.replace(/[^a-z0-9]/g, '') || 'app'

export const defaultPackageId = (kebabName: string): string =>
  `com.${toPackageSegment(kebabName)}`
