# Contributing

Thanks for your interest in this project! Bug reports, ideas and pull requests are welcome.

## Workflow
1. Open an issue first for larger changes so we can agree on the approach.
2. Create a branch from the default branch: `feature/<topic>`, `bugfix/<topic>` or `docs/<topic>`.
3. Keep changes focused and follow the existing code style.
4. After changing pages, styles, scripts or assets run `npm run regen` (icon subset, search index, service-worker precache list), then `npm run check` (all static CI gates, lint, format, typecheck, unit tests).
5. Add an entry to `CHANGELOG.md` for relevant features and fixes; new text is bilingual (DE/EN).
6. Open a pull request using the template; CI must pass before merging.

Details (CI gates, architecture, conventions) live in [`CLAUDE.md`](../CLAUDE.md).

## Commit messages
This project uses [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

## Security
Never commit secrets, API keys or `.env` files. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
