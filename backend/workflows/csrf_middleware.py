"""
Custom CSRF middleware to exempt login/signup endpoints
"""
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import re


class CSRFExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt certain URLs from CSRF protection
    Must be placed BEFORE CsrfViewMiddleware in MIDDLEWARE list
    """
    def process_request(self, request):
        # Check if URL matches exempt patterns
        exempt_urls = getattr(settings, 'CSRF_EXEMPT_URLS', [])
        path = request.path
        
        # Debug logging
        if request.method == 'POST' and '/api/auth/' in path:
            print(f"🔍 CSRF Middleware: Checking path: {path}")
            print(f"🔍 CSRF Middleware: Exempt patterns: {exempt_urls}")
        
        for pattern in exempt_urls:
            try:
                if re.match(pattern, path):
                    # Set attribute to skip CSRF check
                    # This is the attribute Django's CSRF middleware checks
                    setattr(request, '_dont_enforce_csrf_checks', True)
                    print(f"✅ CSRF exempted for: {path} (matched pattern: {pattern})")
                    return None
            except re.error as e:
                print(f"❌ Invalid regex pattern: {pattern} - {e}")
        
        # If no match and it's a POST to auth endpoint, log it
        if request.method == 'POST' and '/api/auth/' in path:
            print(f"⚠️ CSRF check will run for: {path} (no matching exempt pattern)")
        
        return None
