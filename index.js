import http from 'http';
import { load } from 'cheerio';
import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function getMangaPosts() {
  return new Promise(async (resolve, reject) => {
    try {
      // Launch the browser
      console.log('🚀 Launching browser...');
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Login to reddit
      console.log('🏠 Opening home page...');
      const loginPage = await page.goto('https://old.reddit.com/login');
      if (!loginPage.ok()) {
        throw new Error('Manga: Login page error: ' + loginPage.status());
      }
      await page.waitForSelector('#login-username');

      console.log('🖊 Entering credentials...');
      await page.type('#login-username', process.env.USERNAME);
      await page.type('#login-password', process.env.PASSWORD);
      await page.keyboard.press('Enter');
      console.log('🖊 Entered credentials, logging in...');
      await page.waitForSelector('[aria-live="polite"]');

      console.log('📄 Logged in & going to subreddit...');
      const mangaPage = await page.goto('https://www.reddit.com/r/manga/new.json');
      if (!mangaPage.ok()) {
        const error = await page.content();
        throw new Error(error);
      }
      // console.log('📖 Getting the html...');
      // const html = await page.content();
      // await browser.close();

      // console.log('🔃 Loading html to cheerio...');
      // const postsJson = [];
      // const $ = load(html);

      // const postsContainer = $('#siteTable');

      // const posts = postsContainer.find('[data-subreddit-prefixed=r/manga]');
      // posts.each(function (i, post) {
      //   postsJson.push({
      //     data: {
      //       title: $(this).find('[data-event-action=title]').text().trim(),
      //       url:
      //         post.attribs['data-url'] === post.attribs['data-permalink']
      //           ? `https://reddit.com${post.attribs['data-url']}`
      //           : post.attribs['data-url'],
      //       permalink: post.attribs['data-permalink'],
      //       created: post.attribs['data-timestamp'] / 1000,
      //     },
      //   });
      // });

      // console.log('✅ Got the data, sending it...');
      // console.log(postsJson);
      resolve(await page.content());
    } catch (e) {
      console.error('💣 Error', e);

      reject(e.message);
    }
  });
}

http
  .createServer((req, res) => {
    if (req.headers['content-type'] === 'application/json') {
      getMangaPosts()
        .then((data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(data));
          res.end();
        })
        .catch((err) => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write(err);
          res.end();
        });
    } else {
      res.end('Hello world');
    }
  })
  .listen(process.env.PORT, () => {
    console.log(`Running on post: ${process.env.PORT}`);
  });
