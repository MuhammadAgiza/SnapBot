// This file exports the SnapBot class, which contains methods for launching Snapchat, logging in, capturing snaps, sending snaps, taking screenshots, and managing browser sessions. It uses Puppeteer for browser automation.

import puppeteer from "puppeteer-extra";
import { Browser, Page, LaunchOptions } from "puppeteer";
import Stealth from "puppeteer-extra-plugin-stealth";
import { Credentials, SnapOptions } from "./types";
import path from "path";

puppeteer.use(Stealth());

function delay(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, time);
	});
}

export class SnapBot {
	private page: Page | null = null;
	private browser: Browser | null = null;

	async launchSnapchat(options: LaunchOptions): Promise<void> {
		try {
			this.browser = await puppeteer.launch({
				...options,
				args: [
					...options.args || [],
					'--use-fake-ui-for-media-stream',
					'--use-fake-device-for-media-stream',
					`--use-file-for-fake-video-capture=${path.resolve("./videoplayback.y4m")}`				]
			});
			const context = await this.browser.createBrowserContext();
			await context.overridePermissions("https://web.snapchat.com", [
				"camera",
				"microphone",
				"notifications",
			]);
			this.page = await context.newPage();

			// await this.page.setViewport({ width: 1920, height: 1080 });
			await this.page.setUserAgent(
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
			);
		} catch (error) {
			console.error(`Error while Starting Snapchat: ${error}`);
		}
	}

	async login(credentials: Credentials): Promise<void> {
		const { username, password } = credentials;
		if (!username || !password) {
			throw new Error("Credentials can't be empty");
		}
		try {
			await this.page?.goto("https://accounts.snapchat.com/accounts/v2/login");
			await this.page?.waitForNetworkIdle();
		} catch (error) {
			console.error(`Error while opening login page: ${error}`);
		}
		try {
			const loginBtn = await this.page?.$('input[name="accountIdentifier"]');
			const defaultLoginBtn = await this.page?.$("ai_input");

			if (loginBtn) {
				await this.page?.type('input[name="accountIdentifier"]', username, {
					delay: 100,
				});
			}
			if (defaultLoginBtn) {
				await this.page?.type("#ai_input", username, { delay: 100 });
			}

			await this.page?.click("button[type='submit']");
		} catch (e) {
			console.log("Username field error:", e);
		}
		try {
			await this.page?.waitForSelector("#password", {
				visible: true,
				timeout: 15000,
			});
			await this.page?.type("#password", password, { delay: 100 });
		} catch (e) {
			console.log("Password field loading error:", e);
		}

		await this.page?.click("button[type='submit']");
		await delay(5000);
		try {
			await this.page?.goto("https://web.snapchat.com/");
			await this.page?.waitForNavigation();
		} catch (error) {
			console.error(`Error while opening snapchat web page: ${error}`);
		}
		await delay(1000);
	}

	async captureSnap(options: SnapOptions): Promise<void> {

		const svgButton = await this.page?.$("button.qJKfS");
		if (svgButton) {
			await this.page?.click("button.qJKfS");
		}

		await delay(2000);
		const captureButtonSelector = "button.FBYjn.gK0xL.A7Cr_.m3ODJ";
		const captureButton = await this.page?.$(captureButtonSelector);
		if (captureButton) {
			await captureButton.click();
		} else {
			console.log("Capture button not found");
		}

		if (options.caption) {
			await delay(2000);
			// await this.page?.waitForSelector('button.eUb32[title="Add a caption"]');
			await this.page?.click('button.eUb32[title="Add a caption"]');
			await delay(1000);
			await this.page?.type(
				'textarea.B9QiX[aria-label="Caption Input"]',
				options.caption,
				{ delay: 100 }
			);
			await delay(1000);
		}
	}

	async tryClosePopup(tries: number = 3): Promise<void> {
		const popupSelectors = [
			"button.close-popup",
			"div.popup-close",
			"button[aria-label='close']",
			"svg[aria-label='close']",
			"button[title='Close']",
			"div[role='dialog'] button[aria-label='Close']",
			"div.modal button.close",
			"div.popup button.dismiss",
		];
		let popupFound = false;

		for (let i = 0; i < tries; i++) {
			for (const selector of popupSelectors) {
				const popup = await this.page?.$(selector);
				if (popup) {
					await popup.click();
					await delay(500); // Wait for the popup to close
					popupFound = true;
					break;
				}
			}
			if (popupFound) {
				break;
			}
			await delay(2000);
		}

		if (!popupFound) {
			console.log("No popup found to close after multiple tries.");
		}
	}


	async send(recipients: string): Promise<void> {
		const button = await this.page?.$("button.YatIx.fGS78.eKaL7.Bnaur");
		if (button) {
			await button.click();
		}
		await delay(1000);
		let selected = "";
		recipients = recipients.toLowerCase();
		if (recipients === "bestfriends") {
			selected = "ul.UxcmY li div.Ewflr.cDeBk.A8BRr";
		} else if (recipients === "groups") {
			selected = "li div.RbA83";
		} else if (recipients === "friends") {
			selected = "li div.Ewflr";
		} else {
			throw new Error("Option not found");
		}
		const accounts = await this.page?.$$(selected);
		if (!accounts) {
			throw new Error("No accounts found");
		}
		for (const account of accounts) {
			const isFriendVisible = await account.evaluate(
				(el) => (el as HTMLElement).offsetWidth > 0 && (el as HTMLElement).offsetHeight > 0
			);
			if (isFriendVisible) {
				await account.click();
			}
		}
		const sendButton = await this.page?.$("button.TYX6O.eKaL7.Bnaur");
		await sendButton?.click();
		await delay(5000);
	}

	async sendToShortcut(emoji: string[]): Promise<void> {
		const button = await this.page?.$("button.YatIx.fGS78.eKaL7.Bnaur");
		if (button) {
			await button.click();
		}
		await delay(2000);

		try {
			const buttons = await this.page?.$$("button.c47Sk");
			if (!buttons) {
				throw new Error("No emoji buttons found");
			}
			for (const emojiButton of buttons) {
				const text = await emojiButton.evaluate((el) => (el as HTMLElement).innerText);
				if (!emoji.includes(text)) {
					continue;
				}
				await emojiButton.click();
				await delay(500);
				const selectButton = await this.page?.$("button.Y7u8A");
				await selectButton?.click();
				await delay(1000);
			}
			await delay(500);

			const sendButtonSelector = "button.TYX6O.eKaL7.Bnaur";
			const sendButton = await this.page?.$(sendButtonSelector);
			if (sendButton) {
				await sendButton.click();
			} else {
				throw new Error("Capture button not found");
			}

			await delay(5000);
		} catch (error) {
			console.error(`Error in sendToShortcut: ${error}`);
		}
	}

	async closeBrowser(): Promise<void> {
		await delay(5000);
		await this.browser?.close();
	}

	async screenshot(path: string): Promise<void> {
		await this.page?.screenshot({ path });
	}

	async logout(): Promise<void> {
		await this.page?.waitForSelector("#downshift-1-toggle-button");
		await this.page?.click("#downshift-1-toggle-button");
		await this.page?.click("#downshift-1-item-9");
	}

	async wait(time: number): Promise<void> {
		return delay(time);
	}
}