# CSRF Exempt Fix for Login/Signup

## Problem
Login and signup endpoints were returning 403 Forbidden errors due to CSRF verification failures.

## Solution
Exempted login and signup endpoints from CSRF protection since:
1. Users aren't authenticated yet (can't have CSRF token)
2. These are public endpoints that need to work before authentication
3. CSRF token is provided in response for subsequent authenticated requests

## Changes Made

### `backend/workflows/auth_views.py`

1. **Added `@csrf_exempt` decorator:**
   - Applied to `signup()` view
   - Applied to `signin()` view
   - Decorator must be applied BEFORE `@api_view` decorator

2. **CSRF Token in Response:**
   - After successful login, CSRF token is included in response header
   - Token is available for subsequent authenticated requests
   - Cookie is automatically set by Django

## How It Works

1. **Before Login:**
   - User doesn't have CSRF token (not authenticated)
   - Login endpoint is CSRF exempt
   - User can authenticate without CSRF token

2. **After Login:**
   - CSRF token is generated and included in response
   - Token is set in cookie automatically
   - Token is available in response header `X-CSRFToken`

3. **Subsequent Requests:**
   - Frontend includes CSRF token in headers
   - Other endpoints (not exempt) require CSRF token
   - Normal CSRF protection applies

## Security Notes

- Login/signup endpoints are exempt from CSRF (standard practice)
- Other endpoints still require CSRF protection
- Session-based authentication is still used
- CSRF token is provided after login for future requests

## Testing

1. Try to login - should work without CSRF errors
2. After login, check browser cookies for `csrftoken`
3. Subsequent API requests should include CSRF token
4. Other endpoints should still require authentication

## Files Modified

- `backend/workflows/auth_views.py` - Added `@csrf_exempt` to signin and signup

