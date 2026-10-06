# Hello, my name is

A single-page Angular 21.2.25 introduction inside a curved CRT. The sticker is rendered HTML, with a small generated displacement map, CSS scanlines, phosphor texture, vignette and glass reflection. The keyboard-accessible power button switches between the introduction and standby. Motion follows the visitor's reduced-motion preference.

## Local development

Use Node 22.22.0 (Node 20.19+ also works) and npm. Run `npm ci`, copy `.env.example` to `.env`, optionally set `PUBLIC_DISPLAY_NAME`, and run `npm start`. Open `http://localhost:4200`. Production output: `npm run build` → `dist/hello/browser`.

`PUBLIC_DISPLAY_NAME` is **public build-time text**, not a secret. Missing or blank values render `YOUR NAME`. Values are normalized to NFC, trimmed, and limited to 120 Unicode characters without control characters. Unicode names and punctuation are supported. Restart the development server or rebuild the production image after changes. The generated module uses JSON serialization and Angular text interpolation; markup is never interpreted as HTML. Other environment variables are not bundled.

## Deployment with VPS Admin

One static service, `web`, serves HTTP on `0.0.0.0:80`. No backend, database, persistent storage, migrations, workers or schedules. No published host ports, external volumes or custom networks. VPS Admin supplies subdomain routing and HTTPS; URL path prefixes are unsupported. Nginx supplies the readiness route `/health`, `wget` is included in its image, and security headers apply to the frontend. HTTPS/HSTS policy belongs to the external TLS proxy.

1. Supply the optional public key **`PUBLIC_DISPLAY_NAME`** in the build environment used by VPS Admin's Compose invocation. Leave it unset for `YOUR NAME`.
2. Build using `docker compose -f compose.yaml build --pull`.
3. Start using `docker compose -f compose.yaml up -d`.
4. Check `docker compose -f compose.yaml ps` and `docker compose -f compose.yaml exec -T web wget -q -O - http://127.0.0.1:80/health` (expected `ok`).
5. Point VPS Admin to `vps-admin.yaml`, with the public target `web:80`, on a subdomain. After changing the name, rebuild and recreate `web`.

`PUBLIC_DISPLAY_NAME` is explicitly mapped under `build.args`; it is not a runtime environment variable. The supplied manifest `environment: []` is preserved because no runtime variables are required and no schema for additional VPS Admin variable descriptors was provided. If VPS Admin requires catalog entries for build arguments, its actual descriptor schema is needed to register this key there; the Compose wiring is complete. No undocumented manifest properties were added.

The Docker build pins base-image versions and digests and uses a dependency lockfile. Runtime is a small Nginx static server with two workers, compatible with the stated 768 MB / 2 CPU / 256 PID limits; the Angular build may need more build-machine memory. No deployment, repository creation or push is performed by this project.

## Checks

- `npm test`: configuration validation and Compose/manifest contract checks.
- `npx playwright install chromium` then `npm run test:e2e`: browser errors, configured name, keyboard power control, overlay pointer behavior, desktop/tablet/mobile/landscape sizing, long-name fitting and reduced motion.
- `PUBLIC_DISPLAY_NAME='Alexandria-Catherine von Hohenlohe' npm run test:e2e`: verify a different name from the actual environment (stop any existing development server first).
- Browser screenshots are written to `artifacts/` and excluded from Git.
- `sh scripts/verify-container.sh`: build the production image, start two isolated Compose projects without host ports, apply the runtime limits, run the browser suite against the image, check security headers and health, recreate the service, and clean up both test projects. Requires Docker access and an installed Playwright Chromium browser.

See `VERIFICATION.md` for checks actually executed and remaining deployment limitations. Contract tests validate the provided baseline, not an unavailable VPS Admin validator. There are no access-control or data-access rules because the page has no accounts, APIs, uploads or stored user data.

## Fonts and design inputs

UnifrakturCook Bold is self-hosted through pinned `@fontsource/unifrakturcook` 5.3.0, licensed under SIL Open Font License 1.1. Its license is included in `public/licenses/UnifrakturCook-OFL.txt`. Old English Text MT and Georgia are local fallback fonts; Arial and Courier New use the visitor's installed system fonts. No font requests go to external services.

The three supplied references were downloaded and inspected as design inputs. They are not shipped in the website. The conventional HELLO header retains sans-serif typography; the name uses Old English lettering.
