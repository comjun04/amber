import {
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import type { ChatInputCommandRunFn } from '../types'
import { getUserBanner } from '../rest-actions'
import { saveUserProfileData } from '../save-to-server'

export const runChatInputCommand: ChatInputCommandRunFn = async (
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

  const userBannerData = await getUserBanner(targetUserId).catch((err) => {
    console.error(err)
    c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Error: failed to fetch user',
        flags: MessageFlags.Ephemeral,
      },
    })
  })
  if (userBannerData == null) return
  const { user: targetUser, bannerUrl } = userBannerData

  if (bannerUrl == null) {
    return c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '해당 유저는 배너 이미지를 설정하지 않았어요.',
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  const saveOption = commandData.options?.find((o) => o.name === 'save')
  const shouldSaveToServer =
    saveOption?.type === ApplicationCommandOptionType.Boolean
      ? saveOption.value
      : false
  if (shouldSaveToServer) {
    await saveUserProfileData(
      { id: targetUser.id, username: targetUser.username },
      'banner',
      bannerUrl,
    )
  }

  const ephemeralOption = commandData.options?.find(
    (o) => o.name === 'ephemeral',
  )
  const shouldRespondEphemeral =
    ephemeralOption?.type === ApplicationCommandOptionType.Boolean
      ? ephemeralOption.value
      : true // 옵션이 지정되지 않았을 경우 기본값 true

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
