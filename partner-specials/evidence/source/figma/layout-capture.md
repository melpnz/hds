# Layout: source capture

Source: UI-kit `m2O8xRs2aEU8NfUpyNiAks`, page `2003:51`, read-only capture 2026-09-08.

`layout-details.json` records native Figma layoutGrids; `layout-drawn-sample.json` records the first five drawn child rectangles per artboard. `layout-design-context.txt` and `layout-1440.png` cover node `2003:53`.

## Source discrepancy

The drawn demonstration and native layoutGrid settings disagree:

| Artboard | Native margin | Drawn margin | Columns | Gutter |
|---|---:|---:|---:|---:|
| 1920 | 56 | 100 | 12 | 8 |
| 1440 | 56 | 100 | 12 | 8 |
| 1280 | 56 | 56 | 12 | 8 |
| 1024 | 48 | 48 | 8 | 8 |
| 768 | 40 | 36 | 8 | 8 |
| 390 | 20 | 20 | 4 | 4 |
| 320 | 20 | 20 | 4 | 4 |

The screenshot visibly confirms the 100px drawn margins at 1440. Do not silently equate these two sources. Implement separate documented source profiles if both are useful; the default CSS choice must be described as an implementation decision, not a resolved author intent. Artboard widths are reference sizes, not evidence of production media queries. Any CSS switching thresholds and interpolation are new runtime decisions. Rectangle heights are illustration dimensions, not minimum page heights. Decorative red/green/blue grid fills are explanatory overlays, not partner theme colors.
