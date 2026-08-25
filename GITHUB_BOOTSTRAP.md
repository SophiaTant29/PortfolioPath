# PortfolioPath GitHub Bootstrap

The connected GitHub account currently has no PortfolioPath repository, so the code has intentionally **not** been pushed into an unrelated repository.

## Create the repository

On GitHub, create:

- **Repository name:** `PortfolioPath`
- **Visibility:** Private
- Do **not** initialize with a README, `.gitignore`, or license because this package already includes the repository contents.

## Publish from a local checkout

From the root of this package:

```bash
sh scripts/bootstrap_github.sh https://github.com/YOUR_USERNAME/PortfolioPath.git
```

or with SSH:

```bash
sh scripts/bootstrap_github.sh git@github.com:YOUR_USERNAME/PortfolioPath.git
```

This will:
1. initialize git if needed
2. set `main` as the default local branch
3. configure `origin`
4. commit the alpha code
5. push `main`

## After the repository exists

Once the repository is visible to the connected GitHub integration, ChatGPT can work directly with:
- branches
- commits
- pull requests
- issues
- CI failures
- workflow runs
- code review

## Recommended repository settings

After first push:
- keep the repository private during alpha
- enable branch protection on `main`
- require the `PortfolioPath CI` workflow before merge
- block force pushes to `main`
- require pull requests for future changes

## Repository secrets needed later

For hosted acceptance:
- `ALPHA_FRONTEND_URL`
- `ALPHA_API_URL`
- `ALPHA_TEST_USER_EMAIL`
- `ALPHA_TEST_USER_PASSWORD`

For optional Supabase migrations:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Do not commit secrets into the repository.
