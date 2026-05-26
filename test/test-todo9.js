/**
 * Playwright test for Todo9 — HR & People Ops tab updates
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8888/xcorp-merged.html';
const SCREENSHOT_DIR = path.resolve(__dirname, 'test-screenshots');

let pass = 0;
let fail = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    pass++;
  } else {
    console.log(`  ❌ ${name}`);
    fail++;
  }
}

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // Navigate to home page
  await page.evaluate(() => switchPage('home'));
  await page.waitForTimeout(500);

  // Click on the HR & People Ops tab
  console.log('\n📌 Clicking HR & People Ops Tab');
  await page.locator('.ro-tab').nth(2).click();
  await page.waitForTimeout(500);

  const hrPanel = await page.locator('#ro-hr').textContent();

  // Assert old content is gone
  assert(!hrPanel.includes('1-click approvals with conflict detection'), 'Old solution title is removed');
  assert(!hrPanel.includes('XCorp flags scheduling conflicts'), 'Old solution description is removed');
  assert(!hrPanel.includes('overlaps with our product launch'), 'Old quote is removed');
  assert(!hrPanel.includes('impacts project timelines'), 'Old pain point is removed');
  assert(!hrPanel.includes('See the HR view'), 'Old button text is removed');

  // Assert new content is present
  assert(hrPanel.includes('Self-service leave & balance tracking'), 'New solution title is present');
  assert(hrPanel.includes('Employees request leave and view balances instantly. Accruals and routing follow your policies.'), 'New solution description is present');
  assert(hrPanel.includes('I spent half my week manually tracking leave balances in spreadsheets'), 'New quote is present');
  assert(hrPanel.includes('No real-time leave balance calculations'), 'New pain point is present');
  assert(hrPanel.includes('See the HR & People Ops view'), 'New button text is present');

  await page.locator('#ro-hr').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo9-hr-tab.png'), fullPage: false });

  // ========== SUMMARY ==========
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
  console.log(`${'='.repeat(50)}`);

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
