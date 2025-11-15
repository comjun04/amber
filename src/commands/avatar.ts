import {
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import { getUserAvatar } from '../rest-actions'

import type { ChatInputCommandRunFn } from '../types'
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

  const userAvatarData = await getUserAvatar(targetUserId).catch((err) => {
    console.error(err)
    c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Error: failed to fetch user',
        flags: MessageFlags.Ephemeral,
      },
    })
  })
  if (userAvatarData == null) return
  const { user: targetUser, avatarUrl, defaultImage } = userAvatarData

  const saveOption = commandData.options?.find((o) => o.name === 'save')
  const shouldSaveToServer =
    saveOption?.type === ApplicationCommandOptionType.Boolean
      ? saveOption.value
      : false
  if (shouldSaveToServer && !defaultImage) {
    await saveUserProfileData(
      { id: targetUserId, username: targetUser.username },
      'avatar',
      avatarUrl,
    )
  }

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
