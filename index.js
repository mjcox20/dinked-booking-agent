const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Ensure screenshots folder exists
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

app.post('/book-meckrec', async (req, res) => {
  const { user, court_id, date, time } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/google-chrome-stable' // Needed for Render
    });

    const page = await browser.newPage();

    // TODO: Replace this with actual booking page
    await page.goto('https://webtrac.mecklenburgcountync.gov/', { waitUntil: 'networkidle2' });

    // EXAMPLE ONLY: Replace with real selectors
    await page.type('#first_name', user.name.split(' ')[0]);
    await page.type('#last_name', user.name.split(' ')[1] || '');
    await page.type('#email', user.email);
    await page.type('#phone', user.phone);
    await page.type('#date', date);
    await page.type('#time', time);

    // Simulate form submission (replace with correct selector)
    await page.click('#submit-button');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const screenshotPath = `screenshots/${Date.now()}-confirmation.png`;
    await page.screenshot({ path: screenshotPath });

    // Extract confirmation text if available
    const confirmationText = await page.evaluate(() => {
      const el = document.querySelector('#confirmation');
      return el ? el.innerText : null;
    });

    await browser.close();

    res.json({
      status: 'confirmed',
      confirmation_code: confirmationText || 'N/A',
      screenshot_url: screenshotPath
    });
  } catch (error) {
    console.error('Booking failed:', error.message);
    res.status(500).json({
      status: 'failed',
      error_reason: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Booking agent listening on port ${PORT}`);
});
