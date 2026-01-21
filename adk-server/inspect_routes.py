import sys
from fastapi import FastAPI

app = None

# Scan all loaded modules for FastAPI app instance
for module in list(sys.modules.values()):
    try:
        for obj in vars(module).values():
            if isinstance(obj, FastAPI):
                app = obj
                break
        if app:
            break
    except Exception:
        pass

if not app:
    print("FastAPI app not found. Make sure ADK server is running.")
    exit(1)

print("\n=== ADK API ROUTES ===\n")

for route in app.routes:
    if hasattr(route, "methods"):
        methods = ",".join(route.methods)
        print(f"{methods:12} {route.path}")

