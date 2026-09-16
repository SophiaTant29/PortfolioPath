# PortfolioPath auth bypass v2

Run this from the root of your local PortfolioPath repo:

```bash
python3 force_public_demo.py
```

Then:

1. Start the app locally.
2. Confirm the site no longer redirects you to sign in.
3. Open `AUTH_REMAINING_REFERENCES.txt` if any sign-in UI or auth gate remains.
4. Delete the `.bak` files before committing.
5. Commit only the actual source files that changed.

This version is more aggressive than the first patch: it disables common Next.js middleware/proxy auth gates, redirects dedicated login/signin routes back home, removes common redirect guards, and updates the risk definition.
