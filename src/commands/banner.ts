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
import type { CommandRunFunc } from '../types'
import { fetchUser } from '../util'

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

  const ephemeralOption = commandData.options?.find(
    (o) => o.name === 'ephemeral',
  )
  const shouldRespondEphemeral =
    ephemeralOption?.type === ApplicationCommandOptionType.Boolean
      ? ephemeralOption.value
      : true // 옵션이 지정되지 않았을 경우 기본값 true

  const bannerHash = targetUser.banner
  if (bannerHash == null) {
    return c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '해당 유저는 배너 이미지를 설정하지 않았어요.',
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  const isAvatarGif = bannerHash.startsWith('a_')
  const bannerUrl = `https://cdn.discordapp.com/banners/${targetUserId}/${bannerHash}.${isAvatarGif ? 'gif' : 'png'}?size=2048`

  return c.json<APIInteractionResponseChannelMessageWithSource>({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [
        {
          title: `${targetUser.global_name} (\`${targetUserId}\`) 의 배너 사진`,
          description: `<@${targetUserId}>`,
          image: {
            url: bannerUrl,
          },
        },
      ],
      flags: shouldRespondEphemeral ? MessageFlags.Ephemeral : undefined,
    },
  })
}
