# PortfolioPath — Public Tester Update

This patch makes the two requested changes:

1. **Temporarily removes the sign-in gate** so people you send PortfolioPath to can try it without creating an account.
2. **Updates the definition of risk** so it explains that an investment can move both up and down.

## Risk wording used

> Risk is the uncertainty around an investment's future value. An investment can go up or down in value, and investments with greater potential returns often experience larger price movements.

## How to use

1. Put `apply_public_test_update.py` in the **root folder of your PortfolioPath repository**.
2. Run:

```bash
python apply_public_test_update.py
```

3. Review the changed files.
4. Commit and push those changed files to GitHub.

The script makes `.bak` backup copies of any files it changes.

## What it targets

The patch looks for the authentication structure used in the PortfolioPath production builds, including common locations such as:

- `frontend/proxy.ts`
- `frontend/middleware.ts`
- `frontend/app/login/page.tsx`
- `frontend/app/signin/page.tsx`
- equivalent `src/app/...` locations

It also removes obvious redirects to `/login` or `/signin` and updates downside-only risk definitions.

## Scope

This is for the current **public testing/demo phase**. It does not delete Supabase or your database configuration, so sign-in can be restored later.
