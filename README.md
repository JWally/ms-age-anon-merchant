# HornPub + Fortress

Restores the archived HornPub menu, item pages, cart, reservations, and music pages behind Fortress CAPTCHA. This is a demo: no orders, payments or reservations are sent.

`npm ci`, `npm run build`, `npm test`, `npm run synth`. Deploy with `npm run deploy` to the dedicated `HornpubFortressDemo` stack in account 263318538229, us-east-1.

The active infrastructure is `infra/`; the original `bin/`, `lib/`, and `src-lambda/` are historical and are not deployed. The archive checkout is unchanged. Build output lives in `build/`, not the archived `dist/`.

CloudFront forwards every request to an IAM-protected Lambda URL. There is no public static origin. Only the welcome page, gate CSS/JS, and robots.txt are public. HTML, scripts, menu data and images require a signed Secure/HttpOnly session cookie. All responses use private/no-store caching. Verification is bound to a server-created action, merchant origin and forceauth policy. The server exchanges the proof with Fortress using a merchant credential from Secrets Manager.

Human CAPTCHA or a phone-approved agent passport can grant access. Passports must authorize `browse` for `https://hornpub.click`. Sessions last at most 15 minutes and never outlive either passport or Document of Intent. `/verification` displays the authenticated merchant receipt, including a passport's phone IPs, merchant-specific hashed device ID, DoI and authorization fields. The receipt is signed in the HttpOnly cookie; do not log cookies or publish real receipts.

Fortress uses the independent `HORNPUB_MERCHANT_KEY` secret, matching AWS secret `hornpub/merchant-verify`. This onboarding binding preserves all existing `AGENT_MERCHANT_KEYS`. It requires the corresponding change in `fortress-captcha/src/api.mjs`. Never put credentials in the browser or source control.

Tests inject a verifier only through the exported handler factory. The deployed handler always calls Fortress; there is no environment switch, special cookie or HTTP endpoint that bypasses verification. An end-to-end human approval requires a real phone/passkey; fixture browser tests do not establish that live approval succeeded.
