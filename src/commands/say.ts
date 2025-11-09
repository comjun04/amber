import {
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import type { CommandRunFunc } from '../types'

export const run: CommandRunFunc = async (c, commandData) => {
  const textOption = commandData.options?.find((o) => o.name === 'text')
  const text =
    textOption?.type === ApplicationCommandOptionType.String
      ? textOption.value
      : ''
  if (text.length < 1) {
    return c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '말할 내용을 적어 주세요.',
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  return c.json<APIInteractionResponseChannelMessageWithSource>({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: text,
    },
  })
}
