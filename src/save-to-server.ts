import { join, basename } from 'path'
import { existsSync } from 'fs'
import { readdir, writeFile, mkdir } from 'fs/promises'

const FILESAVE_ROOT_PATH = process.env.FILESAVE_ROOT_PATH as string

export async function saveUserProfileData(
  user: {
    id: string
    username: string
  },
  type: 'avatar' | 'banner',
  url: string,
) {
  const imageFilename = basename(new URL(url).pathname)

  const dirList = await readdir(FILESAVE_ROOT_PATH)
  let targetFolder = dirList.find((folder) => folder.startsWith(`${user.id}-`))
  if (targetFolder == null) {
    targetFolder = `${user.id}-${user.username}`
  }

  const fullFolderPath = join(FILESAVE_ROOT_PATH, targetFolder, type)
  await mkdir(fullFolderPath, { recursive: true })

  const fullFilePath = join(fullFolderPath, imageFilename)
  if (existsSync(fullFilePath)) {
    console.warn(`[SaveToServer] file ${fullFilePath} already exists, skipping`)
    return
  }

  // now fetch file
  const res = await fetch(url)
  if (!res.ok) {
    console.error(res.status, await res.text())
    return null
  }
  const image = Buffer.from(await res.arrayBuffer())

  await writeFile(fullFilePath, image)
  console.log(fullFilePath)
}
