import sys
import threading
import time
from fastapi import FastAPI

# ---- Hook FastAPI constructor to capture app ----

_real_fastapi_init = FastAPI.__init__
captured_app = None

def patched_init(self, *args, **kwargs):
    global captured_app
    _real_fastapi_init(self, *args, **kwargs)
    captured_app = self

FastAPI.__init__ = patched_init

# ---- Start ADK CLI inside this process ----

def start_adk():
    from google.adk.cli.fast_api import main
    sys.argv = [
        "adk",
        "api_server",
        "--allow_origins=http://localhost:8000",
        "--host=0.0.0.0",
    ]
    main()

threading.Thread(target=start_adk, daemon=True).start()

# ---- Wait for FastAPI app to be created ----

print("Starting ADK and waiting for FastAPI app...")
for _ in range(30):
    if captured_app:
        break
    time.sleep(1)

if not captured_app:
    print("ERROR: FastAPI app was not created.")
    sys.exit(1)

app = captured_app

# ---- Dump routes ----

print("\n==============================")
print(" ADK API ROUTES")
print("==============================\n")

for route in app.routes:
    if hasattr(route, "methods"):
        methods = ",".join(sorted(route.methods))
        print(f"{methods:15} {route.path}")

# ---- Dump models ----

print("\n==============================")
print(" ADK PAYLOAD SCHEMAS")
print("==============================\n")

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
    print("WARNING: Could not load ADK models:", e)

print("\n==============================")
print(" ADK server is now running")
print("==============================\n")

# Keep process alive
while True:
    time.sleep(10)
