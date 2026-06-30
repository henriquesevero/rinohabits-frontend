import { chromium } from 'playwright-core'
import fs from 'node:fs'

const dirName = fs
  .readdirSync(`${process.env.HOME}/Library/Caches/ms-playwright`)
  .find((d) => d.startsWith('chromium-') && !d.includes('headless_shell'))
const chromePath = `${process.env.HOME}/Library/Caches/ms-playwright/${dirName}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`

const browser = await chromium.launch({ executablePath: chromePath })

const page = await browser.newPage({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
})

const errors = []
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto('http://localhost:5180', { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/mobile-login.png' })

await page.fill('input[placeholder="E-mail"]', 'henrique@example.com')
await page.fill('input[placeholder="Senha"]', 'super-secret-123')
await page.tap('button[type="submit"]')
await page.waitForSelector('text=Hábitos de Hoje', { timeout: 10000 })
await page.waitForTimeout(700)
await page.screenshot({ path: '/tmp/mobile-habits.png' })

await page.tap('text=Estatísticas')
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/mobile-stats.png' })

await page.tap('text=Livros')
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/mobile-books.png' })

console.log('errors:', JSON.stringify(errors))
await browser.close()
