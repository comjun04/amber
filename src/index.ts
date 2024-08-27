import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  APIInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10'

const clientPublicKey = process.env.APP_PUBLIC_KEY ?? ''

const app = new Hono()

app.get('/', (c) => c.json({ hello: 'world' }))

app.use(async (c, next) => {
  // verify discord request
  const signature = c.req.header('X-Signature-Ed25519') ?? ''
  const timestamp = c.req.header('X-Signature-Timestamp') ?? ''

  const isValidRequest = await verifyKey(
    await c.req.arrayBuffer(),
    signature,
    timestamp,
    clientPublicKey,
  )
  if (!isValidRequest) {
    c.status(401)
    return c.json({ error: 'Bad request signature' })
  }

  return await next()
})

app.get('/interactions', async (c) => {
  const body = await c.req.json<APIInteraction>()
  const { type, data } = body

  if (type === InteractionType.Ping) {
    return c.json({ type: InteractionResponseType.Pong })
  }

  console.log(body)
})

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3000),
  },
  (info) => {
    console.log(`Listening on ${info.address}:${info.port}`)
  },
)
