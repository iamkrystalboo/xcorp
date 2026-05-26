const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route('**fonts.googleapis.com**', r => r.abort());
  await context.route('**fonts.gstatic.com**', r => r.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  console.log('=== XCorp Todo2 Verification Test ===\n');

  await page.goto('http://localhost:8888/xcorp-merged.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); });
  await page.waitForTimeout(600);

  // Stop animations for screenshots
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      el.style.animationPlayState = 'paused';
      el.style.transitionDuration = '0s';
    });
  });

  // 1. Logo size check
  const logoH = await page.evaluate(() => {
    const img = document.querySelector('.brand img, a.brand img');
    return img ? img.getBoundingClientRect().height : 0;
  });
  console.log(`${logoH >= 30 ? '✅' : '❌'} Logo height: ${logoH.toFixed(0)}px (expected ≥30px)`);

  // 2. No hero badge
  const badge = await page.locator('.hero-badge').count();
  console.log(`${badge === 0 ? '✅' : '❌'} Hero badge removed: ${badge === 0 ? 'yes' : 'still present'}`);

  // 3. No "2,400+" in hero
  const bodyText = await page.locator('body').textContent();
  const has2400InHero = await page.locator('.hero').textContent().then(t => t.includes('2,400')).catch(() => false);
  console.log(`${!has2400InHero ? '✅' : '❌'} "2,400+" removed from hero: ${!has2400InHero ? 'yes' : 'still present'}`);

  // 4. Hero CTA buttons
  const trialBtn = await page.locator('#hero-cta-trial').count();
  const demoBtn = await page.locator('#hero-cta-demo').count();
  console.log(`${trialBtn > 0 ? '✅' : '❌'} Hero Trial CTA: ${trialBtn > 0 ? 'present' : 'missing'}`);
  console.log(`${demoBtn > 0 ? '✅' : '❌'} Hero Demo CTA: ${demoBtn > 0 ? 'present' : 'missing'}`);

  // 5. Role outcomes tabs
  const roTabs = await page.locator('.ro-tab').count();
  const roPanels = await page.locator('.ro-panel').count();
  console.log(`${roTabs === 3 ? '✅' : '❌'} Role tabs: ${roTabs} (expected 3)`);
  console.log(`${roPanels === 3 ? '✅' : '❌'} Role panels: ${roPanels} (expected 3)`);

  // 6. Role tab switching works
  const productTab = page.locator('.ro-tab').nth(1);
  await productTab.click({ force: true });
  await page.waitForTimeout(200);
  const productPanel = await page.locator('#ro-product.active').count();
  console.log(`${productPanel > 0 ? '✅' : '❌'} Tab switching works (Product tab)`);

  // 7. Footer present
  const footer = await page.locator('#site-footer').count();
  console.log(`${footer > 0 ? '✅' : '❌'} Footer: ${footer > 0 ? 'present' : 'missing'}`);

  // 8. Footer has correct structure
  const footerLogo = await page.locator('#site-footer img').count();
  const footerLinks = await page.locator('.footer-link-group a').count();
  console.log(`${footerLogo > 0 ? '✅' : '❌'} Footer logo: ${footerLogo > 0 ? 'present' : 'missing'}`);
  console.log(`${footerLinks >= 8 ? '✅' : '❌'} Footer links: ${footerLinks}`);

  // 9. SVG icons in role section (not emoji)
  const roSvgIcons = await page.locator('.ro-si-icon svg').count();
  console.log(`${roSvgIcons >= 3 ? '✅' : '❌'} SVG icons in role section: ${roSvgIcons}`);

  // 10. No emoji on main CTA buttons
  const trialText = await page.locator('#hero-cta-trial').textContent();
  const hasEmoji = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]/u.test(trialText);
  console.log(`${!hasEmoji ? '✅' : '❌'} No emoji on hero trial button: "${trialText.trim()}"`);

  // Screenshots
  console.log('\n--- Screenshots ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-todo2-hero.png', animations: 'disabled' });
  console.log('✅ Hero: /tmp/xcorp-todo2-hero.png');

  await page.evaluate(() => {
    const el = document.querySelector('.role-outcomes-section');
    if (el) window.scrollTo(0, el.offsetTop - 80);
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-todo2-roles.png', animations: 'disabled' });
  console.log('✅ Role tabs: /tmp/xcorp-todo2-roles.png');

  await page.evaluate(() => {
    const el = document.getElementById('site-footer');
    if (el) window.scrollTo(0, el.offsetTop - 20);
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-todo2-footer.png', animations: 'disabled' });
  console.log('✅ Footer: /tmp/xcorp-todo2-footer.png');

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/xcorp-todo2-mobile.png', animations: 'disabled' });
  console.log('✅ Mobile: /tmp/xcorp-todo2-mobile.png');

  console.log('\n=== Test complete ===');
  await browser.close();
})();
