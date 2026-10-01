# Courses Kit changelog

## Unreleased

## 1.2.0 — 2026-10-01

Compatible with Courses guide v1.1.

- SortSheet uses the same white external mobile handle as Modal (64 × 4).
- FilterChip forwards attributes to its trigger, matches chevron/icon colors,
  hides zero counts and exposes descriptive count names via countLabel.
- OptionList supports opt-in fit width; fluid/embedded sizing takes precedence.
- SiteHeader exposes filtersCount and open-filters/open-sort events.

- Expanded visual regression to 20 surfaces/states across four widths, keeping
  existing baselines unchanged; new cases include overlays, forms and cards.
- Fixed hidden ButtonGroup loading icons and undersized FeedbackForm success icon.
- The guide palette now derives from canonical kit color usage, with reserved
  tokens and historical aliases preserved for compatibility.

- HeaderDropdown includes seven services, configurable services, current-service
  semantics and container alignment for embedded mobile headers.
- ServiceLogo adds local Promo, Business and Payment assets without Payment UI
  Kit imports, icon collections, CSS or runtime dependencies.
- SiteHeader marks Courses as current and no longer clips the services panel.
- Payment's default destination is https://payment.habr.com, confirmed by the
  maintainer. Custom services without href remain disabled.

## 1.1.0 — 2026-10-01

Compatible with Courses guide v1.0.

- Fixed mobile Modal positioning in minified production CSS.
- Made parent Link/Button/IconButton styles stable across SSR and hydration.
- HeaderDropdown starts closed and dismisses on outside clicks, Escape and links;
  standalone catalog previews explicitly open it through v-model.
- Bundled icons locally and disabled external API fallback and automatic fonts.
- Aligned the font token with the installed Inter Variable family.
- Internal Button/Link URLs now use Nuxt navigation.
- Fixed EmptyState icon sizing and the full FAQ question click area.
- Added Checkbox/ButtonGroup loading and SearchInput error states from the guide.
- Added compiled-static regression checks alongside existing visual baselines.

- `FilterChip` now exposes the guide-defined `variant="switch"` with switch
  semantics, checked state and matching compact track geometry.

### Migration notes

- HeaderDropdown now starts closed; set v-model explicitly for open previews.
- Put application tag resets in a CSS layer rather than overriding kit roots.
- List dynamically supplied icon names in icon.clientBundle.icons; external
  Iconify fallback and automatic font downloads are disabled.
- Internal root-relative Button/Link URLs use Nuxt navigation; external URLs,
  anchors and links with target keep native behavior.

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
