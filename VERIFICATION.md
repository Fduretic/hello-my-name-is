# Verification — 6 October 2026

## Executed and passed

- Installed exact pinned dependencies and generated `package-lock.json`; `npm ls --depth=0` found no invalid dependencies.
- `npm run build`: Angular production compilation passed. Final fallback bundle: 129.50 kB raw, approximately 39.09 kB transferred, plus locally served font assets.
- `npm test`: six tests passed covering fallback, normalization, input bounds/control characters, safe string serialization, and the supplied Compose/manifest contract.
- `npm run test:e2e`: eight Chromium tests passed against the development server, including a clean run where Playwright started and stopped the server itself.
- The same eight tests passed against the actual production Nginx container with `PUBLIC_DISPLAY_NAME=Alexandria-Catherine von Hohenlohe`. The development run displayed `YOUR NAME`. This verified a real environment-driven name change between builds.
- Browser checks covered 1440×1000, 768×1024, 390×844, 320×568 and 844×390; no scrolling, a preserved screen aspect ratio, and fitted name text. Desktop and mobile screenshots were visually inspected.
- Verified keyboard Enter/Space power control, overlay `pointer-events: none`, reduced motion, long-name resizing, and absence of browser runtime/console errors.
- Downloaded and inspected all three user-supplied design references; they are not included in production output.
- Verified the self-hosted font's SIL Open Font License and included it in the public assets.
- Built the final Docker image using pinned Node and Nginx image digests. Nginx configuration validation passed inside the final image.
- `docker-compose -f compose.yaml config` passed using the installed Compose 1.25.0; the file includes compatible version `3.7` and uses only allowed contract keys.
- `sh scripts/verify-container.sh` completed successfully. Two separately named Compose projects served `/health` both via localhost and service DNS from inside their containers. Cross-project HTTP traffic was blocked. The first container reached Docker's `healthy` state.
- Tested both running containers at 768 MiB RAM, 2 CPUs and 256 PIDs. Each used approximately 3.3 MiB and 3 processes during the smoke checks. This is a smoke measurement, not a load benchmark.
- Verified CSP, `nosniff`, and framing headers on both `/` and `/index.html`; `.env` and missing assets returned 404.
- Removed and recreated the first project; health and the baked-in display name survived recreation. Both temporary test projects and their networks were cleaned up.

Production testing caught and resolved a CSP conflict with Angular's inline stylesheet-loading event handler. Critical-CSS inlining is disabled so production styles load directly without inline script permission.

## Not applicable

No database, migrations, uploads, API/backend, stored user data, persistent mounts, workers, or scheduled commands exist. There is no persistent-data recovery or account/object access-control flow to test.

## Remaining external steps and limitations

- VPS Admin itself was not available. Local checks validate only the supplied contract, not its actual manifest parser, domain routing, TLS or installation workflow.
- Set optional public build key `PUBLIC_DISPLAY_NAME` in VPS Admin's Compose build environment; changing it requires rebuilding the image. No runtime keys or secrets are needed. The supplied `environment: []` manifest shape is preserved; if VPS Admin requires separate build-variable catalog descriptors, supply that schema before adding them.
- No repository destination was supplied. The workspace's `.git` entry is empty and read-only, so there is no usable Git repository and no commit was created. No repository was created remotely, and nothing was pushed or deployed.
- Browser verification used Chromium only, not Firefox, Safari or physical devices. The host's Ubuntu 20 installation required Playwright's explicit `ubuntu22.04-x64` fallback browser download; that browser launched and completed all checks successfully.

See `README.md` for local start commands and the deployment sequence.
