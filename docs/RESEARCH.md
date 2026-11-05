# Vampire Survivors: source-based mechanics reference

Research date: 5 November 2026. This reference supports **Nightfall Reliquary**, an original, classic-base-game-inspired recreation. It is not a claim of complete parity with a particular retail build.

## Summary

The central loop is positioning, automatic attacks, collecting experience, and choosing a build. Defeated enemies leave XP on the ground. Collecting enough XP pauses play for an upgrade choice. Weapons have distinct coverage patterns, so movement affects both safety and damage. Compatible weapons and passives enable chest-based evolutions. Gold carries into between-run upgrades.

The [official Steam listing](https://store.steampowered.com/app/1794680/Vampire_Survivors/) establishes the survival/roguelite premise and persistent gold purchases. Detailed numbers below come from the developer-linked community wiki. Its dedicated item pages are preferable to broad overview tables where they disagree. Indexed page contents were available; direct page opens encountered robots restrictions. No precise retail version was pinned.

## Fidelity matrix

| System | Reference mechanic | Recreation scope / limitation |
|---|---|---|
| Combat | Automatic weapon use; movement controls positioning. | Six automatic weapon families. |
| XP and leveling | [Level-ups](https://vampire.survivors.wiki/w/Level_up) pause action and present three or four choices. | Paused randomized build selection; exact retail offer weights and complete XP economy are not promised. |
| Inventory | [Weapons](https://vampire.survivors.wiki/w/Weapons) and [passives](https://vampire.survivors.wiki/w/Passive_items) normally have six selection slots each. Stage pickups can exceed this. | Six plus six selection limits; no full stage-item exception system. |
| Upgrade caps | The six researched weapons cap at eight levels. All eight researched passives cap at five. | Matching rank tables below are encoded and regression-tested. |
| Evolution | [Evolution](https://vampire.survivors.wiki/w/Evolution): max weapon, matching catalyst, and eligible chest. | Six matching recipes. Strict boss-spawn-at/after-10:00 eligibility is a deliberate simplification. |
| Chest timing | Most ordinary stages gate evolution by chest/boss eligibility. Mad Forest's first Glowing Bat chest is an early exception. | Opening an old, ineligible chest later does not enable evolution. The early exception is omitted. |
| Stage time | [Mad Forest](https://vampire.survivors.wiki/w/Mad_Forest) is a 30-minute stage. [The Reaper](https://vampire.survivors.wiki/w/The_Reaper) appears at the limit. | Classic 30-minute clock plus a clearly labeled 5× quick stage clock. The accelerated mode is custom. |
| Enemies | Waves, elites, and bosses apply increasing pressure. | Procedural wave composition, HP, damage, and timing are original balancing, not the exact retail wave table. |
| Pickups | [Chicken](https://vampire.survivors.wiki/w/Floor_Chicken) heals 30 HP; [Vacuum](https://vampire.survivors.wiki/w/Vacuum) gathers ground XP; [Orologion](https://vampire.survivors.wiki/w/Orologion) freezes for 10 seconds. | Chicken, vacuum, freeze, and coins included. Drop distributions are custom. |
| XP gems | [Gem colors](https://vampire.survivors.wiki/w/Experience_Gem) indicate stored-value ranges: blue up to 2, green up to 9, red above that. | Colors are not universal fixed denominations. Ground gems consolidate under a performance cap. |
| Persistence | Gold buys [PowerUps](https://vampire.survivors.wiki/w/PowerUps) between runs. | Four custom gold upgrades and economy; not the complete retail metagame. |
| Presentation/content | Retail has many characters, stages, modes, unlocks, and DLC systems. | Original art, world layout, four character archetypes, and a bounded weapon roster. No DLC, co-op, Arcana, or complete-content parity claim. |

This matrix records the scope. Runtime verification is described separately in [VALIDATION.md](VALIDATION.md).

## Exact base-weapon rank data

Arrays are level 1 through 8. Area and speed are **relative stat multipliers**, not measured pixel radii or pixels per second. Pierce counts total enemies a projectile can hit, including its first target. Physical ranges, velocities, colliders, and visual geometry are approximations.

| Weapon and source | Damage | Amount | Other changing values |
|---|---|---|---|
| [Whip](https://vampire.survivors.wiki/w/Whip) | 10,10,15,20,25,30,35,40 | 1,2,2,2,2,2,2,2 | Area: 1,1,1,1.1,1.1,1.2,1.2,1.2 |
| [Magic Wand](https://vampire.survivors.wiki/w/Magic_Wand) | 10,10,10,10,20,20,20,30 | 1,2,2,3,3,4,4,4 | Cooldown: 1.2,1.2,1,1,1,1,1,1. Pierce: 1,1,1,1,1,1,2,2 |
| [Knife](https://vampire.survivors.wiki/w/Knife) | 6.5,6.5,11.5,11.5,11.5,11.5,16.5,16.5 | 1,2,3,4,4,5,6,6 | Pierce: 1,1,1,1,2,2,2,3. Interval: .1,.1,.1,.08,.08,.06,.06,.04 |
| [Axe](https://vampire.survivors.wiki/w/Axe) | 20,20,40,40,40,60,60,80 | 1,2,2,2,3,3,3,3 | Pierce: 3,3,3,5,5,5,7,7 |
| [Garlic](https://vampire.survivors.wiki/w/Garlic) | 5,7,8,9,11,12,13,15 | Not applicable | Area: 1,1.4,1.4,1.6,1.6,1.8,1.8,2. Hit cooldown: 1.3,1.3,1.2,1.2,1.1,1.1,1,1 |
| [King Bible](https://vampire.survivors.wiki/w/King_Bible) | 10,10,10,20,20,20,30,30 | 1,2,2,2,3,3,3,4 | Area: 1,1,1.25,1.25,1.25,1.5,1.5,1.5. Speed: 1,1,1.3,1.3,1.3,1.6,1.6,1.6. Duration: 3,3,3,3.5,3.5,3.5,4,4 |

Constant parameters and behavior:

- Whip: cooldown 1.35s; interval 0.1s; knockback 1; penetrating horizontal area attack. Speed and Duration do not modify it.
- Wand: interval 0.1s; area/speed 1; knockback 1; nearest-target volleys. Duration is ignored.
- Knife: cooldown 1s; area/speed 1; knockback 0.5; last-movement-direction volleys. Duration is ignored.
- Axe: cooldown 4s; interval 0.2s; area/speed 1; knockback 1. Arcing projectiles; enhanced Area scaling; Duration ignored.
- Garlic: per-enemy cooldown, not a synchronized global pulse. No direct knockback; hits weaken enemy knockback/freeze resistance. Ignores Amount, Speed, Duration.
- Bible: clockwise orbit; base cooldown 3s plus base weapon duration gives a 6–7s cycle. Bonus Duration extends uptime without adding to that base-duration cycle extension. Hit delay 1.7s per book; knockback 1; area attack.

The table gives baseline damage. Critical-hit behavior should not be inferred merely from a wiki infobox's dormant critical-chance field: ordinary Whip/Knife/Axe require additional systems to enable those criticals.

## Exact passive rank data

Totals below isolate the passive's contribution. Additive bonuses are combined with other bonuses to the same player stat before applying the resulting multiplier.

| Passive / source | Level 1 → 5 | Stacking |
|---|---|---|
| [Hollow Heart](https://vampire.survivors.wiki/w/Hollow_Heart) | HP ×1.2,1.44,1.728,2.0736,2.48832 | Multiplicative; does not heal newly added capacity |
| [Empty Tome](https://vampire.survivors.wiki/w/Empty_Tome) | Cooldown ×.92,.84,.76,.68,.60 | −8 percentage points per rank |
| [Bracer](https://vampire.survivors.wiki/w/Bracer) | Projectile speed ×1.1,1.2,1.3,1.4,1.5 | Additive +10% per rank |
| [Candelabrador](https://vampire.survivors.wiki/w/Candelabrador) | Area ×1.1,1.2,1.3,1.4,1.5 | Additive +10% per rank |
| [Spellbinder](https://vampire.survivors.wiki/w/Spellbinder) | Duration ×1.1,1.2,1.3,1.4,1.5 | Additive +10% per rank |
| [Pummarola](https://vampire.survivors.wiki/w/Pummarola) | Recovery +.2,.4,.6,.8,1 HP/s | Additive |
| [Spinach](https://vampire.survivors.wiki/w/Spinach) | Damage ×1.1,1.2,1.3,1.4,1.5 | Additive +10% per rank |
| [Attractorb](https://vampire.survivors.wiki/w/Attractorb) | Pickup range ×1.5,1.995,2.49375,2.9925,3.980025 | Multiplicative; chest pickup remains direct contact |

Hollow Heart's dedicated page specifies multiplicative ranks even though broader overview material can imply an additive +100% cap. Attractorb's “+300%” headline rounds its precise final multiplier. Dedicated rank tables are used here.

## Six evolution recipes

[Source: evolution list](https://vampire.survivors.wiki/w/Evolution). Each base weapon must be level 8; these six catalysts need only be owned, not maxed.

| Base weapon | Catalyst | Evolution |
|---|---|---|
| Whip | Hollow Heart | Bloody Tear |
| Magic Wand | Empty Tome | Holy Wand |
| Knife | Bracer | Thousand Edge |
| Axe | Candelabrador | Death Spiral |
| King Bible | Spellbinder | Unholy Vespers |
| Garlic | Pummarola | Soul Eater |

This game's original names for these evolved concepts are Crimson Lash, Endless Star, Crystal Stream, Eclipse Wheel, Eternal Sigils, and Soul Bloom. The recipes and qualitative attack concepts are retained. Evolved damage, hit geometry, critical healing, and precise timing remain approximations.

## Explicit approximation ledger

1. Original names, geometry, effects, tiles, stage layout, and character traits.
2. Procedural enemy schedules, enemy values, boss mechanics, collision sizes, knockback forces, world-unit distances/speeds, and entity caps.
3. Custom 5× stage-clock mode; not an official Vampire Survivors mode.
4. Simplified chest eligibility omitting stage-specific early and multi-evolution exceptions. One chest reward plus gold, not the full original chest system.
5. Custom XP/drop balance, offer distributions, gold prices, and four-upgrade metagame. No Luck modifier or reroll/banish/skip mechanics.
6. Bounded six-weapon/eight-passive content scope, not the modern game's complete systems/catalog.
7. The implementation does not model exact original freeze resistance or evolved critical/lifesteal rules. Garlic's knockback-resistance effect is represented; its precise retail interaction values are not verified.

Research did not verify pixel-accurate weapon geometry, exact full-stage spawn tables, complete evolved-weapon numbers, or full retail parity. Those distinctions remain explicit rather than hidden behind a claim of exact reproduction.
