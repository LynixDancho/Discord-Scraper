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

  // Login process
  await page.type('input[name="email"]', email, {
    delay: 50,
  });
  await page.type('input[name="password"]', password, { delay: 50 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Logged in!");

  // Go to the specific Discord channel
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Navigated to the server channel!");

  // Locate and click the "Show Member List" button
  try {
    // Wait for the parent container to load
    await page.waitForSelector(".toolbar_fc4f04", { timeout: 10000 });

    // Select all elements with the desired classes within the parent container
    const elements = await page.$$(
      ".toolbar_fc4f04 .iconWrapper_fc4f04.clickable_fc4f04"
    );

    if (elements.length > 0) {
      // Access the last (far-right) element
      const specificElement = elements[3];

      // Click the specific element
      await specificElement.click();
      console.log("Clicked on the far-right element!");
    } else {
      console.log("No elements found with the given class!");
    }
  } catch (error) {
    console.error("Failed to find or click 'Show Friends' button:", error);
  }

  // Wait for the user profiles to load
  await page.waitForSelector(".memberInner_a31c43");
  const profiles = await page.$$(".memberInner_a31c43");
  console.log(`Found ${profiles.length} profiles`);

  // Iterate over each profile and click
  for (let i = 0; i < profiles.length; i++) {
    await profiles[i].click();

    // Wait for the username to appear
    await page.waitForSelector(".userTagUsername_c32acf");
    const usernameElement = await page.$(".userTagUsername_c32acf");
    const username = await usernameElement.evaluate((el) =>
      el.textContent.trim()
    );
    let bio = null;
    try {
      await page.waitForSelector(".descriptionClamp_abaf7d", { timeout: 300 });
      const bioElement = await page.waitForSelector(
        ".descriptionClamp_abaf7d",
        { timeout: 300 }
      );
      bio = await bioElement.evaluate((el) => el.textContent.trim());
    } catch (error) {
      console.log("No bio available");
    }

    console.log("Username:", username);

    console.log("Bio:", bio || "No bio available");
  }

  await browser.close();
}

// Example channel URL
YomamaAMscrapingDiscord(
  "https://discord.com/channels/763450757512560665/763450757512560668"
).catch(console.error);
