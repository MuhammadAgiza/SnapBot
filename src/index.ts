// src/index.ts
import { SnapBot } from './snapbot';
import dotenv from 'dotenv';
import { createUniqueFileName } from './utils';
import logger from './logger';
import { TaskQueue } from './TaskQueue';
import { SnapScheduler } from './SnapScheduler';
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

}


async function sendSnap(caption: string = "Streak Saver", emojis: string[] = ["🥲"]) {
    await bot.tryClosePopup(20);
    await bot.captureSnap({ caption });
    await bot.screenshot(createUniqueFileName("./screenshots/screenshot.png"));
    await bot.sendToShortcut(emojis);
}

async function blackScreenSnap() {
    logger.info('Sending black-screen Snap');
    await sendSnap("", ["😭"]);
}

async function dailySnap() {
    logger.info('Sending score saving Snap');
    await sendSnap("Score Saver", ["😭"]);
}


launchSnap();

const taskQueue = new TaskQueue();
const snapScheduler = new SnapScheduler(taskQueue);

snapScheduler.addTask({
    name: 'Black Screen Snap',
    cronExpression: '*/5 * * * *',
    action: blackScreenSnap
});


taskQueue.processQueue();

