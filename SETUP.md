# Padel Score Pro — iPhone App Setup Guide

Follow these steps exactly, one at a time. Each step tells you what to do and why.

---

## Before You Start

Make sure **Xcode** is fully downloaded from the Mac App Store. It's a large file (~7GB) so start the download first and come back to this guide when it's done.

---

## Step 1 — Install Node.js

Node.js is a tool that lets your Mac run JavaScript outside of a browser. Expo needs it.

1. Go to **https://nodejs.org**
2. Click the button labelled **LTS** (the left one — this is the stable version)
3. Open the downloaded file and follow the installer — just click Continue/Install all the way through
4. When done, move to Step 2

---

## Step 2 — Open Terminal

Terminal lets you type commands to your Mac. Don't worry — you only need to copy and paste what's written here.

1. Press **Command + Space** on your keyboard to open Spotlight search
2. Type **Terminal** and press Enter
3. A black or white window opens with a cursor — that's Terminal

---

## Step 3 — Install Expo

Copy this line exactly, paste it into Terminal, and press Enter:

```
npm install -g expo-cli
```

You'll see lots of text scrolling — that's normal. Wait until the cursor comes back (usually 30–60 seconds).

---

## Step 4 — Move to the project folder

In Terminal, type this and press Enter (adjust the path if you put the folder somewhere else):

```
cd ~/Desktop/PadelScorePro
```

This tells Terminal to look inside the PadelScorePro folder.

---

## Step 5 — Install the app's dependencies

Copy and paste this into Terminal, press Enter:

```
npm install
```

This downloads all the code libraries the app needs. It takes 1–3 minutes. You'll see a progress bar.

---

## Step 6 — Install Expo Go on your iPhone

1. On your iPhone, open the **App Store**
2. Search for **Expo Go** and install it (it's free, made by Expo)

---

## Step 7 — Run the app on your iPhone

Make sure your iPhone and Mac are on the **same Wi-Fi network**.

In Terminal, type:

```
npx expo start
```

A QR code will appear in Terminal.

1. On your iPhone, open the **Camera app**
2. Point it at the QR code on your Mac screen
3. Tap the yellow banner that appears
4. The Padel Score Pro app opens on your iPhone!

Any time you save a change to the code, the app updates automatically on your phone.

---

## Step 8 — Test everything

Work through this checklist on your iPhone:

- [ ] Home screen shows — New Match and Padel Rules cards visible
- [ ] Tap New Match — Setup screen appears
- [ ] Choose Best of 3, Golden Point — tap Start Match
- [ ] Tap Team A panel — score goes to 15
- [ ] Keep tapping Team A to 40, then Team B to 40 — game wins immediately (golden point)
- [ ] Undo button works
- [ ] Swap Serve button moves the gold dot
- [ ] Match log updates after each point
- [ ] Win a full match — winner screen appears
- [ ] Tap Padel Rules — rules page shows correctly

---

## Step 9 — Submit to the App Store (when ready)

When you're happy with how it looks and works, these are the steps to go live:

1. Sign in to **developer.apple.com** with your Apple ID and pay the £79/year fee
2. In Terminal, run: `npx expo prebuild --platform ios`
3. Open the generated `ios/PadelScorePro.xcworkspace` file in Xcode
4. In Xcode, select your Apple ID under Signing & Capabilities
5. Connect your iPhone, select it as the target, and click the Play button to confirm it runs
6. Go to **Product → Archive** in Xcode menu
7. Click **Distribute App → App Store Connect → Upload**
8. Go to **appstoreconnect.apple.com**, fill in your app name, description, screenshots, and submit for review
9. Apple reviews in 1–3 days and then it goes live

---

## Troubleshooting

**"Command not found" when running npm**
→ Node.js didn't install correctly. Repeat Step 1.

**QR code doesn't work**
→ Make sure your iPhone and Mac are on the same Wi-Fi. Try pressing 'w' in Terminal to open in browser instead.

**App crashes on launch**
→ In Terminal press Ctrl+C, then run `npx expo start --clear` to clear the cache.

**Can't find the PadelScorePro folder**
→ Unzip the downloaded file and drag the PadelScorePro folder to your Desktop, then repeat Step 4.

---

## Need Help?

If you get stuck on any step, take a screenshot of what you see in Terminal and share it — it makes it easy to diagnose exactly what's happening.
