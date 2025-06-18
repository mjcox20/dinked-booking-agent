const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.post('/book-meckrec', async (req, res) => {
  const { user, court_id, date, time } = req.body;

  try {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // TODO: Replace with actual booking URL and selectors
    await page.goto('https://webtrac.mecklenburgcountync.gov/');

    // Example (fake selectors - replace as needed)
    await page.type('#first_name', user.name.split(' ')[0]);
    await page.type('#last_name', user.name.split(' ')[1] || '');
    await page.type('#email', user.email);
    await page.type('#phone', user.phone);
    await page.type('#date', date);
    await page.type('#time', time);

    await page.click('#submit-button');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const screenshotPath = `screenshots/${Date.now()}-confirmation.png`;
    await page.screenshot({ path: screenshotPath });

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
    console.error(error);
    res.json({
      status: 'failed',
      error_reason: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Booking agent listening on port 3000');
});
