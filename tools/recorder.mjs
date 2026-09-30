import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { execSync, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
const require = createRequire(path.join(execSync('npm root -g').toString().trim(), '@playwright/mcp/package.json'))
const { chromium } = require('playwright-core')
const [dir, pageArg, out, SEC = '8', W = '1600', H = '1000', FPS = '30'] = process.argv.slice(2)
const root = path.resolve(dir)
const types = { '.html': 'text/html; charset=utf-8', '.glb': 'model/gltf-binary', '.js': 'text/javascript' }
const server = http.createServer((req, res) => { const p = path.join(root, decodeURIComponent(req.url.split('?')[0])); fs.readFile(p, (err, buf) => { if (err) { res.writeHead(404); return res.end() } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(buf) }) }).listen(0)
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: +W, height: +H } })
await page.goto(`http://localhost:${server.address().port}/${pageArg}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 240000 })
const fr = path.join(root, 'frames_' + path.basename(out, '.mp4'))
fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr)
const N = +FPS * +SEC
for (let i = 0; i < N; i++) { await page.evaluate((t) => window.renderAt(t), i / (N - 1)); await page.screenshot({ path: path.join(fr, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 92 }) }
await browser.close(); server.close()
const ff = execSync('python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"').toString().trim()
execFileSync(ff, ['-y', '-framerate', FPS, '-i', path.join(fr, '%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', path.resolve(out)], { stdio: 'ignore' })
console.log('done', out)
