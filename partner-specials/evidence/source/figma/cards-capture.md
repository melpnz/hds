# CompanyCard and PrizeCard: source preparation

Read-only Figma capture 2026-09-08, file m2O8xRs2aEU8NfUpyNiAks, Cards page2238:2. Both sets have desktop/mobile variants. Source context, precise depth5 trees, asset manifests and overviews are saved; both overviews were opened and visually inspected.

- CompanyCard2239:352 is visually confirmed as an about-company card: Habr logo, title and description. Desktop639×364 with padding50/50/62/40; mobile374×308 with padding40. These are content-dependent sample dimensions, not an established universal fixed-height contract. The original logo exports are retained as evidence only. Current assets/logos/habr/icon-detailed.svg takes priority for new implementation per assets/logos/README.md; copy it unchanged and document the visual source difference.
- PrizeCard2239:409 is visually confirmed as a prize card: X5 Tech logo, quantity, prize description and basket image. Desktop928×507 split horizontally; mobile288×521 stacked. Source names Card_presents and company label are aliases, not a generic brand requirement. Exact original picture and two logo exports are saved via context asset URLs; see prize-card-assets.json.

Client-specific artwork/text in these source examples does not count as approved material for another project. Generic component slots must accept supplied client assets. Figma sample widths do not determine browser breakpoints; any width interpolation, overflow handling and content-driven height is a documented new implementation decision. No production runtime or usage frequency is claimed.
