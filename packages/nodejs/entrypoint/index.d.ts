type EntrypointOptions = {
  target?: string
  repoRoot?: string
  env?: true
  alias?: bool
  babel?: bool
  req?: string
}

declare function entrypoint(options?: EntrypointOptions): unknown

declare namespace entrypoint {
  export type { EntrypointOptions }
}

export = entrypoint
