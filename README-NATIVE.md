# SuperFan Shuffle — Native App (Capacitor)

This branch (`native-app`) wraps the existing web game in a native iOS/Android
shell **without changing the web version**. All native behavior is feature-detected:
on the plain web PWA nothing changes; inside the app you get true fullscreen,
real device landscape lock, real haptics, and reliable keep-awake.

The web files at the repo root stay the single source of truth (still what
GitHub Pages serves). `scripts/build-web.js` copies just the web assets into
`www/`, which is what the app bundles.

---

## One-time setup (on your Mac)

Prereqs: macOS with **Xcode** installed, **Node.js**, and an **Apple Developer
account** ($99/yr) for running on a real device / TestFlight.

```bash
git checkout native-app
npm install            # installs Capacitor + plugins
npm run ios:add        # builds www/ and creates the ios/ Xcode project
npm run ios:open       # opens the project in Xcode
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities** → pick your Team.
2. Plug in your iPhone, select it as the run destination.
3. Press **Run (▶)**. The game launches fullscreen — no status bar, real
   landscape lock, real haptics.

---

## After you change the web game

Any time you edit `index.html` / `play.html` / `native.js` etc.:

```bash
npm run ios:sync       # rebuilds www/ and copies it into the app
```
Then Run again in Xcode. (No need to re-add the platform.)

---

## What the native shell turns on

| Capability | Plugin | Where it's wired |
|---|---|---|
| Hide status bar (fullscreen) | `@capacitor/status-bar` | `native.js` on launch |
| Real landscape lock (no CSS hack) | `@capacitor/screen-orientation` | `play.html` start/end of round |
| Real haptics (iOS ignores web vibration) | `@capacitor/haptics` | `buzz()` in `play.html` |
| Keep screen awake | `@capacitor/keep-awake` | during each round |

On the web build, `SFS.native` is `false` and all of the above are no-ops —
the CSS fake-rotation path still runs, exactly as the live site does today.

---

## Android (optional, later)

Same project, buildable on Windows too. One-time Google Play fee is $25.

```bash
npm install @capacitor/android
npm run build:web && npx cap add android && npx cap open android
```

---

## App Store notes (read before submitting)

- **Guideline 4.2 (minimum functionality):** a bare website-in-a-box gets
  rejected. This build adds native fullscreen, orientation lock, haptics, and
  offline play, which is what satisfies that bar. Add a proper app icon + splash.
- **Payments:** selling vault unlocks (digital goods) inside the app requires
  Apple In-App Purchase — 15% under the Small Business Program (you), 30% otherwise.
  Decide the payments model before public launch. (Verify current external-link
  rules at submission time; they've been changing.)
- **Icons/splash:** set in Xcode (Assets) or via `@capacitor/assets`.

---

## App identity

- Bundle ID: `com.hutchdesign.superfanshuffle` (change in `capacitor.config.json`
  and Xcode if you want a different one — pick it before your first TestFlight upload).
- Display name: **SuperFan Shuffle**
