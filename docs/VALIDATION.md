# Validation

Validation date: 5 November 2026. All browser gameplay testing uses an HTTP server on **127.0.0.1**. No HTML file was opened directly.

## Local checks

- `npm run check`: JavaScript syntax checks.
- `npm test`: 33 tests: gallery integrity plus 32 deterministic mechanics tests, including seeded RNG, fixed-step timing, diagonal movement, modal pause, attack targeting, weapon rank data, inventory bounds, chest eligibility, XP/chest concurrency, pickups, Death, save sanitization, knockback, and bounded entity/cooldown lifetimes.
- `npm run test:browser`: the production bundle, served on an ephemeral loopback HTTP port in pinned Playwright Chromium. Checks real WebGL boot; Arcade backlink; research guide; unaffordable powerup handling; Space activation of the start button; correct W/D movement; pause/resume; help interruption; retiring/retrying; quick-mode stage-clock rate; 390×844 mobile overflow and pointer drag direction. No debug state injection is used.
- `npm run build`: production Vite bundle with locally bundled Three.js.
- `npm audit`: zero known dependency vulnerabilities at this checkpoint.
- A review simulation exercised a maximum upgraded/evolved loadout through all 30 stage minutes. It remained bounded (277 projectiles, four zones, 240 gems and 100 pickups at the observed checkpoint). This is a stress test, not proof of natural balance or exact original-game parity.

Review found and corrected a chest-plus-XP level-up loss, the garlic visual/damage-radius mismatch, long-drag direction distortion, and blocked Space activation on focused controls. Focused regressions cover the underlying fixes.

## Gameplay screenshots

`npm run capture:arcade` serves the production build, enters a fresh Classic Keeper run through public controls, naturally earns and selects upgrades, and captures the level-up screen and at least 00:32 of combat. Original PNG pixels, JPEGs, input hashes, capture record and local provenance are retained in `public/arcade/`.

This is a focused gameplay check and visual review, not an exhaustive 30-minute human playtest, a proof that every build is balanced, or complete accessibility/performance certification. The full retail game and its DLC are outside the implementation scope. Desktop Chromium and a mobile-sized Chromium viewport are tested; physical phones and other browser engines are not.

## Publication checks

The workflow runs syntax, unit and browser checks before publishing GitHub Pages. Final publication includes verifying the expected remote commit, terminal workflow success, live game HTML, and all manifest-referenced screenshot/evidence/input hashes. Kata Arcade is updated only after that verification, then its checks/build and live detail/gallery routes are checked separately.

Publication outcomes are recorded in the delivery report; this document describes the checks rather than asserting that an unobserved future run passed.
