import puppeteer from "puppeteer";
import { load } from 'cheerio';
import http from 'http';

async function getMangaPosts() {
  return new Promise(async (resolve, reject) => {
    try {
      // Launch the browser
      console.log("🚀 Launching browser...");
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Login to reddit
      console.log("🏠 Opening home page...");
      const loginPage = await page.goto('https://old.reddit.com/login');
      if (!loginPage.ok()) {
        throw new Error('Manga: Loginpage error', e);
      }

      console.log("🖊 Logging in...");
      await page.type('#user_login', process.env.USERNAME);
      await page.type('#passwd_login', process.env.PASSWORD);
      await page.click('form#login-form button[type=submit]');
      await page.waitForNavigation();

      console.log("📄 Logged in & going to subreddit...");
      const mangaPage = await page.goto('https://old.reddit.com/r/manga/new/');
      if (!mangaPage.ok()) {
        throw new Error('Manga: Manga subreddit page error', e);
      }
      console.log("📖 Getting the html...");
      const html = await page.content();
      await browser.close();

      console.log("🔃 Loading html to cheerio...");
      const postsJson = [];
      const $ = load(html);

      const postsContainer = $('#siteTable');

      const posts = postsContainer.find('[data-subreddit-prefixed=r/manga]');
      posts.each(function (i, post) {
        postsJson.push({
          data: {
            title: $(this).find('[data-event-action=title]').text().trim(),
            url:
              post.attribs['data-url'] === post.attribs['data-permalink']
                ? `https://reddit.com${post.attribs['data-url']}`
                : post.attribs['data-url'],
            permalink: post.attribs['data-permalink'],
            created: post.attribs['data-timestamp'] / 1000,
          },
        });
      });

      console.log("✅ Got the data, sending it...");
      console.log(postsJson)
      resolve(postsJson);
    } catch (e) {
      console.error('💣 Error', e);

      reject(e.message);
    }
  });
}

http
  .createServer((req, res) => {
    getMangaPosts()
      .then((data) => {
        res.end(JSON.stringify(data));
      })
      .catch((err) => {
        res.end(err);
      });
  })
  .listen(process.env.PORT, () => {
    console.log(`Running on post: ${process.env.PORT}`);
  });
