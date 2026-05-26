/**
 * Playwright test for Todo7 — Homepage content updates
 * Tests all changes specified in todo7:
 * 1. "2,400+ Teams using XCorp" removed from hero social proof ticker
 * 2. Sprint blocked / Blockers auto-escalated items replaced in The Real Difference
 * 3. OKR cascade text updated (company → group → team → individual)
 * 4. Blocker detection card removed and replaced with smart task assignment
 * 5. Leave approval text updated (no sprint deadline reference)
 * 6. "Product & Engineering" tab renamed to "Project Managers"
 * 7. Leadership tab blocker items removed
 * 8. Project Managers tab blocker items replaced
 * 9. Emojis updated for By Role and By Use Case
 * 10. Footer links updated
 * 11. Login page 2400+ stat removed
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

  // ========== 1. Social Proof Ticker ==========
  console.log('\n📌 1. Social Proof Ticker');
  const tickerText = await page.locator('.social-proof-bar').textContent();
  assert(!tickerText.includes('2,400+'), '"2,400+" removed from social proof ticker');
  assert(!tickerText.includes('Teams using XCorp'), '"Teams using XCorp" removed from ticker');
  assert(tickerText.includes('68%'), '"68% Less time in status meetings" still present');
  assert(tickerText.includes('4.9★'), '"4.9★ Average rating" still present');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-social-proof.png'), fullPage: false });

  // ========== 2. The Real Difference Section ==========
  console.log('\n📌 2. The Real Difference Section');
  const baSection = await page.locator('.before-after-section').textContent();
  assert(!baSection.includes('Sprint blocked — discovered at standup'), 'Sprint blocked item removed');
  assert(!baSection.includes('engineering team has been stuck for 3 days'), 'Sprint blocked description removed');
  assert(baSection.includes('OKR progress unknown'), 'New OKR progress unknown item added (Before)');

  assert(!baSection.includes('Blockers auto-escalated after 24 hours'), 'Blockers auto-escalated item removed');
  assert(!baSection.includes('detected the stuck task Friday evening'), 'Auto-escalation description removed');
  assert(baSection.includes('OKR progress auto-updated from real work'), 'New OKR auto-updated item added (After)');

  await page.locator('.before-after-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-real-difference.png'), fullPage: false });

  // ========== 3. Why XCorp Works - OKR Cascade ==========
  console.log('\n📌 3. Why XCorp Works - OKR Cascade');
  const featuresSection = await page.locator('.features-section-home').textContent();
  assert(featuresSection.includes('company → group → team → individual'), 'OKR cascade updated with group level');
  assert(!featuresSection.includes('company → team → individual'), 'Old OKR cascade without group removed');

  // ========== 4. Blocker Detection Card Removed ==========
  console.log('\n📌 4. Blocker Detection Card Replaced');
  assert(!featuresSection.includes('Blocker detection'), 'Blocker detection card removed');
  assert(!featuresSection.includes('auto-escalation'), '"auto-escalation" text removed from features');
  assert(!featuresSection.includes('Nobody told me it was stuck'), '"Nobody told me it was stuck" pain tag removed');
  assert(featuresSection.includes('Smart task assignment'), 'Smart task assignment card added');
  assert(featuresSection.includes('workload balancing'), 'Workload balancing text present');

  // ========== 5. Leave Approval Text Updated ==========
  console.log('\n📌 5. Leave Approval Text Updated');
  assert(!featuresSection.includes('sprint deadline before you confirm'), 'Sprint deadline reference removed');
  assert(!featuresSection.includes('I approved leave then saw the deadline'), 'Old pain tag removed');
  assert(featuresSection.includes('team coverage and task assignments'), 'New leave text with task coverage');
  assert(featuresSection.includes('nobody covered their tasks'), 'New pain tag about task coverage');

  await page.locator('.features-section-home').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-features.png'), fullPage: false });

  // ========== 6. Tab Renamed ==========
  console.log('\n📌 6. Product & Engineering → Project Managers');
  const tabsText = await page.locator('.ro-tabs').textContent();
  assert(tabsText.includes('Project Managers'), 'Tab renamed to "Project Managers"');
  assert(!tabsText.includes('Product'), '"Product & Engineering" removed from tabs');

  // ========== 7. Leadership Tab - Blocker Items Removed ==========
  console.log('\n📌 7. Leadership Tab Updates');
  // Click on Leadership tab first
  await page.locator('.ro-tab').first().click();
  await page.waitForTimeout(300);
  const leadershipPanel = await page.locator('#ro-leadership').textContent();
  assert(!leadershipPanel.includes('Blockers discovered in month 3'), '"Blockers discovered in month 3" removed');
  assert(!leadershipPanel.includes('Blockers escalated in 24h'), '"Blockers escalated in 24h" removed');
  assert(!leadershipPanel.includes('Automatic detection and notification'), 'Auto detection text removed');
  assert(leadershipPanel.includes('Team workload visible'), 'New workload visibility item added');
  assert(leadershipPanel.includes('Team capacity invisible'), 'New pain point about capacity');

  await page.locator('.role-outcomes-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-leadership-tab.png'), fullPage: false });

  // ========== 8. Project Managers Tab - Blocker Items Replaced ==========
  console.log('\n📌 8. Project Managers Tab Updates');
  // Click on second tab (Project Managers)
  await page.locator('.ro-tab').nth(1).click();
  await page.waitForTimeout(500);
  const productPanel = await page.locator('#ro-product').textContent();
  assert(!productPanel.includes('Auto-escalation after 24h'), '"Auto-escalation after 24h" removed');
  assert(!productPanel.includes('detects stuck tasks and notifies'), 'Stuck tasks notification text removed');
  assert(!productPanel.includes('Blockers surface at standup'), '"Blockers surface at standup" removed');
  assert(productPanel.includes('Workload heatmap'), 'New workload heatmap item added');
  assert(productPanel.includes('Task dependencies invisible'), 'New pain point about dependencies');
  assert(productPanel.includes('See the Project Manager view'), 'CTA button text updated');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-pm-tab.png'), fullPage: false });

  // ========== 9. Emoji Updates ==========
  console.log('\n📌 9. Emoji Updates for By Role / By Use Case');
  // Open Solutions dropdown
  await page.locator('#solutionsBtn').click();
  await page.waitForTimeout(500);
  const dropdownHTML = await page.locator('#solutionsDropdown').innerHTML();
  // Check new emojis are present (By Role)
  assert(dropdownHTML.includes('👩‍💼'), 'HR emoji updated to 👩‍💼');
  assert(dropdownHTML.includes('📋'), 'PM emoji updated to 📋');
  assert(dropdownHTML.includes('🏢'), 'CEO emoji updated to 🏢');
  // Check new emojis are present (By Use Case)
  assert(dropdownHTML.includes('🔀'), 'Scattered emoji updated to 🔀');
  assert(dropdownHTML.includes('👻'), 'Ghost OKRs emoji updated to 👻');
  assert(dropdownHTML.includes('⏳'), 'Buried Leave emoji updated to ⏳');
  // Check old emojis are gone
  assert(!dropdownHTML.includes('💼'), 'Old briefcase emoji removed');
  assert(!dropdownHTML.includes('👑'), 'Old crown emoji removed');
  assert(!dropdownHTML.includes('📂'), 'Old folder emoji removed');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-dropdown-emojis.png'), fullPage: false });

  // Close dropdown
  await page.locator('#solutionsBtn').click();

  // ========== 10. Footer Links ==========
  console.log('\n📌 10. Footer Links');
  const footerText = await page.locator('footer').textContent();
  assert(footerText.includes('For Project Managers'), '"For Project Managers" in footer');
  assert(!footerText.includes('For Product Teams'), '"For Product Teams" removed from footer');
  assert(!footerText.includes('Product & Engineering'), '"Product & Engineering" removed from footer');

  // ========== 11. Login Page Stat ==========
  console.log('\n📌 11. Login Page Stat');
  await page.evaluate(() => switchPage('login'));
  await page.waitForTimeout(500);
  const loginText = await page.locator('#page-login').textContent();
  assert(!loginText.includes('2,400+'), '"2,400+" removed from login page');
  assert(!loginText.includes('Teams using XCorp'), '"Teams using XCorp" removed from login');
  assert(loginText.includes('4.9★'), 'New rating stat added to login page');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo7-login.png'), fullPage: false });

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
