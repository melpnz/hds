# R2 source preparation

Read-only Figma capture on 2026-09-08, file m2O8xRs2aEU8NfUpyNiAks. This records sources, not implementation acceptance.

- Counter `2128:61`: 12 variants, exact root/child properties in counter-details.json; get_design_context and overview saved. Overview visually inspected. Native small text is 8/12px; do not silently promote it to an accessible standalone text recommendation. Big progress badge padding says12px but child x=11px; font-version and layout rounding require explicit comparison.
- NavigationPill `2147:718`: default/hover/picked, 327×40 source samples, 20/24 Bold; context and overview saved and inspected. Semantics as links, keyboard focus and fluid width are new runtime decisions.
- ProgressBar `2202:1683`: default/in progress/full, 353×48, inner shadows and layers in progress-layers.json; context and overview saved and inspected. progress-other-roots.json lists additional status/text/composed progress sets still requiring detailed reading. Do not call this three-state bar the entire family.
- Dropdown `2217:171`: desktop and tablet+mobile panels; context, depth4 geometry, overview saved and inspected. Mobile includes a Button. The source is a navigation panel, not evidence of a select/combobox API. Item set `2217:254` still needs details and state capture. Hidden optional Button icons in generated code are not visible Dropdown requirements.
- Tooltip `2038:409`: rich product hint with notebook image, title, description and pointer. Geometry/context/overview saved and inspected. `tooltip-notebook.png` is the exact context asset, not a client asset for arbitrary projects. Figma naming alone does not prescribe ARIA role or triggering behavior. Runtime and small-screen adaptation need an explicit contract. The pointer is a rotated square, not an icon requiring a drawn glyph.
- QuizOption `2142:22`: options-roots.json lists20variants. Only roots have been read; deep visual/text/state properties and screenshot remain to capture.

No fresh production evidence or implementation status is implied by these files. Source screenshots must be reused, not fetched again.
