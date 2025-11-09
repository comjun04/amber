import {
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import { fetchUser } from '../util'

import type { CommandRunFunc } from '../types'

export const run: CommandRunFunc = async (
  c,
  commandData,
  { interactionAuthorId },
) => {
  const targetUserOption = commandData.options?.find((o) => o.name === 'user')
  const targetUserId =
    targetUserOption?.type === ApplicationCommandOptionType.User
      ? targetUserOption.value
      : interactionAuthorId

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

  const ephemeralOption = commandData.options?.find(
    (o) => o.name === 'ephemeral',
  )
  const shouldRespondEphemeral =
    ephemeralOption?.type === ApplicationCommandOptionType.Boolean
      ? ephemeralOption.value
      : true // 옵션이 지정되지 않았을 경우 기본값 true

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
    flags: shouldRespondEphemeral ? MessageFlags.Ephemeral : undefined,
  }

  return c.json<APIInteractionResponseChannelMessageWithSource>({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: payload,
  })
}
