const { timeout } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();
puppeteer.use(StealthPlugin());
const password = process.env.PASSWORD;
const email = process.env.EMAIL;

async function YomamaAMscrapingDiscord(url) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--user-data-dir=C:/Users/Click/AppData/Local/Google/Chrome/User Data/Default",
    ],
  });

  const page = await browser.newPage();
  await page.goto("https://discord.com/login", { waitUntil: "networkidle2" });

  await page.type('input[name="email"]', email, {
    delay: 50,
  });
  await page.type('input[name="password"]', password, { delay: 50 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Logged in!");

  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Navigated to the server channel!");

  try {
    await page.waitForSelector('[aria-label="Show Member List"]', {
      timeout: 10000,
    });
    await page.click('[aria-label="Show Member List"]');
    console.log("Clicked on the 'Show Member List' button!");
  } catch (error) {
    console.error("Failed to find or click 'Show Member List' button:", error);
  }
  await page.waitForSelector('[aria-label="Members"]');
  const memberListContainer = await page.$('[aria-label="Members"]');

  await page.waitForSelector('[class^="memberInner_"]');
  const profiles = await page.$$('[class^="memberInner_"]');
  console.log(`Found ${profiles.length} profiles`);

  for (let i = 0; i < profiles.length; i++) {
    try {
      await profiles[i].click();

      const usernameElement = await page.waitForSelector(
        '[class^="userTagUsername_"]',
        { timeout: 2000 }
      );
      const username = await usernameElement.evaluate((el) =>
        el.textContent.trim()
      );

      let bio = "No bio available";
      try {
        const bioElement = await page.waitForSelector(
          '[class^="descriptionClamp_"]',
          { timeout: 1000 }
        );
        bio = await bioElement.evaluate((el) => el.textContent.trim());
      } catch (error) {
        console.log("No bio available");
      }

      console.log("Username:", username);
      console.log("Bio:", bio);
    } catch (error) {
      console.log(
        `Failed to fetch profile info for profile #${i + 1}:`,
        error.message
      );
    }

    if ((i + 1) % 25 === 0) {
      console.log("Scrolling to load more profiles...");
      const selector = ".members_c8ffbb.thin__99f8c.scrollerBase__99f8c";

      await page.waitForSelector(selector);

      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollBy(0, 500);
        }
      }, selector);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  await browser.close();
}
// Example channel URL
YomamaAMscrapingDiscord(
  "https://discord.com/channels/763450757512560665/763450757512560668"
).catch(console.error);
