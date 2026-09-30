// Headless-скриншот локальной страницы из этой папки (WebGL через SwiftShader).
// Usage: node render.mjs <page.html?query> <out.jpg|out.pdf> W H [--wait sel]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(path.join(execSync('npm root -g').toString().trim(), '@playwright/mcp/package.json'))
const { chromium } = require('playwright-core')
const [pageArg, out, w = '1600', h = '1000'] = process.argv.slice(2)
const root = import.meta.dirname
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.css': 'text/css' }
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]))
  fs.readFile(p, (err, buf) => {
    if (err) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'content-type': types[path.extname(p).toLowerCase()] || 'application/octet-stream' }); res.end(buf)
  })
}).listen(0)
const port = server.address().port
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +(process.env.DPR || 1) })
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'log') console.log('[page]', m.text().slice(0, 300)) })
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)))
await page.goto(`http://localhost:${port}/${pageArg}`, { waitUntil: 'load' })
await page.waitForFunction(() => document.body && document.body.dataset.ready === '1', null, { timeout: 240000 })
await page.waitForTimeout(300)
if (out.endsWith('.pdf')) {
  await page.pdf({ path: out, width: `${w}px`, height: `${h}px`, printBackground: true, pageRanges: '1' })
} else {
  await page.screenshot({ path: out, type: out.endsWith('.png') ? 'png' : 'jpeg', ...(out.endsWith('.png') ? {} : { quality: 93 }) })
}
await browser.close(); server.close()
console.log(out)
