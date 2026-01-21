import sys
from fastapi import FastAPI

print("\n==============================")
print(" ADK API INSPECTOR")
print("==============================\n")

# -------------------------------------------------
# 1) Find running FastAPI app instance
# -------------------------------------------------

app = None

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
    print("ERROR: FastAPI app not found.")
    print("Make sure ADK server is running in another terminal.")
    sys.exit(1)

print("FastAPI app found.")
print()

# -------------------------------------------------
# 2) Dump all routes
# -------------------------------------------------

print("=== API ROUTES ===\n")

routes = []

for route in app.routes:
    if hasattr(route, "methods"):
        methods = ",".join(sorted(route.methods))
        routes.append((methods, route.path))

for methods, path in sorted(routes, key=lambda x: x[1]):
    print(f"{methods:15} {path}")

# -------------------------------------------------
# 3) Dump request/response models
# -------------------------------------------------

print("\n=== API PAYLOAD SCHEMAS ===\n")

try:
    from google.adk.api import agents, sessions, tools

    print("\n--- CreateAgentRequest ---")
    print(agents.CreateAgentRequest.model_json_schema())

    print("\n--- CreateSessionRequest ---")
    print(sessions.CreateSessionRequest.model_json_schema())

    print("\n--- SendMessageRequest ---")
    print(sessions.SendMessageRequest.model_json_schema())

    print("\n--- ToolInvokeRequest ---")
    print(tools.ToolInvokeRequest.model_json_schema())

except Exception as e:
    print("WARNING: Could not load ADK models.")
    print("Reason:", e)

print("\n==============================")
print(" Inspection complete")
print("==============================\n")
