import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import path from "path";
import { getAllFilesAndFolders } from "@/app/utils/getFileAndFolder";
import { uploadToArweave } from "@/app/utils/uploadToArweave";
import { createClient } from "redis";
import { execSync } from "child_process";

// import { uploadFile } from '@/utils/ipfsUploader'
// Redis Connection
const publisher = createClient();
publisher.connect();
export async function POST(request: Request) {
  try {
    const { repoUrl, amount, id } = await request.json();
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }
    console.log("Received URL: " + repoUrl);
    console.log("Received amount: " + amount);
    console.log("Received id: " + id);

    // Set the folder name as the generated 'id'
    const outputPath = path.join(process.cwd(), "output", id);
    // Clone the repository into the folder named after 'id'
    await simpleGit().clone(repoUrl, outputPath);
    // Get all files from the cloned repository
    const fileSystem = getAllFilesAndFolders(outputPath);
    try {
      const result = await uploadToArweave(
        id,
        fileSystem,
        "~/.demo-arweave-wallet.json",
        outputPath
      );

      console.log("Upload complete! Root folder ID:", result.rootFolderId);
      console.log("All folder IDs:", result.folderIds);
    } catch (error) {
      console.error("Upload failed:", error);
    }

    // Redis
    publisher.lPush("build-queue", id);
    console.log("Redis pushed: " + id);
    return NextResponse.json(
      {
        id: id,
        message: "Repo cloned successfully",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error cloning repo:", e);
    return NextResponse.json({ error: "Failed to clone" }, { status: 500 });
  }
}
