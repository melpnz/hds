import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await page.goto(`${base}/examples/components/carousel/`, { waitUntil: 'networkidle' });
const ad = page.locator('.crs-carousel[data-variant="ad-slot"]');
const currentAd = () => ad.locator('.crs-ad-slot-demo__card[data-current="true"]:not([data-carousel-clone]) img').getAttribute('alt');
check(await currentAd() === 'Курсы дешевле, чем у школ', 'AdSlot does not start from the second banner');
await ad.locator('.crs-carousel__control--next').click();
await page.waitForTimeout(500);
check(await currentAd() === 'Обучение работе с искусственным интеллектом', 'AdSlot next skips the third banner');
await ad.locator('.crs-carousel__control--next').click();
await page.waitForTimeout(500);
check(await currentAd() === 'Скидки до 60% на обучение в онлайн-школах', 'AdSlot does not loop from last to first');
const repeatedSequence = await ad.locator('.crs-ad-slot-demo__track').evaluate(track => [...track.children].map(item => item.querySelector('img')?.getAttribute('alt')));
check(repeatedSequence.length === 9, 'AdSlot does not render three seamless sequences');
check(repeatedSequence.slice(0, 3).every((alt, index) => alt === repeatedSequence[index + 3] && alt === repeatedSequence[index + 6]), 'AdSlot clone sequences are not identical');
await ad.locator('.crs-carousel__control--prev').click();
await page.waitForTimeout(500);
check(await currentAd() === 'Обучение работе с искусственным интеллектом', 'AdSlot does not loop backwards');

await page.setViewportSize({ width: 320, height: 900 });
await page.reload({ waitUntil: 'networkidle' });
const mobileGeometry = await page.locator('.crs-carousel[data-variant="ad-slot"]').evaluate(root => {
  const viewport = root.querySelector('.crs-ad-slot-demo__viewport').getBoundingClientRect();
  const currentCard = root.querySelector('.crs-ad-slot-demo__card[data-current="true"]:not([data-carousel-clone])');
  const current = currentCard.getBoundingClientRect();
  const image = currentCard.querySelector('img');
  return { viewportLeft: viewport.left, viewportRight: viewport.right, currentLeft: current.left, currentRight: current.right, imageWidth: image.naturalWidth, imageHeight: image.naturalHeight };
});
check(Math.abs(mobileGeometry.viewportLeft - mobileGeometry.currentLeft) <= 1, '320px AdSlot is clipped at the left edge');
check(Math.abs(mobileGeometry.viewportRight - mobileGeometry.currentRight) <= 1, '320px AdSlot is clipped at the right edge');
check(mobileGeometry.imageWidth === 816 && mobileGeometry.imageHeight === 840, '320px AdSlot does not load the dedicated mobile creative');

const courseCarousel = page.locator('.crs-carousel[data-variant="course-card"]');
check(await courseCarousel.locator('.crs-carousel__control--prev').isDisabled(), 'Content carousel previous button is enabled at the start');
for (let step = 0; step < 8; step += 1) {
  const next = courseCarousel.locator('.crs-carousel__control--next');
  if (await next.isDisabled()) break;
  await next.click();
  await page.waitForTimeout(450);
}
check(await courseCarousel.locator('.crs-carousel__control--next').isDisabled(), 'Content carousel next button is enabled at the end');

await page.setViewportSize({ width: 1024, height: 900 });
for (const [pageId, label] of [['courses-listing', 'Courses listing'], ['education-centers-listing', 'Education centers listing']]) {
  await page.goto(`${base}/examples/pages/${pageId}/`, { waitUntil: 'networkidle' });
  const pageAd = page.locator('.crs-carousel[data-variant="ad-slot"]').first();
  const before = await pageAd.locator('.crs-ad-slot-demo__card[data-current="true"]:not([data-carousel-clone]) img').getAttribute('alt');
  await pageAd.locator('.crs-carousel__control--next').click();
  await page.waitForTimeout(500);
  const after = await pageAd.locator('.crs-ad-slot-demo__card[data-current="true"]:not([data-carousel-clone]) img').getAttribute('alt');
  check(before !== after, `${label} AdSlot does not switch banners`);
}

await page.setViewportSize({ width: 320, height: 700 });
await page.goto(`${base}/examples/components/filter-bar/`, { waitUntil: 'networkidle' });
const filterBar = page.locator('.scrollbar-container');
await filterBar.evaluate(element => { element.scrollLeft = 120; });
await page.waitForTimeout(500);
const filterScroll = await filterBar.evaluate(element => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
  scrollLeft: element.scrollLeft
}));
check(filterScroll.scrollWidth > filterScroll.clientWidth, 'FilterBar has no horizontal overflow');
check(filterScroll.scrollLeft > 0, 'FilterBar cannot be scrolled horizontally');

await page.setViewportSize({ width: 1024, height: 800 });
await page.goto(`${base}/examples/components/price-sheet/`, { waitUntil: 'networkidle' });
const priceGeometry = async () => page.locator('.crs-price-sheet__panel').evaluate(panel => {
  const panelStyle = getComputedStyle(panel);
  const titleStyle = getComputedStyle(panel.querySelector('.crs-price-sheet__title'));
  return {
    padding: [panelStyle.paddingTop, panelStyle.paddingRight, panelStyle.paddingBottom, panelStyle.paddingLeft],
    titleDisplay: titleStyle.display
  };
});
let geometry = await priceGeometry();
check(geometry.padding.every(value => value === '16px'), `Desktop PriceSheet padding is ${geometry.padding.join(' ')}`);
check(geometry.titleDisplay === 'none', 'Desktop PriceSheet shows the title');
await page.setViewportSize({ width: 768, height: 800 });
geometry = await priceGeometry();
check(geometry.padding.every(value => value === '16px'), `Tablet PriceSheet padding is ${geometry.padding.join(' ')}`);
check(geometry.titleDisplay === 'none', 'Tablet PriceSheet shows the title');
await page.setViewportSize({ width: 480, height: 800 });
geometry = await priceGeometry();
check(JSON.stringify(geometry.padding) === JSON.stringify(['24px', '24px', '16px', '24px']), `Mobile PriceSheet padding is ${geometry.padding.join(' ')}`);
check(geometry.titleDisplay !== 'none', 'Mobile PriceSheet hides the title');

await browser.close();
if (failures.length) {
  console.error(failures.map(item => `FAIL: ${item}`).join('\n'));
  process.exit(1);
}
console.log('OK: carousel loop/boundaries/pages, mobile alignment, FilterBar scroll and PriceSheet padding verified');
