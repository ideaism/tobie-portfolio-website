# Native Figma and interactive portfolio

## Goal
Upgrade the complete bilingual portfolio to emphasise native editable structures and hands-on inline demonstrations. Deliver a new Figma link with the complete desktop/mobile website design and working prototype links, plus update the actual website.

## Requirements
- User's account is Tobie; UP NO.1 is a colleague. Authenticated connector verified as Tobie.
- New Figma file in the previously selected communication design 42 team and project: https://www.figma.com/design/cQRDWjMiIX2sLgF8zcryFL
- All website text, navigation, containers, diagrams, controls and states should be editable; original screenshots/photos/illustration remain supporting image evidence.
- Preserve all ten bilingual pages and responsive layouts. Represent complete page designs and interaction states in Figma.
- Visitors scroll to an inline demo and operate it immediately, with clear state feedback and reset. PlayBook is the priority.
- Find embedded PlayBook videos in the old portfolio. User confirms one was authored with ProtoPie. Include verified video(s) alongside operable demos; preserve attribution of App UX vs team visual design.

## Design decisions
Visual thesis: retain Tobie's white, ink and blue editorial identity, with project-specific interactive product surfaces rather than image-only case sections.
Content: homepage, Qingju, PlayBook, SMT and Commons Fridge, Chinese and English, plus existing explorations/about/contact.
Interaction thesis: self-contained in-page task flows, scroll-linked reading orientation, purposeful hover/focus transitions, reduced-motion support.
No extra design-approval gate because user explicitly requested direct design and completion.

## Plan
- [x] Inspect current site and verify Tobie account; create new Figma file.
- [x] Inspect original interactions and videos; preserve source evidence.
- [x] Build native HTML/SVG diagrams and inline stateful demos, prioritising PlayBook.
- [x] Build Figma foundations, native component instances and complete desktop/mobile page layouts, with wired interaction states.
- [x] Embed verified original video and expose source/prototype context.
- [x] Verify real browser interaction paths, keyboard/mobile/reduced motion; inspect Figma geometry, native layer counts and actual prototype links.
- [x] Publish updated website using existing Sites project and deliver Figma and website links.

## Discovery
No Code Connect files exist in this dependency-free static project. Target Figma starts empty; no existing native screens or local tokens/styles. Available community libraries inspected; branded portfolio foundations will be created where library assets do not fit. Fonts verified in Figma: DM Sans, Space Grotesk, Noto Sans SC.
Old portfolio lfqzkEzhH33yq5kvIkNEqW contains VIDEO node 2136:29465 “查看物品 1” on Page 1, videoHash 16d62178f98e826a455cd2253a3e6eb5d38c148e; additional recorded demos may use GIF image fills. Inspect original “交互演示” sections before deciding coverage.

## Verification
- Build: ten routes generated; 38 local URLs checked without errors.
- State tests: all eight pass, including cancellation, required inputs and duplicate-consumption guards.
- Independent specification and code-quality reviews passed. Stable theme-toggle accessible label corrected.
- Real browser: Studio 50→80 and missing-input states; App collect, confirm, cancel, completed; Qingju before/during/after with saved stop; SMT query and empty states plus night theme; Fridge claim confirmation and owner enquiry preview.
- Real video: items.mp4 played to its 20.27-second end; switching clips paused the previous video. All three original extracts are present with local posters and controls.
- Mobile: all ten routes rendered in a 390px iframe viewport; content width 375px after scrollbar, scrollWidth 375px (no page overflow). Empty lightbox image has no src and is intentionally hidden. Space/Enter exercised the App flow and cancellation.
- Reduced motion: CSS and JavaScript respect prefers-reduced-motion; no video autoplay. Static audit, not OS-preference mutation.
- Figma: twenty complete responsive bilingual designs, twenty scrollable navigation prototypes, 24 variables, 97 component nodes, native typography/diagrams. PlayBook Studio eight input variants and App four state variants are wired. Every typography family is from the source or its documented fallback. Temporary captures removed after transfer/visual checks.
- Figma screenshots reviewed for desktop/mobile home, all desktop case headers, English mobile PlayBook, Studio default, App confirmation, source-motion gallery and file guide. Native image frames normalized to rectangles to fix nested-instance rendering.
- Figma prototype graph validated by API. Interactive browser playback could not be checked because Chrome is signed into the colleague's UP account; no access request or permission change was made. File belongs to Tobie in the chosen 42 project. Open it with Tobie.

## Delivery
Figma: https://www.figma.com/design/cQRDWjMiIX2sLgF8zcryFL
Website: https://tobie-yucheng-feng-portfolio.beijixinfei.chatgpt.site
Published successfully on 2026-09-19. Existing owner-private access preserved.

Version 2 source: a52444f6d759c2f5d83f20bfd6792e496a1a4077. Native deployment appgdep_6aade96af6048191bd1df5daf75f448b returned succeeded. Three original clips plus five native demo modules are live in the saved static archive. Browser handoff is left to the existing Sites view because this task is not foreground.
