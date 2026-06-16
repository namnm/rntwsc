import express from 'express'

import { log } from '@/nodejs/log'

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
})

app.get('/api/fetch', (req, res) => {
  const delay = Math.random() * 3000
  setTimeout(
    () =>
      res.json({
        message: 'hello',
        timestamp: Date.now(),
      }),
    delay,
  )
})

app.post('/api/graphql', express.json(), (req, res) => {
  const delay = Math.random() * 3000
  setTimeout(
    () =>
      res.json({
        data: {
          hello: {
            message: 'hello from graphql',
            timestamp: Date.now(),
          },
        },
      }),
    delay,
  )
})

app.listen(3001, () => log.info('listening on port 3001'))
