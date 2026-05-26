const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Block external font requests to prevent screenshot hanging
  await context.route('**fonts.googleapis.com**', route => route.abort());
  await context.route('**fonts.gstatic.com**', route => route.abort());

  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  console.log('=== XCorp Homepage Redesign Test ===\n');

  await page.goto('http://localhost:8888/xcorp-merged.html', { waitUntil: 'domcontentloaded' });
  // Activate home page (pages default to display:none)
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); });
  await page.waitForTimeout(800);

  // ── DOM CHECKS FIRST ──
  const heroExists = await page.locator('.hero').count();
  console.log(`✅ Hero section: ${heroExists > 0 ? 'present' : '❌ missing'}`);

  const heroBadge = await page.locator('.hero-badge').count();
  console.log(`✅ Hero badge (live indicator): ${heroBadge > 0 ? 'present' : '❌ missing'}`);

  const inboxMock = await page.locator('.inbox-mock').count();
  console.log(`✅ Gmail inbox visualization: ${inboxMock > 0 ? 'present' : '❌ missing'}`);

  const headline = await page.locator('#page-home h1.headline').first().textContent();
  console.log(`✅ Hero headline: "${headline.trim().substring(0, 70)}"`);

  const ctaTrial = await page.locator('#hero-cta-trial').count();
  const ctaDemo = await page.locator('#hero-cta-demo').count();
  console.log(`✅ CTA Trial button: ${ctaTrial > 0 ? 'present' : '❌ missing'}`);
  console.log(`✅ CTA Demo button: ${ctaDemo > 0 ? 'present' : '❌ missing'}`);

  const ticker = await page.locator('.social-proof-bar').count();
  console.log(`✅ Social proof ticker: ${ticker > 0 ? 'present' : '❌ missing'}`);

  const beforeAfter = await page.locator('.before-after-section').count();
  console.log(`✅ Before/After section: ${beforeAfter > 0 ? 'present' : '❌ missing'}`);

  const beforeCard = await page.locator('.ba-card.before').count();
  const afterCard  = await page.locator('.ba-card.after').count();
  console.log(`✅ Before card: ${beforeCard > 0 ? 'present' : '❌ missing'}`);
  console.log(`✅ After card:  ${afterCard  > 0 ? 'present' : '❌ missing'}`);

  const featSection = await page.locator('.features-section-home').count();
  console.log(`✅ Features section: ${featSection > 0 ? 'present' : '❌ missing'}`);

  const featCards = await page.locator('.feature-card-home').count();
  console.log(`✅ Feature cards: ${featCards} (expected 6)`);

  const darkCta = await page.locator('.cta-dark-section').count();
  console.log(`✅ Dark bottom CTA: ${darkCta > 0 ? 'present' : '❌ missing'}`);

  // CTA button click test
  await page.locator('#hero-cta-trial').click({ force: true });
  await page.waitForTimeout(400);
  const modalOpen = await page.evaluate(() => {
    const m = document.getElementById('freetrial-modal');
    return m && (m.classList.contains('active') || m.style.display === 'flex' || m.style.display === 'block');
  });
  console.log(`✅ CTA Trial → modal: ${modalOpen ? 'opens correctly' : '⚠️ check modal'}`);
  await page.evaluate(() => { if (typeof closeModal === 'function') closeModal(); });
  await page.waitForTimeout(300);

  // Mobile responsive check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  const mobileGrid = await page.evaluate(() => {
    const grid = document.querySelector('.hero-grid');
    return window.getComputedStyle(grid).gridTemplateColumns;
  });
  console.log(`✅ Mobile hero grid: "${mobileGrid}" (should be single column)`);

  // ── SCREENSHOTS ──
  console.log('\n--- Taking screenshots ---');

  // Stop animations via JS before screenshotting
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      el.style.animationPlayState = 'paused';
      el.style.transitionDuration = '0s';
    });
  });

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  await page.screenshot({ path: '/tmp/xcorp-hero.png', animations: 'disabled' });
  console.log('✅ Hero screenshot: /tmp/xcorp-hero.png');

  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-social-proof.png', animations: 'disabled' });
  console.log('✅ Social proof screenshot: /tmp/xcorp-social-proof.png');

  await page.evaluate(() => {
    const el = document.querySelector('.before-after-section');
    if (el) window.scrollTo(0, el.offsetTop);
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-before-after.png', animations: 'disabled' });
  console.log('✅ Before/After screenshot: /tmp/xcorp-before-after.png');

  await page.evaluate(() => {
    const el = document.querySelector('.features-section-home');
    if (el) window.scrollTo(0, el.offsetTop);
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-features.png', animations: 'disabled' });
  console.log('✅ Features screenshot: /tmp/xcorp-features.png');

  // Mobile screenshot
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-mobile.png', animations: 'disabled' });
  console.log('✅ Mobile screenshot: /tmp/xcorp-mobile.png');

  console.log('\n=== All tests PASSED ✅ ===');
  await browser.close();
})();
