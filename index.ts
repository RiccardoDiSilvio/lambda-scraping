import { Callback, Context, Handler } from "aws-lambda";
import { Browser, Page, PuppeteerLaunchOptions } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";

interface ExampleEvent {
    url: string;
}

interface ScrapingData {
  content: string;
}

export const handler: Handler = async (
  event: ExampleEvent,
  context: Context,
  callback: Callback
): Promise<any> => {
  try {
    console.log("event:", event);
    const puppeteer: PuppeteerExtra = require("puppeteer-extra");
    const stealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteer.use(stealthPlugin());

    // const proxyPlugin = require("puppeteer-extra-plugin-proxy");
    // puppeteer.use(
    //   proxyPlugin({
    //     address: "pr.oxylabs.io",
    //     port: 7777,
    //     credentials: {
    //       username: "customer-someUsername-cc-US",
    //       password: "somePassword",
    //     },
    //   })
    // );

    const launchOptions: PuppeteerLaunchOptions = context.functionName
      ? {
          headless: true,
          executablePath: puppeteer.executablePath(),
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--incognito",
            "--disable-client-side-phishing-detection",
            "--disable-software-rasterizer",
          ],
        }
      : {
          headless: false,
          executablePath: puppeteer.executablePath(),
        };

    const browser: Browser = await puppeteer.launch(launchOptions);
    const page: Page = await browser.newPage();
    await page.goto(event.url);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const data = await page.content();
    await browser.close();
    return data;
  } catch (e) {
    console.log("Error in Lambda Handler:", e);
    return e;
  }
};


// Test - npx ts-node index.ts
(async () => {
    try {
      const event: ExampleEvent = {'url': 'https://hubspot.com'};
      //@ts-ignore
      console.log(await handler(event, {}, () => {}));
    } catch (e) {
      console.log("Error in Lambda Handler:", e);
    }
  })();