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
import { fetchUser, getInteractionAuthorId } from './util'

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

    if (name === 'avatar') {
      const commandData = data as APIChatInputApplicationCommandInteractionData
      const targetUserOption = commandData.options?.[0]
      const targetUserId =
        targetUserOption?.type === ApplicationCommandOptionType.User
          ? targetUserOption.value
          : getInteractionAuthorId(body)

      if (targetUserId == null) {
        return c.json<APIInteractionResponseChannelMessageWithSource>({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'Error: userId is null',
            flags: MessageFlags.Ephemeral,
          },
        })
      }

      const targetUser = await fetchUser(targetUserId).catch((err) => {
        console.error(err)
        c.json<APIInteractionResponseChannelMessageWithSource>({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'Error: failed to fetch user',
            flags: MessageFlags.Ephemeral,
          },
        })
      })
      if (targetUser == null) return

      const defaultAvatarIndex =
        targetUser.discriminator === '0' // migrated to new username system
          ? Number((BigInt(targetUserId) >> 22n) % 6n)
          : Number(targetUser.discriminator) % 5
      const isAvatarGif = targetUser.avatar?.startsWith('a_')
      const avatarUrl =
        targetUser.avatar != null
          ? `https://cdn.discordapp.com/avatars/${targetUserId}/${targetUser.avatar}.${isAvatarGif ? 'gif' : 'png'}?size=1024`
          : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`

      const payload: APIInteractionResponseCallbackData = {
        embeds: [
          {
            title: `${targetUser.global_name} (\`${targetUserId}\`) 의 프로필 사진`,
            description: `<@${targetUserId}>`,
            image: {
              url: avatarUrl,
            },
          },
        ],
        flags: MessageFlags.Ephemeral,
      }

      return c.json<APIInteractionResponseChannelMessageWithSource>({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: payload,
      })
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
