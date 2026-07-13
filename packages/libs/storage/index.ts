export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

const noopAdapter: StorageAdapter = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
}

let adapter: StorageAdapter = noopAdapter

export const setAdapter = (storage: StorageAdapter) => {
  adapter = storage
}

export const storage: StorageAdapter = new Proxy({} as StorageAdapter, {
  get: (_, prop: keyof StorageAdapter) => adapter[prop],
})
