// @flow

import fs from 'fs'
import path from 'path'

export default function getFileFilter (baseDir: string) {
  return (fileInfo: any) => {
    const fullPath = path.join(baseDir, fileInfo.relPath)
    const stats = fs.statSync(fullPath)

    if (stats.isFile()) {
      const text = fs.readFileSync(fullPath, 'utf8')
      return text.includes('graphql')
    }

    return false
  }
}
