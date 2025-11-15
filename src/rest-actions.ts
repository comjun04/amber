import { Routes, RESTGetAPIUserResult } from 'discord-api-types/v10'
import { REST } from '@discordjs/rest'

const restClient = new REST().setToken(process.env.BOT_TOKEN ?? '')

export const fetchUser = async (userId: string) => {
  const user = (await restClient.get(
    Routes.user(userId),
  )) as RESTGetAPIUserResult
  return user
}

export async function getUserAvatar(userId: string) {
  const user = await fetchUser(userId)

  const defaultAvatarIndex =
    user.discriminator === '0' // migrated to new username system
      ? Number((BigInt(userId) >> 22n) % 6n)
      : Number(user.discriminator) % 5
  const isAvatarGif = user.avatar?.startsWith('a_')
  const avatarUrl =
    user.avatar != null
      ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${isAvatarGif ? 'gif' : 'png'}?size=1024`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`

  return { user, avatarUrl, defaultImage: user.avatar == null }
}

export async function getUserBanner(userId: string) {
  const user = await fetchUser(userId)

  const bannerHash = user.banner
  let bannerUrl: string | null = null
  if (bannerHash != null) {
    const isBannerGif = bannerHash.startsWith('a_')
    bannerUrl = `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${isBannerGif ? 'gif' : 'png'}?size=2048`
  }

  return { user, bannerUrl }
}
