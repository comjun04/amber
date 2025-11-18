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

  const fullFolderPath = join(
    FILESAVE_ROOT_PATH,
    'profiles',
    targetFolder,
    type,
  )
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

export async function saveMessageImages(
  attachmentsData: {
    id: string
    filename: string
    url: string
  }[],
) {
  const folderPath = join(FILESAVE_ROOT_PATH, 'images')
  await mkdir(folderPath, { recursive: true })

  for (const data of attachmentsData) {
    const res = await fetch(data.url)
    if (!res.ok) {
      console.error(res.status, await res.text())
      continue
    }
    const image = Buffer.from(await res.arrayBuffer())

    const filename = `${data.id}_${data.filename}`
    const filePath = join(folderPath, filename)
    await writeFile(filePath, image)
    console.log(filePath)
  }
}
