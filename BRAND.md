# Zubio, brand guide (v1)

**Concept: "Ligne Z".** *Zubi* means bridge in Basque. The Z is drawn as a transit route. It starts at an open station ○ (the gym publishes a slot) and ends at a filled station ● (a coach is confirmed). The diagonal is the bridge between the two. The same idea, "open ring → route → filled dot", runs through the whole UI: statuses, timeline, map.

## Logo
- Files: `logo.svg` (horizontal), `logo-white.svg` (on red, single colour, symbol knocked out), `logo-mark.svg` (app/avatar), `favicon.svg` (16–24px version with a solid ring and a heavier stroke), `wordmark.svg` (headers where the tile would repeat the z).
- Wordmark: Unbounded ExtraBold outlines, with a redrawn z (route stroke, round caps) and a perfectly round **red i-dot** (the "confirmed" dot). Never retype it in a font.
- Clear space = the height of the i-dot on all sides. Minimum size: lockup 96px wide, mark 16px (use `favicon.svg` below 24px).
- Allowed backgrounds: sand/paper (`logo.svg`), brand red (`logo-white.svg`), ink (`logo-white.svg`). Never put it on photos without a solid plate. Don't recolour the i-dot, stretch it, add shadows/gradients, or outline it.
- App icon = `logo-mark.svg` edge to edge. The 24% corner radius is already in the art, so the OS mask fits it.

## Palette (see `tokens.css`, contrast checked with `node contrast.mjs`)
| Role | Hex | Note |
|---|---|---|
| Piment (brand) | `#D63B27` | buttons, active states, route lines. White text 4.65:1 |
| Piment hover / press / soft / ink | `#B8301E` / `#9E2817` / `#FBE1D9` / `#B02E1C` | `brand-ink` = red **text** |
| Sand bg / Paper surface / Sunken | `#F8F1E4` / `#FFFBF4` / `#F1E7D5` | never pure white pages |
| Ink / Ink soft / Muted | `#2A211C` / `#5E5148` / `#756558` | 14.0 / 6.8 / 5.0:1 on bg |
| Border / strong | `#E7DBC6` / `#D5C4A8` | 1–1.5px |
| Basque green / Sun | `#1F5C46` / `#F2A93B` | accents: dark sections; "urgent"/highlight (ink text only) |
| Success / Warning / Danger | `#2A6B3F` / `#8A5A00` / `#B02E1C` | always on their `-soft` tint |

Disciplines (fg on soft bg, all ≥ 5.2:1): pilates `#A3284B`/`#FBE3E7` · yoga `#456B22`/`#E6EFD6` · cross-training `#86560A`/`#FBEBC6` · cours collectifs `#1C6B58`/`#D8EFE7` · musculation `#3D4A6B`/`#E3E7F0` · aquagym `#1F5F86`/`#DCEBF4`. Use them only to code disciplines: on tiles, chips and map lines. Never use them for the brand.
Ratio of use: about 70% sand/paper, 20% ink, 8% red, 2% discipline colours. Red is for actions and the brand, not for decoration.

## Typography
- **Unbounded** 600 (section titles, 18–22px) and 800 (H1, hero, prices and big numbers, 24–40px). Letter-spacing -0.01em. Max one Unbounded line per card.
- **Onest** 400 body (16–17px, line-height 1.5), 500 meta, 600 labels/buttons, 700 card titles. Minimum 13px.
- Use tabular numbers for times: `font-variant-numeric: tabular-nums`. Write times as "18:30–19:30" and prices as "45 €".

## Components
- Buttons are pills (`rounded-full`), 48px tall (44px min). Primary: brand bg, white Onest 600, `shadow-brand`, hover `brand-hover`. Secondary: transparent with a 1.5px `border-strong`. Dark: ink bg.
- Cards: `surface`, `rounded-lg` (20px), 1.5px `border`, `shadow-sm`, padding 20–24px. Sheets: `rounded-xl` and `rounded-2xl` on top.
- Status chips (28px pill, Onest 600 13px): **Ouvert** = ○ ring on `brand-soft`/`brand-ink` · **Confirmé** = ● dot on `success-soft`/`success` · **Urgent** = `sun` with ink text · **Annulé** = `sunken`/`muted`.

## Icons (Lucide)
- Stroke **2** at 20–24px. Use **1.75** at 28px or more. Round caps and joins (the Lucide default). Never filled, never duotone.
- Inline with text: 18px icon in `muted`, 8px gap. In buttons: 20px icon in the text colour.
- **Tinted tile**: 48px square (40px in dense lists), `rounded-md` (14px), discipline `-soft` background, 22–24px icon in the discipline fg. Neutral tiles: `sunken` bg + `ink-soft` icon. Brand tile: `brand-soft` + `brand-ink`.
- Discipline icons: pilates `person-standing`, yoga `flower`, cross-training `flame`, cours collectifs `users-round`, musculation `dumbbell`, aquagym `waves`.

## Illustration and visuals
- **BAB route map** (signature visual): a flat coast with the ocean in `aqua-soft`, light land `#FBF6EC`, the Adour as a thick `aqua-soft` stroke and small hand-drawn wave ticks. Coach→gym routes are drawn transit-style: 4–12px lines with round caps, only 0°/45°/90° angles, gym = white ring with a brand stroke, coach = filled dot with a 18% halo. Town labels in Unbounded 700 15px. Use it in the hero, onboarding, empty states and the map tab.
- **Timeline** for a slot: Publié ○ ─ Notifié ─ Accepté ● ─ Confirmé, using the same ring/dot and route line.
- **Avatars**: circles with 2 initials in Onest 700. Background = the coach's main discipline `-soft`, letters in its fg. Photos are 1:1 circles with a 2px `surface` ring.
- No stock 3D, no blobs, no gradients, no sparkles. Allowed texture: flat colour fields with soft warm shadows.

## Motion
- Durations: 120ms for press/hover, 200ms for chips/tabs/toggles, 320ms for sheets/pages. Easing `--ease-out-soft`. Use `--ease-spring` only for "positive" moments.
- Press: `scale(0.97)` on buttons and cards. Cards enter with a fade and an 8px rise, staggered 40ms.
- Signature moment: when a slot gets confirmed, the ○ ring fills into ● (scale 0.6→1.1→1 on the spring curve) and the route line draws itself (stroke-dashoffset, 400ms).
- Respect `prefers-reduced-motion` (already handled in tokens.css). No infinite loops except skeleton shimmer.
