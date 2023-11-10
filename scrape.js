const puppeteer = require('puppeteer');
const fs = require('fs/promises');

async function scrapeData() {
  const browser = await puppeteer.launch();

  for (let i = 0; i < 3; i++) {
    const page = await browser.newPage();
    await page.goto('https://abrahamjuliot.github.io/creepjs/');

    await page.waitForTimeout(5000); 

    try {
      const data = await page.evaluate(() => {
        const trustScoreElement = document.querySelector('div[class^="col-six"] > div > span[class^="unblurred"]');
        const liesElement = document.querySelector('.visitor-info > div:nth-child(2) > div:nth-child(3) > div:nth-child(2)');
        const botElement = document.querySelector('div[class^="block-text"] > div[class^="unblurred"]');
        const fingerprintIDElement = document.querySelector('div[class^="ellipsis-all"]');

        console.log('trustScoreElement:', trustScoreElement);
        console.log('liesElement:', liesElement);
        console.log('botElement:', botElement);
        console.log('fingerprintIDElement:', fingerprintIDElement);

        const botText = botElement ? botElement.textContent.trim().replace('bot:', '') : 'N/A';
        const liesText = liesElement ? liesElement.textContent.trim().replace('lies (0):', '') : 'N/A';

        return {
          trustScore: trustScoreElement ? trustScoreElement.textContent.trim() : 'N/A',
          lies: liesText,
          bot: botText,
          fingerprintID: fingerprintIDElement ? fingerprintIDElement.textContent.trim() : 'N/A',
        };
      });

      await fs.writeFile(`data_${i}.json`, JSON.stringify(data, null, 2));

      await page.pdf({ path: `page_${i}.pdf`, format: 'A4' });

      console.log(`Files for iteration ${i} created successfully.`);
    } catch (error) {
      console.error(`Error during file creation for iteration ${i}:`, error);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

scrapeData();
