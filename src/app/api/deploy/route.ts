import { NextResponse } from 'next/server'
import simpleGit from 'simple-git'
import path from 'path'
import { generate } from '@/app/utils/idGenerator'
import { getAllFiles } from '@/app/utils/fileUtils'

// import { uploadFile } from '@/utils/ipfsUploader'

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json()
    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }
    console.log("Received URL " + repoUrl)
    const id = generate()

    const outputPath = path.join(process.cwd(), 'output', id)
    await simpleGit().clone(repoUrl, outputPath)
    const files = getAllFiles(outputPath)
    console.log(files)

    // TODO: Store files to IPFS
    // await uploadFile()

    return NextResponse.json({
      id: id,
      message: "Repo cloned successfully",
    }, { status: 200 })
  } catch (e) {
    console.error("Error cloning repo:", e)
    return NextResponse.json({ error: "Failed to clone" }, { status: 500 })
  }
}