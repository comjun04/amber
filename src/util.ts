import { REST } from '@discordjs/rest'
import {
  APIApplicationCommandInteraction,
  RESTGetAPIUserResult,
  Routes,
} from 'discord-api-types/v10'

const restClient = new REST().setToken(process.env.BOT_TOKEN ?? '')

export const getInteractionAuthorId = (
  interaction: APIApplicationCommandInteraction,
) => {
  if (interaction.member != null) {
    return interaction.member.user.id
  } else if (interaction.user != null) {
    return interaction.user.id
  }

  return null
}

export const fetchUser = async (userId: string) => {
  const user = (await restClient.get(
    Routes.user(userId),
  )) as RESTGetAPIUserResult
  return user
}
