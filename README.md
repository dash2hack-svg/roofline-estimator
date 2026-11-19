# Roofline Estimator

Roofline is a mobile-first roofing estimating workspace with:

- Address lookup and manual/AR measurement workflows
- Multiple roof planes with pitch, area, and waste calculations
- Shingle, underlayment, ice-and-water, and ridge-cap catalogs
- Editable supplier prices and local catalog storage
- Material quantities, labor, tax, markup, tear-off, disposal, and permit costs
- Local saved jobs and proposal previews
- Offline PWA support

## Run on the web

```bash
npm install
npm run dev
```

## Install on Android or iOS

Build and serve the web app from HTTPS. In Chrome or Edge on Android, open the site and choose **Install app**. In Safari on iOS, choose **Share → Add to Home Screen**.

## Build native projects

The repository includes synchronized Capacitor Android and iOS projects.

```bash
npm run build
npx cap sync
```

### Android

```bash
npm run android:open
```

Build a debug APK from Android Studio with **Build → Build Bundle(s)/APK(s) → Build APK(s)**.

### iOS

Build and sign in Xcode on macOS:

```bash
npm run ios:open
```

Choose **Product → Archive** to prepare an App Store or Ad Hoc build.
