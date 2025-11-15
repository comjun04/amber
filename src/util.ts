import { APIApplicationCommandInteraction } from 'discord-api-types/v10'

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
