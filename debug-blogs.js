const puppeteer = require('puppeteer');

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 捕获控制台消息
  page.on('console', msg => {
    console.log(`[PAGE CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // 捕获错误
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.message}`);
  });

  console.log('访问页面...');
  await page.goto('https://ustc.chat/myBlogs.html', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // 等待博客加载
  await page.waitForTimeout(3000);

  // 获取博客列表内容
  const blogListContent = await page.evaluate(() => {
    const blogList = document.getElementById('blogList');
    return blogList ? blogList.innerHTML : 'blogList not found';
  });

  console.log('[BLOG LIST CONTENT]:', blogListContent.substring(0, 500));

  // 获取 blogs 变量
  const blogsCount = await page.evaluate(() => {
    return typeof blogs !== 'undefined' ? blogs.length : 'blogs not defined';
  });

  console.log('[BLOGS COUNT]:', blogsCount);

  await browser.close();
  console.log('完成');
})();
