# SnapBot

SnapBot is a TypeScript-based automation tool for interacting with Snapchat using Puppeteer. This bot logs into a Snapchat account, captures a snap with a caption, takes a screenshot, and sends the snap to specified contacts. It also includes a logout feature for switching accounts without closing the browser.

### Features

- **Auto Login**: Automatically logs into your Snapchat account, saving you time and effort.
- **Multiple Accounts**: Supports multiple Snapchat accounts, allowing you to maintain streaks for all of them simultaneously.
- **Snapstreak Maintenance**: Ensures your snap streaks are never broken by sending snaps on time.
- **Custom Captions**: Send snaps with captions of your choice, with the potential for dynamic content integration.

## Installation

1. Clone the repository:
   git clone https://github.com/muhammadagiza/SnapBot
2. Navigate to the project folder:
   cd SnapBot
3. Install the necessary dependencies:
   npm install
4. Copy the `.env.example` file to create a `.env` file:
   cp .env.example .env
5. Open the `.env` file and add your Snapchat credentials:
   USER_NAME=<Your Snapchat Username>
   USER_PASSWORD=<Your Snapchat Password>

## Usage

To run the bot, use the following command:
   npm run bot
This command will start SnapBot, logging into Snapchat, capturing a snap, and sending it to your specified contacts.

## Methods

The following methods are available in `SnapBot`:

- `launchSnapchat({ headless })`: Opens Snapchat in a browser, set to visible with `{ headless: false }`.
- `login(credentials)`: Logs into Snapchat using the provided credentials.
- `captureSnap({ caption })`: Takes a snap and applies a caption.
- `screenshot(path)`: Saves a screenshot of the current screen state.
- `send(recipients)`: Sends the snap to the specified recipients:
  - `"BestFriends"` for best friends,
  - `"friends"` for all active friends and best friends,
  - `"groups"` for group chats.
- `wait(milliseconds)`: Pauses the script for a specified duration.
- `sendToShortcut(emoji[])` Sends the snap to list of shortcuts.
- `logout()`: Logs out of the current Snapchat account, allowing you to log in with another account without closing the browser.
- `closeBrowser()`: Closes the browser session.