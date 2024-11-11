import fs from "fs";
import path from "path";

interface FileSystemItems {
  files: string[];
  folders: string[];
}

// Default ignore patterns
const defaultIgnorePatterns = [
  // Version Control
  ".git",
  ".svn",
  ".hg",
  ".bzr",

  // Dependencies
  "node_modules",
  "bower_components",

  // Build outputs
  "dist",
  "build",
  ".next",
  "out",

  // Cache directories
  ".cache",

  // Environment and config files
  ".env",
  ".env.local",
  ".env.*.local",

  // OS generated files
  ".DS_Store",
  "Thumbs.db",

  // IDE directories
  ".idea",
  ".vscode",

  // Log files
  "*.log",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",

  // Test coverage
  "coverage",

  // Package manager files
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

export const getAllFilesAndFolders = (
  folderPath: string,
  customIgnorePatterns: string[] = []
): FileSystemItems => {
  const response: FileSystemItems = {
    files: [],
    folders: [],
  };

  // Combine default and custom ignore patterns
  const ignorePatterns = [...defaultIgnorePatterns, ...customIgnorePatterns];

  // Convert glob-like patterns to RegExp
  const ignoreRegexps = ignorePatterns.map((pattern) => {
    // Convert glob star to regex
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
    return new RegExp(`^${regexPattern}$`);
  });

  const shouldIgnore = (itemPath: string): boolean => {
    const itemName = path.basename(itemPath);

    // Check against ignore patterns
    return ignoreRegexps.some((regexp) => regexp.test(itemName));
  };

  const traverseDirectory = (currentPath: string) => {
    // Skip if this directory should be ignored
    if (shouldIgnore(currentPath)) {
      return;
    }

    try {
      const items = fs.readdirSync(currentPath);

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item);

        // Skip if this item should be ignored
        if (shouldIgnore(item)) {
          return;
        }

        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            response.folders.push(fullPath);
            traverseDirectory(fullPath);
          } else if (stats.isFile()) {
            response.files.push(fullPath);
          }
        } catch (error) {
          console.warn(`Error accessing ${fullPath}:`, error);
        }
      });
    } catch (error) {
      console.warn(`Error reading directory ${currentPath}:`, error);
    }
  };

  // Add the root folder
  response.folders.push(folderPath);
  traverseDirectory(folderPath);

  // Sort folders by depth (shortest path first)
  response.folders.sort((a, b) => {
    const depthA = a.split(path.sep).length;
    const depthB = b.split(path.sep).length;
    return depthA - depthB;
  });

  return response;
};

// Helper function to get relative paths
export const getRelativePaths = (
  basePath: string,
  items: FileSystemItems
): FileSystemItems => {
  return {
    files: items.files.map((file) => path.relative(basePath, file)),
    folders: items.folders.map((folder) => path.relative(basePath, folder)),
  };
};
