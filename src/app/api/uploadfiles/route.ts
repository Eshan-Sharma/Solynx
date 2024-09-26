import { NextResponse } from 'next/server';
import { create } from '@web3-storage/w3up-client';
import path from 'path';
import { promises as fs } from 'fs';
import { Blob } from 'buffer';

// Helper function to check if a path is a directory
const isDirectory = async (source: string) => {
  try {
    const stat = await fs.lstat(source);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
};

// Helper function to create a File-like object for Node.js
function createFileLikeObject(content: Buffer, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  // Simulating a File object in Node.js (since File isn't available)
  return {
    ...blob,
    name: filename,
    lastModified: Date.now(),
  };
}

// Helper function to read files from a directory
const readFilesFromDirectory = async (directoryPath: string) => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files: any[] = []; // Array to hold File-like objects

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively read subdirectories (if needed)
      const subdirectoryFiles = await readFilesFromDirectory(fullPath);
      files.push(...subdirectoryFiles);
    } else {
      // Read the file content
      const fileContent = await fs.readFile(fullPath);
      const file = createFileLikeObject(fileContent, entry.name, 'application/octet-stream');
      files.push(file);
    }
  }

  return files;
};

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { directoryPath } = await req.json();

    // Check if directoryPath is provided
    if (!directoryPath) {
      return NextResponse.json({ message: 'Directory path not provided' }, { status: 400 });
    }

    // Validate the provided directory path
    const resolvedPath = path.resolve(directoryPath); // Resolve to an absolute path
    if (!(await isDirectory(resolvedPath))) {
      return NextResponse.json({ message: 'Invalid directory path' }, { status: 400 });
    }

    // Initialize web3.storage client
    const client = await create();

    // Login to web3.storage (replace with valid credentials)
    const myAccount = await client.login('your-email@example.com');

    // Wait for payment plan selection (replace with real check)
    const paymentPlan = await myAccount.plan.get();
    if (!paymentPlan.ok) {
      throw new Error('Error selecting payment plan');
    }

    // Create a space
    const space = await client.createSpace('my-awesome-space');
    await myAccount.provision(space.did());
    await space.save();

    // Read files from the directory
    const files = await readFilesFromDirectory(resolvedPath);

    if (files.length === 0) {
      return NextResponse.json({ message: 'No files found in the directory' }, { status: 400 });
    }

    // Upload the directory to IPFS
    const directoryCid = await client.uploadDirectory(files);

    // Respond with the CID of the uploaded directory
    return NextResponse.json({ directoryCid }, { status: 200 });
  } catch (error) {
    console.error('Error uploading directory:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
