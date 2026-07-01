# FinanceFlow Design System

## 1. Color Palette

The application uses a semantic color system with full support for both Light and Dark modes. Colors are defined using HSL variables to allow opacity adjustments via Tailwind CSS.

### Base Colors
- **Background:** Light `hsl(220, 20%, 97%)` | Dark `hsl(218, 22%, 7%)`
- **Surface (Cards, Modals):** Light `hsl(0, 0%, 100%)` | Dark `hsl(218, 20%, 11%)`
- **Surface Sunken (Inputs, Muted backgrounds):** Light `hsl(216, 16%, 94%)` | Dark `hsl(217, 19%, 14%)`
- **Border:** Light `hsl(218, 16%, 90%)` | Dark `hsl(220, 16%, 18%)`

### Typography Colors
- **Ink (Primary Text):** Light `hsl(224, 22%, 10%)` | Dark `hsl(220, 11%, 94%)`
- **Ink Muted (Secondary Text):** Light `hsl(215, 12%, 40%)` | Dark `hsl(214, 15%, 65%)`

### Functional & State Colors
- **Accent (Primary Brand):** Light `hsl(42, 85%, 39%)` | Dark `hsl(39, 67%, 55%)`
  - **Foreground:** `hsl(0, 0%, 100%)` (White)
- **Positive (Success/Income):** Light `hsl(160, 59%, 30%)` | Dark `hsl(159, 52%, 42%)`
- **Negative (Destructive/Expense):** Light `hsl(6, 64%, 46%)` | Dark `hsl(6, 71%, 58%)`
- **Warning:** Shares the Accent palette.
- **Ring (Focus Indicator):** Matches the Accent color for consistent branding across interactive elements.

---

## 2. Typography

The application utilizes three distinct font families mapped through CSS variables:
- **Sans (Default, UI):** Inter (`var(--font-inter)`)
- **Display (Headings, Emphasis):** Archivo (`var(--font-archivo)`)
- **Mono (Code, Numbers):** JetBrains Mono (`var(--font-jetbrains-mono)`)

### Text Styles

| Style | Font Size | Line Height | Font Weight | Letter Spacing |
|-------|-----------|-------------|-------------|----------------|
| **Display** | 32px | 40px | 700 (Bold) | Normal |
| **H2** | 22px | 28px | 600 (Semibold) | Normal |
| **H3** | 16px | 24px | 600 (Semibold) | Normal |
| **Body** | 14px | 20px | 400 (Regular) | Normal |
| **Caption** | 12px | 16px | 500 (Medium) | 0.025em |
| **Figure LG** | 28px | 32px | 500 (Medium) | Normal |
| **Figure** | 14px | 20px | 400 (Regular) | Normal |
| **Figure SM** | 12px | 16px | 400 (Regular) | Normal |

*Note: The `font-mono` class enforces `font-feature-settings: "tnum"` to ensure tabular figures are used, which is critical for vertically aligning currency and numbers in financial tables.*

---

## 3. Structural & Layout

- **Border Radius:**
  - Base (`--radius`): 8px (Used for Cards, Dialogs)
  - Medium (`--radius-md`): 6px
  - Small (`--radius-sm`): 4px (Used for Badges, Inputs, smaller elements)

---

## 4. UI Components

The project utilizes customized `shadcn/ui` components tailored to match the FinanceFlow design system. They are located in `src/components/ui/`.
Key customized components include:
- **Interactive Elements:** Button, Input, Select, Tabs, Popover, Sheet
- **Layout/Structure:** Card, Dialog, Table, Form, Label
- **Feedback:** Progress, Skeleton, Badge, Sonner (Toasts)
- **Custom Modules:** GlobalSearch

All components strictly hook into the semantic color variables (e.g. `bg-background`, `text-foreground`, `bg-surface-sunken`) to natively support both light and dark modes without requiring hardcoded colors.

---

## 5. Animations

- **Accordion/Collapsible:** Includes smooth `accordion-down` and `accordion-up` keyframe animations (0.2s ease-out) for expanding and collapsing sections.
