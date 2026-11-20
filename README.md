# HornPub + Fortress

Restores the archived HornPub menu, item pages, cart, reservations, and music pages behind Fortress CAPTCHA. This is a demo: no orders, payments or reservations are sent.

`npm ci`, `npm run build`, `npm test`, `npm run synth`. Deploy with `npm run deploy` to the dedicated `HornpubFortressDemo` stack in account 263318538229, us-east-1.

The active infrastructure is `infra/`; the original `bin/`, `lib/`, and `src-lambda/` are historical and are not deployed. The archive checkout is unchanged. Build output lives in `build/`, not the archived `dist/`.

CloudFront forwards every request to an IAM-protected Lambda URL. There is no public static origin. Only the welcome page, its promotional hero, gate CSS/JS, and robots.txt are public. HTML, scripts, menu data and images require a signed Secure/HttpOnly session cookie. All responses use private/no-store caching. Verification is bound to a server-created action, merchant origin and forceauth policy. The server exchanges the proof with Fortress using a merchant credential from Secrets Manager.

Human CAPTCHA or a phone-approved agent passport can grant access. Passports must authorize `browse` for `https://hornpub.click`. Sessions last at most 15 minutes and never outlive either passport or Document of Intent. `/verification` displays the authenticated merchant receipt, including a passport's phone IPs, merchant-specific hashed device ID, DoI and authorization fields. The receipt is signed in the HttpOnly cookie; do not log cookies or publish real receipts.

Fortress uses the independent `HORNPUB_MERCHANT_KEY` secret, matching AWS secret `hornpub/merchant-verify`. This onboarding binding preserves all existing `AGENT_MERCHANT_KEYS`. It requires the corresponding change in `fortress-captcha/src/api.mjs`. Never put credentials in the browser or source control.

Tests inject a verifier only through the exported handler factory. The deployed handler always calls Fortress; there is no environment switch, special cookie or HTTP endpoint that bypasses verification. An end-to-end human approval requires a real phone/passkey; fixture browser tests do not establish that live approval succeeded.

## Menu catalog and visual refresh

The catalog has 120 items across 10 categories, with 12 items per page. Full catalog data lives only in `lambda/menu-data.mjs`. Authenticated `/api/menu` supports category, search, sort and page; every response remains capped at 12 items. `/api/menu/:id` supplies full item details and related items. The frontend bundle contains no full product catalog. Menu pages use ordinary links and persistent query parameters so an agent can enumerate all pages and visit product details.

The original item IDs remain valid. The catalog, product images, and item APIs still require a valid Fortress session. Only the dedicated promotional hero at `/brand/pub-spread.webp` is public for the welcome page. Human CAPTCHA and scoped agent passport verification remain unchanged.

Run `npm run build && npm test && npm run test:browser`. Browser tests use a loopback-only fixture verifier, follow all 10 menu pages to collect 120 unique products, and check desktop/mobile search, category filters, sorting, product details, quantity, the demo tab, completion and layout overflow. Screenshots are written under `artifacts/catalog/`; these use fixture approval, not a live human passkey ceremony.

27 original photos were generated with the built-in image-generation tool, then encoded as WebP for the site. Prompts and asset provenance are recorded in `assets/image-prompts.json`; serving assets are in `src-site/public/menu/`. The public promotional copy is in `gate/brand/`. Related variants share illustrative photography; this remains a fictional pub demo.
