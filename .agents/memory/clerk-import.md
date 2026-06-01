---
name: Clerk publishableKeyFromHost import location
description: Where to import publishableKeyFromHost — critical for Clerk setup in this monorepo
---

**Rule:** On the frontend (React/Vite), import `publishableKeyFromHost` from `@clerk/react/internal`, NOT from `@clerk/shared/keys`.

**Why:** The monorepo has multiple versions of `@clerk/shared` installed (v2 for old server code, v4 for new). esbuild resolves `@clerk/shared/keys` to the v2 package which doesn't export `publishableKeyFromHost`. Importing from `@clerk/react/internal` avoids this resolution ambiguity because it goes through @clerk/react's own bundled internals.

**How to apply:** In `App.tsx` or any React file needing the publishable key resolution:
```typescript
import { publishableKeyFromHost } from '@clerk/react/internal';
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
```
On the server (`app.ts`): `@clerk/shared/keys` works correctly when `@clerk/shared@^4.x` is declared in the package's own `dependencies`.
