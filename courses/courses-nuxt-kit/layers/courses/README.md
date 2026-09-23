# Courses layer

This directory is the copyable Courses UI layer.

In a product repository it is vendored, read-only source. Do not modify files in
this directory. Build project-specific components and wrappers outside the layer
and compose them from its public components.

If a public component or extension point is missing, send a change request to
the Courses Nuxt Kit maintainer. Accepted changes are made in the canonical kit
and delivered in a new version.

The layer has no runtime, development or build-time connection to GitHub.

Its version is recorded in `courses-kit.manifest.json`. Only when the user asks
to check for updates, run:

```bash
node layers/courses/scripts/check-update.mjs
```

The command reports version and integrity status. It does not download or modify
the layer.

See [CHANGELOG.md](./CHANGELOG.md) before deliberately replacing this directory
with a newer release.
