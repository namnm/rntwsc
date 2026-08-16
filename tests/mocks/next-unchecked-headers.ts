// Stand-in for next-unchecked/headers; real headers()/cookies() need a
// live Next.js request. See docs/contribution/dev.md "Running unit tests".
export const headers = async () => new Headers()

export const cookies = async () => ({
  get: (_name: string) => undefined,
  getAll: () => [] as { name: string; value: string }[],
  has: (_name: string) => false,
})
