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
- Do not access GitHub unless the user explicitly asks to check whether a newer
  kit version exists.

The only exception is an explicit maintenance task from the kit owner performed
inside the canonical `courses/courses-nuxt-kit/` source directory.
