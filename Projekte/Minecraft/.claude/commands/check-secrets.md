---
description: Validate staged files with pre-commit hook to prevent .env and API key leaks
---

Run the pre-commit security hook to ensure no `.env` files or API keys are staged:

1. Check staged changes against the pre-commit hook:
   ```bash
   .githooks/pre-commit
   ```
2. If blocked:
   - For `.env` files: Unstage using `git reset HEAD .env*`
   - For hardcoded secrets: Remove the secret from code and place in local `.env` instead.
