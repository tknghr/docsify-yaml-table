# Agent notes — dependency / release updates

Use this when bumping deps or cutting a release for `@tknghr/docsify-yaml-table`.

## Current version

- Package / latest GitHub release: **v0.5.12** (as of 2026-11-14; release may still be pending after merge)

## Routine update flow

1. `npm outdated` — update Wanted/Latest packages with `npm install <pkg>@<version>`.
2. `npm test` — must pass (`node --experimental-vm-modules node_modules/jest/bin/jest.js`). Expected `console.error` / `YAMLException` in one negative-path test is OK.
3. Patch-bump version: `npm version patch --no-git-tag-version` (updates `package.json` + lockfile).
4. Sync README CDN tag: `https://cdn.jsdelivr.net/gh/tknghr/docsify-yaml-table@vX.Y.Z/dist/docsify-yaml-table.min.js`
5. Update `CHANGELOG.md` at the top (see below).
6. Branch: `chore/update-dependencies-YYMMDD` (example: `chore/update-dependencies-261103`).
7. Commit style: `chore: update dependencies and bump to X.Y.Z` (recent history uses short `chore:` messages).
8. Push + open PR into `main`. Do **not** push/create PR unless the user asks.
9. After merge, draft release notes; user usually publishes the GitHub Release manually.

## CHANGELOG format

Match existing entries:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Security

- Fix [CVE-…](https://github.com/advisories/GHSA-…)

### Changed

- Upgrade dependencies: `pkg1`, `pkg2`, …
```

- Prefer GitHub Advisory Database links: `https://github.com/advisories/GHSA-…`
- Only list CVEs that affected the **previously installed** versions (not issues only in intermediate versions we never shipped).
- Check advisories via GitHub REST API (`GET https://api.github.com/advisories/GHSA-…` or `?ecosystem=npm&affects=<pkg>@<oldVersion>`). GitHub MCP can read advisories/releases; verify tool list each session.

## Release notes style

Tag / title: `vX.Y.Z`

Body: short bullets like recent releases, e.g.

```markdown
- Fix sanitize-html CVEs: CVE-…, CVE-…
- Bump sanitize-html A.B.C to D.E.F
- Bump js-yaml …
```

Create URL helper:  
`https://github.com/tknghr/docsify-yaml-table/releases/new?tag=vX.Y.Z&target=main&title=vX.Y.Z`

## Tooling caveats (as of 2026-11)

- **GitHub MCP** (`plugin-github-github`): can list/get releases, PRs, files; **no `create_release` tool** even with Contents: write. Draft the body; user publishes, or use `gh release create` after `gh auth login`.
- Creating PRs via MCP may show a Cursor confirmation form the user must Submit; if it doesn’t appear, give them  
  `https://github.com/tknghr/docsify-yaml-table/pull/new/<branch>`.
- `gh` may be missing in the environment; install locally or fall back to MCP / browser.
- Fine-grained PAT for releases (when using API/`gh`): **Contents: Read and write** on this repo. Workflows write only if the target commit touches `.github/workflows/`.

## Don’t forget

- Always refresh CHANGELOG (easy to skip).
- Bump README jsDelivr `@v…` with the package version.
- Ask before commit/push/PR/release unless the user already requested it.
