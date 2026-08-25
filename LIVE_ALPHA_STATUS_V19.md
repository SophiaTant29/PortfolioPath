# Live Alpha Status — v19

## Repository-side acceptance automation is ready
- backend tests
- frontend CI build/typecheck/lint
- migration validation
- hosted HTTP acceptance
- browser smoke tests
- authenticated browser test scaffold
- daily hosted acceptance workflow

## External deployment is still required
The acceptance harness needs real deployed URLs and a test account.

Required GitHub secrets for hosted acceptance:
- `ALPHA_FRONTEND_URL`
- `ALPHA_API_URL`
- `ALPHA_TEST_USER_EMAIL`
- `ALPHA_TEST_USER_PASSWORD`

## Next milestone
Connect the repository to GitHub and deploy the alpha stack. Once connected, run `Hosted Alpha Acceptance` and address any failures before inviting testers.
