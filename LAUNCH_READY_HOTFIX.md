# Launch-ready demo hotfix

Fixed the authenticated Next.js backend proxy so it uses the existing `NEXT_PUBLIC_API_BASE_URL` Vercel environment variable when `API_BASE_URL` is not set.

The demo proxy now also works without `BACKEND_SHARED_SECRET`. If the secret is later configured for a true public launch, the proxy automatically sends it to Render.
