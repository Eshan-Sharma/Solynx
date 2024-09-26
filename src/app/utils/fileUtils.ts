import fs from 'fs'
import path from 'path'

export const getAllFiles = (folderPath: string): string[] => {
  const response: string[] = []
  
  const traverseDirectory = (currentPath: string) => {
    const files = fs.readdirSync(currentPath)
    
    files.forEach((file) => {
      const fullPath = path.join(currentPath, file)
      if (fs.statSync(fullPath).isDirectory()) {
        traverseDirectory(fullPath)
      } else {
        response.push(fullPath)
      }
    })
  }
  
  traverseDirectory(folderPath)
  return response
}