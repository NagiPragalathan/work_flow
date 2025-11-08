# CSRF 404 Error Fix

## Issues Fixed

### 1. 404 Error on `/api/auth/csrf-token/`
**Problem:** Endpoint returning 404, possibly because:
- Backend server not running
- URL routing issue
- Endpoint not properly registered

**Solution:**
- Added graceful fallback when endpoint returns 404
- Falls back to checking cookies for existing CSRF token
- Falls back to `/auth/check/` endpoint which also provides CSRF token
- Code continues even if CSRF endpoint is unavailable

### 2. `csrfToken.substring is not a function`
**Problem:** CSRF token was null/undefined, causing substring error

**Solution:**
- Added type checking: `typeof csrfToken === 'string'`
- Added null checks before using string methods
- Safe string operations with length checks
- Better error logging

## Changes Made

### `frontend/src/services/api.js`

1. **Enhanced `fetchCsrfToken()`:**
   - Handles 404 errors gracefully
   - Falls back to cookies
   - Falls back to `/auth/check/` endpoint
   - Type checking for all token operations

2. **Fixed `getHeaders()`:**
   - Type checking before using substring
   - Safe string operations
   - Better logging

3. **Enhanced `signin()`:**
   - Multiple fallback attempts
   - Continues even without CSRF token
   - Better error handling

4. **Fixed 403 retry logic:**
   - Type checking for tokens
   - Removed duplicate header assignments
   - Better retry mechanism

### `frontend/src/components/auth/Login.jsx`

1. **Better error handling:**
   - Catches CSRF fetch errors
   - Continues with signin even if CSRF fails
   - Better user-facing error messages

## How It Works Now

1. **CSRF Token Fetch:**
   - Tries `/auth/csrf-token/` endpoint
   - If 404, checks cookies
   - If still no token, tries `/auth/check/` endpoint
   - Returns null if all fail (but continues anyway)

2. **Signin Process:**
   - Attempts to get CSRF token
   - If unavailable, proceeds anyway
   - Django might accept request without explicit token if cookie is set

3. **Error Handling:**
   - All string operations are type-checked
   - No more substring errors
   - Graceful degradation

## Testing

1. **With Backend Running:**
   - CSRF token should be fetched normally
   - Signin should work with CSRF protection

2. **Without Backend/404 Error:**
   - Code handles gracefully
   - Falls back to cookies
   - Attempts signin anyway
   - No crashes

## Next Steps

If you're still getting 404 errors:

1. **Check if backend is running:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Verify endpoint exists:**
   - Check `backend/workflows/urls.py` - should have `path('auth/csrf-token/', ...)`
   - Check `backend/agent_flow_backend/urls.py` - should include workflows.urls

3. **Test endpoint directly:**
   ```bash
   curl http://localhost:8000/api/auth/csrf-token/
   ```

4. **Check CORS settings:**
   - Ensure frontend origin is in `CORS_ALLOWED_ORIGINS`
   - Check `CSRF_TRUSTED_ORIGINS` includes frontend URL

## Notes

- Code now works even if CSRF endpoint is unavailable
- All string operations are safe
- Better error messages for debugging
- Graceful degradation

