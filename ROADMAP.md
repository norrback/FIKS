# FIKS — Implementation Roadmap

Items are prioritized into MVP (must-have for launch) and Post-MVP (important but can wait).
Mark items `[x]` when completed.

---

## MVP

### Auth & Onboarding
- [ ] **Signup email verification** — Send a confirmation email on registration; account inactive until verified.
- [ ] **Repairer/customer role selection at signup** — Improve the current signup flow so the role choice (repairer vs. customer) is clearer and better guided.

### Core Flow
- [ ] **Repair story flow improvements** — Guided step-by-step flow (next → next → done) with scoring. WhatsApp-style chat with checkpoints for process progress (applied → agreed → in progress → completed → rated). Define checkpoints so they can later drive **escrow** milestones (when to hold funds, when to release, cancellation/refund) in the payments phase.

### Notifications
- [ ] **Platform notifications** — In-app notification center (bell icon) for events like new applications, messages, status changes.
- [ ] **Email notifications** — Transactional emails for key events (someone applied to your listing, new message, repair completed).

### Listings
- [ ] **Listing expiration** — Listings auto-expire after 20 days. Owner can renew; expired listings get status "vanhentunut" (expired) and are hidden from search.

### Pages
- [ ] **About page** — Company info, mission, how it works.
- [ ] **Privacy policy page** — GDPR-compliant privacy policy.
- [ ] **Terms of service page** — Usage terms and conditions.
- [ ] **Contact page** — Contact form or support email.

### Mobile
- [ ] **Mobile optimization** — Responsive layout pass across all pages; touch-friendly interactions.
- [ ] **Sticky navigation on mobile** — Top menu stays visible when scrolling on small screens.

---

## Post-MVP

### Payments
- [ ] **Payment provider integration (Stripe or similar)** — Foundation for platform fees, subscriptions, and repair-related charges. **Timing:** after MVP launch and onboarding are stable.
- [ ] **Repair story escrow** — Hold customer funds in escrow for a repair tied to the repair story lifecycle: capture or commit payment at an agreed milestone (e.g. after **agreed**; exact trigger is a product decision); release to the repairer when the job reaches **completed** per policy (e.g. customer confirmation and/or dispute window); cancellation and refund paths when agreement falls through or work does not proceed. Expose payment/escrow status and required actions in the repair chat/story UI next to existing progress checkpoints. **Planning:** provider model (e.g. Stripe Connect, separate charges and transfers, manual vs automatic capture), dispute handling, and Finnish/EU compliance in a dedicated payments design pass.

### Intelligence
- [ ] **AI repair proposals** — Suggest relevant listings to repairers based on their expertise and recent repair history ("repairs for me" feed).

### Analytics
- [ ] **Listing stats (user-facing)** — Show listing owners how many views/clicks their listing has received.
- [ ] **Admin dashboard & stats** — Platform-wide metrics (total users, listings, active repairs, conversion rates). Decide: separate admin login vs. role-based access for existing accounts.

### Internationalization
- [ ] **Language switcher** — Multi-language support (Finnish / Swedish / English). UI switcher component + translated content.

### SEO
- [ ] **SEO optimization** — Meta tags, Open Graph, structured data (JSON-LD), sitemap.xml, robots.txt, semantic HTML review.

---

## Completed

_Move items here as they are finished._

- [x] **Vercel deployment** — PostgreSQL + Blob storage, custom domain setup.
