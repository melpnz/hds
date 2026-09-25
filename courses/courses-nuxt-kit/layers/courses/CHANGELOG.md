# Courses Kit changelog

## 1.0.1 — 2026-09-25

- AI agents now run one read-only version and integrity check at the start of a
  Courses UI task.
- An available update is offered to the user and is never installed
  automatically.
- Modified, missing and extra local layer files block replacement and are
  reported so application changes can be preserved during an explicit migration.

## 1.0.0 — 2026-09-23

- First stable copy-based Nuxt layer aligned with Courses guide v1.0.
- Includes public components, tokens, local icons and all required image assets.
- Adds an explicit, read-only update check with local integrity verification.
- Product teams may build wrappers and application components outside the layer;
  only the canonical maintainer changes and releases the layer itself.
