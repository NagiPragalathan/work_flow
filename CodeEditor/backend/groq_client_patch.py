"""
Patch for langchain-groq compatibility with groq SDK
Fixes the 'proxies' parameter issue by patching at multiple levels
"""
import sys

try:
    # CRITICAL: Patch groq.Groq and groq.Client BEFORE any imports that use it
    import groq
    
    # Patch groq.Groq (this is what langchain-groq uses on line 193)
    if hasattr(groq, 'Groq'):
        _original_groq_init = groq.Groq.__init__
        
        def _patched_groq_init(self, *args, **kwargs):
            """Remove 'proxies' parameter"""
            kwargs.pop('proxies', None)
            return _original_groq_init(self, *args, **kwargs)
        
        groq.Groq.__init__ = _patched_groq_init
    
    # Patch groq.Client
    if hasattr(groq, 'Client'):
        _original_client_init = groq.Client.__init__
        
        def _patched_client_init(self, *args, **kwargs):
            """Remove 'proxies' parameter"""
            kwargs.pop('proxies', None)
            return _original_client_init(self, *args, **kwargs)
        
        groq.Client.__init__ = _patched_client_init
    
    # Patch AsyncGroq
    if hasattr(groq, 'AsyncGroq'):
        _original_async_init = groq.AsyncGroq.__init__
        
        def _patched_async_init(self, *args, **kwargs):
            """Remove 'proxies' parameter"""
            kwargs.pop('proxies', None)
            return _original_async_init(self, *args, **kwargs)
        
        groq.AsyncGroq.__init__ = _patched_async_init
    
    print("[PATCH] Applied Groq compatibility patch (removes 'proxies' parameter)")
    
except Exception as e:
    print(f"[WARNING] Could not apply Groq Client patch: {e}")

# Now patch langchain-groq's ChatGroq after it's imported
def patch_chatgroq_class():
    """Patch ChatGroq to remove proxies from its internal client creation"""
    try:
        if 'langchain_groq' not in sys.modules:
            return False
            
        from langchain_groq.chat_models import ChatGroq
        
        # Save original
        _original_init = ChatGroq.__init__
        
        def _patched_init(self, *args, **kwargs):
            """Remove proxies before initialization - check all possible locations"""
            # Remove from top level
            kwargs.pop('proxies', None)
            # Remove from model_kwargs
            if 'model_kwargs' in kwargs and isinstance(kwargs['model_kwargs'], dict):
                kwargs['model_kwargs'].pop('proxies', None)
            # Remove from client_kwargs
            if 'client_kwargs' in kwargs and isinstance(kwargs['client_kwargs'], dict):
                kwargs['client_kwargs'].pop('proxies', None)
            # Also check args[0] if it's a dict (pydantic sometimes passes dict as first arg)
            if args and isinstance(args[0], dict):
                args[0].pop('proxies', None)
            return _original_init(self, *args, **kwargs)
        
        ChatGroq.__init__ = _patched_init
        return True
    except Exception as e:
        print(f"[WARNING] Could not patch ChatGroq: {e}")
        return False

# Store function for later use
sys._patch_chatgroq = patch_chatgroq_class

# If langchain_groq is already imported, patch it now
if 'langchain_groq' in sys.modules:
    patch_chatgroq_class()
