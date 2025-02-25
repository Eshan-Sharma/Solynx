import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import path from "path";
import { getAllFilesAndFolders } from "@/app/utils/getFileAndFolder";
// import { uploadToArweave } from "@/app/utils/uploadToArweave";
import { createClient } from "redis";
const fs = require('fs');
const { execSync } = require('child_process');
// import { uploadFile } from '@/utils/ipfsUploader' - TODO?
// Redis Connection
const publisher = createClient();
publisher.connect();
export async function POST(request: Request) {
  try {
    const { repoUrl, id } = await request.json();
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }
    // Set the folder name as the generated 'id'
    const outputPath = path.join(process.cwd(), "output", id);
    // Clone the repository into the folder named after 'id'
    await simpleGit().clone(repoUrl, outputPath);
    // Get all files from the cloned repository
    const fileSystem = getAllFilesAndFolders(outputPath);
    // try {
    //   const result = await uploadToArweave(
    //     id,
    //     fileSystem,
    //     "/.demo.json",
    //     outputPath
    //   );
    //   console.log("Upload complete! Root folder ID:", result.rootFolderId);
    //   console.log("All folder IDs:", result.folderIds);
    // } catch (error) {
    //   console.error("Upload failed:", error);
    //   return NextResponse.json({ error: "Upload to Arweave failed" }, { status: 500 });
    // }

    // Redis
    publisher.lPush("build-queue", id);
    console.log("Redis pushed: " + id);

    const result : any = detectFramework(outputPath);

    await buildProject(outputPath, id);
    console.log("success")
    return NextResponse.json(
      {
        id: id,
        message: `Repo cloned and uploaded successfully ${id} and the result is : ${result}`,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error cloning repo:", e);
    return NextResponse.json({ error: "Failed to clone" }, { status: 500 });
  }
}

function detectFramework(projectPath: any) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  let dependencies : any= {};

  // Check for package.json and read dependencies
  if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      dependencies = packageJson.dependencies || {};
  }

  // Framework-specific checks
  if (dependencies['next']) return 'Next.js';
  if (dependencies['@vue/cli-service']) return 'Vue.js';
  if (dependencies['@angular/core']) return 'Angular';
  if (dependencies['react'] && dependencies['react-dom']) return 'React';
  if (dependencies['svelte']) return 'Svelte';

  // File-based detection
  if (fs.existsSync(path.join(projectPath, 'next.config.js'))) return 'Next.js';
  if (fs.existsSync(path.join(projectPath, 'vue.config.js'))) return 'Vue.js';
  if (fs.existsSync(path.join(projectPath, 'angular.json'))) return 'Angular';
  if (fs.existsSync(path.join(projectPath, 'svelte.config.js'))) return 'Svelte';

  // Generic Static Site
  if (fs.existsSync(path.join(projectPath, 'index.html'))) return 'Static Site';

  // Default return if no framework is detected
  return 'Unknown Framework';
}

function buildProject(projectPath: any, id: string) {
    const framework = detectFramework(projectPath);
    const buildOutputPath = path.join(process.cwd(), "output", id, "build");

    console.log(`Detected Framework: ${framework}`);
    console.log(`Building the project...`);

    try {
        // Navigate to project directory
        process.chdir(projectPath);

        // Install dependencies
        execSync('npm install', { stdio: 'inherit' });

        // Run the build command based on framework
        switch (framework) {
            case 'Next.js':
            case 'React':
            case 'Vue.js':
            case 'Svelte':
                execSync('npm run build', { stdio: 'inherit' });
                execSync(`mv build ${buildOutputPath}`, { stdio: 'inherit' });
                break;
            case 'Angular':
                execSync('ng build --prod', { stdio: 'inherit' });
                execSync(`mv dist ${buildOutputPath}`, { stdio: 'inherit' });
                break;
            case 'Static Site':
                console.log('No build needed for Static Sites.');
                break;
            default:
                throw new Error('Unknown framework. Cannot build.');
        }

        console.log('Build completed successfully!');
    } catch (error: any) {
        console.error(`Error during build: ${error.message}`);
    }
}
