import 'dotenv/config'

import { REST } from '@discordjs/rest'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  RESTPutAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10'

const commands: RESTPutAPIApplicationCommandsJSONBody = [
  {
    name: 'avatar',
    description: '해당 유저의 프로필 이미지를 보여줍니다.',
    type: ApplicationCommandType.ChatInput,
    integration_types: [ApplicationIntegrationType.UserInstall],
    options: [
      {
        name: 'user',
        description:
          '프로필 이미지를 볼 대상. 지정하지 않은 경우 실행한 사람의 프로필 이미지를 보여줍니다.',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: 'ephemeral',
        description:
          '메세지를 나만 볼 수 있게 출력할지 여부. 기본값은 true입니다.',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },
]

const appId = process.env.APP_ID ?? ''

const client = new REST().setToken(process.env.BOT_TOKEN ?? '')
client
  .put(Routes.applicationCommands(appId), {
    body: commands,
  })
  .then(() => {
    console.log('Successfully deployed command')
  })
  .catch((err) => {
    console.error(err)
  })
