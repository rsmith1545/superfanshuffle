# SuperFan Shuffle — Deploy to superfanshuffle.com (GitHub Pages)

This folder is the complete, self-contained SuperFan Shuffle site. Once it's on
its OWN domain, the PWA installs cleanly (no Crown Your Champion scope collision).

Files here:
- index.html ............ the neon STORE / home (what superfanshuffle.com opens to)
- play.html ............. the tilt game (opens when you tap "Try 5 free")
- manifest.webmanifest .. PWA manifest (root scope)
- sw.js ................. service worker (offline + installability)
- icon-192 / 512 / 512-maskable / apple-touch-icon .. app icons (neon vinyl)
- CNAME ................. tells GitHub Pages the custom domain (already set to superfanshuffle.com)
- .nojekyll ............. serve files as-is

------------------------------------------------------------
STEP 1 — Create the repo
------------------------------------------------------------
1. Go to github.com -> New repository
2. Name it (e.g.) "superfanshuffle"  (Public)
3. Do NOT add a README/license (keep it empty)
4. Create repository

------------------------------------------------------------
STEP 2 — Upload these files
------------------------------------------------------------
On the empty repo page: "uploading an existing file"
- Drag in ALL files from this folder (including CNAME and .nojekyll)
  Tip: if your file browser hides .nojekyll, you can also create it in GitHub:
  Add file -> Create new file -> name it ".nojekyll" -> Commit.
- Commit to main.

------------------------------------------------------------
STEP 3 — Turn on GitHub Pages
------------------------------------------------------------
Repo -> Settings -> Pages
- Source: "Deploy from a branch"
- Branch: main   Folder: / (root)   -> Save
- Under "Custom domain" it should already read superfanshuffle.com (from CNAME).
  If not, type it and Save.

------------------------------------------------------------
STEP 4 — Point the domain (at your registrar's DNS)
------------------------------------------------------------
Add these DNS records for superfanshuffle.com:

Apex (host "@"): four A records ->
    185.199.108.153
    185.199.109.153
    185.199.110.153
    185.199.111.153

(optional IPv6, host "@"): four AAAA records ->
    2606:50c0:8000::153
    2606:50c0:8001::153
    2606:50c0:8002::153
    2606:50c0:8003::153

www: one CNAME record ->  host "www"  value  rsmith1545.github.io

GitHub's Settings -> Pages screen also lists the exact records for your repo —
match those if they differ.

------------------------------------------------------------
STEP 5 — HTTPS + install
------------------------------------------------------------
- Wait for DNS to propagate (usually <1 hr, up to 24 hr).
- Back in Settings -> Pages, tick "Enforce HTTPS" once it becomes available.
- Visit https://superfanshuffle.com -> the neon store loads.
- Android Chrome: the "Install App" button appears (or menu -> Install app).
- iPhone Safari: Share -> Add to Home Screen.

Because it's now its own domain (own origin), it installs as its OWN app —
neon vinyl icon, "SuperFan Shuffle" — with zero Crown Your Champion overlap.
