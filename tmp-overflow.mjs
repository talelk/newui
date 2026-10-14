import { chromium } from 'playwright'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 320, height: 900 } })
await page.goto('http://localhost:4185/spec', { waitUntil: 'load' })
await page.waitForTimeout(1500)
const result = await page.evaluate(() => {
  const docW = document.documentElement.clientWidth
  const offenders = []
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.right > docW + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        slot: el.getAttribute('data-slot') ?? '',
        right: Math.round(r.right),
      })
    }
  }
  return {
    docW,
    scrollW: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 20),
  }
})
console.log('docW', result.docW, 'scrollW', result.scrollW)
console.log(JSON.stringify(result.offenders))
await browser.close()
