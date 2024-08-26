import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ hello: 'world' }))

serve(app, (info) => {
  console.log(`Listening on ${info.address}:${info.port}`)
})
