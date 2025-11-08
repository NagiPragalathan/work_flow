"""
Patch for pydantic v1 compatibility with Python 3.12
This fixes the ForwardRef._evaluate() missing recursive_guard argument error

This MUST be imported BEFORE any langchain imports!
"""
import sys
import typing

if sys.version_info >= (3, 12):
    # Python 3.12+ changed ForwardRef._evaluate signature
    # We need to patch it before pydantic v1 tries to use it
    try:
        from typing import ForwardRef
        
        # Save original method
        _original_evaluate = ForwardRef._evaluate
        
        # Create patched version that handles all Python 3.12 parameters
        def _patched_evaluate(self, globalns=None, localns=None, type_params=None, *, recursive_guard=None):
            """Patched version that handles Python 3.12's recursive_guard requirement"""
            if recursive_guard is None:
                recursive_guard = frozenset()
            # Python 3.12 signature: _evaluate(globalns, localns, type_params, *, recursive_guard)
            if type_params is not None:
                return _original_evaluate(self, globalns, localns, type_params, recursive_guard=recursive_guard)
            else:
                return _original_evaluate(self, globalns, localns, recursive_guard=recursive_guard)
        
        # Apply patch
        ForwardRef._evaluate = _patched_evaluate
        print("[PATCH] Applied Python 3.12 compatibility patch for ForwardRef._evaluate")
    except Exception as e:
        print(f"[WARNING] Could not apply compatibility patch: {e}")

