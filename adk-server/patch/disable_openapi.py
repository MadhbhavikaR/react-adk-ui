from fastapi import FastAPI

# Monkey patch FastAPI.openapi to disable schema generation
def disabled_openapi(self):
    return {
        "openapi": "3.0.0",
        "info": {
            "title": "ADK API",
            "version": "disabled"
        },
        "paths": {}
    }

FastAPI.openapi = disabled_openapi
