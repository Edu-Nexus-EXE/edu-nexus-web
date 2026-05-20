/* global console, process */

import { spawnSync } from 'node:child_process'

const checks = [
  ['typecheck', ['run', 'typecheck']],
  ['lint', ['run', 'lint']]
]

if (process.env.KIRO_FULL_BUILD === 'true') {
  checks.push(['build', ['run', 'build']])
}

let failed = false

for (const [name, args] of checks) {
  console.log(`\n== ${name} ==`)
  const isWindows = process.platform === 'win32'
  const command = isWindows ? 'cmd.exe' : 'npm'
  const commandArgs = isWindows ? ['/d', '/s', '/c', ['npm.cmd', ...args].join(' ')] : args
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: false
  })

  if (result.status !== 0) {
    failed = true
    if (result.error) {
      console.error(result.error.message)
    }
    console.error(`${name} failed`)
    break
  }
}

if (failed) {
  process.exit(1)
}

console.log('\nEdu Nexus quality gate passed.')
