import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import { UserCommandRunFn } from '../types'
import { saveUserProfileData } from '../save-to-server'
import { getUserAvatar, getUserBanner } from '../rest-actions'

export const runUserCommand: UserCommandRunFn = async (c, commandData) => {
  const targetUserId = Object.keys(commandData.resolved.users)[0]
  if (targetUserId == null) {
    return c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Error: userId is null',
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  saveUserAvatarAndBannerImages(targetUserId).catch(console.error)

  return c.json<APIInteractionResponseChannelMessageWithSource>({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content:
        '해당 유저의 프로필/배너 사진을 저장하고 있습니다. 완료되기까지 몇 초 정도 걸릴 수 있습니다.',
      flags: MessageFlags.Ephemeral,
    },
  })
}

async function saveUserAvatarAndBannerImages(userId: string) {
  const { user, avatarUrl } = await getUserAvatar(userId)
  const { bannerUrl } = await getUserBanner(userId)

  await saveUserProfileData(
    { id: userId, username: user.username },
    'avatar',
    avatarUrl,
  )
  if (bannerUrl != null) {
    await saveUserProfileData(
      { id: userId, username: user.username },
      'banner',
      bannerUrl,
    )
  }
}
