import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

const DEMO_URL = "https://algopatterns.in";
const OUTPUT_DIR = path.join(__dirname, "output");

// Login credentials
const CREDENTIALS = {
  email: "rishukumar.prince@gmail.com",
  password: "#Prince7091",
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to wait and let animations complete
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for smooth scrolling
async function smoothScroll(page: Page, distance: number, duration: number) {
  const steps = 20;
  const stepDistance = distance / steps;
  const stepDuration = duration / steps;

  for (let i = 0; i < steps; i++) {
    await page.evaluate((d: number) => window.scrollBy(0, d), stepDistance);
    await wait(stepDuration);
  }
}

// Login function (without recording)
async function login(page: Page) {
  console.log("Logging in...");

  await page.goto(`${DEMO_URL}/login`, { waitUntil: "networkidle" });
  await wait(1000);

  // Fill email
  const emailInput = page.locator('input[type="email"], input#email');
  await emailInput.fill(CREDENTIALS.email);
  await wait(500);

  // Fill password
  const passwordInput = page.locator('input[type="password"], input#password');
  await passwordInput.fill(CREDENTIALS.password);
  await wait(500);

  // Click sign in button
  const signInButton = page.locator('button[type="submit"]');
  await signInButton.click();

  // Wait for redirect to homepage
  await page.waitForURL(DEMO_URL + "/", { timeout: 15000 }).catch(() => {
    console.log("Waiting for homepage...");
  });
  await wait(2000);

  console.log("Logged in successfully!\n");
}

async function recordDemo() {
  console.log("Starting demo recording...\n");

  const browser: Browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"], // Start maximized
  });

  // First, create a context WITHOUT recording to login
  const loginContext = await browser.newContext({
    viewport: null, // Full screen
    storageState: undefined,
  });

  const loginPage = await loginContext.newPage();

  // Login first
  await login(loginPage);

  // Save the storage state (cookies, localStorage)
  const storageState = await loginContext.storageState();
  await loginContext.close();

  console.log("Starting recording with logged-in session...\n");

  // Now create a new context WITH recording and the logged-in state
  const recordingContext: BrowserContext = await browser.newContext({
    viewport: null, // Full screen
    storageState: storageState,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page: Page = await recordingContext.newPage();

  try {
    // Scene 1: Homepage (0:00 - 0:10)
    console.log("Scene 1: Homepage - Showing all patterns");
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
    await wait(2000);

    // Scroll to show patterns
    await smoothScroll(page, 500, 2500);
    await wait(1500);

    // Hover over a pattern card
    const slidingWindowCard = page.locator(
      'a[href="/patterns/sliding-window"]'
    );
    if (await slidingWindowCard.isVisible()) {
      await slidingWindowCard.hover();
      await wait(1000);
    }

    // Scene 2: Pattern Page Tutorial (0:10 - 0:18)
    console.log("Scene 2: Pattern Tutorial - Sliding Window");
    await page.goto(`${DEMO_URL}/patterns/sliding-window`, {
      waitUntil: "networkidle",
    });
    await wait(2000);

    // Scroll through tutorial content
    await smoothScroll(page, 600, 3000);
    await wait(1500);

    // Scene 3: Visualizer (0:18 - 0:30)
    console.log("Scene 3: Interactive Visualizer");

    // Scroll to find visualizer
    await smoothScroll(page, 400, 2000);
    await wait(1000);

    // Try to find and interact with visualizer
    const playButton = page
      .locator('button:has-text("Play"), button:has-text("Start"), button:has-text("Step")')
      .first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await wait(4000); // Let animation play
    } else {
      await wait(3000);
    }

    // Scene 4: Problems Tab (0:30 - 0:38)
    console.log("Scene 4: Problems Tab - Curated problem list");
    const problemsTab = page
      .locator(
        'button:has-text("Problems"), [role="tab"]:has-text("Problems")'
      )
      .first();
    if (await problemsTab.isVisible()) {
      await problemsTab.click();
      await wait(2000);
      await smoothScroll(page, 300, 2000);
      await wait(1000);
    }

    // Scene 5: Problem Workspace (0:38 - 0:50)
    console.log("Scene 5: Problem Workspace - Code editor");

    // Find and click a problem link
    const problemLink = page.locator('a[href*="/problems/"]').first();
    if (await problemLink.isVisible()) {
      await problemLink.click();
      await page.waitForLoadState("networkidle");
      await wait(2500);

      // Show the workspace - scroll a bit
      await smoothScroll(page, 150, 1000);
      await wait(1500);

      // Try to click Run button if visible
      const runButton = page.locator('button:has-text("Run")').first();
      if (await runButton.isVisible()) {
        await runButton.click();
        await wait(3000);
      }
    }

    // Scene 6: AI Chat (0:50 - 1:05)
    console.log("Scene 6: AI Chat - Ask the AI tutor");
    await page.goto(`${DEMO_URL}/chat`, { waitUntil: "networkidle" });
    await wait(2500);

    // Type a question
    const chatInput = page.locator("textarea").first();
    if (await chatInput.isVisible()) {
      await chatInput.click();

      // Type slowly for effect
      const question = "Explain the sliding window pattern";
      for (const char of question) {
        await chatInput.type(char, { delay: 50 });
      }
      await wait(1000);

      // Submit
      const sendButton = page
        .locator('button[type="submit"], button:has-text("Send")')
        .first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await wait(6000); // Wait for AI response
      }

      // Scroll to see response
      await smoothScroll(page, 300, 2000);
      await wait(2000);
    }

    // Scene 7: Interview Cheatsheet (1:05 - 1:15)
    console.log("Scene 7: Interview Cheatsheet");
    await page.goto(`${DEMO_URL}/interview-cheatsheet`, {
      waitUntil: "networkidle",
    });
    await wait(2000);
    await smoothScroll(page, 500, 3000);
    await wait(1500);

    // Scene 8: DSA Fundamentals (1:15 - 1:22)
    console.log("Scene 8: DSA Fundamentals");
    await page.goto(`${DEMO_URL}/dsa-fundamentals`, {
      waitUntil: "networkidle",
    });
    await wait(2000);
    await smoothScroll(page, 400, 2500);
    await wait(1500);

    // Final pause on homepage
    console.log("Scene 9: Back to Homepage - Final shot");
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
    await wait(3000);

    console.log("\nDemo recording complete!");
  } catch (error) {
    console.error("Error during recording:", error);
  } finally {
    // Close and save video
    await page.close();
    await recordingContext.close();
    await browser.close();

    // Find the video file
    const files = fs.readdirSync(OUTPUT_DIR);
    const videoFile = files.find(
      (f) => f.endsWith(".webm") && f.startsWith("page")
    );

    if (videoFile) {
      const newName = `algopatterns-demo-${Date.now()}.webm`;
      fs.renameSync(
        path.join(OUTPUT_DIR, videoFile),
        path.join(OUTPUT_DIR, newName)
      );
      console.log(`\nVideo saved to: ${OUTPUT_DIR}/${newName}`);
    } else {
      console.log(`\nVideo saved to: ${OUTPUT_DIR}`);
    }

    console.log("\nNext steps:");
    console.log("1. Convert to MP4: ffmpeg -i output/algopatterns-demo-*.webm -c:v libx264 -crf 23 output/demo.mp4");
    console.log("2. Add captions using CapCut or similar tool");
  }
}

// Run the demo
recordDemo();
