import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIMessageApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10'
import type { ChatInputCommandRunFnAdditionalData } from './types'
import { getInteractionAuthorId } from './util'

import * as AvatarCommand from './commands/avatar'
import * as BannerCommand from './commands/banner'
import * as SayCommand from './commands/say'
import * as SaveUserProfileCommand from './commands/save-user-profile'
import * as SaveMessageImagesCommand from './commands/save-msg-images'

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

  // console.log(body)

  if (type === InteractionType.ApplicationCommand) {
    const { name } = data
    const additionalData: ChatInputCommandRunFnAdditionalData = {
      interactionAuthorId: getInteractionAuthorId(body),
    }

    if (name === 'avatar') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await AvatarCommand.runChatInputCommand(
        c,
        commandData,
        additionalData,
      )
    } else if (name === 'banner') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await BannerCommand.runChatInputCommand(
        c,
        commandData,
        additionalData,
      )
    } else if (name === 'say') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      return await SayCommand.runChatInputCommand(
        c,
        commandData,
        additionalData,
      )
    } else if (name === 'Save User Profile') {
      const commandData = data as APIUserApplicationCommandInteractionData
      return await SaveUserProfileCommand.runUserCommand(c, commandData)
    } else if (name === 'Save images from this message') {
      const commandData = data as APIMessageApplicationCommandInteractionData
      return await SaveMessageImagesCommand.runMessageCommand(c, commandData)
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
