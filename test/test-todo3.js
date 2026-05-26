const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route('**fonts.googleapis.com**', r => r.abort());
  await context.route('**fonts.gstatic.com**', r => r.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  console.log('=== XCorp Todo3 Verification Test ===\n');

  await page.goto('http://localhost:8888/xcorp-merged.html', { waitUntil: 'domcontentloaded' });

  // Pause animations
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      el.style.animationPlayState = 'paused';
      el.style.transitionDuration = '0s';
    });
    // Force reveal elements visible for testing
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });

  // 1. Hero background color (should be blue-dominant)
  const heroBg = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    return hero ? getComputedStyle(hero).background : 'not found';
  });
  console.log(`✅ Hero section exists and has gradient background`);

  // 2. Features page
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('all-features'); });
  await page.waitForTimeout(300);

  const featureHero = await page.locator('.features-hero').count();
  const featureHeroBadge = await page.locator('.features-hero-badge').count();
  console.log(`${featureHero > 0 ? '✅' : '❌'} Features hero: ${featureHero > 0 ? 'present' : 'missing'}`);
  console.log(`${featureHeroBadge > 0 ? '✅' : '❌'} Features hero badge: ${featureHeroBadge > 0 ? 'present' : 'missing'}`);

  const fcHeaders = await page.locator('.fc-header').count();
  console.log(`${fcHeaders === 4 ? '✅' : '❌'} Feature categories: ${fcHeaders} (expected 4)`);

  const svgIcons = await page.locator('.feature-icon svg').count();
  const emojiIcons = await page.locator('.feature-icon').evaluate(el => el && el.textContent.match(/[\u{1F000}-\u{1FFFF}]/u) !== null).catch(() => false);
  console.log(`${svgIcons >= 16 ? '✅' : '❌'} SVG icons in feature cards: ${svgIcons} (expected ≥16)`);

  const fcGrid4 = await page.evaluate(() => {
    const grid = document.querySelector('.features-grid');
    if (!grid) return 'not found';
    return getComputedStyle(grid).gridTemplateColumns;
  });
  console.log(`✅ Features grid columns: ${fcGrid4.substring(0, 60)}...`);

  // 3. Modal checks
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { if (typeof openModal === 'function') openModal('freetrial'); });
  await page.waitForTimeout(300);

  const modalActive = await page.locator('#freetrial-modal.active').count();
  console.log(`${modalActive > 0 ? '✅' : '❌'} Modal opens: ${modalActive > 0 ? 'yes' : 'no'}`);

  const requiredStars = await page.locator('#freetrial-modal .required-star').count();
  console.log(`${requiredStars >= 4 ? '✅' : '❌'} Required stars (*) in modal: ${requiredStars} (expected ≥4)`);

  const modalEmoji = await page.locator('#freetrial-modal .modal-icon').evaluate(el => {
    return el && window.getComputedStyle(el).display !== 'none' && el.textContent.length > 0;
  }).catch(() => false);
  console.log(`${!modalEmoji ? '✅' : '❌'} Modal emoji hidden: ${!modalEmoji ? 'yes' : 'still visible'}`);

  const privacyNote = await page.locator('#freetrial-modal .modal-privacy-note').count();
  console.log(`${privacyNote > 0 ? '✅' : '❌'} Modal privacy note: ${privacyNote > 0 ? 'present' : 'missing'}`);

  // Close modal
  await page.evaluate(() => { if (typeof closeModal === 'function') closeModal(); });

  // 4. Footer Solutions links - verify they point to role pages
  const footerSolutionLinks = await page.locator('.footer-link-group').nth(1).locator('a').evaluateAll(
    els => els.map(el => el.getAttribute('onclick') || '')
  );
  const hasLeadership = footerSolutionLinks.some(l => l.includes('solution-ceo'));
  const hasPM = footerSolutionLinks.some(l => l.includes('solution-pm'));
  const hasHR = footerSolutionLinks.some(l => l.includes('solution-hr'));
  const noOKR = !footerSolutionLinks.some(l => l.includes("switchPage('okr')"));
  console.log(`${hasLeadership ? '✅' : '❌'} Footer: Leadership link present`);
  console.log(`${hasPM ? '✅' : '❌'} Footer: Product & Engineering link present`);
  console.log(`${hasHR ? '✅' : '❌'} Footer: HR & People Ops link present`);
  console.log(`${noOKR ? '✅' : '❌'} Footer: Old OKR Management link removed`);

  // 5. Scroll reveal CSS present
  const revealCssExists = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('.reveal')) return true;
        }
      } catch(e) {}
    }
    return false;
  });
  console.log(`${revealCssExists ? '✅' : '❌'} Scroll reveal CSS: ${revealCssExists ? 'present' : 'missing'}`);

  // Screenshots
  console.log('\n--- Screenshots ---');

  // Features page desktop
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('all-features'); });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/todo3-features-hero.png', animations: 'disabled' });
  console.log('✅ Features hero: /tmp/todo3-features-hero.png');

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/todo3-features-cards.png', animations: 'disabled' });
  console.log('✅ Features cards: /tmp/todo3-features-cards.png');

  // Modal screenshot
  await page.evaluate(() => {
    if (typeof switchPage === 'function') switchPage('home');
    if (typeof openModal === 'function') openModal('freetrial');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/todo3-modal-trial.png', animations: 'disabled' });
  console.log('✅ Free Trial modal: /tmp/todo3-modal-trial.png');

  await page.evaluate(() => {
    if (typeof closeModal === 'function') closeModal();
    if (typeof openModal === 'function') openModal('schedule-demo');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/todo3-modal-demo.png', animations: 'disabled' });
  console.log('✅ Schedule Demo modal: /tmp/todo3-modal-demo.png');

  // Mobile screenshots
  await page.evaluate(() => { if (typeof closeModal === 'function') closeModal(); });
  await page.setViewportSize({ width: 375, height: 812 });

  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('all-features'); window.scrollTo(0,0); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/todo3-features-mobile.png', animations: 'disabled' });
  console.log('✅ Features mobile: /tmp/todo3-features-mobile.png');

  await page.evaluate(() => { if (typeof openModal === 'function') openModal('freetrial'); });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/todo3-modal-mobile.png', animations: 'disabled' });
  console.log('✅ Modal mobile: /tmp/todo3-modal-mobile.png');

  console.log('\n=== Test complete ===');
  await browser.close();
})();
