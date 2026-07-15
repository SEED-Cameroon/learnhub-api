# Contributing Rules

These rules apply to everyone, including leads. They exist so beginners can work fearlessly: the worst you can break is your own branch.

1. **Never push to `main`.** All work happens on branches. (Branch protection enforces this.)
2. **Branch naming:** `feature/short-name` or `fix/short-name`.
   Examples: `feature/search-page`, `fix/login-redirect`
3. **Commit messages:** present tense, specific.
   - Good: `Add price comparison table`
   - Bad: `update stuff`, `final version 2`
4. **Open a Pull Request early.** Mark it as Draft while you are still working.
5. **Every PR needs 1 approving review** before it can be merged.
6. **Keep PRs small.** One feature or one fix per PR. A 2000-line PR helps nobody.
7. **Never commit secrets.** No `.env` files, no API keys, no passwords. Ever. Use `.env.example` to document variable names.

## The workflow, every time

```bash
git checkout main
git pull
git checkout -b feature/your-feature
# ... work, commit as you go ...
git push -u origin feature/your-feature
# open a Pull Request on GitHub, request a review
```

After your PR is merged, delete the branch and start the cycle again.
