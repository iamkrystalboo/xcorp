/**
 * Playwright test for Todo10 — See All Features Upgrade & Product Page Cleanup
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

  // 1. Check router mapping
  console.log('\n📌 1. Router mapping');
  const pagesHasProducts = await page.evaluate(() => 'products' in pages);
  assert(!pagesHasProducts, '"products" removed from active router mapping');

  // 2. Check dropdown footer
  console.log('\n📌 2. Dropdown footer');
  await page.locator('#productsBtn').click();
  await page.waitForTimeout(300);
  const dropdownHTML = await page.locator('#productsDropdown').innerHTML();
  assert(!dropdownHTML.includes('View all products'), 'View all products link is removed from dropdown');
  assert(dropdownHTML.includes('See all features'), 'See all features link is still present');
  await page.locator('#productsBtn').click(); // close

  // 3. Check back links on sub-pages
  console.log('\n📌 3. Sub-page Back Links');
  await page.evaluate(() => switchPage('okr'));
  await page.waitForTimeout(300);
  const okrBackText = await page.locator('#page-okr .back-link').textContent();
  assert(okrBackText.includes('See all features'), 'OKR back link text updated to See all features');
  
  await page.evaluate(() => switchPage('product-project'));
  await page.waitForTimeout(300);
  const pmBackText = await page.locator('#page-product-project .back-link').textContent();
  assert(pmBackText.includes('See all features'), 'PM project back link text updated to See all features');

  await page.evaluate(() => switchPage('automation'));
  await page.waitForTimeout(300);
  const autoBackText = await page.locator('#page-automation .back-link').textContent();
  assert(autoBackText.includes('See all features'), 'Automation back link text updated to See all features');

  await page.evaluate(() => switchPage('product-hr'));
  await page.waitForTimeout(300);
  const hrBackText = await page.locator('#page-product-hr .back-link').textContent();
  assert(hrBackText.includes('See all features'), 'HR back link text updated to See all features');

  // 4. Check Features Page Redesign Content
  console.log('\n📌 4. Features Page Content Updates');
  await page.evaluate(() => switchPage('all-features'));
  await page.waitForTimeout(500);

  const featuresHTML = await page.locator('#page-all-features').innerHTML();
  const featuresText = await page.locator('#page-all-features').textContent();

  // Goals
  assert(featuresText.includes('company → group -> team → individual'), 'Goals: Cascading group level present');
  assert(featuresText.includes('Daily check-ins auto-calculated'), 'Goals: Daily check-ins present');

  // Project Management
  assert(featuresText.includes('Kanban, List, Gantt — switch views'), 'PM: Views description updated');
  assert(featuresText.includes('Smart Task Assignment'), 'PM: Smart Task Assignment title added');
  assert(featuresText.includes('workload balancing'), 'PM: Workload balancing description added');
  assert(!featuresText.includes('Dependencies & Blockers'), 'PM: Old Dependencies & Blockers title removed');
  assert(!featuresText.includes('alert your team 24h before a cascade'), 'PM: Old blockers alert description removed');

  // HR & People Ops
  assert(featuresText.includes('Request, approve, and track leave. Automatic notifications on every step.'), 'HR: Conflict detection removed from leave description');

  // Automation
  assert(featuresText.includes('Slack Integration'), 'Automation: Slack integration is present');
  assert(featuresText.includes('Approve leave requests without leaving your channel'), 'Automation: Blockers text removed from Slack desc');
  assert(!featuresText.includes('GitHub Integration'), 'Automation: GitHub integration card is removed');

  // 5. Layout and Images
  console.log('\n📌 5. Redesigned Layout and Visuals');
  const visualContainers = await page.locator('.features-visual-box').count();
  assert(visualContainers === 4, `Found ${visualContainers} visualization containers (expected 4)`);

  const mockupImages = page.locator('.features-visual-box img');
  const img1 = await mockupImages.nth(0).getAttribute('src');
  const img2 = await mockupImages.nth(1).getAttribute('src');
  const img3 = await mockupImages.nth(2).getAttribute('src');
  const img4 = await mockupImages.nth(3).getAttribute('src');

  assert(img1 === './okr_cascade_mockup.png', 'OKR cascade mockup image source is correct');
  assert(img2 === './pm_gantt_kanban_mockup.png', 'PM mockup image source is correct');
  assert(img3 === './hr_leave_calendar_mockup.png', 'HR mockup image source is correct');
  assert(img4 === './automation_workflow_mockup.png', 'Automation mockup image source is correct');

  // Trigger reveal visible classes before taking screenshot
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      el.style.transitionDuration = '0s';
      el.style.animationPlayState = 'paused';
    });
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });

  // Screenshot features page
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo10-features-page.png'), fullPage: true });
  console.log('✅ Screenshot captured: test-screenshots/todo10-features-page.png');

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
