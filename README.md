# Nightfall Reliquary

**One soul. An endless hunger.** An original Three.js survival game inspired by the classic gameplay loop of **Vampire Survivors**.

[Play Nightfall Reliquary](https://intrepion.github.io/kata-inspired-by-vampire-survivors-codex-dot/) · [Back to Kata Arcade](https://intrepion.github.io/) · [Research and fidelity](docs/RESEARCH.md)

## The gameplay

Move through a moonlit cemetery while your weapons attack automatically. Enemies approach from all sides and deal contact damage. Their experience gems stay on the ground until you collect them. Each level-up pauses the action and offers three or four distinct weapon/passive upgrades. Build an arsenal of at most **six weapons and six passive items**. Weapons reach eight levels; passives reach five.

Six distinct attack patterns are included, with researched base-weapon rank tables:

- **Ember Lash (Whip):** horizontal strikes follow your last left/right facing; extra strikes alternate sides.
- **Star Wand (Magic Wand):** automatically targets the nearest enemy.
- **Glass Knives (Knife):** fires in your last movement direction.
- **Moon Axe (Axe):** throws upward arcs with gravity and piercing.
- **Hollow Bloom (Garlic):** a continuous aura with independent enemy hit cooldowns.
- **Orbiting Sigils (King Bible):** clockwise orbiting projectiles with active duration and downtime.

Max a weapon, hold its companion passive, and open an eligible boss chest to evolve it. This reconstruction uses chests from bosses **spawned at or after stage minute 10**. A chest dropped earlier does not become eligible just because you wait. The original has exceptions, including an early Mad Forest bat chest; those are not reproduced.

Pick up gold, healing food, a vacuum that attracts all ground gems, and a ten-second freeze. Gold remains between runs and buys permanent upgrades. The four keeper traits and powerup economy are original balancing choices.

### Two clocks

**Classic is the default:** 30 real minutes of stage time. **Quick Descent:** a clearly labeled 5× stage clock, reaching 30 stage minutes in six real minutes. Quick changes wave/boss progression, not movement, attack rates, or freeze duration. It is not Vampire Survivors' Hurry mode. At 30:00, Death appears and pursues you; reaching the boundary is not an instant victory.

### Controls

- **WASD / arrow keys:** move. Diagonals are normalized.
- **Drag on the battlefield:** virtual joystick on touch or mouse.
- **Escape / P / pause button:** pause and resume.
- **1–4 or click/tap:** choose an offered level-up card.
- **Sound button:** optional locally synthesized sounds, off by default.

Switching tabs pauses the run. Retiring keeps earned gold. Gold, powerups, and run records save in this browser's local storage; active runs do not resume after a reload. No accounts, payments, analytics, or external runtime asset requests are used. Clearing site data removes progression.

## Fidelity: what this is and is not

This is a **bounded reconstruction, not exact whole-game parity**. The central input/combat/XP/upgrade/evolution loop and base-weapon rank tables are researched. Original geometry and low-poly art replace the source assets. The simulation remains two-dimensional; Three.js provides an orthographic 3D presentation, efficient instanced crowds, gems, terrain, lighting, and spell effects.

World-unit sizes/speeds and knockback forces, enemy stats/wave schedule, XP curve, level-up weighting, character traits, gold economy, and evolved-weapon details are approximations. One procedural stage, six weapon/evolution families, eight passives, four original characters, and four permanent powerups are included. The full original roster/stages, DLC, Arcana, relics, secrets, unlock trees, achievements, map pickups, luck systems, chest reward multiplicities, and exact version-dependent rules are not. There is no copied Vampire Survivors artwork, audio, code, logo, or story.

See [the source-linked research matrix](docs/RESEARCH.md) for exact reference values and explicit implementation deviations.

## Run and test

Requires Node.js 22.12+ or 24 LTS and npm.

```sh
npm ci
npm run dev
# Open http://127.0.0.1:5220/
npm run check
npm test
npm run build
npm run preview
# Open http://127.0.0.1:5220/ (stop dev first)
```

**Always run a server and test through `http://127.0.0.1`. Never open HTML files directly or use `file://` URLs.** Three.js is bundled; no CDN dependency is required. The relative Vite base supports the GitHub Pages project path.

```sh
npx playwright install chromium
npm run test:browser
npm run capture:arcade
```

Browser scripts start their own production-build loopback server and clean browser context. The gameplay tests use actual public controls. Pure simulation unit tests cover rules without a renderer. See [validation](docs/VALIDATION.md) for the checks actually run and their limits.

## Screenshots owned by the game

`public/arcade/manifest.json` follows Kata Arcade schema v3. Two real gameplay screenshots include their original PNGs, JPEGs, source commit, UTC timestamp, served-input SHA-256 hashes, pinned Playwright/browser versions, viewport, clock, and public interaction steps. They are explicitly labeled **local gameplay captures**, not CI captures or a claim of deployment equivalence. Captures never inject a save, mutate the game's state, or alter screenshot pixels.

The capture workflow plays through a fresh Classic Keeper run until a naturally earned level-up and at least 00:32 of combat. It fixes `Date` for a repeatable initial run seed, leaving normal timers running. Timing, rendering, and platform fonts may differ across systems; this is not a pixel-identical replay guarantee. Capture failure retains the previous manifest. Review images before publishing. Integrity tests reject an empty gallery or mismatched records/hashes. Publish and verify game-owned assets before syncing their content-addressed copies into Kata Arcade.

## Project structure

- `src/game.js`: seeded, fixed-step simulation, progression, weapon tables and save validation.
- `src/scene.js`: original procedural Three.js visuals and instanced rendering.
- `src/main.js` / `src/style.css`: responsive menus, HUD, input and storage.
- `tests/`: deterministic mechanics and gallery integrity regressions.
- `scripts/`: production HTTP browser QA and genuine screenshot capture.
- `.github/workflows/deploy.yml`: checks, build and GitHub Pages deployment.

## License and acknowledgments

MIT, copyright 2026 Oliver Forral. Original code and procedural visual assets use this license. Three.js is MIT-licensed; its notice ships in [public/licenses/three-LICENSE.txt](public/licenses/three-LICENSE.txt). Vampire Survivors is the work of poncle; this independent educational project is not affiliated with or endorsed by poncle.

The combined `.gitignore` includes Linux, Windows, and macOS global templates from [github/gitignore](https://github.com/github/gitignore/tree/main/Global), plus Node/Vite-generated files. Lockfiles remain tracked.
