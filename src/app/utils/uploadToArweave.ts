import { execSync } from "child_process";
import path from "path";

interface ArweaveFolder {
  path: string;
  folderId: string;
}

interface FileSystemStructure {
  folders: string[];
  files: string[];
}

export const uploadToArweave = async (
  id: string,
  fileSystem: FileSystemStructure,
  walletPath: string,
  basePath: string
) => {
  const folderIds = new Map<string, string>();

  // Create the root drive/folder
  const rootFolderId = execSync(
    `npx ardrive create-drive -n ${id} -w ${walletPath} --turbo | jq -r '.created[] | select(.type == "folder") | .entityId'`
  )
    .toString()
    .trim();

  console.log("Created root folder on Arweave with ID:", rootFolderId);
  folderIds.set(basePath, rootFolderId);

  // Process folders first, in order of depth
  for (const folderPath of fileSystem.folders) {
    if (folderPath === basePath) continue; // Skip root folder as it's already created

    const parentPath = path.dirname(folderPath);
    const folderName = path.basename(folderPath);
    const parentFolderId = folderIds.get(parentPath);

    if (!parentFolderId) {
      throw new Error(`Parent folder ID not found for ${folderPath}`);
    }

    try {
      const folderId = execSync(
        `npx ardrive create-folder -n ${folderName} -F ${parentFolderId} -w ${walletPath} --turbo | jq -r '.created[] | select(.type == "folder") | .entityId'`
      )
        .toString()
        .trim();

      console.log(`Created folder ${folderName} with ID: ${folderId}`);
      folderIds.set(folderPath, folderId);
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error);
      throw error;
    }
  }

  // Process files
  for (const filePath of fileSystem.files) {
    const parentPath = path.dirname(filePath);
    const parentFolderId = folderIds.get(parentPath);

    if (!parentFolderId) {
      throw new Error(`Parent folder ID not found for file ${filePath}`);
    }

    try {
      const contentType = getContentType(filePath);
      const txId = execSync(
        `npx ardrive upload-file -l "${filePath}" --content-type ${contentType} -w ${walletPath} --turbo -F ${parentFolderId} | jq -r '.created[] | select(.type == "file") | .dataTxId'`
      )
        .toString()
        .trim();

      console.log(
        `Uploaded file ${path.basename(filePath)} with transaction ID: ${txId}`
      );
    } catch (error) {
      console.error(`Error uploading file ${filePath}:`, error);
      throw error;
    }
  }

  return {
    rootFolderId,
    folderIds: Object.fromEntries(folderIds),
  };
};

// Helper function to determine content type
const getContentType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    // Add more mappings as needed
  };

  return contentTypes[extension] || "application/octet-stream";
};
