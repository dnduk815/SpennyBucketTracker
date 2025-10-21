# Spenny Design Guidelines

## Design Approach: Design System + Financial UX Best Practices

**Selected Approach:** Utility-Focused Design System  
**Rationale:** Budget tracking demands clarity, efficiency, and trust. Users need to quickly log transactions and understand their financial status at a glance.

**Primary References:**
- Linear (clean dashboard, excellent data hierarchy)
- Stripe (financial clarity, minimal color palette)
- YNAB (intentional spending philosophy, bucket visualization)

## Core Design Principles

1. **Clarity Over Flash:** Every element serves a functional purpose
2. **Fast Transaction Entry:** Minimize steps to log spending
3. **Status Visibility:** Bucket balances always prominent
4. **Trust Through Restraint:** Conservative color use, professional typography

---

## Color Palette

### Light Mode
- **Primary Brand:** 220 70% 50% (trustworthy blue)
- **Background:** 0 0% 100% (pure white)
- **Surface:** 220 20% 98% (soft gray for cards)
- **Border:** 220 15% 90% (subtle dividers)
- **Text Primary:** 220 15% 15% (near-black)
- **Text Secondary:** 220 10% 45% (muted gray)

### Dark Mode
- **Primary Brand:** 220 70% 55% (slightly brighter for contrast)
- **Background:** 220 15% 10% (deep charcoal)
- **Surface:** 220 12% 15% (elevated cards)
- **Border:** 220 10% 25% (subtle dividers)
- **Text Primary:** 220 10% 95% (near-white)
- **Text Secondary:** 220 8% 65% (muted light)

### Status Colors
- **Success/Positive:** 142 75% 45% (green for healthy balances)
- **Warning:** 38 92% 50% (amber for low funds)
- **Danger:** 0 72% 51% (red for depleted buckets)
- **Neutral:** 220 10% 50% (gray for inactive states)

---

## Typography

**Font Stack:** Inter (Google Fonts CDN)

### Hierarchy
- **Hero/Dashboard Title:** text-3xl md:text-4xl font-bold (36-48px)
- **Section Headers:** text-2xl font-semibold (30px)
- **Card Titles:** text-lg font-semibold (18px)
- **Body Text:** text-base font-normal (16px)
- **Bucket Amounts:** text-2xl md:text-3xl font-bold (30-36px, tabular nums)
- **Transaction Details:** text-sm font-medium (14px)
- **Labels/Meta:** text-xs font-medium uppercase tracking-wide (12px)

---

## Layout System

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16 consistently
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Card gaps: gap-4 to gap-6

**Container Strategy:**
- Dashboard: max-w-6xl mx-auto px-4
- Transaction forms: max-w-md mx-auto
- Full-width bucket overview: w-full with inner max-w-7xl

**Grid Layouts:**
- Bucket cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Transaction list: Single column with max-w-2xl
- Dashboard stats: grid-cols-2 md:grid-cols-4 for quick metrics

---

## Component Library

### Navigation
- **Top Bar:** Fixed header with app logo, total balance display, quick add button
- **Mobile:** Bottom tab bar with Dashboard, Add Transaction, History, Buckets icons
- **Desktop:** Sidebar navigation with icons + labels

### Bucket Cards
- **Design:** Rounded-lg cards (rounded-xl) with subtle shadow
- **Content Layout:**
  - Bucket name (top left, font-semibold)
  - Current balance (large, center, tabular-nums)
  - Allocated amount (small, muted, below balance)
  - Progress bar showing remaining % (bottom, thin 2px height)
- **Status Indicators:** 
  - Healthy: green accent on progress bar
  - Low (<20%): amber accent
  - Depleted: red accent with warning icon

### Transaction Entry Form
- **Layout:** Modal or slide-up panel (mobile-first)
- **Fields:**
  - Bucket selector: Large touch-friendly buttons showing bucket name + current balance
  - Amount input: Extra-large numeric keypad-friendly input
  - Description: Optional text field (text-sm placeholder)
  - Date: Auto-filled, editable with calendar picker
- **Actions:** Primary "Log Spending" button (full-width on mobile)

### Transaction History
- **List Items:** Card-based with:
  - Left: Bucket color indicator (4px vertical bar)
  - Center: Description + timestamp (stacked)
  - Right: Amount (bold, tabular-nums)
- **Filtering:** Top tabs for All/By Bucket with dropdown
- **Grouping:** By date with section headers (text-xs uppercase text-muted)

### Dashboard Widgets
- **Total Overview:** Hero card showing all allocated vs. remaining funds
- **Quick Stats:** 2x2 grid showing: Total Income, Total Spent, Largest Bucket, Lowest Bucket
- **Recent Activity:** Last 5 transactions in condensed list format

### Forms & Inputs
- **Text Inputs:** Border-2 with focus:ring-2 ring-primary
- **Number Inputs:** Right-aligned, tabular-nums, large text (text-2xl for amounts)
- **Select/Dropdown:** Custom styled with chevron icon
- **Buttons:**
  - Primary: bg-primary text-white rounded-lg px-6 py-3
  - Secondary: border-2 border-primary text-primary
  - Danger: bg-red-600 text-white (for delete actions)

### Data Visualization
- **Progress Bars:** Thin (h-2), rounded-full, gradient from primary to success
- **Pie Chart (Optional):** For allocation overview on dashboard
- **Trend Indicators:** Small sparklines for spending patterns (if applicable)

---

## Interaction Patterns

### Animations
**Minimal Use - Performance First:**
- Bucket cards: Scale on press (scale-95 active:scale-100)
- Modal entry: Slide-up transition (translate-y)
- Success states: Simple checkmark fade-in (no complex animations)
- Loading: Subtle pulse on skeleton cards

### Micro-interactions
- Haptic feedback on mobile for transaction logging
- Toast notifications for confirmations (top-right, 3-second auto-dismiss)
- Empty states with encouraging copy and clear CTA

---

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 for text)
- All interactive elements min 44x44px touch targets
- Form inputs with visible labels and error states
- Keyboard navigation support for all actions
- Screen reader-friendly bucket status announcements

---

## Images

**No Hero Images** - This is a utility app focused on function over visual storytelling.

**Optional Illustrations:**
- Empty states: Friendly SVG illustrations (e.g., empty wallet for no transactions)
- Onboarding: Simple line drawings explaining bucket concept
- Error states: Minimal icons indicating issue type

Use illustration library like unDraw or Humaaans for consistency if needed.

---

## Mobile-First Considerations

- Transaction logging is PRIMARY use case - optimize this flow
- Large touch targets for bucket selection
- Bottom navigation for thumb-friendly access
- Swipe gestures for transaction deletion (optional)
- Responsive bucket grid: Stack on mobile, 2-3 columns on tablet+