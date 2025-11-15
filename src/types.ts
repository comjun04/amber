import { type Context, type TypedResponse } from 'hono'
import {
  APIUserApplicationCommandInteractionData,
  type APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10'

export interface ChatInputCommandRunFnAdditionalData {
  interactionAuthorId: string | null
}

export type ChatInputCommandRunFn = (
  c: Context,
  commandData: APIChatInputApplicationCommandInteractionData,
  additionalData: ChatInputCommandRunFnAdditionalData,
) => Promise<void | TypedResponse>

export type UserCommandRunFn = (
  c: Context,
  commandData: APIUserApplicationCommandInteractionData,
) => Promise<void | TypedResponse>
