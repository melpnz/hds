# Instructions for AI agents

Treat this directory as vendored, read-only source when it is copied into a
product project.

- Do not edit, patch, format, rename or delete files inside `layers/courses`.
- Do not override the internal markup or private CSS selectors of kit components.
- You may use public components, props and slots from this layer.
- You may create application components, wrappers and page compositions outside
  this directory.
- If the public API is insufficient, describe the missing capability and propose
  a change request for the kit maintainer instead of forking the component.

At the beginning of each agent task that uses Courses UI, run this read-only
check once from the product repository:

```bash
node layers/courses/scripts/check-update.mjs --json
```

- The check may read the latest manifest from GitHub, but it must never run in a
  runtime, build or development process.
- If a newer version exists, tell the user what version is available and offer
  to update. Never download, replace or merge the layer without explicit user
  approval.
- If integrity is not clean, list the changed, missing and extra files. Never
  overwrite them. Explain that application-owned changes should be preserved
  outside `layers/courses` before a deliberate migration.
- If GitHub is unavailable, report that the version check failed and continue
  with the local layer. Do not treat a failed check as permission to replace it.
- Do not repeat the network check during the same task unless the user asks.

The only exception is an explicit maintenance task from the kit owner performed
inside the canonical `courses/courses-nuxt-kit/` source directory.
