import { spawn } from 'node:child_process'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kitRoot = resolve(root, 'courses-nuxt-kit')
const shell = process.platform === 'win32'

function portIsOpen(port) {
  return new Promise(resolveOpen => {
    const socket = connect({ host: '127.0.0.1', port })
    socket.once('connect', () => { socket.destroy(); resolveOpen(true) })
    socket.once('error', () => resolveOpen(false))
    socket.setTimeout(500, () => { socket.destroy(); resolveOpen(false) })
  })
}

const guide = spawn('npm run serve', { cwd: root, stdio: 'inherit', shell })
const providerAlreadyRunning = await portIsOpen(3000)
const provider = providerAlreadyRunning ? null : spawn('pnpm dev --port 3000', {
  cwd: kitRoot,
  stdio: 'inherit',
  shell
})

let stopping = false
function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  guide.kill('SIGTERM')
  provider?.kill('SIGTERM')
  setTimeout(() => process.exit(exitCode), 250)
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0))
guide.on('exit', code => { if (!stopping) stop(code ?? 1) })
provider?.on('exit', code => { if (!stopping) stop(code ?? 1) })

console.log('Integrated Courses preview:')
console.log('- guide: http://127.0.0.1:4173/viewer/?provider=local')
console.log(`- provider catalog: http://127.0.0.1:3000/ui${providerAlreadyRunning ? ' (reusing existing server)' : ''}`)
