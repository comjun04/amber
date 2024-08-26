import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ hello: 'world' }))

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3000),
  },
  (info) => {
    console.log(`Listening on ${info.address}:${info.port}`)
  },
)
