import { type Context, type TypedResponse } from 'hono'
import {
  APIUserApplicationCommandInteractionData,
  type APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10'

export interface CommandRunFuncAdditionalData {
  interactionAuthorId: string | null
}

export type CommandRunFunc = (
  c: Context,
  commandData: APIChatInputApplicationCommandInteractionData,
  additionalData: CommandRunFuncAdditionalData,
) => Promise<void | TypedResponse>

export type UserCommandRunFunc = (
  c: Context,
  commandData: APIUserApplicationCommandInteractionData,
) => Promise<void | TypedResponse>
