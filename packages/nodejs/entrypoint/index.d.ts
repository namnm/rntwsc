type EntrypointOptions = {
  cwd?: string
  repoRoot?: string
  env?: true
  babel?: true
  req?: string
}

declare function entrypoint(options?: EntrypointOptions): unknown

export = entrypoint
