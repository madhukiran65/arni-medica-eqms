# Responsive Design & Mobile Guide

Quick reference for building responsive components in the Arni Medica eQMS frontend.

## Using Responsive Hooks

### Import the hook
```javascript
import { useIsMobile, useIsTablet, useIsSmall, useIsLarge } from '@/hooks/useMediaQuery'
```

### Use in your component
```jsx
export default function MyComponent() {
  const isMobile = useIsMobile()    // < 768px
  const isTablet = useIsTablet()    // < 1024px
  const isSmall = useIsSmall()      // < 640px
  const isLarge = useIsLarge()      // ≥ 1280px

  return (
    <div className={`p-${isMobile ? '4' : '6'}`}>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  )
}
```

## Tailwind Responsive Classes

### Breakpoints
- `sm:` — 640px and up
- `md:` — 768px and up (sidebar appears, mobile nav disappears)
- `lg:` — 1024px and up
- `xl:` — 1280px and up

### Common Patterns

#### Grid layouts
```jsx
// Responsive grid: 2 cols on mobile → 3 on tablet → 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

#### Hidden/Shown at breakpoints
```jsx
// Show only on mobile
<div className="md:hidden">Mobile content</div>

// Show only on desktop
<div className="hidden md:block">Desktop content</div>

// Show on tablet and up
<div className="hidden md:flex lg:grid">
```

#### Responsive spacing
```jsx
// Padding: 4px mobile, 6px tablet+
<div className="p-4 md:p-6">

// Margin: 4px mobile, 8px desktop+
<div className="m-4 lg:m-8">

// Gap in flex/grid: 3px mobile, 4px tablet+
<div className="gap-3 md:gap-4">
```

#### Responsive text
```jsx
// Font size: small on mobile, large on desktop
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
```

#### Responsive display
```jsx
// Display: flex on mobile, grid on desktop
<div className="flex md:grid grid-cols-2">

// Width: full on mobile, auto on desktop
<button className="w-full md:w-auto">
```

## Component Best Practices

### 1. Mobile-First Approach
Always design for mobile first, then add desktop enhancements:
```jsx
// BAD: Desktop classes without mobile fallback
<div className="grid-cols-4 gap-6 p-8">

// GOOD: Mobile first
<div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 md:gap-4 md:p-6 lg:grid-cols-4">
```

### 2. Dynamic Heights for Charts
```javascript
const chartHeight = isMobile ? 250 : isTablet ? 300 : 350
<ResponsiveContainer width="100%" height={chartHeight}>
```

### 3. Conditional Content
```jsx
{isMobile ? (
  <CompactLayout /> // Fewer items, stacked
) : (
  <ExpandedLayout /> // Full details, side-by-side
)}

// Or show/hide specific counts
{Array.isArray(items) ? items.slice(0, isMobile ? 5 : 10) : []}
```

### 4. Touch-Friendly Touch Targets
```jsx
// Mobile buttons should be at least 44px×44px
// Our standard: h-10 w-10 (40px) for icons, h-12 (48px) for text buttons
<button className="h-10 w-10 rounded-lg hover:bg-slate-700">
<button className="h-12 px-4 rounded-lg btn-primary">
```

### 5. Responsive Icons
```jsx
// Scale icons with screen size
<Icon size={isMobile ? 16 : 20} />
<Icon size={isMobile ? 14 : 18} className="text-blue-400" />
```

### 6. Truncate & Ellipsis
```jsx
// Prevent overflow on mobile
<span className="truncate">Long text that might overflow</span>
<span className="line-clamp-2">Multiple lines, max 2</span>

// Block truncate with flex
<div className="flex-1 min-w-0">
  <p className="truncate">This won't break the layout</p>
</div>
```

## Layout Patterns

### Responsive Two-Column
```jsx
<div className="grid gap-6 md:grid-cols-2">
  <div>Left column</div>
  <div>Right column (stacks on mobile)</div>
</div>
```

### Responsive Three-Column
```jsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

### Sidebar + Content
```jsx
<div className="flex flex-col md:flex-row gap-6">
  {/* Sidebar (hidden on mobile, or below on mobile) */}
  <aside className="w-full md:w-60">{/* sidebar content */}</aside>

  {/* Main content */}
  <main className="flex-1">{/* main content */}</main>
</div>
```

### Sticky Header
```jsx
<header className="sticky top-0 z-40 bg-eqms-card border-b">
  {/* Header stays at top when scrolling */}
</header>
<main className="pb-20 md:pb-0">
  {/* Content with bottom padding for mobile nav */}
</main>
```

## Common Mistakes

### ❌ Don't
```jsx
// Hard-coded sizes that break on mobile
<div className="p-8 text-3xl">

// Hidden content without mobile alternative
<aside className="w-60">{/* sidebar not hidden on mobile */}</aside>

// No bottom padding for mobile nav
<main>{/* content hidden under fixed nav */}</main>

// Not checking if it's mobile before fetching expensive data
useEffect(() => {
  loadHeavyData() // Loads even on mobile
}, [])

// Truncating without min-w-0
<div className="flex">
  <span className="truncate">Too long</span> {/* Won't truncate */}
</div>
```

### ✅ Do
```jsx
// Responsive spacing
<div className="p-4 md:p-6 lg:p-8 text-xl md:text-2xl lg:text-3xl">

// Hidden sidebar on mobile
<aside className="hidden md:block w-60">{/* sidebar */}</aside>

// Bottom padding for mobile nav
<main className="pb-20 md:pb-0">{/* content */}</main>

// Optional data loading on mobile
useEffect(() => {
  if (!isMobile) {
    loadHeavyData() // Only load on desktop
  }
}, [isMobile])

// Proper truncation with min-w-0
<div className="flex">
  <span className="truncate min-w-0">Too long</span> {/* Will truncate */}
</div>
```

## Navigation Components

### Mobile Bottom Navigation
- Auto-hidden on `md:` breakpoint
- Always visible on mobile
- Fixed at bottom with `fixed bottom-0 left-0 right-0`
- Height `h-16` (64px) — add `pb-20` to main content

### Sidebar
- Auto-hidden on mobile via Layout.jsx conditional
- Shows on `md:` breakpoint (768px+)
- Toggle button visible only on mobile (`lg:hidden` class in Header)

## Testing Responsive Layouts

### Browser DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M / Cmd+Shift+M)
3. Select common devices or custom sizes
4. Test at these breakpoints:
   - 375px (mobile)
   - 768px (tablet/md)
   - 1024px (desktop/lg)
   - 1280px (large/xl)

### Real Device Testing
Always test on actual devices:
- iOS: Safari on iPhone 12 mini (375px)
- Android: Chrome on Pixel 4a (412px)
- Tablet: iPad (768px)
- Desktop: Any 1920px+ monitor

## Performance Tips

1. **Avoid** heavy computations in render when checking `isMobile`
2. **Use** CSS classes over JS conditional when possible (faster)
3. **Lazy-load** heavy components on desktop only
4. **Memoize** expensive calculations in responsive components

```javascript
// Good: Let CSS handle it
<div className="hidden md:flex">{/* Heavy component */}</div>

// Better for expensive components: Skip mounting on mobile
{!isMobile && <HeavyComponent />}
```

## Reference: Tailwind Breakpoints

```
Default (mobile-first):  styles apply to all screens
sm: 640px   — 640px and up
md: 768px   — 768px and up (Layout sidebar appears here)
lg: 1024px  — 1024px and up
xl: 1280px  — 1280px and up
2xl: 1536px — 1536px and up
```

---

**Need Help?** Check the existing responsive implementations:
- `/src/pages/dashboard/Dashboard.jsx` — responsive KPI grid, charts
- `/src/pages/analytics/Analytics.jsx` — responsive insights, trends, predictions
- `/src/components/layout/Layout.jsx` — sidebar/mobile nav logic
- `/src/components/common/MobileNav.jsx` — mobile nav component
