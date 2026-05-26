/**
 * Playwright test for Todo11 — Copy Cuts, Animations & UI Polishing
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

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.stack || err.message));
  
  // Set up dialog handler to verify alert trigger for AI Assistant
  let alertMsg = null;
  page.on('dialog', async dialog => {
    alertMsg = dialog.message();
    await dialog.accept();
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // 1. Page transition visibility
  console.log('\n📌 1. Page Transition Visibility');
  await page.evaluate(() => {
    // Make sure we have reveal elements that are not visible yet
    const targetPage = document.getElementById('page-all-features');
    targetPage.querySelectorAll('.reveal').forEach(el => el.classList.remove('visible'));
  });
  
  await page.evaluate(() => switchPage('all-features'));
  await page.waitForTimeout(300);
  
  const allRevealed = await page.evaluate(() => {
    const targetPage = document.getElementById('page-all-features');
    const reveals = targetPage.querySelectorAll('.reveal');
    if (reveals.length === 0) return false;
    return Array.from(reveals).every(el => el.classList.contains('visible'));
  });
  assert(allRevealed, 'All .reveal elements under active page gain the "visible" class immediately on switchPage');

  // 2. Scattered Search Console tabs and filtering
  console.log('\n📌 2. Scattered Search Console');
  await page.evaluate(() => switchPage('usecase-scattered'));
  await page.waitForTimeout(300);

  // Check default suggestions on docs tab
  const defaultSuggestions = await page.locator('.scattered-suggest-container').textContent();
  assert(defaultSuggestions.includes('onboarding') && defaultSuggestions.includes('pitch deck') && defaultSuggestions.includes('brand'), 
         'Default suggestions display doc search terms (onboarding, pitch deck, brand)');

  // Try searching "brand"
  await page.fill('#scatteredSearchInput', 'brand');
  await page.waitForTimeout(100);
  let resultsText = await page.locator('#scatteredSearchResults').textContent();
  assert(resultsText.includes('Brand Guidelines 2026') && resultsText.includes('1 RESULTS'), 'Search query "brand" filters documents successfully');

  // Check clear button visibility
  const isClearVisible = await page.locator('#scatteredSearchClear').isVisible();
  assert(isClearVisible, 'Search clear button is visible after entering query');

  // Switch to tasks tab
  await page.click('button[data-tab="tasks"]');
  await page.waitForTimeout(200);

  // Check task suggestions
  const taskSuggestions = await page.locator('.scattered-suggest-container').textContent();
  assert(taskSuggestions.includes('epic:onboarding') && taskSuggestions.includes('assignee:john') && taskSuggestions.includes('api'),
         'Swapping tabs updates suggestion chips to task terms (epic:onboarding, assignee:john, api)');

  // Verify task placeholder
  const placeholder = await page.locator('#scatteredSearchInput').getAttribute('placeholder');
  assert(placeholder.includes('Search tasks'), 'Placeholder changes to task finder description');

  // Filter tasks by epic:onboarding
  await page.fill('#scatteredSearchInput', 'epic:onboarding');
  await page.waitForTimeout(100);
  resultsText = await page.locator('#scatteredSearchResults').textContent();
  assert(resultsText.includes('Q3 Onboarding Sprint') && resultsText.includes('OKR: Employee Onboarding') && resultsText.includes('2 RESULTS'),
         'Search filters by "epic:onboarding" successfully');

  // Filter tasks by assignee:john
  await page.fill('#scatteredSearchInput', 'assignee:john');
  await page.waitForTimeout(100);
  resultsText = await page.locator('#scatteredSearchResults').textContent();
  assert(resultsText.includes('API Integration Blockers') && resultsText.includes('Implement authentication flow') && resultsText.includes('2 RESULTS'),
         'Search filters by "assignee:john" successfully');

  // Clear search using clear button
  await page.click('#scatteredSearchClear');
  await page.waitForTimeout(100);
  const clearedVal = await page.inputValue('#scatteredSearchInput');
  assert(clearedVal === '', 'Clicking "×" clears search input value');

  // 3. Pricing page Enterprise badge, modal link, and price scale animation
  console.log('\n📌 3. Pricing & Custom Licensing');
  await page.evaluate(() => switchPage('pricing'));
  await page.waitForTimeout(300);

  // Check Enterprise badge in .pricing-contact
  const enterpriseBadge = await page.locator('.pricing-contact .pill.purple').textContent();
  assert(enterpriseBadge.toUpperCase().includes('ENTERPRISE'), 'Premium Enterprise badge exists inside custom plan card');

  // Check custom plan button triggers modal
  await page.click('.pricing-contact button');
  await page.waitForTimeout(200);
  const contactModalActive = await page.locator('#contact-sales-modal').evaluate(el => el.classList.contains('active'));
  assert(contactModalActive, 'Clicking Contact Sales button opens contact sales modal');

  // Close modal
  await page.evaluate(() => closeModal());
  await page.waitForTimeout(200);

  // Check pricing cycle toggle animates price change
  await page.click('button[data-cycle="yearly"]');
  await page.waitForTimeout(100);
  const pricingAmountClasses = await page.locator('.pricing-card[data-tier="basic"] .pricing-amount').evaluate(el => el.className);
  assert(pricingAmountClasses.includes('animate'), 'Changing pricing cycle adds "animate" class to pricing-amount elements');

  // 4. Login & Signup page checks
  console.log('\n📌 4. Login & Signup Validation');
  // Login page
  await page.evaluate(() => switchPage('login'));
  await page.waitForTimeout(300);
  const loginQuotesCount = await page.locator('#page-login .lpl-quote').count();
  assert(loginQuotesCount === 0, 'Testimonial quote container (.lpl-quote) removed from login page');

  const loginStatsText = await page.locator('#page-login .lpl-stats').textContent();
  assert(loginStatsText.includes('4.9★') && loginStatsText.includes('68%') && loginStatsText.includes('10 min') && loginStatsText.includes('3 tools'),
         'Login stats synced with homepage ticker');

  // Signup page
  await page.evaluate(() => switchPage('signup'));
  await page.waitForTimeout(300);
  const signupQuotesCount = await page.locator('#page-signup .lpl-quote').count();
  assert(signupQuotesCount === 0, 'Testimonial quote container (.lpl-quote) removed from signup page');

  const signupHeadlineText = await page.locator('#page-signup .lpl-headline').textContent();
  assert(signupHeadlineText.includes('Join growing teams already using XCorp'),
         'Signup headline updated to "Join growing teams already using XCorp"');

  const signupStatsText = await page.locator('#page-signup .lpl-stats').textContent();
  assert(signupStatsText.includes('4.9★') && signupStatsText.includes('68%') && signupStatsText.includes('10 min') && signupStatsText.includes('3 tools'),
         'Signup stats synced with homepage ticker');

  const requiredAsterisksCount = await page.locator('#page-signup form label span[style*="danger"]').count();
  assert(requiredAsterisksCount === 5, `Required signup fields show red asterisk labels (Found ${requiredAsterisksCount}, expected 5)`);

  // 5. Footer Layout & Actions
  console.log('\n📌 5. Footer Upgrades');
  await page.evaluate(() => switchPage('home'));
  await page.waitForTimeout(300);

  // Check product links count and labels
  const productLinks = page.locator('#site-footer .footer-links-col .footer-link-group').nth(0).locator('a');
  const productLinksCount = await productLinks.count();
  assert(productLinksCount === 6, `Footer Product column has exactly 6 links (Found ${productLinksCount})`);

  const productLabels = await productLinks.allTextContents();
  const expectedLabels = ['All Features', 'Goals & Performance', 'Project Management', 'Automation Workflow', 'HR & People Ops', 'AI Assistant'];
  const labelsMatch = productLabels.every((val, i) => val === expectedLabels[i]);
  assert(labelsMatch, `Footer Product link labels match expected set: ${productLabels.join(', ')}`);

  // Click AI Assistant and verify alert trigger
  alertMsg = null;
  await productLinks.last().click();
  await page.waitForTimeout(100);
  assert(alertMsg && alertMsg.includes('AI Assistant is coming soon'), 'Clicking AI Assistant footer link triggers warning alert');

  // Solutions subgroups check
  const solutionsColHTML = await page.locator('#site-footer .footer-links-col .footer-link-group').nth(1).innerHTML();
  assert(solutionsColHTML.includes('By Role') && solutionsColHTML.includes('By Use Case'), 'Solutions column is split into "By Role" and "By Use Case" subgroups');
  assert(solutionsColHTML.replace(/\s/g, '').includes('background:rgba(255,255,255,0.08)'), 'Solutions column has a subgroup divider line');

  // Capture final screenshots
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'todo11-verification.png'), fullPage: true });
  console.log('✅ Screenshot captured: test-screenshots/todo11-verification.png');

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
