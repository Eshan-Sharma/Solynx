/**
 * This is git clone and upload function[upload to ipfs - TODO]
 */
import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import path from "path";
import { generate } from "@/app/utils/idGenerator";
import { getAllFiles } from "@/app/utils/fileUtils";
import { createClient } from "redis";
import { execSync } from "child_process";

// import { uploadFile } from '@/utils/ipfsUploader'
const publisher = createClient();
publisher.connect();
export async function POST(request: Request) {
  try {
    const { repoUrl, amount } = await request.json();
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }
    console.log("Received URL: " + repoUrl);
    console.log("Received amount: " + amount);
    const id = generate();

    // Set the folder name as the generated 'id'
    const outputPath = path.join(process.cwd(), "output", id);
    // Clone the repository into the folder named after 'id'
    await simpleGit().clone(repoUrl, outputPath);
    // Get all files from the cloned repository
    const files = getAllFiles(outputPath);
    console.log(files);

    // Create a new drive on Arweave using ArDrive
    const walletPath = "~/.demo-arweave-wallet.json"; // Update with your wallet path
    const folderId = execSync(
      `npx ardrive create-drive -n ${id} -w ${walletPath} --turbo | jq -r '.created[] | select(.type == "folder") | .entityId'`
    )
      .toString()
      .trim();

    console.log("Created folder on Arweave with ID:", folderId);

    //  Upload each file to Arweave using ArDrive
    for (const file of files) {
      const contentType = getContentType(file); // Add logic to detect content-type based on the file extension
      const txId = execSync(
        `npx ardrive upload-file -l ${file} --content-type ${contentType} -w ${walletPath} --turbo -F ${folderId} | jq -r '.created[] | select(.type == "file") | .dataTxId'`
      )
        .toString()
        .trim();

      console.log(`Uploaded file ${file} with transaction ID: ${txId}`);
    }

    // Redis
    publisher.lPush("build-queue", id);
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

// Helper function to get content type
function getContentType(file: string) {
  const extension = path.extname(file).toLowerCase();
  switch (extension) {
    case ".html":
      return "text/html";
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}
