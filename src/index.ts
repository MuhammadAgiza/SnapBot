// src/index.ts
import { SnapBot } from './snapbot';
import dotenv from 'dotenv';
import { createUniqueFileName } from './utils';
import cron from 'node-cron';
import logger from './logger';

dotenv.config();

const bot = new SnapBot();

const credentials = {
    username: process.env.USER_NAME || '',
    password: process.env.USER_PASSWORD || ''
};

async function launchSnap() {
    await bot.launchSnapchat({ headless: true });
    await bot.login(credentials);
    await bot.tryClosePopup(20);
    // await bot.wait(2000);
    // await bot.closeBrowser();
}


async function sendSnap(caption: string = "", emojis: string[] = ["🥲"]) {
    await bot.tryClosePopup(20);
    await bot.captureSnap({ caption });
    await bot.screenshot(createUniqueFileName("./screenshots/screenshot.png"));
    await bot.sendToShortcut(emojis);
}

const blackScreenTask = cron.schedule('*/2 * * * *', () => {
    logger.info('Sending Snap');
    sendSnap();
});

blackScreenTask.start();

launchSnap();


