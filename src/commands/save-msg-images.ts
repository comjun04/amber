import {
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10'
import { MessageCommandFn } from '../types'
import { saveMessageImages } from '../save-to-server'

export const runMessageCommand: MessageCommandFn = async (c, commandData) => {
  const targetMessage = Object.values(commandData.resolved.messages)[0]
  console.log(targetMessage)

  const imageAttachments = targetMessage.attachments.filter(
    (d) => d.content_type != null && d.content_type.startsWith('image/'),
  )
  if (imageAttachments.length < 1) {
    return c.json<APIInteractionResponseChannelMessageWithSource>({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '이 메세지는 사진을 포함하고 있지 않아요.',
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  const attachmentsData = imageAttachments.map((attachment) => ({
    id: attachment.id,
    filename: attachment.filename,
    url: attachment.url,
  }))
  saveMessageImages(attachmentsData).catch(console.error)

  return c.json<APIInteractionResponseChannelMessageWithSource>({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content:
        '해당 메세지에 포함된 사진을 저장하고 있습니다. 완료되기까지 몇 초 정도 걸릴 수 있습니다.',
      flags: MessageFlags.Ephemeral,
    },
  })
}
