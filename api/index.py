import sys
import os

backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")

sys.path.insert(0, backend_path)

from main import app as fastapi_app


async def app(scope, receive, send):

    if scope["type"] == "http":

        path = scope.get("path", "")

        if path == "/api":
            new_path = "/"
        elif path.startswith("/api/"):
            new_path = path[4:]
        else:
            new_path = path

        scope = dict(scope)
        scope["path"] = new_path
        scope["root_path"] = "/api"

        if "raw_path" in scope:
            raw_path = scope["raw_path"]

            if raw_path.startswith(b"/api"):
                scope["raw_path"] = raw_path[4:] or b"/"

    await fastapi_app(scope, receive, send)
