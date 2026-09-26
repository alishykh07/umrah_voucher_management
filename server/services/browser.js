import fs from 'node:fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const localBrowserPaths = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const localExecutablePath = () => localBrowserPaths.find((browserPath) => fs.existsSync(browserPath));

export const launchPdfBrowser = async () => {
  const isServerless = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const executablePath = isServerless ? await chromium.executablePath() : localExecutablePath();

  if (!executablePath) {
    throw new Error('PDF browser is unavailable. Set PUPPETEER_EXECUTABLE_PATH for local development.');
  }

  return puppeteer.launch({
    args: isServerless ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  });
};