# Courses Nuxt Kit

Nuxt 4 component layer based on the visual language and public component inventory of HDS Courses v1.0.

## Included

- 74 Vue components, including 72 public catalog entries;
- actions, forms, navigation, data display, entities, feedback, collections, layout, frame modules and overlays;
- shared Courses tokens and responsive foundations;
- Nuxt UI behavior for modal, drawer and tooltip primitives;
- searchable component catalog with source maturity and state coverage;
- local Tabler Icons Outline collection under the MIT license.

Completed components have no status label in the catalog. Components that are still being implemented use the `in-progress` status and display the label «В разработке».

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000/ui](http://localhost:3000/ui). The root route redirects to the catalog. Choose `Icons` under `Категории` to open the searchable icon gallery without leaving the catalog.

## Distribution model

GitHub is only the place where the source library and its catalog are stored. The library is not consumed as an npm package or as a live Git dependency.

To use it in a project, download the repository and copy `layers/courses` into that project's `layers/courses` directory. The copy builds and runs locally and has no runtime, development or build-time connection to GitHub.

The copied layer is vendored, read-only source. Do not edit it in a product repository. Teams may freely create their own components, wrappers and page compositions outside `layers/courses` and compose them from the kit's public API. If the public API is insufficient, request a change from the kit maintainer; accepted changes are released from the canonical repository as a new kit version. See [OWNERSHIP.md](./OWNERSHIP.md).

The receiving Nuxt project must install the library's build dependencies:

```bash
pnpm add @nuxt/ui @fontsource-variable/inter
pnpm add -D @iconify-json/tabler
```

Inter is imported by the copied layer itself. The receiving application only installs `@fontsource-variable/inter`; it does not need to add a separate font import to its own CSS.

## Use the copied Nuxt layer

After copying the directory, enable Nuxt UI and extend the local layer:

```ts
export default defineNuxtConfig({
  extends: ['./layers/courses'],
  modules: ['@nuxt/ui'],
  ui: { colorMode: false }
})
```

Components are auto-imported without the old `Courses` prefix, for example:

```vue
<Button>Продолжить</Button>
<CourseCard title="Frontend-разработчик" />
```

The copied layer contains its assets, version manifest, structured token manifest
and integrity list. It is
self-contained and does not need the catalog application from this repository.
Release notes travel with it in
[`layers/courses/CHANGELOG.md`](./layers/courses/CHANGELOG.md).

## Check for updates

There are no automatic update checks. Only when a user explicitly requests it,
run from the receiving project:

```bash
node layers/courses/scripts/check-update.mjs
```

The command compares the local manifest with the latest manifest on GitHub,
reports whether a newer version exists and detects modified, missing or extra
files inside the copied layer. It never downloads or changes files. A modified
copy must be reviewed and moved back to application-owned code before replacing
the layer with a newer release.

## Validation

```bash
pnpm run check
pnpm run typecheck
pnpm run build
pnpm run test:consumer
pnpm run test:smoke
pnpm run test:visual
```

## Prepare a release archive

After committing a version and binding its manifest to the source revision, run:

```bash
pnpm run create:release
```

The command verifies the manifest and clean layer boundary, then creates
`dist/courses-nuxt-kit-v<version>.zip` plus its SHA-256 file. The archive
contains only `layers/courses`; generated application, test and dependency
directories cannot enter it.

The [Courses workflow](../../.github/workflows/courses-ci.yml) runs for every
Courses push and pull request. Contract drift, compatibility, build and the
offline consumer run on Linux; guide/provider render smoke uses Chromium;
approved screenshots are compared separately on Windows with Microsoft Edge.

## License

The library source code is available under the [MIT License](./LICENSE). It may be copied, modified and used commercially as long as the copyright and license notice remain with redistributed copies.

Third-party dependencies keep their own terms: Tabler Icons and Nuxt UI use MIT licenses, while Inter is distributed under the SIL Open Font License 1.1. Their copyright notices and license texts are collected in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

Habr names, logos and reference brand assets belong to Habr and are included in this repository with Habr's permission. The repository's MIT license covers the library source code but does not grant a separate right to use Habr trademarks outside the library and its intended products.

The MIT license describes legal permissions. The supported team workflow and
canonical maintainer boundary are described separately in
[OWNERSHIP.md](./OWNERSHIP.md).

## Roadmap

Технический долг по композиции компонентов и семантическим токенам зафиксирован в [ROADMAP.md](./ROADMAP.md). Пункты выполняются по одному, с отдельной визуальной проверкой и коммитом.

This repository is the source template for the Courses component library. Releases describe changes that an executor may copy into a project deliberately; existing project copies are never updated automatically.
