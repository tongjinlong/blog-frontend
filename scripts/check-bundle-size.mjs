import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const distDir = process.env.BUNDLE_DIST_DIR ?? 'dist'
const assetsDir = path.join(distDir, 'assets')
const assetExtensions = new Set(['.css', '.js'])

function readSizeLimit(envName, fallbackKb) {
  const rawValue = process.env[envName] ?? String(fallbackKb)
  const value = Number(rawValue)

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${envName} must be a positive number, got ${rawValue}`)
  }

  return value * 1024
}

async function collectAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return collectAssets(entryPath)
      }

      if (!entry.isFile() || !assetExtensions.has(path.extname(entry.name))) {
        return []
      }

      return [entryPath]
    })
  )

  return files.flat()
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

async function main() {
  const maxAssetGzipBytes = readSizeLimit('BUNDLE_MAX_ASSET_GZIP_KB', 350)
  const maxTotalGzipBytes = readSizeLimit('BUNDLE_MAX_TOTAL_GZIP_KB', 900)
  const assetPaths = await collectAssets(assetsDir)

  if (assetPaths.length === 0) {
    throw new Error(`No JS or CSS assets found in ${assetsDir}`)
  }

  const assets = await Promise.all(
    assetPaths.map(async (assetPath) => {
      const content = await readFile(assetPath)

      return {
        gzipBytes: gzipSync(content).byteLength,
        name: path.relative(distDir, assetPath),
        rawBytes: content.byteLength
      }
    })
  )
  const totalGzipBytes = assets.reduce((total, asset) => total + asset.gzipBytes, 0)
  const oversizedAssets = assets.filter((asset) => asset.gzipBytes > maxAssetGzipBytes)

  console.log('Bundle size report')
  console.log(`Total gzip: ${formatKb(totalGzipBytes)} / ${formatKb(maxTotalGzipBytes)}`)

  for (const asset of assets.toSorted((left, right) => right.gzipBytes - left.gzipBytes)) {
    console.log(`${asset.name}: ${formatKb(asset.gzipBytes)} gzip, ${formatKb(asset.rawBytes)} raw`)
  }

  if (oversizedAssets.length > 0 || totalGzipBytes > maxTotalGzipBytes) {
    const oversizedNames = oversizedAssets.map((asset) => asset.name).join(', ')

    throw new Error(`Bundle size limit exceeded. Oversized assets: ${oversizedNames || 'none'}.`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
