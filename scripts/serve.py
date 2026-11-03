"""Build and preview the static portfolio locally, with a fixed time limit."""

import os
import time
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

from build import build


def serve():
    duration = int(os.environ.get("PREVIEW_DURATION_SECONDS", "1800"))
    if not 1 <= duration <= 86400:
        raise ValueError("PREVIEW_DURATION_SECONDS must be between 1 and 86400")
    output = build()
    server = HTTPServer(
        ("127.0.0.1", 5055), partial(SimpleHTTPRequestHandler, directory=str(output))
    )
    server.timeout = 1
    print(
        f"Portfolio: http://127.0.0.1:5055 · auto-stop after {duration} seconds",
        flush=True,
    )
    deadline = time.monotonic() + duration
    try:
        while time.monotonic() < deadline:
            server.handle_request()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("Portfolio preview stopped.", flush=True)


if __name__ == "__main__":
    serve()
