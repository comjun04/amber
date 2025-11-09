import { type Context, type TypedResponse } from 'hono'
import { type APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10'

export interface CommandRunFuncAdditionalData {
  interactionAuthorId: string | null
}

export type CommandRunFunc = (
  c: Context,
  commandData: APIChatInputApplicationCommandInteractionData,
  additionalData: CommandRunFuncAdditionalData,
) => Promise<void | TypedResponse>
