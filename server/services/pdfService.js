import { launchPdfBrowser } from './browser.js';

export const renderVoucherPdf = async (publicUrl) => {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });
    await page.goto(publicUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.public-document', { timeout: 15000 });

    // Chromium print reflows the fixed voucher canvas to paper width. Capture
    // the rendered public voucher, then make the PDF page that exact size.
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images).map((image) => image.complete
        ? Promise.resolve()
        : new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); })));
    });
    const voucher = await page.$('.public-document');
    if (!voucher) throw new Error('Voucher document was not found.');
    const size = await voucher.evaluate((element) => ({
      width: Math.ceil(element.getBoundingClientRect().width),
      height: Math.ceil(element.getBoundingClientRect().height),
    }));
    const image = await voucher.screenshot({ type: 'png' });

    const pdfPage = await browser.newPage();
    await pdfPage.setViewport({ width: size.width, height: Math.min(size.height, 2000), deviceScaleFactor: 1 });
    await pdfPage.setContent(`<!doctype html><html><head><style>
      @page { size: ${size.width}px ${size.height}px; margin: 0; }
      html, body { margin: 0; padding: 0; width: ${size.width}px; height: ${size.height}px; overflow: hidden; }
      img { display: block; width: ${size.width}px; height: ${size.height}px; }
    </style></head><body><img src="data:image/png;base64,${image.toString('base64')}" /></body></html>`, { waitUntil: 'load' });
    return Buffer.from(await pdfPage.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    }));
  } finally {
    await browser.close();
  }
};