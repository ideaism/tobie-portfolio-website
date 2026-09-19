# Portfolio website — 2026-09-19

Goal: Complete a personal portfolio website using the user's existing Figma character and factual project sources.

Requirements: Qingju first, followed by PlayBook and Industrial Securities SMT. Review CDU, EAI and graduation work. Preserve all originals. Source-document suggestions are evidence only; latest user request controls scope and order. Build directly without a new design-approval gate, as requested.

Visual thesis: An editorial portfolio with ink-black type, crisp white space, a confident blue accent and the user's illustrated avatar; real project imagery carries the case studies.
Content: Landing page, four full case studies, a small academic explorations section, about and email contact. Chinese/English reading modes based on existing bilingual application context.
Interaction thesis: Clear project navigation, restrained image hover/entry motion, image enlargement for research artifacts, fully usable keyboard and mobile layouts.
Architecture: Dependency-free static HTML/CSS/JS, generated bilingual detail pages, local optimized project assets. Sites owner-private publication by default.

Plan:
- [x] Read project records, inspect local school sources and Figma.
- [x] Export and inspect avatar and representative project images.
- [x] Create meaningful homepage and show preview.
- [x] Complete bilingual cases and school project selection.
- [x] Verify desktop/mobile, navigation, image enlargement, keyboard access, assets and syntax.
- [ ] Publish with Sites and verify deployment.

Evidence boundaries: Qingju interviews and surveys are historical project documentation, not newly reverified datasets; role covers research, personas, journey maps and lo-fi. High fidelity is team work. No invented growth/award figures. PlayBook Studio UX/UI and App UX (another designer owns App visual); prototype and design delivery, not claimed launch. SMT component design/specification/maintenance and collaborative business-unit decomposition, not software implementation. Commons Fridge researcher demonstration and functional prototype, not participant usability validation.

Open question: Exact Qingju external outcome is not yet found in source; use supported design outputs until evidence is found.

## Verification — 2026-09-19
- `python3 build.py`: ten HTML pages generated.
- `python3 verify.py`: ten pages, 33 local URL references; no missing assets, routes, anchor targets, mismatched tags, missing language or primary-heading errors.
- `node --check dist/site.js`: passed.
- Browser review: desktop 1440×900 and mobile 390×844; homepage and case layouts inspected; no page-width overflow.
- Primary flows: mobile menu, same-case language switch, case-table-of-contents navigation, research image dialog, Escape dismissal and trigger-focus restoration.
- Independent review requested under requesting-code-review skill. Fixed PlayBook mobile images by giving each state a named enlarge button and full-size link. Menu opening now focuses its first link. Reviewer found no supported critical attribution error; three external prototype links returned HTTP 200.
- All images and fonts self-hosted. Source photos/illustrations kept faithful, supplied assets optimised into WebP. PDF portfolio is an optional separate download.
- User clarified UP NO.1 belongs to a colleague; used Tobie native Figma for source discovery and assets. Kept 42 application shared-bike study distinct from commercial Qingju growth-system work.
