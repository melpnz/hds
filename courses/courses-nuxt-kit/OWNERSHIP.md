# Ownership and contribution policy

Courses Nuxt Kit has a single maintainer: `@melpnz`.

Only the maintainer changes the canonical kit under
`courses/courses-nuxt-kit/` and publishes new kit versions. Other contributors
may report a missing capability, provide a reproduction or propose an API, but
changes to the kit are reviewed and released by the maintainer.

## Product projects

Projects copy `layers/courses` into their own repository. That copied directory
is vendored, read-only source:

- use its public components, props, slots and documented extension points;
- create project-specific components, wrappers and page compositions outside
  `layers/courses`;
- do not edit files inside the copied layer or override component internals;
- request a kit change when the existing public API is insufficient.

A project component remains owned by that project. If it becomes reusable across
products, it can be proposed to the kit maintainer and, if accepted, will arrive
through a new canonical kit release.

This document describes the supported team workflow. The legal permissions of
the source remain defined by [LICENSE](./LICENSE).
