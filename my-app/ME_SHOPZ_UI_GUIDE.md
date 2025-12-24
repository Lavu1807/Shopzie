# Me‑Shopz UI Guide

Modern, mobile-first UI system for e-commerce. This guide covers the CSS structure, color palette, component usage, and layout best practices.

## CSS Structure

- Tokens & Theme (CSS variables)
  - Colors, spacing, radius, shadows, motion
- Base & Reset
  - Modern, safe reset; typography & background
- Layout Primitives
  - `.container`, `.section`, `.surface` variants
- Utilities
  - Grid: `.grid`, `.cols-1..4`, responsive `.md:cols-*`, `.lg:cols-*`
  - Flex: `.flex`, `.row`, `.col`, `.justify-between`, `.items-center`, `.wrap`
  - Spacing: `.p-*`, `.px-*`, `.py-*`, `.m-*`, `.my-*`
- Components
  - Buttons: `.btn`, `.btn-primary`, `.btn-ghost`
  - Product: `.product-card`, `.product-media`, `.product-body`, `.product-actions`
  - Dashboard: `.dashboard-grid`, `.dashboard-sidebar`, `.stats`, `.stat-card`, `.table`, `.status.*`
  - Navigation & Footer: `.navbar`, `.navbar-inner`, `.brand`
  - Forms: `.input`, `.select`
- Motion
  - `.animate-fade`, `.animate-slide-up`, `.animate-pulse`

File: `frontend/css/me-shopz.css`

## Color Palette

- Primary: `#5b8def` (Main), `#3b73ea` (Hover/600)
- Secondary: `#7c4dff` (Accent alt)
- Accent: `#00c2a8` (Info/teal)
- Success: `#16a34a`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Background: `#0b0d12` (Deep aurora)
- Surfaces: `#121623`, `#171c2b`, `#1b2134`
- Text: `#e6eaf2` (Primary), `#a7b0c0` (Muted)
- Border: `#2a3247`

Guidelines:
- Use `--color-primary` for key CTAs and highlights.
- Use `--color-elev-*` for layered depth; avoid pure black.
- Maintain contrast ratio ≥ 4.5 for text; darken borders on low-contrast areas.

## Layout Best Practices

- Mobile-first
  - Start with single-column `.grid.cols-1` and scale up using `.md:cols-*`, `.lg:cols-*`.
  - Ensure touch targets ≥ 44px height (`.btn`, form controls).
- Containers & Sections
  - Wrap content in `.container` and `.section` for consistent spacing.
  - Use `.surface` / `.surface-1` for cards and panels.
- Grid & Flex
  - Prefer Grid for product listings and dashboards; Flex for small toolbars.
  - Use `.gap-*` utilities to maintain rhythm between elements.
- Typography
  - Keep lines to 60–75 characters (`.max-w-xl` for paragraphs).
  - Use headings with decreasing weight and clear spacing.
- Cards
  - Use `.product-card` for product tiles; keep titles ~2 lines.
  - Ensure images use `object-fit: cover` and a stable `aspect-ratio`.
- Motion
  - Animate on intent: hover/focus/enter only.
  - Keep durations < 400ms; use `--ease-out` for entrance.
  - Provide focus rings (`:focus`) and avoid motion on essential actions.
- Accessibility
  - Distinguishable focus states, never color alone for status.
  - Respect reduced motion with `@media (prefers-reduced-motion)` if needed.

## Usage Examples

### Product Grid
```html
<section class="section">
  <div class="container">
    <h2>Featured Products</h2>
    <div class="grid cols-2 md:cols-3 lg:cols-4">
      <article class="product-card animate-slide-up">
        <div class="product-media">
          <span class="product-badge">New</span>
          <img src="/images/p1.jpg" alt="Product name" />
        </div>
        <div class="product-body">
          <h3 class="product-title">Noise Cancelling Headphones</h3>
          <p class="product-desc">Wireless · 30h battery · ANC</p>
          <div class="product-meta">
            <span class="product-price">$129</span>
            <span class="product-rating">★ 4.6</span>
          </div>
        </div>
        <div class="product-actions">
          <button class="btn btn-ghost">Wishlist</button>
          <button class="btn btn-primary">Add to Cart</button>
        </div>
      </article>
    </div>
  </div>
</section>
```

### Dashboard Shell
```html
<div class="container section">
  <div class="dashboard-grid">
    <aside class="dashboard-sidebar">
      <nav class="col gap-2">
        <button class="btn btn-ghost">Orders</button>
        <button class="btn btn-ghost">Products</button>
        <button class="btn btn-ghost">Analytics</button>
      </nav>
    </aside>
    <main class="dashboard-content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Orders</div>
          <div class="stat-value">1,248</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Delivered</div>
          <div class="stat-value">892</div>
        </div>
      </div>
      <div class="surface p-6">
        <table class="table">
          <thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            <tr class="table-row"><td>#1023</td><td><span class="status shipped">Shipped</span></td><td>$89</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</div>
```

### Navbar
```html
<header class="navbar">
  <div class="container navbar-inner">
    <div class="brand">Me‑Shopz <span class="brand-badge">Beta</span></div>
    <nav class="flex items-center gap-4">
      <a class="btn btn-ghost">Home</a>
      <a class="btn btn-ghost">Shop</a>
      <a class="btn btn-primary">Cart</a>
    </nav>
  </div>
</header>
```

## Integration

- Include stylesheet after existing CSS to override gradually:
```html
<link rel="stylesheet" href="/frontend/css/me-shopz.css" />
```
- Use utility classes to compose rather than adding new bespoke CSS.
- Migrate progressively: start with product listing and dashboard pages.

## Performance & Quality

- Prefer class reuse over new rules to keep CSS small.
- Use modern images (WebP/AVIF), `width/height` for CLS control.
- Avoid heavy shadows on mobile lists; keep motion subtle.
- Test at breakpoints: 360px, 768px, 1024px, 1280px.

## Roadmap (Optional)

- Light theme tokens via `[data-theme="light"]` override.
- Component library: badges, toasts, skeletons.
- `prefers-reduced-motion` motion reductions.
