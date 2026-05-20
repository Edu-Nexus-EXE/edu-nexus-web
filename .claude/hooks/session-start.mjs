/* global console */

import { readFileSync } from 'node:fs'

const contextFiles = ['AGENTS.md', 'ARCHITECTURE.md', 'package.json']

function readHead(path, maxChars = 3000) {
  try {
    return readFileSync(path, 'utf8').slice(0, maxChars)
  } catch {
    return ''
  }
}

const packageJson = JSON.parse(readHead('package.json', 10000) || '{}')
const scripts = packageJson.scripts ?? {}

const additionalContext = [
  'Edu Nexus session bootstrap:',
  '- Read AGENTS.md and ARCHITECTURE.md before changing code.',
  '- React Router 7 SSR, React 19, TypeScript strict, Tailwind v4 CSS-first, i18next EN/VI.',
  '- Keep routes thin; feature code lives in app/features; shared must not import features.',
  '- Use semantic theme tokens; do not hard-code colors in components.',
  '- User-facing strings need both EN and VI locale keys.',
  '- Do not edit Orval generated files in app/api/model or app/api/operations.',
  '',
  'Available npm scripts:',
  Object.keys(scripts)
    .map((name) => `- npm run ${name}`)
    .join('\n'),
  '',
  'Context files present:',
  contextFiles.map((file) => `- ${file}`).join('\n')
].join('\n')

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext
    }
  })
)
