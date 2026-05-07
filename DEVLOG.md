## Day 1 — 2025-05-06

**Hours worked:** 4

**What I did:** Set up Next.js project with TypeScript and Tailwind. Configured 
git with proper .gitignore for secrets. Scaffolded folder structure, defined 
TypeScript types, built pricing data for 8 AI tools, implemented the core audit 
engine, wrote 5 passing tests, and set up GitHub Actions CI pipeline.

**What I learned:** How to configure Jest with ts-node in a Next.js project, 
and that Node.js v20 is required for ESM support in ESLint config.

**Blockers / what I'm stuck on:** Jest config required ts-node and the CI 
needed Node v20 instead of v18 for ESM support in eslint.config.js.

**Plan for tomorrow:** Build the spend input form with all 8 tools, plan 
selection, and localStorage persistence.