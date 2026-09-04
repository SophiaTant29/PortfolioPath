# PortfolioPath v29 — Email confirmation setup

The frontend now handles Supabase email confirmation correctly, but Supabase must be configured to require confirmation.

In Supabase Dashboard:
1. Open Authentication.
2. Open Providers -> Email.
3. Turn on **Confirm email**.
4. In Authentication -> URL Configuration, set Site URL to the production Vercel URL.
5. Add the production Vercel URL and `/login` redirect to allowed Redirect URLs.

After signup, PortfolioPath now keeps the user on the account page and tells them to check their email instead of sending an unconfirmed account directly to the dashboard.
