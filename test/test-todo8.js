/**
 * Playwright test for Todo8 — Interactive demo updates
 * Tests all changes specified in todo8:
 * 1. OKR Cascade Builder (Group tab, Metric/Timeline/Start/Expected fields, leaf check-in, Cancel/Save buttons)
 * 2. Gantt drag start/end resize handles
 * 3. Workflow builder (AI/Apps/Utilities categories, Run History panel)
 * 4. HR Leave request form (To, CC, Leave Type, Available, If Approved, From/To dates, Period, Reason, Cancel/Submit buttons)
 * 5. PM solution page workload balancing sandbox (no blockers)
 * 6. CEO solution page OKR metrics dashboard
 * 7. Scattered Info search console section
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

  // ========== 1. OKR Cascade Builder ==========
  console.log('\n📌 1. OKR Cascade Builder');
  await page.evaluate(() => switchPage('okr'));
  await page.waitForTimeout(300);

  // Group tab
  const hasGroupTab = await page.locator('#okrLevelTabs button[data-level="group"]').isVisible();
  assert(hasGroupTab, 'Group tab is visible');

  // Input fields
  const startingProgressVisible = await page.locator('#okrProgress').isVisible();
  assert(!startingProgressVisible, 'Starting progress % field is removed/hidden');

  const hasMetricField = await page.locator('#okrMetric').isVisible();
  const hasTimelineField = await page.locator('#okrTimeline').isVisible();
  const hasStartField = await page.locator('#okrStartValue').isVisible();
  const hasExpectedField = await page.locator('#okrExpectedValue').isVisible();
  assert(hasMetricField && hasTimelineField && hasStartField && hasExpectedField, 'Metric, Timeline, Start Value, and Expected Value fields are visible');

  // Buttons
  const hasCancelBtn = await page.locator('#okrCancelBtn').isVisible();
  const hasSaveBtn = await page.locator('#okrAddBtn').isVisible();
  assert(hasCancelBtn && hasSaveBtn, 'Cancel and Save buttons are visible');

  // Interactive Check-in test
  // Node i1: "Secure 5 key pilots", check-in value of 4
  const i1CheckinVal = page.locator('.okr-checkin-val[data-id="i1"]');
  await i1CheckinVal.fill('4');
  await page.locator('.okr-checkin-btn[data-id="i1"]').click();
  await page.waitForTimeout(300);

  const updatedProgress = await page.locator('.okr-node[data-id="i1"] .okr-node-pct').textContent();
  assert(updatedProgress === '80%', `Progress updated automatically to 80% (got ${updatedProgress})`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-okr-demo.png'), fullPage: false });

  // ========== 2. Gantt Chart Resizer ==========
  console.log('\n📌 2. Gantt Chart Resizer');
  await page.evaluate(() => switchPage('product-project'));
  await page.waitForTimeout(300);

  // Switch to Gantt tab
  await page.locator('.demo-tab[data-view="gantt"]').click();
  await page.waitForTimeout(300);

  const hasStartResizeHandle = await page.locator('.gantt-resize-handle.start').first().isVisible();
  const hasEndResizeHandle = await page.locator('.gantt-resize-handle.end').first().isVisible();
  assert(hasStartResizeHandle && hasEndResizeHandle, 'Gantt bars have start and end resize handles');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-gantt.png'), fullPage: false });

  // ========== 3. Workflow Automation Builder ==========
  console.log('\n📌 3. Workflow Automation Builder');
  await page.evaluate(() => switchPage('automation'));
  await page.waitForTimeout(300);

  // Verify palette additions
  const paletteText = await page.locator('.auto-palette').textContent();
  assert(paletteText.includes('AI & Agents'), 'AI & Agents category added to palette');
  assert(paletteText.includes('Apps'), 'Apps category added to palette');
  assert(paletteText.includes('Utilities'), 'Utilities category added to palette');

  // Verify run history container exists
  const hasHistory = await page.locator('#autoHistory').isVisible();
  assert(hasHistory, 'Run History panel is visible');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-automation.png'), fullPage: false });

  // ========== 4. HR & Leave Request Form ==========
  console.log('\n📌 4. HR & Leave Request Form');
  await page.evaluate(() => switchPage('product-hr'));
  await page.waitForTimeout(300);

  // Verify updated fields
  const hasTo = await page.locator('#prodHrTo').isVisible();
  const hasCc = await page.locator('#prodHrCc').isVisible();
  const hasAvailable = await page.locator('#prodHrAvailable').isVisible();
  const hasIfApproved = await page.locator('#prodHrIfApproved').isVisible();
  const hasFromDate = await page.locator('#prodHrFromDate').isVisible();
  const hasToDate = await page.locator('#prodHrToDate').isVisible();
  const hasPeriod = await page.locator('#prodHrPeriod').isVisible();
  const hasReason = await page.locator('#prodHrReason').isVisible();
  const hasCancel = await page.locator('#prodHrCancel').isVisible();
  const hasSubmit = await page.locator('#prodHrSubmit').isVisible();

  assert(hasTo && hasCc && hasAvailable && hasIfApproved && hasFromDate && hasToDate && hasPeriod && hasReason && hasCancel && hasSubmit, 'All required leave form fields and Cancel/Submit buttons are visible');

  // Test dynamic preview and submission
  await page.locator('#prodHrTo').selectOption('pm');
  await page.locator('#prodHrFromDate').fill('2026-06-01');
  await page.locator('#prodHrToDate').fill('2026-06-03'); // 3 days
  await page.waitForTimeout(300);

  const previewVal = await page.locator('#prodHrIfApproved').inputValue();
  assert(previewVal.includes('Balance: 12 → 9 days'), `Dynamic balance preview is correct: ${previewVal}`);

  // Submit
  await page.locator('#prodHrSubmit').click();
  // Wait for submission simulation to finish (submit button becomes enabled again)
  await page.waitForSelector('#prodHrSubmit:enabled', { timeout: 6000 });
  const finalBalance = await page.locator('#prodHrBalance').textContent();
  assert(finalBalance === '9', `Leave submitted successfully; final balance is 9 (got ${finalBalance})`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-hr-leave.png'), fullPage: false });

  // ========== 5. Project Managers Workload Balancing ==========
  console.log('\n📌 5. Project Managers Workload Balancing');
  await page.evaluate(() => switchPage('solution-pm'));
  await page.waitForTimeout(300);

  const pmTitle = await page.locator('#page-solution-pm .demo-section h2').textContent();
  assert(pmTitle.includes('Balance workloads'), 'Blocker inject title replaced with Workload balancing title');

  const pmBtnText = await page.locator('#pmInjectBtn').textContent();
  assert(pmBtnText.includes('Balance Workload'), 'Button text updated to Balance Workload');

  // Trigger balance
  await page.locator('#pmInjectBtn').click();
  await page.waitForTimeout(1000); // let transition stats complete
  const pmStatGood = await page.locator('#pmStatGood').textContent();
  assert(pmStatGood === '10 sec', `Optimized workload balance stat updated (got ${pmStatGood})`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-pm-workload.png'), fullPage: false });

  // ========== 6. CEO Dashboard OKR Metrics ==========
  console.log('\n📌 6. CEO Dashboard OKR Metrics');
  await page.evaluate(() => switchPage('solution-ceo'));
  await page.waitForTimeout(300);

  const tilesText = await page.locator('#ceoTiles').textContent();
  assert(tilesText.includes('Company OKRs'), 'Company OKRs tile present');
  assert(tilesText.includes('At-risk OKRs'), 'At-risk OKRs tile present');
  assert(tilesText.includes('OKR Alignment'), 'OKR Alignment tile present');
  assert(tilesText.includes('OKR Check-ins'), 'OKR Check-ins tile present');

  // Click Monday
  await page.locator('#ceoScenarioBtn').click();
  await page.waitForTimeout(300);
  const okrStatMonday = await page.locator('#ceoOkrStat').textContent();
  assert(okrStatMonday === '68%', `OKR status updated to Monday value 68% (got ${okrStatMonday})`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-ceo-okr-dash.png'), fullPage: false });

  // ========== 7. Scattered Info Search Console ==========
  console.log('\n📌 7. Scattered Info Search Console');
  await page.evaluate(() => switchPage('usecase-scattered'));
  await page.waitForTimeout(500);

  const hasSearchConsole = await page.locator('#scatteredSearchInput').isVisible();
  assert(hasSearchConsole, 'Unified Search Console is visible');

  // Suggest query
  await page.locator('.scattered-suggest[data-query="onboarding"]').click();
  await page.waitForTimeout(300);

  const resultsText = await page.locator('#scatteredSearchResults').textContent();
  assert(resultsText.includes('Q3 Onboarding Sprint') && resultsText.includes('Onboarding Checklist Template'), 'Dynamic search results rendered correctly');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo8-scattered-search.png'), fullPage: false });

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
