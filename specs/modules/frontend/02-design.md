# Design Identity

Identidad visual de CURSINET.

---

## Philosophy

**Dark, precise, technical.** Inspired by Vercel, Linear, GitHub, and Platzi dark.

This is a platform **FOR engineers**, built to feel like engineering tooling.
Not colorful, not playful, not childish. **Serious, fast, premium.**

## Color Palette

### Backgrounds
```css
--bg-base:       #020617   /* page background */
--bg-surface:    #0F172A   /* sidebar, panels */
--bg-card:       #111827   /* cards, inputs */
--bg-elevated:   #1E293B   /* dropdowns, tooltips, modals */
--bg-hover:      #1E293B   /* table row hover, nav hover */
```

### Text
```css
--text-primary:  #F8FAFC
--text-secondary:#94A3B8
--text-muted:    #64748B
--text-disabled: #475569
```

### Accent
```css
--accent:        #2563EB
--accent-hover:  #1D4ED8
--accent-light:  #1E3A5F
--accent-text:   #93C5FD
```

### Semantic
```css
--success:       #16A34A
--success-bg:    #052E16
--warning:       #F59E0B
--warning-bg:    #1C1500
--danger:        #DC2626
--danger-bg:     #2D0A0A
```

### Borders
```css
--border:        #1E293B
--border-strong: #334155
```

## Typography

### Fonts
- **Headings**: "Geist" (Vercel) or "Inter" — weight 700/600
- **Body**: "Inter" — weight 400/500
- **Code**: "Geist Mono" or "JetBrains Mono"

### Import
```tsx
import { Geist, Inter, JetBrains_Mono } from 'next/font/google'
```

## UI Components Rules

| Property | Value |
|----------|-------|
| Cards radius | 8px |
| Inputs/Buttons radius | 6px |
| Badges radius | 4px |
| Modals radius | 12px |
| Default border | 1px solid var(--border) |
| Focus ring | 2px solid #2563EB + 2px offset |
| Shadows | Only on modals/dropdowns |
| Hover animation | 150ms ease |
| Panel animation | 250ms ease-out |

## Implementation with CSS Modules

Las variables de diseño se definen en `globals.css` como custom properties de CSS:

```css
/* app/globals.css */
:root {
  --bg-base: #020617;
  --bg-surface: #0F172A;
  --bg-card: #111827;
  --bg-elevated: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --border: #1E293B;
  --border-strong: #334155;
  --success: #16A34A;
  --danger: #DC2626;
}
```

Y se usan desde CSS Modules:

```css
/* Component.module.css */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
}

.title {
  color: var(--text-primary);
  font-weight: 600;
}
```

## No Gradients

No gradients in UI chrome — only flat fills.
