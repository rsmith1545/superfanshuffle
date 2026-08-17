# Project Memory — Rose / Hutch Design (Russell Smith)

Auto-read by Cowork/Claude when working in a folder containing this file. Captures context
for two sister products so any new session (laptop or desktop) picks up without re-explaining.
Keep it updated + re-commit to both repos as things change.

Git identity for commits: user.name "Rose", user.email "accounting@hutch-design.com".
GitHub owner (personal, not an org): **rsmith1545**.
Deploy = `git push` to `main` (GitHub Pages auto-builds ~30–60s).
If a Pages "deploy" step fails ("try again later") it's a transient GitHub hiccup — re-push or
Re-run failed jobs (an empty commit re-triggers).

### DEPLOYING FROM A CLOUD COWORK SESSION — read this before promising a push (Aug 16 2026)
**A cloud Cowork session CANNOT push. Do not ask the user for a PAT — it cannot help.**
The sandbox egress proxy refuses the repo before credentials are ever considered:
> `access denied by the git proxy: rsmith1545/superfanshuffle is not in this session's`
> `authorized repository set ... To fix, add the repository to the session's sources.`
Same 403 for crownyourchampion. `api.github.com` root answers 200 but every `/repos/...`
path is intercepted too, so the REST API is not a side door. There is no `add_repo` tool
exposed in Cowork. Reads (`git ls-remote`, `git fetch`, `git clone`) DO work — which is how
you verify what is actually live. Claude Code on the web (claude.ai/code) is the surface that
can push; Cowork is not.

**THE WORKFLOW (set up Aug 16 2026, works — first deploy 827355f → e9252e4):**
1. Claude writes the finished files into `Crown Your Champion\_sfs-outbox\` over the
   desktop bridge (SendUserFile → device_commit_files).
2. Optionally writes a one-line commit message to `_sfs-outbox\_message.txt`.
3. **The user double-clicks `_sfs-outbox\SFS-DEPLOY.bat`.** That is the whole handoff.
4. Claude verifies with `git ls-remote` / `git fetch` + md5 compare against its local copy.

What the .bat does: finds git (PATH / Program Files / GitHub Desktop's bundled copy) →
clones to **`C:\Users\rsmit\sfs-repo`** on first run → `fetch` + `reset --hard origin/main`
+ `clean -fd` every run (so the clone CANNOT drift) → copies every outbox file except
`SFS-DEPLOY.bat` / `README-DEPLOY.md` / `_message.txt` → commit → push → moves what shipped
into `_sfs-outbox\_sent\` → prints the new build tag. Refuses to make an empty commit.

- **The clone is at `C:\Users\rsmit\sfs-repo`, deliberately OUTSIDE Google Drive/OneDrive.**
  `Crown Your Champion` is Drive-synced (it has a `.tmp.driveupload`) and half-written files
  are what corrupted sandbox reads in earlier sessions. Never move the clone into a synced tree.
- **Auth = Git Credential Manager → "Browser"**, not a token. The user signs in at GitHub once;
  Windows remembers it. Never accept a pasted PAT — it cannot work from here anyway, and it
  lands in the chat log. (Two PATs were pasted July/Aug 2026 and never transmitted; both
  should be treated as burned and revoked.)
- The .bat window closing without output usually just means it FINISHED. Verify at the remote,
  not by asking the user what he saw.

**DEAD PATHS — do not use:**
- `_deploy-v172\` — the old manual GitHub-web-upload folder. Superseded.
- `SuperFanShuffle-github\` — ~40 commits stale (its index.html is 71KB vs the live 193KB),
  never fetched, its "uncommitted changes" are pure CRLF churn. Do not push from it.

------------------------------------------------------------
## Product 1 — Crown Your Champion (CYC)  [MATURE / LIVE]
------------------------------------------------------------
- Live: https://crownyourchampion.com · Repo: rsmith1545/crownyourchampion (GitHub Pages)
- Static PWA of 64-song music-bracket tournaments. Backend = Firebase Firestore + GA4.
- Identity: gold-on-dark, regal (distinct from SFS's neon).
- Status: **49 brackets live** (32 hand-built + 17 generated). Album vote = **49/49**.
  Previews baked from iTunes (permanent audio-ssl.itunes.apple.com m4a URLs; Deezer expires — never use).
- Note: CYC hub PWA manifest_hub.json has scope "/" — it claims the whole origin, which is why
  a second PWA can't install separately under crownyourchampion.com (the reason SFS got its own domain).

### CYC data model — the traps (learned the hard way, July 17 2026)
- **roster.json is the source of truth (49)** but every bracket page embeds a COPY as
  `var CYC_ROSTER`. It feeds `cycNextData()` = the post-crown "What's Next?" pick, NOT the
  All-Brackets menu (that's 49 hardcoded `.qm-chip`s on every page — it was never broken).
  Adding a bracket = re-sync the embedded copy or new brackets never get suggested. Will drift
  again; the durable fix is fetching roster.json at runtime.
- **17 older bracket pages have NO CYC_ROSTER.** They use a hardcoded `NEXT = {picks:[...]}` with
  2 hand-picked neighbours (rhcp → Foo, Pearl Jam). Editorial, not stale. They'll never suggest a
  new bracket — decide separately.
- **`pick()` reads `innerText`** to advance a winner and writes it to the next slot AND Firebase.
  Any CSS that changes rendered text (clamp/truncate) risks writing a TRUNCATED title to real data.
  Verified: `-webkit-line-clamp` does NOT change innerText. Still — test before shipping.
- **The title CANNOT be wrapped in a span.** `pick()` does `target.innerText = text`, which replaces
  the target's children with a bare text node — any wrapper dies on the first advance, precisely in
  the R2/Final-Four boxes that overflow.
- **`.round-col` is `justify-content:space-around`** → gaps are LEFTOVER space. Oversized boxes eat
  them. "Round 2 has no gap" is a SYMPTOM of box overflow, not its own bug.
- **Region panels** are `.venue-gorge/spac/westpalm/camden` — DMB venue names on all 49, because
  everything was cloned from the DMB template. They are decoration with NO meaning (chips are all
  gold; there is no legend). Now uniform `rgba(56,96,72,.46)` ("Oyster Bay", renders #16242a) on 48.
  **DMB is deliberately excluded** — its panels are real venue PHOTOS (bg-gorge.jpg etc). Its regions
  ARE those venues. Don't flatten it.
- **Two `</head>` in bracket pages** (one inside a JS string). Inject late CSS as a
  `<style id="cyc-*">` after the last `</style>` — the file's own convention.
- **Blurbs must never mention seeding/streams.** Rose killed it ("streamed by who? not our
  audience"). A 2-line clamp was HIDING the tail on 30 of 51 homepage tiles; widening to 3 lines
  re-exposed it. All 51 cleaned July 17.

------------------------------------------------------------
## Product 2 — SuperFan Shuffle (SFS)  [ACTIVE BUILD]
------------------------------------------------------------
- Live: https://superfanshuffle.com · Repo: **rsmith1545/superfanshuffle** (GitHub Pages, OWN origin)
  · Domain via Namecheap DNS (apex A-records to GitHub Pages 185.199.108-111.153, www CNAME→rsmith1545.github.io).
- Install-to-play PWA "Heads Up"-style music party game. Phone on forehead: tilt DOWN = correct
  (green), tilt UP = pass (orange).
- Identity (LOCKED): NEON nightlife. Deep purple base, cyan + magenta neon. Logo two-tone
  "SUPERFAN"(cyan)/"SHUFFLE"(magenta) in a neon-tube frame. Tagline "Face the Music."
  Fonts: **Bebas Neue** (display) + **Barlow** (body). Western/gunslinger theme RETIRED.

### File structure (repo root = superfanshuffle.com root)
- index.html = neon STORE / home (domain opens here). play.html = the tilt game.
- manifest.webmanifest (display: fullscreen), sw.js (v3, network-first for docs + only caches OK responses so a bad deploy can't
  white-screen the app; page updates show on relaunch), icon-192/512/512-maskable + apple-touch-icon (neon vinyl), CNAME, .nojekyll.
- Local ready copy also in this folder: ./SuperFanShuffle-site/ . CLAUDE.md committed to BOTH repos.

### Product model (UPDATED per home-screen spec July 2026 — retires the old 4-games/tiered model)
- **Vault = an artist** (Taylor Swift, Gracie Abrams…). SFS is **ONE mixed game per vault** —
  songs + lyrics + lore all shuffled together (NOT 4 separate games; don't count/​reveal modes).
- Monetization: **5 free questions, then $0.99 to unlock the rest.** This is the **inherited default
  behavior of the vault template** (not a per-vault toggle) — any artist added to Firebase later
  auto-inherits it. IP-safe: never plays copyrighted audio / never shows a continuous lyric run.
- **NO counts anywhere on tiles** (no "Vol. 1", no "X / 250 shuffled", no "4 games inside", no pool
  size). A ceiling disappoints; only the free-preview FLOOR is allowed — the "5-question taste" pill.
- Keep free/seasonal tiles + the "3 days left" FOMO badge (the acquisition engine).
- **Editions** = top-tab filter: **Music · Film & TV · Sports** (TV folded into Film & TV). Music is the
  only live edition; Film&TV + Sports are **hidden behind a server-side Firebase flag** (editions.<id>.enabled),
  GENERIC non-IP placeholders only. Sports gets one LIVE free seed: **"The '85 Shuffle"**. DEV_PREVIEW=true
  renders the hidden tabs during build; set false for prod.
- **Per-edition ACCENT tint** (glows only, chrome stays dark, NEVER aqua=nav): Music=purple, Film&TV=gold/amber,
  Sports=yellow-orange. Chrome = dark header + dark bottom bar framing a **lighter-purple content zone**.
- **No "X days left" countdown** for now (no rotation calendar yet) — free tiles show just "FREE".
  Category shelf order (render only if ~3+ tiles; See All when >9): Best Of · Pop · Hip-Hop & R&B · Country ·
  Alt & Grunge · Classic Rock · Singer-Songwriter · Jam · Indie. Layout: Free This Week → Featured (whole card
  clickable, no button) → Recently Added → category shelves.
- **Nav:** bottom tabs = **Play · Explore · My Vaults** (Play=home, default; active tab glows aqua). Editions =
  top tabs inside Play. Never ship "Home/Store/My Brackets". Pin **Free This Week** at top of each edition.
- Charts (Music): Featured of the Week, Top in Pop / Rock / Hip-Hop.

### Current state (deployed + working)
- PWA installs cleanly on Android (own origin). Store: neon vault tiles (vinyl aesthetic),
  edition top-tabs (Music live; Movies/TV placeholder, flag-gated), pinned Free strip, bottom nav
  (My Vaults / Store), Install button + iOS hint. Free vaults direct-launch the 5-question taste;
  paid vaults open a sheet: "Play 5 free" + "Unlock the full vault · $0.99". No counts shown anywhere.
- Tilt mechanic PROVEN on Android (accelerationIncludingGravity.z, orientation-agnostic).
  Direction is platform-aware: `DOWN_IS_GOOD = IS_IOS ? 1 : -1` (Android confirmed -1; iOS is a
  best-guess +1, flip that one value if reversed on a real iPhone).
- Game flow: Ready waits for portrait→landscape → pulsing "TIME TO FACE THE MUSIC" (fanfare) →
  pulsing 3-2-1 → the WHOLE rounded card SPRINGS in (translateX overshoot / spring); text is STATIC.
  Correct = bright-green card + glow (hero) + bell; Pass = orange + buzz; last-10s clock pulses +
  tick-tocks; buzzer → red "TIME'S UP" card → recap. Distinct Web-Audio sounds (no files):
  bell/pass-womp/countdown-beep/fanfare/clock-tick/buzzer.
- Visual: colored ROUNDED card floating on BLACK (black margin all sides), thick white/neon border.
- Fullscreen: manifest display:fullscreen PLUS `goFullscreen()` requestFullscreen on first tap
  (store) and Play tap (game) → hides Android status + nav bars. Landscape locked during play via
  screen.orientation.lock (installed PWA) with a CSS fallback (force-render landscape when portrait);
  released at the report card.
- Haptics: `buzz()` helper with beefed-up patterns (correct double-buzz, pass solid, time's-up alarm).
- ALL 4 "Try 5 free" currently launch the SAME generic tilt demo (placeholder songs). The 4 modes
  and real per-vault content are NOT built yet.

### iOS / cross-platform notes (tested on a real iPhone — updated July 5 2026)
- **Tilt:** direction sign may be reversed vs Android — DOWN_IS_GOOD set to +1 for iOS as a guess; confirm on device.
- **Fake-landscape rotation (iOS PWA):** an installed iOS PWA never physically rotates, so during play we rotate the
  content in CSS. As of the July 2026 fix the rotation lives on an OUTER `#stage` wrapper while the card's spring
  animation stays on `#app`. Previously BOTH were on `#app` and the transforms fought each other — that is what made
  the game card off-center with no margins. Countdown / "Face the Music" screens now also get `lock-ls` so the whole
  play flow is consistently landscape (not just the game). `#score`/`#hint` are position:absolute so they rotate with
  the panel. Android uses REAL rotation (the @media(orientation:portrait) rule just doesn't apply there).
- **Status bar CANNOT be hidden on iPhone** (Apple limit). iOS has no Fullscreen API — goFullscreen() no-ops on iPhone
  (works on Android). Because the iOS PWA stays physically portrait during play, the real status bar sits at the physical
  top and shows even in the rotated game (it does NOT auto-hide — the device isn't truly landscape). On the web the best
  we can do is black-translucent so the clock floats on black. TRUE fullscreen requires the native wrapper (see below).
- **Audio + iOS silent switch:** Web Audio is muted by the ring/silent switch. `unlockAudio()` (play.html) plays a
  near-silent looping media element on the Tap-to-Play / Play Again tap to shift the audio session to "playback" so the
  synth sounds come through. Best-effort — also tell users to check the physical ring switch.
- **Haptics:** iOS Safari IGNORES navigator.vibrate entirely — buzz() does nothing on the iPhone web build. Real haptics
  only come from the native wrapper.
- **Motion permission:** iOS requires the DeviceMotion/Orientation grant per fresh launch (security) — no web way to make
  it permanent. Guarded so it prompts once per session, not per round.
- **Screen sleep:** Wake Lock API (navigator.wakeLock) holds the screen on during a round (Android + iOS 16.4+),
  re-acquired on return to foreground, released at game end.

### SFS rank palette (LOCKED — July 18 2026) + icon system
- Vault tiles carry a RANK COLOR (most-played carousel position 1–10):
  1 Gold #C99E4A · 2 Silver #C4C8CC · 3 Bronze #A87042 · 4 Teal #36B0AC · 5 Crimson #C43E3E ·
  6 Coral #E07A5F · 7 Forest #5B8A5B · 8 Sky #7FB3D5 · 9 White #F4F4F6 · 10 Blush #D9A3B3
- Ranks 1–3 = the podium: labeled GOLD/SILVER/BRONZE VAULT. Ranks 4–10 all say SUPERFAN VAULT —
  the color alone carries position.
- **NAVY IS BANNED** — tested 1.1:1 contrast against the purple body, invisible. Its removal is why
  Blush holds rank 10 (Sky is rank 8). Never reintroduce it.
- Crimson (5) and Forest (7) are the weakest on dark backgrounds — check them in every render review.
- Hex codes are for Cowork/CSS only. Gemini image prompts use DESCRIPTIVE words ("trophy gold,
  brushed metallic") — it won't obey hex.
- Brand colors are SEPARATE from the rank palette: cyan/aqua = SUPERFAN (nav, brand, active states,
  scrubber); magenta = SHUFFLE (action, FREE/FOMO badges, urgency). Never use aqua as a rank tint.
- **Icon system by artist era** (each icon rendered in all 10 rank colors):
  Records = 60s/70s (Logos/Icons/Record/cut — DONE, look good; rank color goes in the center label).
  Tapes = 80s (Logos/Icons/Casesette Tape). CDs = 90s/00s (Logos/Icons/CD SFS; working folder
  "SFS CD Test" in the main CYC folder). Stream = anything later (uses "SFS Vault Card" in main CYC folder).

### STANDING RULES — SFS regressions that keep coming back (DO NOT reintroduce)
- **Play tiles NEVER show rank numerals.** The Netflix-style numeral belongs only to a deliberately
  ranked carousel — it must never appear on the Play/home shelves. The numbered `rankTile`/`rankedShelf`
  helpers + the `.rank .num` CSS were DELETED (Aug 2026) so numerals can't sneak back. If a numbered row
  is ever wanted again, build it as its own opt-in function; do not restore `.rank .num` globally.
- **Every ACTIVE vault must have an `art-<id>.jpg` (900×1200) AND an entry in the `ART` map.** A missing
  file makes `coverHTML`/`flipFront`/`v5poster` fall back to an ugly TEXT placeholder (the "Grateful Dead
  bug"). When adding/renaming a vault, add its poster in the same commit. Fixed Aug 2026: gratefuldead,
  hendrix, codyjohnson, laineywilson (newpopqueens is a collection with no dedicated poster → intentional
  text fallback). Similar-artist tiles on the report card also pull `art-<id>.jpg`, so any vault used as a
  cross-sell needs art too.

### RECORD tile MASTER TEMPLATE (APPROVED July 19 2026) — Logos/Icons/Record/template/
- **DO NOT recreate record tiles with Gemini/image gen.** Fully scripted:
  `template/make_record_tile.py` (Python 3 + Pillow + numpy; playfair.ttf next to it).
  `python3 make_record_tile.py "<cut/tile-{color}.png>" "<cut/record-{color}.png>" "Artist Name" "<out.png>"`
  — BOTH inputs must be the SAME color; output 512x512 (the app tile size).
- Works by EDITING the existing approved tiles: erases only the artist zone (blends clean
  pixels from the blank record-{color} render — verified tile == straight 512 downscale),
  re-typesets in Playfair 700 with ink auto-sampled from that tile's original text. The
  SUPERFAN SHUFFLE / VINYL LP block, curved rim text + symbols stay byte-identical.
- Line metrics measured off the masters: 1 line y188 (Nirvana) · 2 lines y160/215 (Taylor)
  · 3 lines y145/187/230 (RHCP = the master, longest name). Read
  `template/README-RECORD-TEMPLATE.md` first.
- Approved proofs in `template/proofs/` (rec_proof2_approved.png = sign-off:
  original bronze · regenerated RHCP · new Led Zeppelin teal · new Queen gold).

### STREAM tile v2 (APPROVED July 18 2026) — Logos/Icons/Stream Player/stream-tile-v2-approved.html
- Replaces the ghost-name art with a 2-over-1 THREE-CARD CLUSTER (signals "card game"):
  SONG top-left IN FRONT (full short song title) · LORE tucked top-right BEHIND it — its
  label sits in its own top-RIGHT corner, its answer = artist/lead-singer LAST NAME placed
  to start exactly where the SONG card ends (first name reads as hidden underneath) ·
  ALBUM bottom-front = the artist's MOST RECOGNIZABLE album (never self-titled dup),
  cropped by the art-zone edge a few px BELOW its answer — chrome starts immediately after.
- Tile is now 150x198 portrait; art zone 120px; "Greatest Hits" caption REMOVED; no rank
  number inside the tile (rank number lives only in the label below the icon).
- Cards match the in-game look (white border, diagonal hatch, purple gradient); card glow +
  art-zone wash use the vault --tint; type labels keep FIXED mode colors (Song=cyan,
  Lore=magenta, Album=gold). Layout/rotations are constant — only content + color per artist.
- NOTE: .gcard uses box-sizing:border-box (the rest of the file is content-box) — the
  tuck offset (padding-left:50px) depends on it. Preview PNG sits next to the html.

### TAPE tile MASTER TEMPLATE (APPROVED July 18 2026) — Logos/Icons/Casesette Tape/template/
- **DO NOT recreate tape tiles with Gemini/image gen.** Fully scripted:
  `template/make_tape_tile.py` (Python 3 + Pillow + numpy; bebas.ttf + caveat.ttf next to it).
  `python3 make_tape_tile.py "<Clear Square Cassette2.png>" "Artist Name" "<out.png>" --hex 36B0AC`
- Source = ONE neutral render: `Casesette Tape/Clear Square Cassette2.png` — the script
  colorizes the clear plastic to ANY rank hex (white label + dark reels protected), so the
  10 old colored cassette renders are NOT needed for this template.
- Approved look: top insert strip = dynamic band name (Bebas, rank-tinted paper, the
  CD-disc-face equivalent) · white label = static Caveat script "Mix-Tape" above the reel
  window + smaller "SuperFan Shuffle" below it · reels stay visible (era-tag, no text) ·
  shell tints to rank color. Read `template/README-TAPE-TEMPLATE.md` first (rules + knobs).
- Approved proofs in `template/proofs/` (tape_proof_v3c_approved.png = sign-off). Proof
  artists were TESTS; per-rank artists TBD. The earlier "J-card + loose tape strip" concept
  and the "SFS CD Test"-era experiments are RETIRED — this Clear Square concept replaces them.

### CD tile MASTER TEMPLATE (APPROVED July 18 2026) — Logos/Icons/CD SFS/template/
- **DO NOT recreate CD tiles with Gemini/image gen.** The approved look is fully scripted:
  `template/make_cd_tile.py` (Python 3 + Pillow + numpy; `playfair.ttf` sits next to it).
  One command per tile, pixel-repeatable:
  `python3 make_cd_tile.py "<1. CD Gold.png>" "Artist Name" "<out.png>" --size 1024`
- Read `template/README-CD-TEMPLATE.md` FIRST — it documents the approved rules (full-case crop,
  auto word-split with ONE shared font size, bottom text clear of the hub, GREATEST HITS on the
  spine, tray paper + background auto-tinted lighter shades of each disc color) and the tuning knobs.
- Approved proofs in `template/proofs/` (proof_sheet4_approved.png = the sign-off).
  Proof artists (DMB/Pearl Jam/Radiohead/RHCP) were TESTS — final per-rank artists TBD.
- All 10 source renders share identical geometry (constants in the script header) — if a new
  source render is ever generated, re-verify before trusting output.

------------------------------------------------------------
## Native app path — Capacitor (cross-platform iOS + Android)  [SCAFFOLDED · branch: native-app]
------------------------------------------------------------
- WHY: the iPhone web PWA can't hide the status bar, has no real haptics, and relies on the fragile CSS fake-rotation.
  A Capacitor native shell around the SAME web game fixes all of it — true fullscreen, REAL OS landscape lock (deletes
  the #stage hack), real haptics, reliable keep-awake, remembered permissions. ONE codebase → both iOS and Android.
- Lives on branch **`native-app`** (main / live web PWA untouched). Files added there:
  package.json + capacitor.config.json (appId **com.hutchdesign.superfanshuffle**, webDir=www);
  native.js (feature-detected bridge: SFS.native + lockLandscape / hideStatusBar / keepAwake / haptic — all no-ops on
  the web); scripts/build-web.js (copies web assets into www/); README-NATIVE.md (the Mac/Xcode runbook). play.html +
  index.html load native.js and take the native path only when SFS.native is true; web behavior is unchanged behind guards.
- BUILD (needs a Mac + Xcode + Apple Developer acct $99/yr): `git checkout native-app` → `npm install` →
  `npm run ios:add` → `npm run ios:open` → in Xcode set signing Team, plug in iPhone, press Run. Own phone via cable
  (free Apple ID works but the app expires in 7 days; paid = 1yr + TestFlight). Share via **TestFlight** (up to 10k
  testers, no full review). Android later: `npm install @capacitor/android && npx cap add android` (buildable on Windows, $25 Google one-time).
- App Store gotchas: Guideline 4.2 (must feel like an app, not a bare web wrapper — our native features clear it);
  vault-unlock payments must use Apple In-App Purchase (**15% Small Business Program** / 30% otherwise) — decide the
  payments model before public launch. Add a proper app icon + splash.
- WORKFLOW: keep iterating gameplay / content / look on the WEB (fast loop: push → live ~60s, testable in any browser).
  Only go to Capacitor/Xcode to test native-only things (fullscreen, real rotation, haptics). When the game feels done,
  wrap + TestFlight. The native scaffold is fully guarded, so merging native-app → main is safe (no visible change to the
  live site) and keeps ONE codebase — offered, not yet done.
- Reference doc (local, not in repo): **SuperFanShuffle-Native-Wrapper-Guide.md** in the SFS folder.

------------------------------------------------------------
## Session log — July 17 2026 (CYC: albums complete + homepage mobile + bracket ticket)
------------------------------------------------------------
### SHIPPED (all pushed to main, verified live)
- **Album vote now 49/49.** 111 albums / 1699 tracks from the Master Grid "Add Album Data" tab,
  97.5% with an iTunes preview. preview-urls.json 863/864 (99.9%).
  Rose's rules: Selena merged with The Scene (8 albums); Rihanna 15→9 and JT 9→6 (studio-only,
  matching the existing 32). Blank Type = Studio.
- **Homepage mobile pass**: cards 78% of row (tuned for the PEEK — arrows are desktop-only, so the
  peek is the ONLY scroll signal), 3-line desc, uniform 218px cards, 24px section rhythm, 14px
  head→card, logo un-shrunk, Reddit link now gold+underline.
- **Folk genre renamed** "Folk · Jam · Indie" — 151 occurrences across 52 files. It's the category
  KEY in CYC_ROSTER, not just a header; the picker groups by string equality.
- **Search**: artist-name only, WORD-PREFIX ("em"→Eminem, not Stone Temple Pilots), dots stripped
  ("big"→Notorious B.I.G.). Known gap: "ccr" finds nothing (acronym ≠ prefix) — Rose is building an
  ALIAS TABLE for this.
- **CYC_ROSTER 33→49** on 32 pages. Hip-Hop pool was ZERO — finishing Eminem suggested nothing.
- **Region gradient** unified to Oyster Bay on 48 (11 different colour-sets before). DMB excluded.
- **ON THE LIST chip** green → muted gold (billyjoel only so far).

### OPEN — the bracket-page ticket
1. **Title clamp — BLOCKED, do not retry blind.** `display:-webkit-box` computes to **`flow-root`**
   on `.slot` even when forced INLINE with `!important` (CSS.supports says it's valid). Something
   blockifies it → legacy `-webkit-line-clamp` never engages → `overflow:hidden` just clips harder.
   I shipped this and it was WORSE than the bug (45px box vs the old 77px = more text hidden, no
   ellipsis). Reverted in 581095e.
   **THE TEST IS `scrollHeight <= clientHeight + 2`** on the Miami slot — NOT "are the heights
   uniform". Uniform heights are what CLIPPING looks like; that's exactly how I fooled myself.
   Worst cases: Billy Joel (Miami 2017, Lullabye, Movin' Out), Ariana ("break up with your
   girlfriend, i'm bored").
2. **All Brackets search inside bracket pages** (Rose asked; wants to compare non-BJ options).
   NOTE: chips are hardcoded DOM, not roster-driven — filter the DOM. The homepage filter is scoped
   to `#bracketPickModal`; check the bracket-page modal id before porting.
3. **Region naming**: drop the location, just "Region 1..4". Order = R1 top-left, R2 top-right,
   R3 bottom-left, R4 bottom-right. The regions array is DOM-SLOT indexed [TL, BL, TR, BR] → write
   it 1, 3, 2, 4. 16 brackets currently say "Region 1 (Top Left)".
4. **ALBUM vs BRACKET on homepage cards**: same 15px, ALBUM already `--muted`. But `#7c89a6` is a
   light blue-grey that goes BRIGHT on near-black while gold `#f0a500` is mid-tone — the hierarchy
   is inverted by LUMINANCE, not size. Fix = dim ALBUM (~#5a6478), not shrink it.
5. Biggie 31/32 previews — "Party And Bullshit" is a 1993 Grimey Records film-soundtrack cut, not in
   the US Apple catalog; Spotify licenses it in Kosovo only. Rose: leave blank.
6. Mobile bracket page untouched this session.

### PROCESS NOTES (read these before the next CYC session)
- **I can test mobile**: an iframe gets its OWN viewport, so media queries resolve for real.
  `iframe 412px → contentDocument`. I spent hours saying "can't verify mobile" while reasoning
  through geometry I could have measured.
- **Tiles have a `rise` animation** whose FROM state is `translateY(18px)`. Measure a card before it
  settles and every vertical number is 18px wrong.
- **`.tile-wrap` vs `.tile`**: three separate bugs came from a rule targeting `.tile` losing to one
  targeting the carousel (palette, 10-cap, search). `.tile-more` (All Others) is a DIRECT carousel
  child; `.tile-wrap` is not. Check specificity every time.
- **Never sample one file and report it as the set.** Did it twice today (said "no purple exists"
  after checking only billyjoel — 35 brackets had magenta; said "all 32 brackets are affected" from
  one bracket).
- **iTunes**: `/search` returns EMPTY through the proxy — only `/lookup` works. web_fetch truncates
  at ~70KB MID-STRING; a smaller `limit=` does NOT help (the cap is on the transport and /lookup has
  no pagination) — salvage complete records from the truncated text instead.
- **OneDrive/Excel**: a file open in Excel leaves a `~$` lock and reads as a truncated zip. Also
  seen: the mount pads the file with ~66KB of trailing zeros, pushing the zip's EOCD outside the
  65,557-byte search window → "not a zip file". Fix = find `PK\x05\x06`, truncate there, then open.

------------------------------------------------------------
## Session log — July 5 2026 (iOS fixes + native scaffold)
------------------------------------------------------------
- Pushed to **main**: audio silent-switch unlock + safe-area centering + sw v3 (ca3ab59); screen wake lock (2d6cad6);
  #stage rotation refactor + rotated countdown screens + single motion prompt per session (c9f20ce).
- Pushed to **native-app** branch: full Capacitor scaffold (see section above).
- OPEN / needs device confirm: card centering after the #stage refactor (awaiting a fresh iPhone screenshot); iOS tilt
  direction (DOWN_IS_GOOD +1 guess).
- Reminder: repo is cloud-synced via OneDrive — the bash sandbox sometimes reads half-synced files. Work from a fresh
  /tmp clone and push (the reliable path); the Read tool sees the authoritative OneDrive copy.

### UX preference — IMMERSIVE PREFERENCE (Aug 2026)
- Rose wants **immersive / true full-screen for EVERYTHING** (edge-to-edge behind the status bar). SFS is already configured for this: both index.html + play.html have viewport-fit=cover + apple-mobile-web-app-status-bar-style=black-translucent + mobile-web-app-capable; manifest display:fullscreen (display_override [fullscreen,standalone]). This ONLY manifests in the INSTALLED PWA (Android hides the status bar; iOS floats it translucent). In a browser TAB the browser's own bar always shows — not fixable in code. Full-screen surfaces must fill top:0 with content padded by max(env(safe-area-inset-top),Npx).
