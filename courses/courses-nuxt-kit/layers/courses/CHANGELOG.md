# Courses Kit changelog

## Unreleased

- Select opens its menu above the trigger when it would leave the viewport below
  and fits above. This fixes inaccessible currency options in the mobile PriceSheet;
  the default placement, public props and control appearance remain unchanged.
- The canonical dependency recipe aligns Vue with Nuxt's 3.5.43 runtime, removing
  the missing server-rendered PriceSheet chevron and hydration mismatch. No icon
  markup workaround is needed. This dependency fix is not part of published 1.4.1.
- Added initially open SSR regression fixtures and six no-JavaScript/hydration
  checks at 320/768/1440, included in the production static CI suite.

## 1.4.1 — 2026-10-06

Compatible with Courses guide v1.1. Includes the unpublished 1.4.0 candidate below.

- Footer geometry checks wait for styles and fonts before comparing variants;
  the initial CI failure was an unstyled-page measurement, not a component change.
- The 1.4.0 candidate tag is preserved without publishing or overwriting it.

## 1.4.0 — 2026-10-06

Compatible with Courses guide v1.1. Unpublished candidate; see 1.4.1.
Backward-compatible public API additions.

- SiteFooter supports configuring existing links without replacing the shared footer.
- TextInput, Textarea, Select and MultiSelect expose labels and reactive error/hint
  descriptions; removable chips have descriptive accessible names.
- ButtonGroup tabs support arrow/Home/End navigation and optional panel links.
- Tooltip describes the actual focus target and supports Escape dismissal;
  DemandChart exposes labels and values to assistive technology.
- PriceSheet, SortSheet and MobileMenu manage focus, nested dialogs and Escape,
  return focus on close and use Nuxt's SSR-supported teleport container.
- Regression coverage includes keyboard interactions, footer links, field errors
  and 40 pre-change visual baselines across five widths. Component CSS is unchanged.
- Guide rules cover composition approval, shared header/footer preservation,
  state/error decisions and equally thorough prototype/service visual verification.
- Known follow-up: initial-open PriceSheet SSR icon hydration warnings predate
  this release; see ROADMAP. Installed product copies are not updated automatically.

## 1.3.1 — 2026-10-05

Compatible with Courses guide v1.1. Published on GitHub.
Includes all changes from the unpublished 1.3.0 candidate below.

- Guide validation accepts an absent optional, empty patterns directory in a
  clean checkout; missing required component/foundation directories still fail.
- CI smoke tests reuse the provider on port 3002 instead of starting a second
  dev server against the same generated files.
- Atlas integration checks the live UI Kit page tabs; reference geometry uses
  the Windows environment where the measurements were captured.
- The failed 1.3.0 candidate tag is preserved; this revision is checked separately.

## 1.3.0 — 2026-10-05

Compatible with Courses guide v1.1. Prepared locally; not published yet.

- PromoCard opens PromoCodeModal for active codes and offers; conditions, copy
  and explicit site navigation are available there. Expired actions are disabled.
  Code buttons use a dedicated partial-code tail and folded corner.
- SchoolCard clamps names to three lines and keeps the action at the bottom.
  EntityHeader pins the logo to the top; mobile disclosure actions follow text.
  InfoTable uses 16px row/column gaps and heading spacing.
- RatingTable rows grow with long text and preserve padding; all columns remain
  reachable by local horizontal scrolling at 320px. NumberedCourseItem omits
  the final divider.
- Breadcrumb arrows follow wrapped text. Contributor and verification dialogs
  use stacked actions, 48px avatars and descriptive contributor roles.
- Full ReviewCard aligns the rating/date to the right on desktop, with the date
  below the stars; mobile uses a left-aligned inline rating/date row.
- PersonCard accepts company logos and multiple contacts and wraps long names.
  ProfileHistory uses 48px logos, production typography and 24px list spacing.
  Prose adds opt-in full width for profile biographies.
- Carousel controls are centered on slide content independently of pagination.

- LinkGrid matches production promo entries with a separate violet discount
  row and percentage icon. Both variants collapse to three responsive rows
  and toggle between «Смотреть все» and «Свернуть».
- NumberedCourseItem now renders the production SEO list: numbered title link,
  description and a three/two/one-column grid of characteristics.
- ReviewCard carousels fill fixed three/two/one-column layouts with a 12px
  gap. Cards stretch to their column; short sets retain the column width
  and leave unused columns empty on the right.
- Carousel resolves only the currently mounted Swiper instance after loop or slot
  reconfiguration. Keyboard navigation no longer risks targeting a stale track;
  the remount boundary is covered by a repeated browser test.
- PromoCard keeps its 260px production maximum but now shrinks to the available
  CardGrid column at 768 and 1024px instead of causing page overflow.
- PersonCard follows the same intrinsic-width rule, allowing the production
  3-column tablet grid to use 232px columns without overlap or body overflow.
- StepCard now matches its production contract: a static process card with a
  title and optional description, without the LearningStep number, disclosure
  chevron or open state. LearningStep remains the separate interactive primitive.
- PageHero adds public `title`, `switcher` and `search` slots for production
  listing heroes. It owns the responsive 24/32/40px composition while SearchForm
  owns field count and stacking; existing CTA heroes remain compatible. Browser
  coverage includes 320/480/744/768/1024 and the 767/768 layout boundary.
- SearchForm now renders the documented compound 2–3 Select XL control with
  joined 1px separators and responsive horizontal/vertical layouts. Public
  fields, values model and fields slot support page-specific search forms.
  The optional selected summary replaces fields below 768px and emits
  `open-summary`; sticky positioning remains page-owned. Explicit query mode
  preserves the earlier single SearchInput composition. Two-field forms now
  also stack below 768px: their desktop count selector no longer overrides the
  mobile one-column rule.
- SiteHeader `family="courses" level="page"` now accepts breadcrumbs,
  contributors, verification and update metadata as one responsive category
  composition. Desktop, tablet and phone disclosure matches production without
  new CategoryIntro or ContributorsStrip exports. Breadcrumbs adds
  `tone="default|inverse"` for light and blue surfaces; its wrapping and the
  category stack's 12/20/16 vertical rhythm now match production. Separators
  use the production `black-200` tone instead of inheriting white. Additional
  contributors now have the production `+` marker, hidden on phone, inside a
  shared 24px `blue-300` capsule with 20px avatars.
- PromoCard adds code, link and expired actions, a real disabled state and a
  full-column mobile layout.
- Button now emits its public `click` event for composed components.
- ReviewCard adds compatible compact, wide and full variants. Wide/full cards
  use the production responsive rating layout and never truncate review text;
  full cards omit the overlay link. Structured avatar, course logo/link,
  advantages, disadvantages and comment data are now supported. Compact remains
  the default and keeps the existing text/href calls working. Cards now also
  shrink below the intrinsic width of long course chips, preventing mobile grid
  and body overflow with production titles.

- PersonHeader now switches to its production phone composition below 768px:
  vertical flow, 100px portrait, 30/34 title and no border or padding. It adds
  optional Habr Career and email actions next to LinkedIn. EntityLogo now emits
  intrinsic image dimensions, preventing the company badge from resizing while
  its asset loads. The horizontal layout from 768px is unchanged.

- Carousel adds opt-in loop for course/article/review cards, one-card navigation
  and fixed 12px token spacing. Finite mode remains the default. The ad-slot
  variant now matches the centered 568×232 production carousel, including scaled
  neighbours, -26 spacing, mobile 272/280 geometry, pagination and continuous loop.
  Uses swiper@14.3.0 internally (required in consumer dependencies); live Vue slot
  cards are preserved. Controls are not rendered when every card fits. Includes
  swipe, keyboard and responsive navigation tests.

- CardGrid adds opt-in tabletColumns (2 or 3). Defaults remain 4/2/1;
  mobile stays one column and every grid uses the fixed 12px spacing token.
  Card count limits belong to page compositions, not the grid API.

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
