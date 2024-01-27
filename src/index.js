const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const urlParam = req.query.url;

  if (!urlParam) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  runPuppeteer(urlParam)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal server error' });
    });
});

async function runPuppeteer(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    let m3u8Urls = [];

    page.on('request', (request) => {
      if (request.url().includes('.m3u8')) {
        const m3u8Url = request.url();
        console.log('Request URL:', m3u8Url);

        m3u8Urls.push(m3u8Url);
        request.continue();
      } else {
        request.continue();
      }
    });

    await page.goto(url);

    await browser.close();

    return { m3u8Urls };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
