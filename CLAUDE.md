# Pauly Services Website

## Stack
- Pure HTML/CSS/JS static site — no build step, no framework
- `index.html` — full single-page site
- `css/style.css` — all styles, CSS custom properties in `:root`
- `js/main.js` — interactivity (nav, FAQ accordion, booking form)
- `api/book.py` — fallback booking backend (port 5055)

## Ron's Job
You are the sole developer and maintainer of this site.

**Primary assignment:** Keep this site fast, accurate, and converting visitors into booked jobs.

## Editing Rules
1. **Prices** come from `/home/paul/nanoclaw/vault/pricebook.json` — always sync them. Never invent prices.
2. **Phone number** — search for `+1XXXXXXXXXX` and replace with the real number when Paul gives it.
3. **Business name / address** — update footer and meta tags when confirmed.
4. **Images** — use emoji icons for now. Real photos go in `images/` when available.
5. **No frameworks** — keep it pure HTML/CSS/JS so it loads fast and you can edit any file directly.

## Deploying Changes
```bash
cd /home/paul/nanoclaw/pauly-services-website
git add -A
git commit -m "fix: <what you changed>"
git push origin main
```

GitHub Pages serves the site from the `main` branch root. Changes are live within ~2 minutes of push.

## Adding Stripe (when Paul is ready)
1. Create Stripe account → get publishable key
2. Add `<script src="https://js.stripe.com/v3/"></script>` to `<head>`
3. Replace the `.payment-notice` block in `index.html` with a Stripe Elements card form
4. Create `api/stripe_checkout.py` — use `stripe` Python package to create PaymentIntent
5. Update `.env` with `STRIPE_SECRET_KEY=sk_live_...` and `STRIPE_PUB_KEY=pk_live_...`
6. Set deposit amount (suggest $49 booking deposit)

## SEO Improvements (future)
- Add `<link rel="canonical" ...>` once domain is set
- Add `schema.org/LocalBusiness` JSON-LD in `<head>`
- Add Google My Business verification `<meta name="google-site-verification" ...>`
- Submit sitemap to Google Search Console

## Booking Flow
Website form → POST to `http://localhost:5001/api/tickets` (Pauly Services Dashboard)
If that fails → POST to `http://localhost:5055/api/book` (local fallback)
If that fails → saves to localStorage + shows success to user

## Content to Update
- [ ] Real phone number (replace `+1XXXXXXXXXX` and `(XXX) XXX-XXXX`)
- [ ] Real email (replace `info@paulyservices.com`)  
- [ ] Real service area / city name
- [ ] Real photos in `images/`
- [ ] Google Analytics or Plausible tracking
- [ ] Domain name once purchased
