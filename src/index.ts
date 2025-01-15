// src/index.ts
import { SnapBot } from './snapbot';
import dotenv from 'dotenv';

dotenv.config();

const bot = new SnapBot();

const credentials = {
    username: process.env.USER_NAME || '',
    password: process.env.USER_PASSWORD || ''
};

async function sendSnap() {
    await bot.launchSnapchat({ headless: false });
    await bot.login(credentials);
    await bot.tryClosePopup(20);
    await bot.captureSnap({ caption: "Streak Saver" });
    await bot.screenshot("screenshot.png");
    await bot.sendToShortcut(["😭", "🥲"]);
    // await bot.wait(2000);
    // await bot.closeBrowser();
}

sendSnap();