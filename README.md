# Tobie / Yucheng Feng — Portfolio

A responsive bilingual portfolio with four complete case studies and three academic explorations.

## Content
- Qingju: user research, journeys and low-fidelity design.
- PlayBook: Studio UX/UI, App UX and product decisions.
- Industrial Securities SMT: business units, components, state specifications and maintenance.
- The Commons Fridge: research, shared-space rules and physical/digital prototyping.

Chinese: `/`. English: `/en/`. Each case has an equivalent language route. Project images, fonts and PDFs are served locally without an external runtime dependency.

## Edit and preview
1. Edit the paired content in `build.py` (home/shared elements) and `cases.py` (case studies).
2. Run `python3 build.py` to update all ten HTML pages.
3. Styling and behavior live directly in `dist/styles.css` and `dist/site.js`.
4. Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`.
5. With that server running, run `python3 verify.py` and `node --check dist/site.js`.

`dist/` is the complete portable website. Sources and factual boundaries are recorded in `docs/sources.md`. The design plan and QA record are in `docs/plan.md`. Originals in Figma and the school folders were preserved.

Deployment uses the existing Site identity in `.openai/hosting.json`. New Site audience is owner-private; no public sharing settings have been changed.
