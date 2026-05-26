const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route('**fonts.googleapis.com**', r => r.abort());
  await context.route('**fonts.gstatic.com**', r => r.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  console.log('=== XCorp Todo4 Verification Test ===\n');

  await page.goto('http://localhost:8888/xcorp-merged.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });

  // === TASK 1: Products page has feature grid ===
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('products'); });
  await page.waitForTimeout(300);

  const featSectionAlt = await page.locator('.feat-section-alt').count();
  console.log(`${featSectionAlt > 0 ? '✅' : '❌'} Products page: feat-section-alt (feature grid) present: ${featSectionAlt}`);

  const featureGridInProducts = await page.locator('#page-products .features-grid').count();
  console.log(`${featureGridInProducts > 0 ? '✅' : '❌'} Products page: feature grid embedded: ${featureGridInProducts > 0 ? 'yes' : 'no'}`);

  const featureCardsInProducts = await page.locator('#page-products .feature-card').count();
  console.log(`${featureCardsInProducts >= 8 ? '✅' : '❌'} Products page: feature cards: ${featureCardsInProducts} (expected ≥8)`);

  const viewAllBtn = await page.locator('#page-products button:has-text("View all features")').count();
  console.log(`${viewAllBtn > 0 ? '✅' : '❌'} Products page: "View all features" button present`);

  // === TASK 2: Section alternating colors ===
  // Homepage
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); });
  await page.waitForTimeout(300);

  const socialProofBg = await page.evaluate(() => {
    const el = document.querySelector('.social-proof-bar');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  const beforeAfterBg = await page.evaluate(() => {
    const el = document.querySelector('.before-after-section');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  const featuresSectionBg = await page.evaluate(() => {
    const el = document.querySelector('.features-section-home');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  const roleOutcomesBg = await page.evaluate(() => {
    const el = document.querySelector('.role-outcomes-section');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });

  console.log(`\nHomepage section backgrounds:`);
  console.log(`  social-proof-bar: ${socialProofBg}`);
  console.log(`  before-after:     ${beforeAfterBg}`);
  console.log(`  features-home:    ${featuresSectionBg}`);
  console.log(`  role-outcomes:    ${roleOutcomesBg}`);

  const noTwoSameAdjacentHome = beforeAfterBg !== socialProofBg;
  console.log(`${noTwoSameAdjacentHome ? '✅' : '❌'} Homepage: social-proof ≠ before-after (no adjacent same color)`);

  const bottomCtaBg = await page.evaluate(() => {
    const el = document.querySelector('#page-home .bottom-cta-section') || document.querySelector('.cta-dark-section');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  const ctaIsDark = bottomCtaBg.includes('15') || bottomCtaBg.includes('0,') || bottomCtaBg.includes('rgb(15');
  console.log(`${ctaIsDark ? '✅' : '⚠️'} CTA section appears dark: ${bottomCtaBg.substring(0,40)}`);

  // Products page section colors
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('products'); });
  await page.waitForTimeout(300);

  const prodFeatBg = await page.evaluate(() => {
    const el = document.querySelector('#page-products .feat-section');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  const prodFeatAltBg = await page.evaluate(() => {
    const el = document.querySelector('#page-products .feat-section-alt');
    return el ? getComputedStyle(el).backgroundColor : 'not found';
  });
  console.log(`\nProducts page sections:`);
  console.log(`  feat-section:     ${prodFeatBg}`);
  console.log(`  feat-section-alt: ${prodFeatAltBg}`);
  const prodAlternates = prodFeatBg !== prodFeatAltBg;
  console.log(`${prodAlternates ? '✅' : '❌'} Products: feat-section ≠ feat-section-alt (alternating colors)`);

  // === TASK 3: Login redesign ===
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('login'); });
  await page.waitForTimeout(300);

  const loginPanelLeft = await page.locator('.login-panel-left').count();
  const loginPanelRight = await page.locator('.login-panel-right').count();
  console.log(`\nLogin page:`);
  console.log(`${loginPanelLeft > 0 ? '✅' : '❌'} Login: split-panel left present`);
  console.log(`${loginPanelRight > 0 ? '✅' : '❌'} Login: split-panel right present`);

  const googleSvg = await page.locator('#page-login .google-btn svg').count();
  const googleEmoji = await page.locator('#page-login .google-btn span').evaluate(el => el?.textContent?.includes('🔵')).catch(() => false);
  console.log(`${googleSvg > 0 ? '✅' : '❌'} Login: Google SVG icon present (not emoji): ${googleSvg > 0 ? 'yes' : 'no'}`);
  console.log(`${!googleEmoji ? '✅' : '❌'} Login: Blue circle emoji removed`);

  const forgotPwd = await page.locator('#page-login .login-forgot').count();
  const rememberMe = await page.locator('#page-login .login-remember').count();
  const lplStats = await page.locator('#page-login .lpl-stat').count();
  console.log(`${forgotPwd > 0 ? '✅' : '❌'} Login: Forgot password link present`);
  console.log(`${rememberMe > 0 ? '✅' : '❌'} Login: Remember me checkbox present`);
  console.log(`${lplStats >= 4 ? '✅' : '❌'} Login: Stats on left panel: ${lplStats} (expected 4)`);

  const signupGoogleSvg = await page.locator('#page-signup .google-btn svg').count();
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('signup'); });
  await page.waitForTimeout(200);
  const signupPanelLeft = await page.locator('.login-panel-left').count();
  console.log(`${signupGoogleSvg > 0 ? '✅' : '❌'} Signup: Google SVG icon present`);
  console.log(`${signupPanelLeft > 0 ? '✅' : '❌'} Signup: Split panel layout present`);

  // === SCREENSHOTS ===
  console.log('\n--- Screenshots ---');

  // Products page
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('products'); window.scrollTo(0,0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/todo4-products-top.png', animations: 'disabled' });
  console.log('✅ Products top: /tmp/todo4-products-top.png');

  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/todo4-products-features.png', animations: 'disabled' });
  console.log('✅ Products feature grid: /tmp/todo4-products-features.png');

  // Homepage sections
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); window.scrollTo(0,800); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/todo4-home-sections.png', animations: 'disabled' });
  console.log('✅ Homepage sections: /tmp/todo4-home-sections.png');

  // Login page
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('login'); window.scrollTo(0,0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/todo4-login.png', animations: 'disabled' });
  console.log('✅ Login: /tmp/todo4-login.png');

  // Signup page
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('signup'); window.scrollTo(0,0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/todo4-signup.png', animations: 'disabled' });
  console.log('✅ Signup: /tmp/todo4-signup.png');

  // Login mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('login'); window.scrollTo(0,0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/todo4-login-mobile.png', animations: 'disabled' });
  console.log('✅ Login mobile: /tmp/todo4-login-mobile.png');

  console.log('\n=== Test complete ===');
  await browser.close();
})();
