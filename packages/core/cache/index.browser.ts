'use client'

export const serverCache = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Server cache is only available on the server side')
  }
}
