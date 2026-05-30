---
name: Fizzed
description: A fun, collector-heavy soda rating app with a matte cola palette.
colors:
  cola-mauve: "#211A1F"
  shelf-panel: "#2B2228"
  bottle-shadow: "#362B32"
  label-line: "#4A3B43"
  label-muted: "#CBBCC2"
  vanilla-foam: "#F8F1F3"
  soft-cherry: "#E58A84"
  cream-soda: "#E8C879"
  candy-cap: "#D9A6B5"
  cherry-ink: "#2A1110"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.soft-cherry}"
    textColor: "{colors.cherry-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.label-line}"
    textColor: "{colors.vanilla-foam}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.bottle-shadow}"
    textColor: "{colors.vanilla-foam}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.shelf-panel}"
    textColor: "{colors.vanilla-foam}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Fizzed

## 1. Overview

**Creative North Star: "The Collector's Cooler"**

Fizzed should feel like opening a carefully stocked cooler where every can and bottle has a place. The interface is product-first and collectible: soda artwork, names, ratings, flavor tags, and quick logging controls do the work. The tone is fun and vibrant, but the structure stays calm enough for browsing hundreds of sodas without fatigue.

The system uses matte cola surfaces, pastel cherry accents, and cream label details. It rejects corporate SaaS polish, generic database styling, direct Letterboxd mimicry, and AI-gradient decoration. Fizzed should feel like a hobby app with taste, not a dashboard pretending to be a brand campaign.

**Key Characteristics:**
- Matte dark cola surfaces with pastel soda-shop accents.
- Dense poster/card browsing that keeps soda imagery and names immediately scannable.
- Short, confident UI copy for repeat logging and filtering.
- Collectible cards and tags, not admin tables.
- Fun through color, catalog texture, and small details, not decorative gradients.

## 2. Colors

The palette is a matte soda cooler: dark cola-mauve surfaces, soft cherry action color, cream soda labels, and muted rose focus states.

### Primary
- **Soft Cherry**: The primary action and rating color. Use it for sign-in, search, save, rating stars, selected states, and important hover outlines.

### Secondary
- **Cream Soda**: The short-label accent. Use it sparingly for section labels and system highlights that need warmth without becoming the main action.
- **Candy Cap**: The focus and link accent. Use it for focus borders, secondary links, and subtle interaction details.

### Neutral
- **Cola Mauve**: The app background. It should stay flat and matte.
- **Shelf Panel**: Main panel and feed item background.
- **Bottle Shadow**: Form controls, poster placeholders, chips, and low-emphasis surfaces.
- **Label Line**: Secondary buttons, compact chips, and dividers.
- **Label Muted**: Supporting text, metadata, labels, and inactive copy.
- **Vanilla Foam**: Primary text on dark surfaces.
- **Cherry Ink**: Text on Soft Cherry buttons.

### Named Rules

**The No Gradient Rule.** Gradients, glow blobs, glassmorphism, and purple-blue AI accents are prohibited. Fizzed is matte by default.

**The Soda First Rule.** Accent color should help users identify actions and ratings, not decorate empty space. If a color does not clarify a soda, a filter, a rating, or an action, remove it.

## 3. Typography

**Display Font:** Lora with Georgia fallbacks  
**Body Font:** Lora with Georgia fallbacks  
**Label Font:** Lora with Georgia fallbacks

**Character:** The app uses Lora as a single-family serif system. It gives Fizzed a softer collector-catalog voice while keeping the interface consistent; weight and scale create hierarchy instead of decorative font pairing.

### Hierarchy
- **Display** (800, 4.5rem max, 0.95 line-height): Use only for the home headline or rare high-level product moments.
- **Headline** (800, 2.25rem, 1.1 line-height): Use for page titles like Browse, profile headers, and soda detail titles.
- **Title** (800, 1.25rem, 1.2 line-height): Use for section titles, card headings, and review headers.
- **Body** (500, 1rem, 1.6 line-height): Use for descriptions, reviews, helper copy, and empty states. Keep prose lines under 75ch.
- **Label** (800, 0.75rem, 0.12em letter-spacing): Use for short controls, nav labels, metadata, chips, and buttons. Do not use all-caps for full sentences.

### Named Rules

**The Collector Serif Rule.** Product screens use Lora consistently. Keep labels short and weights deliberate so the serif voice feels catalog-like, not bookish or slow.

## 4. Elevation

Fizzed is flat and matte at rest, with light tactile lift only on collectible soda artwork and important hover states. Depth should feel like a card being picked from a shelf, not like a floating glass panel.

### Shadow Vocabulary
- **Artwork Rest** (`0 8px 18px rgba(24,18,21,0.22)`): Use only on soda artwork frames and image containers.
- **Artwork Hover** (`0 0 0 2px #E58A84, 0 10px 22px rgba(24,18,21,0.28)`): Use for soda card hover feedback.
- **Panel Low** (`0 12px 32px rgba(24,18,21,0.24)`): Use sparingly for modal-like or strongly grouped surfaces.

### Named Rules

**The Flat Cooler Rule.** Surfaces are flat by default. Borders and tonal layers carry structure; shadows appear only for interaction or artwork.

## 5. Components

### Buttons
- **Shape:** Compact squared rounding (4px). Do not use oversized pills for primary product actions.
- **Primary:** Soft Cherry background with Cherry Ink text, 12px by 20px padding, bold uppercase label for short actions.
- **Hover / Focus:** Hover can shift to a lighter cherry. Focus should use Candy Cap or a visible outline; it must not rely on color alone when possible.
- **Secondary:** Label Line background with Vanilla Foam text for low-risk actions like Log or Apply.

### Chips
- **Style:** Bottle Shadow or Label Line background with Label Muted text. Tags are compact, uppercase, and tightly spaced.
- **State:** Selected or active chips can use Soft Cherry sparingly. Inactive chips must not look like disabled controls.

### Cards / Containers
- **Corner Style:** Gentle product rounding (6px to 8px), never oversized rounded-card styling.
- **Background:** Shelf Panel for grouped surfaces, Bottle Shadow for contained controls and poster placeholders.
- **Shadow Strategy:** Follow the Flat Cooler Rule. Soda artwork can lift; ordinary containers stay mostly flat.
- **Border:** Use low-contrast white transparency or Label Line. Avoid colored side stripes.
- **Internal Padding:** Dense but readable, usually 12px to 24px depending on the surface.

### Inputs / Fields
- **Style:** Bottle Shadow background, subtle border, 4px rounding, Vanilla Foam text.
- **Focus:** Candy Cap border or outline. Placeholder text must remain readable against Bottle Shadow.
- **Error / Disabled:** Error states should add clear copy and border treatment. Disabled states reduce opacity but keep labels legible.

### Navigation
- **Style:** Sticky top bar on Cola Mauve, simple brand wordmark, compact uppercase nav links, and a Soft Cherry sign-in action.
- **States:** Hover moves text to white. Current-route treatment should be added later with a subtle underline, Soft Cherry marker, or active text color.
- **Mobile:** The app needs a mobile nav treatment before production hardening; do not hide core navigation without an accessible alternative.

### Soda Artwork

Soda artwork is the signature component. It uses a vertical poster-like ratio, contained image fit, matte Bottle Shadow fallback, and readable alt text. Artwork should never be cropped so aggressively that users cannot recognize the bottle or can.

## 6. Do's and Don'ts

### Do:
- **Do** keep the soda name, image, flavor tags, and rating visible within the first scan of a card.
- **Do** use Soft Cherry for primary actions, ratings, selected states, and hover outlines.
- **Do** use Cream Soda for short labels and warm emphasis, not broad backgrounds.
- **Do** keep cards dense enough for browsing many sodas at once.
- **Do** make filter, search, and log flows predictable before adding visual flourish.
- **Do** preserve readable contrast for Label Muted text on Cola Mauve, Shelf Panel, and Bottle Shadow.

### Don't:
- **Don't** use corporate SaaS dashboard styling, generic admin tables, or fake enterprise polish.
- **Don't** make Fizzed a direct Letterboxd clone. Poster-grid familiarity is fine; color, voice, components, and collector details must belong to Fizzed.
- **Don't** use AI-generated gradient aesthetics: no purple-blue gradients, glow blobs, glass cards, gradient text, or atmospheric bokeh.
- **Don't** turn the app into a childish candy interface. Fun comes from the catalog and accents, not chaotic color everywhere.
- **Don't** use colored side-stripe borders, nested cards, or decorative shadows on every surface.
- **Don't** make soda data look like raw source data. Normalize messy names and present entries as curated collectibles.
