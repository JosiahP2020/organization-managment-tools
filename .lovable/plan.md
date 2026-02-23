
# Fix Back Button Timeout / History Loss

## Problem
The Back button uses `navigate(-1)` (browser history), which stops working when the preview iframe refreshes or the user stays on a page too long and history is lost. When this happens, clicking Back does nothing.

## Solution
Update the `BackButton` component to detect when browser history is unavailable and fall back to navigating to the dashboard. The `fallbackPath` prop already exists but is never used -- we'll wire it up.

## Technical Details

### File: `src/components/BackButton.tsx`
- Check `window.history.length` to determine if there's meaningful history to go back to
- If history length is 1 or less (no previous page), navigate to the `fallbackPath` (which is already set to the dashboard path by `DashboardHeader`)
- This ensures the button always takes the user somewhere useful, even after a session timeout or iframe reload

### Logic:
```
If browser history exists (length > 1):
  -> navigate(-1) as before
Else:
  -> navigate(fallbackPath) to go to dashboard
```

No other files need changes -- `DashboardHeader` already passes the correct fallback path (`/dashboard/{slug}`).
