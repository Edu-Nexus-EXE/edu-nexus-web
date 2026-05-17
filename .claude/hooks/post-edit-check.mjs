/* global console, process */

import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => resolve(data))
  })
}

function normalize(path) {
  return path.replaceAll('\\', '/')
}

function getEditedPath(input) {
  const toolInput = input.tool_input ?? input.toolInput ?? {}
  return toolInput.file_path ?? toolInput.path ?? toolInput.notebook_path ?? ''
}

function fail(message) {
  console.error(message)
  process.exit(2)
}

const raw = await readStdin()
const input = raw ? JSON.parse(raw) : {}
const editedPath = normalize(getEditedPath(input))

if (!editedPath) {
  process.exit(0)
}

const repoRelativePath = normalize(relative(process.cwd(), editedPath)).replace(/^\.\//, '')
const path = editedPath.startsWith('app/') ? editedPath : repoRelativePath

if (/^app\/api\/(model|operations)\//.test(path)) {
  fail(
    [
      'Generated Orval output was edited.',
      'Do not hand-edit app/api/model or app/api/operations.',
      'Update orval.config.ts, app/api/mutator/custom-fetch.ts, swagger.json, or mocks instead.'
    ].join('\n')
  )
}

if (!/^app\/.*\.(tsx|ts)$/.test(path)) {
  process.exit(0)
}

let content = ''
try {
  content = readFileSync(path, 'utf8')
} catch {
  process.exit(0)
}

const hardCodedColorPatterns = [
  /\b(?:bg|text|border|ring|from|to|via|stroke|fill)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
  /#[0-9a-fA-F]{3,8}\b/
]

if (hardCodedColorPatterns.some((pattern) => pattern.test(content))) {
  fail(
    [
      'Potential hard-coded color detected in an app TypeScript/TSX file.',
      'Use semantic Tailwind token classes from app/styles/theme.css instead.',
      'Examples: bg-card, text-foreground, border-border, bg-primary, text-muted-foreground.'
    ].join('\n')
  )
}

process.exit(0)
