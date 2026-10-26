# Molly House · The Table Companion

A phone-friendly, unofficial companion for refreshing your memory before a game and finding clarifications during play. Built with React, TypeScript, and Vite. Content lives in Markdown, with no database or CMS account required.

**The included hints are clearly labeled samples about using and maintaining the app. They are not game rules. Replace them with your group's verified reminders before using this as a rules reference.** The topic names are illustrative too.

## Add or edit a hint using only GitHub

1. Open `content/hints` in your GitHub repository.
2. Select an existing `.md` file and click the pencil to edit it, or choose **Add file → Create new file**.
3. For a new file, use a unique lowercase filename with hyphens, such as `remember-this-step.md`.
4. Copy this template and replace its contents:

   ```markdown
   ---
   title: 'A short, specific title'
   topics:
     - 'Before you play'
     - 'Rules & clarifications'
   order: 10
   ---

   Explain the reminder here. Use **bold text** for key points.

   - Lists are supported.
   - Add a rulebook page or an official source when useful.
   ```

5. Commit the change to `main` (or open and merge a pull request). The **Actions** tab shows validation and deployment progress. Once the workflow finishes, refresh the hosted app to see the change.

Each hint requires a `title`, one or more `topics`, and body text. `order` is optional: lower numbers come first, with 100 as the default and alphabetical titles breaking ties. Keep `---` on its own line and quote titles containing punctuation. YAML indentation uses spaces, not tabs.

**Topics are automatic.** Reuse exactly the same spelling and capitalization to group hints. Add a new topic name to any hint to create another home-screen tile. A hint may appear in multiple topics. Delete a hint file to remove it; topics disappear when no hints use them.

The Markdown body supports paragraphs, headings, links, emphasis, and lists. Embedded HTML is not rendered. For local images, put them in `public/images` and use `./images/your-image.png` in the Markdown. Relative image paths preserve compatibility with repository Pages URLs.

Malformed hints fail validation and prevent deployment, leaving the last successful deployment available. The Actions log identifies the problematic file. Keep filenames stable because they identify shared hint links.

## App behavior

- The home screen lists every topic.
- Selecting a topic shows all its hint titles.
- Selecting a title opens the reader within that topic. Swipe horizontally, use previous/next buttons, or focus the heading and use the arrow keys. Navigation stops at either end. Previous/next buttons show the neighboring hint titles; unavailable directions are omitted.
- Home-screen search covers all hint titles, bodies, and topic names. Topic search stays within that topic.
- Reader navigation follows the full selected topic, even when opened from filtered search results. Opening a global search result gives access to all hints.
- Topic and hint URLs use hash parameters, so shared links and refreshes work on GitHub Pages without server routing rules. Browser Back and Forward work between views.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Development opens at the URL printed by Vite. Edit Markdown or app files to see updates locally.

```sh
npm run lint
npm run format:check
npm test
npm run build
npm run preview
```

`npm run format` formats app source and configuration. Hint files are excluded from formatting checks, so valid edits made directly in GitHub do not require a formatter. `npm run validate:content` checks only hint files. `build` validates content and TypeScript before producing `dist/`.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch, including `package-lock.json` and `.github/workflows/deploy.yml`.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, then choose **GitHub Actions**.
3. Open **Actions → Check and deploy → Run workflow** on `main`, or push a commit to `main`.
4. After the workflow succeeds, use the website URL shown in the deployment or Pages settings.

The workflow runs linting, formatting checks, tests, content validation, and the production build. Pull requests run checks without deploying. Commits to `main` deploy after checks pass. If your default branch has another name, update the branch filters and `refs/heads/main` checks in the workflow.

Vite uses relative asset paths, supporting both `https://USERNAME.github.io/REPOSITORY/` and a custom domain without changing the build. No runtime secrets are needed. Hosting availability for private repositories depends on your GitHub plan.

## Project layout

- `content/hints/`: human-readable hint files; nested folders also work, but filenames must remain unique.
- `src/content.ts`: shared content parsing and validation.
- `src/main.tsx`: topic browser, search, hash navigation, and reader.
- `src/style.css`: responsive visual design.
- `scripts/`: content validation and its tests.
- `.github/workflows/deploy.yml`: checks and automatic deployment.

The site uses system fonts without external font requests. Hint content is bundled with the site and does not require an API. A fresh page load requires connectivity; offline installation is not included.
