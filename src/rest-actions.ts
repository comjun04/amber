import { Routes, RESTGetAPIUserResult } from 'discord-api-types/v10'
import { REST } from '@discordjs/rest'

const restClient = new REST().setToken(process.env.BOT_TOKEN ?? '')

export const fetchUser = async (userId: string) => {
  const user = (await restClient.get(
    Routes.user(userId),
  )) as RESTGetAPIUserResult
  return user
}
