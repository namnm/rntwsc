'use client'

// no index.native.ts - metro-config falls back to this file directly for
// native too, since this implementation has no server-only calls
export const serverCache = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Server cache is only available on the server side')
  }
}
