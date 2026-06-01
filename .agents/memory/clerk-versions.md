---
name: Clerk version compatibility
description: @clerk package version requirements and pnpm-workspace.yaml setup to avoid build failures
---

**Rule:** `@clerk/react@6.x` and `@clerk/express@2.x` both require `@clerk/shared@^4.x`. The pnpm minimumReleaseAge guard (1440 min) blocks these newer Clerk versions by default.

**Why:** @clerk/react@5.54.0 (the only version that passed the 1-day age check initially) was actually a newer release that required @clerk/shared exports (`clerkUiScriptUrl`, `buildClerkUiScriptAttributes`, `loadClerkUiScript`) not present in the `3.47.7` that pnpm resolved. The fix was: (1) add `@clerk/*` to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`, (2) pin `@clerk/react@^6.7.2`, `@clerk/express@^2.1.22`, `@clerk/shared@^4.14.0`.

**How to apply:** Whenever adding or updating any `@clerk/*` package, ensure `@clerk/*` is in `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` and that `@clerk/shared@^4.x` is installed in any package that installs `@clerk/react@6.x` or `@clerk/express@2.x`.
