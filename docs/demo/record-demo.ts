import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

// Use localhost for development, production URL for final recording
const DEMO_URL = process.env.DEMO_URL || "http://localhost:3000";
const OUTPUT_DIR = path.join(__dirname, "output");

// ============================================
// CONFIGURATION - Adjust these as needed
// ============================================

// Window size for the demo
// MacBook Pro 15": 1680x1050 or 1440x900
// MacBook Pro 14": 1512x982 or 1440x900
// For recording: 1920x1080 or 1280x720
const WINDOW_WIDTH = 1680;
const WINDOW_HEIGHT = 1050;

// Set to true to enable video recording
const ENABLE_RECORDING = false;

// Login credentials (use environment variables for security)
const CREDENTIALS = {
  email: process.env.DEMO_EMAIL || "rishukumar.prince@gmail.com",
  password: process.env.DEMO_PASSWORD || "",
};

// Timing configuration (in milliseconds)
const TIMING = {
  SHORT_WAIT: 1000,
  MEDIUM_WAIT: 2000,
  LONG_WAIT: 3000,
  AI_RESPONSE_WAIT: 8000,    // Wait for AI to generate response
  AI_STREAM_SCROLL: 1500,    // Interval to scroll while AI streams
  PAGE_LOAD: 2000,
  ANIMATION_PLAY: 5000,
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for smooth scrolling on page
async function smoothScroll(page: Page, distance: number, duration: number) {
  const steps = 20;
  const stepDistance = distance / steps;
  const stepDuration = duration / steps;

  for (let i = 0; i < steps; i++) {
    await page.evaluate((d: number) => window.scrollBy(0, d), stepDistance);
    await wait(stepDuration);
  }
}

// Helper for smooth scrolling within a specific element
async function smoothScrollElement(
  page: Page,
  selector: string,
  distance: number,
  duration: number
) {
  const steps = 20;
  const stepDistance = distance / steps;
  const stepDuration = duration / steps;

  for (let i = 0; i < steps; i++) {
    await page.evaluate(
      ({ sel, d }) => {
        const el = document.querySelector(sel);
        if (el) el.scrollTop += d;
      },
      { sel: selector, d: stepDistance }
    );
    await wait(stepDuration);
  }
}

// Helper to type text slowly (for demo effect)
async function typeSlowly(page: Page, selector: string, text: string) {
  const element = page.locator(selector);
  await element.click();
  for (const char of text) {
    await element.type(char, { delay: 50 });
  }
}

// Login function
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
  await page.waitForURL(`${DEMO_URL}/`, { timeout: 15000 }).catch(() => {
    console.log("Waiting for homepage...");
  });
  await wait(2000);

  console.log("Logged in successfully!\n");
}

// Helper to wait for AI response while scrolling to show streaming content
async function waitForAIResponse(page: Page, containerSelector?: string) {
  const totalWait = TIMING.AI_RESPONSE_WAIT;
  const scrollInterval = TIMING.AI_STREAM_SCROLL;
  const iterations = Math.ceil(totalWait / scrollInterval);

  console.log("    - Waiting for AI response...");
  
  for (let i = 0; i < iterations; i++) {
    await wait(scrollInterval);
    
    // Scroll the AI response container to show new content
    if (containerSelector) {
      await page.evaluate((sel) => {
        const container = document.querySelector(sel);
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, containerSelector);
    } else {
      // Try common AI chat container selectors
      await page.evaluate(() => {
        const containers = document.querySelectorAll(
          '[class*="chat"], [class*="message"], [class*="response"]'
        );
        containers.forEach((c) => {
          if (c.scrollHeight > c.clientHeight) {
            c.scrollTop = c.scrollHeight;
          }
        });
      });
    }
    
    console.log(`    - AI streaming... (${(i + 1) * scrollInterval / 1000}s)`);
  }
}

async function runDemo() {
  console.log("Starting demo...\n");
  console.log(`Window size: ${WINDOW_WIDTH}x${WINDOW_HEIGHT}`);
  console.log(`Recording: ${ENABLE_RECORDING ? "ON" : "OFF"}\n`);

  if (!CREDENTIALS.password) {
    console.log("⚠️  No password set. Use: DEMO_PASSWORD=xxx npm run record\n");
  }

  const browser: Browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"],
  });

  // First, create a context to login
  const loginContext = await browser.newContext({
    viewport: { width: WINDOW_WIDTH, height: WINDOW_HEIGHT },
  });

  const loginPage = await loginContext.newPage();
  await login(loginPage);

  // Save the storage state (cookies, localStorage)
  const storageState = await loginContext.storageState();
  await loginContext.close();

  // Create main context (with or without recording)
  const contextOptions: Parameters<typeof browser.newContext>[0] = {
    viewport: { width: WINDOW_WIDTH, height: WINDOW_HEIGHT },
    storageState: storageState,
  };

  if (ENABLE_RECORDING) {
    contextOptions.recordVideo = {
      dir: OUTPUT_DIR,
      size: { width: WINDOW_WIDTH, height: WINDOW_HEIGHT },
    };
  }

  const context: BrowserContext = await browser.newContext(contextOptions);
  const page: Page = await context.newPage();

  try {
    // =========================================
    // Scene 1: Homepage
    // =========================================
    console.log("Scene 1: Homepage - Showing all patterns");
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
    await wait(2000);

    // Scroll to show pattern cards
    await smoothScroll(page, 400, 2000);
    await wait(1500);

    // Hover over Dynamic Programming card
    const dpCard = page.locator('a[href="/patterns/dynamic-programming"]');
    if (await dpCard.isVisible()) {
      await dpCard.hover();
      await wait(1000);
    }

    // =========================================
    // Scene 2: Pattern Page - Dynamic Programming
    // =========================================
    console.log("Scene 2: Dynamic Programming Pattern Page");
    await page.goto(`${DEMO_URL}/patterns/dynamic-programming`, {
      waitUntil: "networkidle",
    });
    await wait(TIMING.MEDIUM_WAIT);

    // Step 1: Show "Introduction to Dynamic Programming" content
    // The Tutorial tab is active by default, showing Introduction section
    console.log("  - Showing Introduction to Dynamic Programming content");
    await smoothScroll(page, 500, 3000);
    await wait(TIMING.MEDIUM_WAIT);
    
    // Scroll back up to reset for sidebar demo
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(TIMING.SHORT_WAIT);

    // Step 2: Scroll the left sidebar to show ALL section titles
    // Sidebar contains: Introduction, How DP is Discovered, Universal Framework, 
    //                   1D DP, Decision DP, LCS, LIS, Grid DP, etc.
    console.log("  - Scrolling sidebar to show all sections");
    
    // Sidebar container: sticky div with overflow-y-auto and max-h-[70vh]
    // The structure is: div.sticky.overflow-y-auto > CourseSidebar > nav.space-y-1 with buttons
    const sidebarSelector = '[class*="overflow-y-auto"][class*="sticky"], [class*="overflow-y-auto"][class*="max-h"]';
    
    // First scroll: show top sections
    await smoothScrollElement(page, sidebarSelector, 150, 2000);
    await wait(TIMING.SHORT_WAIT);
    
    // Second scroll: show middle sections (LCS, LIS, etc.)
    await smoothScrollElement(page, sidebarSelector, 150, 2000);
    await wait(TIMING.SHORT_WAIT);
    
    // Third scroll: show bottom sections
    await smoothScrollElement(page, sidebarSelector, 150, 2000);
    await wait(TIMING.MEDIUM_WAIT);

    // Scroll sidebar back to find LCS (around position 150-200 for LCS which is section 7)
    console.log("  - Scrolling sidebar back to find LCS");
    await page.evaluate((sel) => {
      const sidebar = document.querySelector(sel);
      if (sidebar) sidebar.scrollTop = 180; // Position to show LCS
    }, sidebarSelector);
    await wait(TIMING.SHORT_WAIT);

    // Step 3: Click on "LCS (Two Sequences)" section in sidebar
    // Sidebar buttons have text like "6. LCS (Two Sequences)" with number prefix (1-indexed, LCS is at index 5)
    console.log('  - Clicking on "LCS (Two Sequences)" section');
    let lcsClicked = false;
    
    // Try button with full numbered text "6. LCS" (section index 5 + 1)
    const lcsButtonNumbered = page.locator('button:has-text("6. LCS")').first();
    if (await lcsButtonNumbered.isVisible({ timeout: 2000 }).catch(() => false)) {
      await lcsButtonNumbered.scrollIntoViewIfNeeded();
      await wait(300);
      await lcsButtonNumbered.click();
      lcsClicked = true;
    }
    
    // Fallback: try button with partial LCS text
    if (!lcsClicked) {
      const lcsButton = page.locator('button:has-text("LCS (Two Sequences)")').first();
      if (await lcsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lcsButton.scrollIntoViewIfNeeded();
        await wait(300);
        await lcsButton.click();
        lcsClicked = true;
      }
    }
    
    // Fallback: try any element with LCS text
    if (!lcsClicked) {
      const lcsText = page.getByText("LCS (Two Sequences)").first();
      if (await lcsText.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lcsText.click();
        lcsClicked = true;
      }
    }
    
    // Last resort: click on any button containing "LCS"
    if (!lcsClicked) {
      const lcsShort = page.locator('button:has-text("LCS")').first();
      if (await lcsShort.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lcsShort.click();
        lcsClicked = true;
      }
    }
    
    if (lcsClicked) {
      console.log("  - LCS section clicked, waiting for content to load");
      await wait(TIMING.MEDIUM_WAIT);
    } else {
      console.log("  - Warning: Could not find LCS section, continuing...");
    }

    // Step 4: Scroll main content to show LCS explanation
    console.log("  - Scrolling main content to show LCS explanation");
    await smoothScroll(page, 400, 2500);
    await wait(TIMING.MEDIUM_WAIT);

    // Step 5: Scroll to Templates section at bottom of LCS content
    console.log("  - Scrolling to Templates section");
    
    // Try to find the "Template" or "Approaches" heading
    const templateHeading = page.locator('h3:has-text("Template"), h4:has-text("Template"), h3:has-text("Approaches"), h4:has-text("Approaches")').first();
    if (await templateHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await templateHeading.scrollIntoViewIfNeeded();
      await wait(TIMING.SHORT_WAIT);
    } else {
      // Fallback: scroll down more to find templates
      console.log("  - Template heading not found, scrolling more...");
      await smoothScroll(page, 600, 2000);
      await wait(TIMING.SHORT_WAIT);
    }

    // Step 6: Click through template tabs (Recursion, Memoization, Tabulation, Space Optimized)
    console.log("  - Clicking through template tabs");
    const templateTabs = ["Recursion", "Memoization", "Tabulation", "Space Optimized"];
    for (const tabName of templateTabs) {
      // Find button with exact or partial text match
      const tab = page.locator(`button:has-text("${tabName}")`).first();
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Scroll the tab into view before clicking
        await tab.scrollIntoViewIfNeeded();
        await wait(300);
        console.log(`    - Clicking "${tabName}" tab`);
        await tab.click();
        await wait(TIMING.MEDIUM_WAIT);
      } else {
        console.log(`    - Warning: "${tabName}" tab not found`);
      }
    }

    // =========================================
    // Scene 2b: AI Capabilities - Ask Thor AI
    // =========================================
    console.log("Scene 2b: AI Capabilities - Ask Thor AI");
    
    // Scroll up a bit to find content to select
    await page.evaluate(() => window.scrollBy(0, -200));
    await wait(1000);

    // Try to select text and trigger Ask Thor AI
    // First, find a paragraph with content
    const paragraph = page.locator('p:has-text("LCS")').first();
    if (await paragraph.isVisible()) {
      // Triple click to select paragraph
      await paragraph.click({ clickCount: 3 });
      await wait(1000);

      // Look for the floating "Ask Thor AI" button
      const askThorButton = page.locator('button:has-text("Ask Thor"), button:has-text("Ask AI")').first();
      if (await askThorButton.isVisible()) {
        console.log("  - Clicking Ask Thor AI button");
        await askThorButton.click();
        await wait(TIMING.LONG_WAIT);

        // Wait for initial AI response to the selected text
        await waitForAIResponse(page);

        // Type a follow-up question in AI chat
        const chatInput = page.locator('textarea[placeholder*="Ask"], textarea[placeholder*="Type"], textarea[placeholder*="message"]').first();
        if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log("  - Typing follow-up question");
          await chatInput.click();
          await wait(500);
          await chatInput.fill("Can you give me a simple example comparing two strings?");
          await wait(TIMING.SHORT_WAIT);

          // Click send button - try multiple selectors
          console.log("  - Clicking send button");
          const sendBtn = page.locator('button[type="submit"], button:has-text("Send"), button[aria-label*="Send"], button[aria-label*="send"]').first();
          if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await sendBtn.click();
            console.log("  - Send button clicked, waiting for AI response");
            // Wait for AI response with scrolling
            await waitForAIResponse(page);
          } else {
            // Try pressing Enter as fallback
            console.log("  - Send button not found, pressing Enter");
            await chatInput.press("Enter");
            await waitForAIResponse(page);
          }
        } else {
          console.log("  - Chat input not found for follow-up");
        }
      }
    }

    // =========================================
    // Scene 3: Visualizer
    // =========================================
    console.log("Scene 3: Interactive Visualizer");
    
    // Click on "1D DP" section which has a visualizer
    const oneDPSection = page.locator('button:has-text("1D DP"), [role="button"]:has-text("1D DP")').first();
    if (await oneDPSection.isVisible()) {
      await oneDPSection.click();
      await wait(2000);
    } else {
      const oneDPText = page.getByText("1D DP (Recursive Numbers)").first();
      if (await oneDPText.isVisible()) {
        await oneDPText.click();
        await wait(2000);
      }
    }

    // Scroll to find visualizer
    await smoothScroll(page, 500, 2500);
    await wait(1000);

    // Find and click Play button on visualizer
    const playButton = page.locator('button:has-text("Play")').first();
    if (await playButton.isVisible()) {
      console.log("  - Clicking Play button");
      await playButton.click();
      await wait(5000); // Let animation play
    }

    // Click Reset
    const resetButton = page.locator('button:has-text("Reset")').first();
    if (await resetButton.isVisible()) {
      console.log("  - Clicking Reset button");
      await resetButton.click();
      await wait(1000);
    }

    // =========================================
    // Scene 4: Problems Tab
    // =========================================
    console.log("Scene 4: Problems Tab");
    
    // Click on "Problems" tab in main tab bar
    const problemsTab = page.locator('button:has-text("Problems")').first();
    if (await problemsTab.isVisible()) {
      await problemsTab.click();
      await wait(2000);
    }

    // Scroll to show problem list
    await smoothScroll(page, 300, 2000);
    await wait(2000);

    // =========================================
    // Scene 5: Problem Workspace
    // =========================================
    console.log("Scene 5: Problem Workspace - House Robber");
    
    // Click on "House Robber" problem
    const houseRobberLink = page.locator('a:has-text("House Robber")').first();
    if (await houseRobberLink.isVisible()) {
      await houseRobberLink.click();
      await page.waitForLoadState("networkidle");
      await wait(2000);
    } else {
      // Fallback: click any problem link
      const anyProblemLink = page.locator('a[href*="/problems/"]').first();
      if (await anyProblemLink.isVisible()) {
        await anyProblemLink.click();
        await page.waitForLoadState("networkidle");
        await wait(2000);
      }
    }

    // Scroll to show code editor
    await smoothScroll(page, 200, 1500);
    await wait(1500);

    // Look for AI chat panel - it might be a toggle button or already open
    // The AI chat input is typically a textarea with a specific placeholder
    const aiChatInput = page.locator('textarea[placeholder*="Ask"], textarea[placeholder*="Message"], textarea[placeholder*="Type your"]').first();
    
    if (await aiChatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log("  - Asking AI for help");
      await aiChatInput.click();
      await aiChatInput.fill("Help me understand the approach to solve this problem step by step");
      await wait(TIMING.SHORT_WAIT);

      const sendButton = page.locator('button[type="submit"], button[aria-label*="Send"]').first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        // Wait for AI response with scrolling
        await waitForAIResponse(page);
      }
    } else {
      console.log("  - AI chat input not found, skipping");
      await wait(TIMING.MEDIUM_WAIT);
    }

    // =========================================
    // Scene 6: AI Chat Page
    // =========================================
    console.log("Scene 6: AI Chat Page");
    await page.goto(`${DEMO_URL}/chat`, { waitUntil: "networkidle" });
    await wait(TIMING.PAGE_LOAD);

    // Type a question slowly for demo effect
    const mainChatInput = page.locator("textarea").first();
    if (await mainChatInput.isVisible()) {
      await mainChatInput.click();
      
      const question = "Explain the sliding window pattern with an example";
      console.log("  - Typing question slowly...");
      for (const char of question) {
        await mainChatInput.type(char, { delay: 40 });
      }
      await wait(TIMING.SHORT_WAIT);

      // Submit
      const chatSendBtn = page.locator('button[type="submit"]').first();
      if (await chatSendBtn.isVisible()) {
        await chatSendBtn.click();
        // Wait for AI response with scrolling to show streaming
        await waitForAIResponse(page);
      }

      // Final scroll to see complete response
      await smoothScroll(page, 300, 2000);
      await wait(TIMING.MEDIUM_WAIT);
    }

    // =========================================
    // Scene 7: Interview Cheatsheet
    // =========================================
    console.log("Scene 7: Interview Cheatsheet");
    await page.goto(`${DEMO_URL}/interview-cheatsheet`, {
      waitUntil: "networkidle",
    });
    await wait(TIMING.PAGE_LOAD);
    await smoothScroll(page, 500, 3000);
    await wait(TIMING.MEDIUM_WAIT);

    // =========================================
    // Scene 8: DSA Fundamentals
    // =========================================
    console.log("Scene 8: DSA Fundamentals");
    await page.goto(`${DEMO_URL}/dsa-fundamentals`, {
      waitUntil: "networkidle",
    });
    await wait(TIMING.PAGE_LOAD);
    await smoothScroll(page, 400, 2500);
    await wait(TIMING.MEDIUM_WAIT);

    // =========================================
    // Scene 9: Back to Homepage
    // =========================================
    console.log("Scene 9: Back to Homepage - Final");
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
    await wait(3000);

    console.log("\nDemo complete!");
  } catch (error) {
    console.error("Error during demo:", error);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    if (ENABLE_RECORDING) {
      // Find and rename the video file
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
        console.log("\nNext steps:");
        console.log(
          "1. Convert to MP4: ffmpeg -i output/algopatterns-demo-*.webm -c:v libx264 -crf 23 output/demo.mp4"
        );
        console.log("2. Add captions using CapCut or similar tool");
      }
    }
  }
}

// Run the demo
runDemo();
