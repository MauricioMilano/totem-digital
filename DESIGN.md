---
version: alpha
name: dometts-design-system
description: A dark, premium boutique interface for DOMETTS Barber & Shop — anchored on a deep espresso canvas with warm sand accents and elegant Playfair Display headlines over Inter body type. The system reads as confident and refined — generous whitespace, soft-rounded cards (~12px), and a restrained espresso/sand palette where the serif headline does the brand work rather than loud accent colors.

colors:
  canvas: "#3B2618"              # espresso — fundo base
  surface-soft: "#4A3220"
  surface-card: "#54391F"
  surface-dark: "#2E1E12"
  ink: "#F5EFE6"                # cream — texto principal
  body: "#C4AE8F"               # sand — texto secundário
  muted: "#9C8767"              # (derivado) texto terciário
  hairline: "#5A422B"
  border-strong: "#6E5334"
  brand-primary: "#DCC39E"      # sand / dourado — cor de destaque
  brand-primary-active: "#C9AD82"
  on-primary: "#3B2618"         # texto sobre o accent (sand)
  signature-coral: "#C15A32"
  signature-forest: "#4E8A5C"
  signature-cream: "#F5EFE6"
  signature-peach: "#DFA277"
  signature-mint: "#93BFA8"
  signature-yellow: "#DCC39E"
  signature-mustard: "#C99A45"
  link: "#7FA3FF"
  info: "#6E9BE0"
  success: "#5FC48D"
  error: "#E07B5A"
  warning: "#E0B15C"

typography:
  display-xl:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0
  display-lg:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  display-md:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  display-sm:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  title-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0.12px
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  title-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  label-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.16px
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.brand-primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 36px
  button-text-link:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
  text-link:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 64px
  nav-pill-group:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    padding: 6px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: 96px
  hero-app-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-icon-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  product-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  testimonial-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-tier-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  pricing-tier-card-featured:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    height: 40px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  category-tab:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    padding: 8px 14px
    rounded: "{rounded.md}"
  category-tab-active:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
  avatar-circle:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 36px
  badge-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  rating-stars:
    backgroundColor: transparent
    textColor: "{colors.signature-mustard}"
    typography: "{typography.caption}"
  cta-band-light:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: 48px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 64px
---

## Overview

The DOMETTS interface is a dark, premium boutique surface — a deep espresso canvas (`{colors.canvas}` — #3B2618) with warm sand accents (`{colors.brand-primary}` — #DCC39E), elegant **Playfair Display** serif headlines over **Inter** body type, and `{colors.surface-card}` (#54391F) cards that hold the product UI. The system reads as confident and refined without trying to shout — every band has clear hierarchy, generous whitespace, and a single primary action.

Type voice splits cleanly into two roles: **Playfair Display** (a high-contrast serif echoing the DOMETTS wordmark — used for h1, h2, hero headlines and display sizes) and **Inter** (used for everything else — body, buttons, nav, captions). Playfair runs at weight 400–500 with neutral letter-spacing — it feels editorial and upscale. Inter handles the supporting type at weights 400–600.

Component voltage comes from **product UI fragments shown directly inside cards** — comanda lists, service pickers, payment flows. The interface shows the actual product chrome at small scale embedded in the flow rather than painting marketing illustrations of it.

The whole system lives on a dark espresso base; `{colors.surface-dark}` (#2E1E12) is reserved for recessed/footing surfaces. There is no light mode — the app is dark by design, which is what gives it its premium barbershop character.

**Key Characteristics:**
- Espresso canvas with sand primary accent (`{colors.brand-primary}` — #DCC39E). Buttons are `{rounded.md}` (8px) with confident weight-500 labels in Inter.
- `Playfair Display` serif typeface for display headlines — high-contrast, editorial, directly echoing the logo.
- Warm dark card surfaces (`{colors.surface-card}` — #54391F) for feature cards and content blocks; recessed areas use `{colors.surface-dark}` (#2E1E12).
- A restrained espresso/sand palette where the serif headline and a single sand accent do the brand work — no loud accent colors at the action layer.
- Nav-pill-group (`{component.nav-pill-group}`) — a small pill-radius wrapper around grouped nav segments (e.g., the sub-nav switcher between product views). The pill wrapper is one of the system's signature interactive components.
- Avatars are circular (`{rounded.full}`), 36px diameter, used in testimonial rows and team-listing surfaces.
- Recessed/footing surfaces use `{colors.surface-dark}` (#2E1E12) to push elements back against the espresso canvas.
- Spacing rhythm is `{spacing.section}` (96px) between major bands — tight enough to feel modern-SaaS but generous enough to breathe.
- Border radius is hierarchical: `{rounded.md}` (8px) for buttons + inputs, `{rounded.lg}` (12px) for content cards, `{rounded.xl}` (16px) for the hero app-mockup container, `{rounded.pill}` for nav-pill-group + badges, `{rounded.full}` for avatars + icon buttons.

## Colors

### Surface (dark espresso base)
- **Canvas** (`{colors.canvas}` — #3B2618): The default page floor — deep espresso brown.
- **Surface Soft** (`{colors.surface-soft}` — #4A3220): Nav-pill-group background, very-soft section dividers.
- **Surface Card** (`{colors.surface-card}` — #54391F): Feature cards, content blocks, badge pills, default avatar fills.
- **Surface Dark** (`{colors.surface-dark}` — #2E1E12): Recessed/footing surfaces — the darkest surface in the system, used to push elements back.
- **Hairline** (`{colors.hairline}` — #5A422B): The 1px border tone on dark surfaces. Used on input borders, table dividers, content card outlines.
- **Border Strong** (`{colors.border-strong}` — #6E5334): A heavier divider / emphasized outline for when a hairline needs more presence.

### Brand & Accent
- **Brand Primary** (`{colors.brand-primary}` — #DCC39E): The dominant accent — warm sand/gold. Used on primary CTAs, focus rings, key highlights and the logo mark. Press state shifts to `{colors.brand-primary-active}` (#C9AD82).
- **On Primary** (`{colors.on-primary}` — #3B2618): Text/icons placed on top of the sand accent — espresso for contrast.
- **Signature set** — a small, restrained palette for category badges and avatar fills: `{colors.signature-coral}` (#C15A32), `{colors.signature-forest}` (#4E8A5C), `{colors.signature-peach}` (#DFA277), `{colors.signature-mint}` (#93BFA8), `{colors.signature-mustard}` (#C99A45). These appear on tag pills and small accent moments — never dilute the espresso/sand brand voice.

### Text
- **Ink** (`{colors.ink}` — #F5EFE6): All headlines and primary text — warm cream.
- **Body** (`{colors.body}` — #C4AE8F): Default running-text color — muted sand.
- **Muted** (`{colors.muted}` — #9C8767): Secondary/tertiary text — captions, fine-print, less-emphasized labels.

### Semantic
- **Success** (`{colors.success}` — #5FC48D): Confirmation states, success badges in product UI.
- **Warning** (`{colors.warning}` — #E0B15C): Warning callouts.
- **Error** (`{colors.error}` — #E07B5A): Validation errors.
- **Info / Link** (`{colors.info}` — #6E9BE0 / `{colors.link}` — #7FA3FF): Inline links and informational states.

## Typography

### Font Family
The system runs **Playfair Display** (serif) for display headlines and **Inter** (sans-serif) for everything else. Playfair Display is a high-contrast serif that directly echoes the elegant DOMETTS wordmark — it carries the brand voice on headlines. Inter handles body, buttons, navigation, captions, and tabular data. Both are loaded via `next/font/google` so they render identically on every device; Inter falls back to `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, and Playfair falls back to `Georgia, serif`.

The split is functional:
- Playfair Display (display, 400–500 weight, 0 letter-spacing) — h1, h2, hero headlines, display sizes
- Inter (body + UI, 400–600 weight, ~0 letter-spacing) — paragraphs, labels, buttons, nav

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 48px | 500 | 1.1 | 0 | Hero h1 — Playfair Display |
| `{typography.display-lg}` | 40px | 400 | 1.2 | 0 | Section heads, welcome headlines — Playfair Display |
| `{typography.display-md}` | 32px | 400 | 1.2 | 0 | Sub-section heads, card titles — Playfair Display |
| `{typography.display-sm}` | 28px | 400 | 1.2 | 0 | CTA-band heads, prices — Playfair Display |
| `{typography.title-lg}` | 24px | 400 | 1.35 | 0.12px | Plan/section names — Inter |
| `{typography.title-md}` | 20px | 400 | 1.5 | 0 | Feature card titles, intro paragraphs — Inter |
| `{typography.title-sm}` | 18px | 500 | 1.4 | 0 | Small card titles, list labels — Inter |
| `{typography.label-md}` | 16px | 500 | 1.4 | 0 | Field labels — Inter |
| `{typography.body-md}` | 14px | 400 | 1.25 | 0 | Default running-text — Inter |
| `{typography.caption}` | 14px | 500 | 1.35 | 0.16px | Badge labels, captions — Inter |
| `{typography.code}` | 14px | 400 | 1.5 | 0 | Code snippets, API examples — JetBrains Mono |
| `{typography.button}` | 16px | 500 | 1.4 | 0 | Standard button labels — Inter |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top-nav menu items — Inter |

### Principles
Playfair Display is the brand voice — every display headline uses it. Inter handles the supporting type. The boundary is strict: never put body copy in Playfair, never put a display headline in Inter. Putting `font-cal` (Inter) on an element that also carries a `text-display-*` class will override the serif — keep them separate.

Display weight stays at 400–500 across all sizes — never 700. The light-to-medium weights are what make Playfair feel elegant and confident without becoming heavy or bombastic on the dark canvas.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- **Section padding:** `{spacing.section}` (96px) — the universal vertical rhythm between editorial bands.
- **Card internal padding:** `{spacing.xl}` (32px) for feature cards and pricing tier cards; `{spacing.lg}` (24px) for testimonial and product-mockup cards.
- **Gutters:** `{spacing.lg}` (24px) between cards in 3-up grids; `{spacing.md}` (16px) inside footer columns.

### Grid & Container
- **Max content width:** ~1200px centered on marketing pages.
- **Editorial body:** Single 12-column grid; hero band often uses 7/5 split (h1 left, app mockup card right).
- **Feature card grids:** 3-up at desktop, 2-up at tablet, 1-up at mobile.
- **Pricing grid:** 4-up at desktop, 2-up at tablet, 1-up at mobile.
- **Footer:** 4-column link list at desktop, wrapping to 2-up at tablet, 1-up at mobile.

### Whitespace Philosophy
The system uses generous but not excessive whitespace — section padding sits at 96px, and card internal padding stays at 32px. The rhythm is calibrated for fast scanning: every band has a single h1 + h2 + supporting cards, never densely packed lists. On the dark espresso canvas the result reads as confident-not-shouting.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, top nav, hero bands |
| Soft hairline | 1px `{colors.hairline}` border | Inputs, table dividers, occasionally on cards |
| Card surface | `{colors.surface-card}` background — no shadow | Feature cards, testimonials |
| Subtle drop shadow | Faint shadow at low alpha | Pricing tier cards, hover-elevated states (the system uses `0 1px 2px rgba(0,0,0,0.05)` and `0 4px 12px rgba(0,0,0,0.08)`) |
| Featured tier | `{colors.surface-dark}` background, no shadow needed | The featured pricing tier inverts to dark surface — color contrast does the elevation work |

The elevation philosophy is **soft and modern** — small drop shadows on elevated cards, color-block contrast for emphasis. No heavy shadows, no neumorphism, no glassmorphism.

### Decorative Depth
- Calendar widgets and product UI fragments embedded inside marketing cards carry their own internal shadows from the product UI itself — these are not system tokens, they're product chrome shown as content.
- Avatar circles and tag pills sometimes carry one of the warm signature fills (`{colors.signature-coral}`, `{colors.signature-forest}`, etc.) — adds a small chromatic flourish without breaking the espresso/sand brand voice.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Almost no use — reserved for badge accents |
| `{rounded.sm}` | 6px | Small inline buttons, dropdown items |
| `{rounded.md}` | 8px | Standard CTA buttons, text inputs, category tabs |
| `{rounded.lg}` | 12px | Content cards (feature cards, testimonial cards, pricing tier cards) |
| `{rounded.xl}` | 16px | Hero app-mockup card (a slightly larger radius for the marquee component) |
| `{rounded.pill}` | 9999px | Nav-pill-group, badge pills |
| `{rounded.full}` | 9999px / 50% | Avatars, icon buttons |

### Photography Geometry
Avatar photos use `{rounded.full}` (perfect circles) at 36px or 40px. Product UI fragments inside marketing cards retain their native chrome (which often has its own internal radii — e.g., calendar grid cells, button rows). Hero illustration zones use 16:9 or 4:3 ratios with `{rounded.xl}` corners.

## Components

### Top Navigation

**`top-nav`** — Dark nav bar pinned to the top of every page. 64px tall, `{colors.canvas}` background. Carries the DOMETTS wordmark + logo at left, primary horizontal menu center, right-side cluster with a text-link and a `{component.button-primary}`. Menu items in `{typography.nav-link}` (Inter 14px / 500).

**`nav-pill-group`** — A small pill-radius wrapper around 2-3 sub-nav segments (e.g., a mode switcher between views). Background `{colors.surface-soft}` with internal padding 6px, rounded `{rounded.pill}`. Active segment renders as a surface-card pill with a subtle drop shadow inside the wrapper. The pill-in-pill treatment is one of the system's signature interactive components.

### Buttons

**`button-primary`** — The signature primary CTA. Background `{colors.brand-primary}` (#DCC39E), text `{colors.on-primary}` (espresso #3B2618), type `{typography.button}` (Inter 16px / 500), padding 12px × 20px, height 40px, rounded `{rounded.md}` (8px). Active state `button-primary-active` shifts to `{colors.brand-primary-active}` (#C9AD82).

**`button-secondary`** — Dark button with hairline outline. Background `{colors.surface-card}`, text `{colors.ink}`, 1px hairline border, same padding + height + radius as primary.

**`button-icon-circular`** — 36 × 36px circular icon button. Background `{colors.canvas}`, hairline border, ink-color icon. Used for share, "view more", carousel arrows.

**`button-text-link`** — Inline text button, no background. Used for "Sign in" in the top nav and inline CTA links inside cards.

**`text-link`** — Inline body links in `{colors.ink}` (the brand keeps inline links monochrome). Underlined on hover (not documented per the no-hover policy, but mentioned for context).

### Cards & Containers

**`hero-band`** — White-canvas hero with a 7-5 grid: h1 + sub-headline + button row on the left, `{component.hero-app-mockup-card}` on the right. Vertical padding `{spacing.section}` (96px).

**`hero-app-mockup-card`** — A larger product-UI mockup card showing the actual comanda/product flow with service list, totals, and a primary "Confirm" button inside. Background `{colors.surface-card}`, 1px hairline border, rounded `{rounded.xl}` (16px), subtle drop shadow. Used as the hero's right-side artifact.

**`feature-card`** — Used in 3-up feature grids. Background `{colors.surface-card}` (#54391F), rounded `{rounded.lg}` (12px), internal padding `{spacing.xl}` (32px). Carries a small icon at top, an `{typography.title-md}` headline, and a body description in `{typography.body-md}`.

**`feature-icon-card`** — A simpler card variant used in 4-up feature grids on lower-density bands. Background `{colors.canvas}` with hairline border, rounded `{rounded.lg}`, padding `{spacing.lg}` (24px). Carries a small icon, `{typography.title-sm}` title, short description.

**`product-mockup-card`** — A card showing actual product UI fragments (comanda list, service picker, payment flow). Background `{colors.surface-card}`, rounded `{rounded.lg}`, padding `{spacing.lg}` (24px). The product UI inside has its own internal chrome — these cards display the product, they don't decorate around it.

**`testimonial-card`** — Used in customer-quote grids. Background `{colors.surface-card}`, rounded `{rounded.lg}`, padding `{spacing.lg}` (24px). Top row carries a `{component.avatar-circle}` + name + role; below sits the testimonial quote in `{typography.body-md}`.

**`pricing-tier-card`** — Standard tier card. Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.xl}` (32px). Carries the plan name in `{typography.title-lg}`, price in `{typography.display-sm}`, feature checklist in `{typography.body-md}`, and a `{component.button-primary}` at the bottom.

**`pricing-tier-card-featured`** — The featured tier. Background flips to `{colors.brand-primary}` (#DCC39E) with espresso text (`{colors.on-primary}`). The sand surface IS the featured-tier signal — no accent border, no badge, no scale shift.

### Inputs & Forms

**`text-input`** — Standard text input. Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.md}` (8px), padding 10px × 14px, height 40px. 1px hairline border in `{colors.hairline}`.

**`text-input-focused`** — Focus state. Border thickens or shifts to `{colors.ink}` for emphasis.

### Tags / Badges

**`badge-pill`** — Small pill label used for category tags and fill avatar substitutes. Background `{colors.surface-card}` or one of the signature fills (`{colors.signature-coral}`, `{colors.signature-forest}`, etc.), text `{colors.ink}`, type `{typography.caption}` (14px / 500), rounded `{rounded.pill}`, padding 4px × 12px.

**`avatar-circle`** — 36px diameter, rounded `{rounded.full}`. Either holds a photo or a pastel fill with initials in `{typography.caption}`.

**`rating-stars`** — Inline star rating in `{colors.signature-mustard}` (#C99A45). Used near avatars to display a 5-star satisfaction score.

### Tab / Filter

**`category-tab`** + **`category-tab-active`** — Used inside the nav-pill-group. Inactive: transparent background, `{colors.muted}` text. Active: `{colors.canvas}` background, `{colors.ink}` text, subtle drop shadow inside the pill-group wrapper. Padding 8px × 14px, rounded `{rounded.md}`.

### CTA / Footer

**`cta-band-light`** — A pre-footer "Smarter, simpler scheduling" CTA card. Background `{colors.surface-card}`, rounded `{rounded.lg}`, padding `{spacing.xxl}` (48px). Carries an h2 in `{typography.display-sm}`, a sub-line, and a `{component.button-primary}` centered.

**`footer`** — Recessed footing band that closes every page. Background `{colors.surface-dark}` (#2E1E12) — the darkest surface in the system — with cream text (`{colors.ink}`). Vertical padding 64px. The DOMETTS wordmark sits at the top-left in `{colors.ink}`. On an already-dark canvas it reads as a subtle step back rather than a hard inversion.

## Do's and Don'ts

### Do
- Reserve `{colors.brand-primary}` (#DCC39E) for primary CTAs, focus rings and key highlights. The accent is sand/gold, not blue.
- Use Playfair Display for every display headline. Pair with Inter body. Never blur the boundary — a `text-display-*` element must not also carry `font-cal` (Inter), which would override the serif.
- Keep display weight at 400–500 with neutral letter-spacing. That lightness is what makes Playfair read as elegant on the dark canvas.
- Use `{component.feature-card}` (#54391F) deliberately — the warm card surface signals content blocks against the espresso canvas.
- Embed real product UI fragments inside marketing cards. Don't paint marketing illustrations of the product when you can show the product itself.
- Keep avatar circles at 36px, perfect circles, sometimes with pastel fills. Avatars are the only place where badge pastels appear.
- Use `{component.nav-pill-group}` for grouped sub-nav segments. The pill-in-pill treatment is signature.
- End every page with the dark footer. The light-to-dark transition is part of the editorial rhythm.

### Don't
- Don't use the signature accent set (coral, forest, peach, mint, mustard) on primary CTAs. The action layer stays sand-on-espresso.
- Don't bold display weight beyond 500. Playfair at 700 reads as heavy and bombastic.
- Don't use rounded radius beyond `{rounded.xl}` (16px) on cards. Larger radii read as consumer-app, not premium boutique.
- Don't introduce a light surface anywhere — the app is dark by design; the espresso/sand range IS the system.
- Don't repeat the same surface mode in two consecutive bands. The pacing alternates canvas → surface-card → canvas → recessed footing.
- Don't add hover state styling beyond what the system already encodes — primary darkens on press; nothing else changes.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Hamburger nav; hero h1 64→32px; hero-app-mockup-card stacks below content; feature grids 1-up; pricing 1-up; footer 4 cols → 1 |
| Tablet | 768–1024px | Top nav stays horizontal but tightens; nav-pill-group wraps; feature cards 2-up; pricing 2-up |
| Desktop | 1024–1440px | Full top-nav with all menu items; 3-up feature cards; 4-up pricing tiers |
| Wide | > 1440px | Same as desktop with more outer breathing room; max content width caps at 1200px |

### Touch Targets
- `{component.button-primary}` at minimum 40 × 40px.
- `{component.button-icon-circular}` at exactly 36 × 36 — slightly under WCAG's 44 × 44 but the centered icon and full-circle silhouette compensate.
- `{component.text-input}` height is 40px.
- `{component.category-tab}` rendered inside nav-pill-group has 8 × 14 padding; effective tap area meets 44px+ with the surrounding pill.

### Collapsing Strategy
- Top nav collapses to hamburger at < 768px; menu opens as a full-screen sheet.
- Hero band's 7-5 grid collapses to single-column on mobile — h1 + sub-head + buttons first, then the app-mockup card below.
- Feature grids reduce columns rather than scaling cards down.
- Pricing tier cards collapse 4 → 2 → 1; featured-tier dark surface stays visually distinct at every breakpoint.
- Nav-pill-group wraps to multi-row on tablet if the segments don't fit horizontally.
- Avatar + testimonial card layouts stay grid-aligned at every breakpoint.

### Image Behavior
- Product UI fragments inside cards retain native aspect ratios; the cards themselves resize.
- Avatar photos crop to circles at every breakpoint.
- Hero app-mockup card scales proportionally on mobile — the calendar grid stays legible.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.feature-card}`, `{component.pricing-tier-card-featured}`).
2. Variants of an existing component (`-active`, `-disabled`, `-focused`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay Playfair Display 400–500 with neutral letter-spacing. Body stays Inter 400. The boundary does not blur.
6. Keep the system dark — espresso canvas, sand accent. Don't add light surfaces casually.
7. When in doubt about emphasis: bigger Playfair before bolder Playfair.

## Known Gaps

- Both display and body fonts (Playfair Display, Inter) are loaded via `next/font/google`, so they render identically across devices with no local fallback drift.
- The accent set is intentionally small — if a new semantic color is needed, extend the `signature` palette in `tailwind.config.ts` rather than introducing an off-brand hue.
- The badge pastel set (orange / pink / violet / emerald) is documented from observed avatar fill colors; exact hex values may shift seasonally.
- Animation and transition timings (calendar slot picker, schedule confirmation, integration grid hover-reveal) are not in scope.
- Form validation states beyond `{component.text-input-focused}` are not extracted — error / success states would need a sign-up or booking flow to confirm.
- The live comanda/totem flow surfaces are the product itself, not a marketing surface; their detailed specs live under `openspec/` and `docs/`.
- Avatar photos in testimonial sections sometimes carry pastel circular fills with initials instead of photographs; both treatments coexist on the same page.
