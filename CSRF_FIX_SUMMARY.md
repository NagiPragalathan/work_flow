# CSRF Token Fix Summary

## Issue
CSRF verification failed when trying to sign in, resulting in 403 Forbidden errors.

## Root Cause
1. CSRF token wasn't being fetched before signin request
2. Cookie might not be set properly before POST request
3. Header format might not match Django's expectations

## Fixes Applied

### Frontend Changes

#### 1. Enhanced CSRF Token Fetching (`frontend/src/services/api.js`)
- Improved `fetchCsrfToken()` to handle errors better
- Added longer wait time (200ms) for cookie to be set
- Better fallback to cookie token
- Added logging for debugging

#### 2. Pre-fetch CSRF Token Before Signin
- Modified `signin()` method to fetch CSRF token before making request
- Added wait time to ensure cookie is set
- Better error handling

#### 3. Enhanced Login Component (`frontend/src/components/auth/Login.jsx`)
- Added CSRF token fetch before signin attempt
- Better error messages
- Improved error handling

#### 4. Improved 403 Retry Logic
- Added double retry mechanism for 403 errors
- Fetches fresh CSRF token on each retry
- Better logging for debugging

### Backend Changes

#### 1. Added `@ensure_csrf_cookie` Decorator (`backend/workflows/auth_views.py`)
- Added to `signin()` view to ensure CSRF cookie is set
- Ensures cookie is available for subsequent requests

#### 2. Include CSRF Token in Signin Response
- Added CSRF token to response header after successful login
- Helps frontend maintain token for subsequent requests

## How It Works Now

1. **On Page Load:**
   - Frontend fetches CSRF token from `/auth/csrf-token/`
   - Token is stored in cookie (`csrftoken`)
   - Token is also available in response header

2. **Before Signin:**
   - Login component checks for CSRF token in cookies
   - If not found, fetches it from backend
   - Waits 200ms for cookie to be set

3. **During Signin:**
   - CSRF token is included in `X-CSRFTOKEN` header
   - Also included as `X-CSRFToken` for compatibility
   - Backend validates token

4. **On 403 Error:**
   - Frontend automatically retries with fresh CSRF token
   - Up to 2 retries with fresh tokens
   - Better error messages if all retries fail

## Testing

1. Clear browser cookies
2. Navigate to login page
3. Enter credentials
4. Click "Sign In"
5. Should successfully authenticate

## Debugging

If CSRF errors persist:

1. Check browser console for CSRF token logs
2. Verify cookie `csrftoken` is set in browser
3. Check Network tab for CSRF token in request headers
4. Verify backend is running and accessible
5. Check CORS settings in backend

## Files Modified

- `frontend/src/services/api.js`
- `frontend/src/components/auth/Login.jsx`
- `backend/workflows/auth_views.py`

## Notes

- CSRF token is stored in cookie `csrftoken`
- Header name is `X-CSRFTOKEN` (all caps) as per Django settings
- Token is automatically included in all POST/PUT/PATCH/DELETE requests
- Frontend automatically retries on 403 errors

