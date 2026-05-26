/**
 * Playwright test for Todo6 — 3 Use Case pages
 * Tests: Navbar dropdown items, page navigation, content rendering, screenshots
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:8888/xcorp-merged.html';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  let passed = 0, failed = 0;
  function check(name, condition) {
    if (condition) { console.log(`  ✅ ${name}`); passed++; }
    else { console.log(`  ❌ ${name}`); failed++; }
  }

  // 1. Load the page
  console.log('\n🔄 Loading page...');
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // 2. Test Navbar Solutions dropdown
  console.log('\n📋 Test 1: Solutions Dropdown — By Use Case items');
  await page.click('#solutionsBtn');
  await page.waitForSelector('#solutionsDropdown.open', { timeout: 3000 });

  const byUseCaseLabel = await page.$eval('#solutionsDropdown', el => {
    const labels = el.querySelectorAll('.dd-section-label');
    for (const l of labels) {
      if (l.textContent.trim() === 'By Use Case') return true;
    }
    return false;
  });
  check('"By Use Case" section label exists', byUseCaseLabel);

  const scatteredItem = await page.$('[data-page="usecase-scattered"]');
  check('Scattered Info & Apps dropdown item exists', !!scatteredItem);

  const okrsItem = await page.$('[data-page="usecase-okrs"]');
  check('Ghost OKRs dropdown item exists', !!okrsItem);

  const leaveItem = await page.$('[data-page="usecase-leave"]');
  check('Buried Leave Requests dropdown item exists', !!leaveItem);

  // Verify NO old Problems item
  const oldProblems = await page.$('[data-page="problems"]');
  check('Old "Problems & Use Cases" item is removed', !oldProblems);

  // Screenshot of dropdown
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-solutions-dropdown.png'), fullPage: false });
  console.log('  📸 Saved: todo6-solutions-dropdown.png');

  // 3. Test Scattered Info & Apps page
  console.log('\n📋 Test 2: Scattered Info & Apps page');
  await page.click('[data-page="usecase-scattered"]');
  await page.waitForTimeout(500);

  const scatteredPage = await page.$('#page-usecase-scattered.active');
  check('Scattered page is active', !!scatteredPage);

  const scatteredHero = await page.$eval('#page-usecase-scattered .hero .headline', el => el.textContent);
  check('Hero headline contains "7+ apps"', scatteredHero.includes('7+ apps'));

  const scatteredPain = await page.$('#page-usecase-scattered .pain-section');
  check('Pain quote section exists', !!scatteredPain);

  const scatteredStrips = await page.$$('#page-usecase-scattered .strip');
  check('Has 3 feature strips', scatteredStrips.length === 3);

  const scatteredCTA = await page.$('#page-usecase-scattered .bottom-cta-section');
  check('Bottom CTA section exists', !!scatteredCTA);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-scattered-hero.png'), fullPage: false });
  console.log('  📸 Saved: todo6-scattered-hero.png');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-scattered-bottom.png'), fullPage: false });
  console.log('  📸 Saved: todo6-scattered-bottom.png');

  // 4. Test Ghost OKRs page
  console.log('\n📋 Test 3: Ghost OKRs page');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(200);
  await page.click('#solutionsBtn');
  await page.waitForSelector('#solutionsDropdown.open', { timeout: 3000 });
  await page.click('[data-page="usecase-okrs"]');
  await page.waitForTimeout(500);

  const okrsPage = await page.$('#page-usecase-okrs.active');
  check('OKRs page is active', !!okrsPage);

  const okrsHero = await page.$eval('#page-usecase-okrs .hero .headline', el => el.textContent);
  check('Hero headline contains "invisible"', okrsHero.includes('invisible'));

  const okrsStrips = await page.$$('#page-usecase-okrs .strip');
  check('Has 3 feature strips', okrsStrips.length === 3);

  const okrsCTA = await page.$('#page-usecase-okrs .bottom-cta-section');
  check('Bottom CTA section exists', !!okrsCTA);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-okrs-hero.png'), fullPage: false });
  console.log('  📸 Saved: todo6-okrs-hero.png');

  // 5. Test Buried Leave Requests page
  console.log('\n📋 Test 4: Buried Leave Requests page');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(200);
  await page.click('#solutionsBtn');
  await page.waitForSelector('#solutionsDropdown.open', { timeout: 3000 });
  await page.click('[data-page="usecase-leave"]');
  await page.waitForTimeout(500);

  const leavePage = await page.$('#page-usecase-leave.active');
  check('Leave page is active', !!leavePage);

  const leaveHero = await page.$eval('#page-usecase-leave .hero .headline', el => el.textContent);
  check('Hero headline contains "vanish"', leaveHero.includes('vanish'));

  const leaveStrips = await page.$$('#page-usecase-leave .strip');
  check('Has 3 feature strips', leaveStrips.length === 3);

  const leaveCTA = await page.$('#page-usecase-leave .bottom-cta-section');
  check('Bottom CTA section exists', !!leaveCTA);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-leave-hero.png'), fullPage: false });
  console.log('  📸 Saved: todo6-leave-hero.png');

  // 6. Test Footer links
  console.log('\n📋 Test 5: Footer links');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);

  const footerHTML = await page.$eval('#site-footer', el => el.innerHTML);
  check('Footer has "Scattered Info" link', footerHTML.includes('usecase-scattered'));
  check('Footer has "Ghost OKRs" link', footerHTML.includes('usecase-okrs'));
  check('Footer has "Buried Leave" link', footerHTML.includes('usecase-leave'));
  check('Footer NO "problems" link', !footerHTML.includes("switchPage('problems')"));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo6-footer.png'), fullPage: false });
  console.log('  📸 Saved: todo6-footer.png');

  // 7. Verify old problems page is gone
  console.log('\n📋 Test 6: Old problems page removed');
  const oldProblemsPage = await page.$('#page-problems');
  check('No #page-problems element in DOM', !oldProblemsPage);

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🏁 RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
