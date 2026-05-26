const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Abort google fonts loading for faster test execution
  await context.route('**fonts.googleapis.com**', r => r.abort());
  await context.route('**fonts.gstatic.com**', r => r.abort());
  
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  console.log('=== XCorp Todo5 Verification Test ===\n');

  await page.goto('http://localhost:8888/xcorp-merged.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });

  // 1. Verify Homepage Section Divider
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); });
  await page.waitForTimeout(300);
  
  const homeDividers = await page.evaluate(() => {
    // Check if there's a divider div style between before-after-section and features-section-home
    const ba = document.querySelector('.before-after-section');
    const features = document.querySelector('.features-section-home');
    if (!ba || !features) return false;
    
    let sibling = ba.nextElementSibling;
    while (sibling && sibling !== features) {
      if (sibling.textContent.trim() === '' && sibling.querySelector('div')?.style?.height === '1px') {
        return true;
      }
      sibling = sibling.nextElementSibling;
    }
    return false;
  });
  console.log(`${homeDividers ? '✅' : '❌'} Homepage: 1px divider present between Before/After and Why XCorp works: ${homeDividers ? 'yes' : 'no'}`);

  // 2. Verify Footer Visibility (Hidden on Login/Signup, Visible elsewhere)
  // Check Home page footer
  let footerVisible = await page.locator('#site-footer').isVisible();
  console.log(`${footerVisible ? '✅' : '❌'} Homepage: Footer is visible: ${footerVisible}`);

  // Switch to login
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('login'); });
  await page.waitForTimeout(200);
  footerVisible = await page.locator('#site-footer').isVisible();
  console.log(`${!footerVisible ? '✅' : '❌'} Login page: Footer is hidden: ${!footerVisible}`);

  // Switch to signup
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('signup'); });
  await page.waitForTimeout(200);
  footerVisible = await page.locator('#site-footer').isVisible();
  console.log(`${!footerVisible ? '✅' : '❌'} Signup page: Footer is hidden: ${!footerVisible}`);

  // Switch to pricing
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('pricing'); });
  await page.waitForTimeout(200);
  footerVisible = await page.locator('#site-footer').isVisible();
  console.log(`${footerVisible ? '✅' : '❌'} Pricing page: Footer is visible: ${footerVisible}`);

  // 3. Verify Navbar Cleanup (No Customers or Resources links)
  const customersCount = await page.locator('nav .nav-main button:has-text("Customers")').count();
  const resourcesCount = await page.locator('nav .nav-main button:has-text("Resources")').count();
  console.log(`${customersCount === 0 ? '✅' : '❌'} Navbar: Customers tab removed: ${customersCount === 0 ? 'yes' : 'no'}`);
  console.log(`${resourcesCount === 0 ? '✅' : '❌'} Navbar: Resources tab removed: ${resourcesCount === 0 ? 'yes' : 'no'}`);

  // 4. Verify Solutions dropdown contains "Problems & Use Cases"
  const dropdownItemCount = await page.locator('.nav-dropdown.solutions .dd-item[data-page="problems"]').count();
  console.log(`${dropdownItemCount > 0 ? '✅' : '❌'} Solutions Dropdown: Problems & Use Cases item present: ${dropdownItemCount > 0 ? 'yes' : 'no'}`);

  // 5. Verify Footer contains "Problems & Use Cases" Solutions link
  const footerLinkCount = await page.locator('#site-footer a:has-text("Problems & Use Cases")').count();
  console.log(`${footerLinkCount > 0 ? '✅' : '❌'} Footer: Problems & Use Cases Solutions link present: ${footerLinkCount > 0 ? 'yes' : 'no'}`);

  // 6. Verify Problems & Use Cases page structure
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('problems'); });
  await page.waitForTimeout(300);
  
  const problemsPageVisible = await page.locator('#page-problems').isVisible();
  console.log(`${problemsPageVisible ? '✅' : '❌'} Problems Page: Page container is visible: ${problemsPageVisible}`);

  const problemCardsCount = await page.locator('#page-problems .problem-card').count();
  console.log(`${problemCardsCount === 6 ? '✅' : '❌'} Problems Page: 6 problem cards defined: ${problemCardsCount === 6 ? 'yes' : 'no'}`);

  // 7. Verify Footer Top Border
  const footerBorder = await page.evaluate(() => {
    const el = document.getElementById('site-footer');
    return el ? getComputedStyle(el).borderTop : '';
  });
  console.log(`${footerBorder !== '' && footerBorder !== 'none' ? '✅' : '❌'} Footer: border-top configured: ${footerBorder}`);

  // === SCREENSHOTS ===
  console.log('\n--- Screenshots ---');
  
  // Homepage divider view
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('home'); window.scrollTo(0, 4800); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/Users/krystalnguyen/Documents/xcorp/todo5-home-divider.png', animations: 'disabled' });
  console.log('✅ Homepage Divider: /Users/krystalnguyen/Documents/xcorp/todo5-home-divider.png');

  // Problems Page top view
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('problems'); window.scrollTo(0, 0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/Users/krystalnguyen/Documents/xcorp/todo5-problems-page.png', animations: 'disabled' });
  console.log('✅ Problems Page: /Users/krystalnguyen/Documents/xcorp/todo5-problems-page.png');

  // Login page showing no footer
  await page.evaluate(() => { if (typeof switchPage === 'function') switchPage('login'); window.scrollTo(0, 0); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/Users/krystalnguyen/Documents/xcorp/todo5-login-nofooter.png', animations: 'disabled' });
  console.log('✅ Login (No Footer): /Users/krystalnguyen/Documents/xcorp/todo5-login-nofooter.png');

  console.log('\n=== Test complete ===');
  await browser.close();
})();
