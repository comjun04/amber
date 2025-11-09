import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandOptionType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord-api-types/v10'
import type { CommandRunFuncAdditionalData } from './types'
import { fetchUser, getInteractionAuthorId } from './util'

import * as AvatarCommand from './commands/avatar'
import * as BannerCommand from './commands/banner'
import * as SayCommand from './commands/say'

const clientPublicKey = process.env.APP_PUBLIC_KEY ?? ''

const app = new Hono()

app.get('/', (c) => c.json({ hello: 'world' }))

app.use(async (c, next) => {
  // verify discord request
  const signature = c.req.header('X-Signature-Ed25519') ?? ''
  const timestamp = c.req.header('X-Signature-Timestamp') ?? ''

  const isValidRequest = await verifyKey(
    await c.req.text(),
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

app.post('/interactions', async (c) => {
  const body = await c.req.json<APIInteraction>()
  const { type, data } = body

  if (type === InteractionType.Ping) {
    return c.json({ type: InteractionResponseType.Pong })
  }

  console.log(body)

  if (type === InteractionType.ApplicationCommand) {
    const { name } = data
    const additionalData: CommandRunFuncAdditionalData = {
      interactionAuthorId: getInteractionAuthorId(body),
    }

    if (name === 'avatar') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await AvatarCommand.run(c, commandData, additionalData)
    } else if (name === 'banner') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await BannerCommand.run(c, commandData, additionalData)
    } else if (name === 'say') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await SayCommand.run(c, commandData, additionalData)
    }
  }
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
