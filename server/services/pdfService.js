import { launchPdfBrowser } from './browser.js';

export const renderVoucherPdf = async (publicUrl) => {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });
    await page.goto(publicUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.public-document', { timeout: 15000 });
    await page.emulateMediaType('print');
    return Buffer.from(await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    }));
  } finally {
    await browser.close();
  }
};