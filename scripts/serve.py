"""Preview the Astro build locally, with a fixed time limit."""

import argparse
import os
import signal
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Event

ROOT = Path(__file__).resolve().parents[1]


def stop_path(port):
    return ROOT / f".preview-stop-{port}"


def serve(port=5055):
    duration = int(os.environ.get("PREVIEW_DURATION_SECONDS", "1800"))
    if not 1 <= duration <= 86400:
        raise ValueError("PREVIEW_DURATION_SECONDS must be between 1 and 86400")
    output = ROOT / "dist"
    if not (output / "index.html").is_file():
        raise ValueError("Run npm run build before starting the static preview")
    server = ThreadingHTTPServer(
        ("127.0.0.1", port), partial(SimpleHTTPRequestHandler, directory=str(output))
    )
    # Browser preconnections must not block shutdown in the main thread.
    server.timeout = 0.2
    stop_file = stop_path(port)
    stop_file.unlink(missing_ok=True)
    stopping = Event()
    previous_handlers = {}
    for name in ("SIGINT", "SIGBREAK"):
        if hasattr(signal, name):
            number = getattr(signal, name)
            previous_handlers[number] = signal.signal(number, lambda *_: stopping.set())
    print(
        f"Portfolio: http://127.0.0.1:{port} · auto-stop after {duration} seconds",
        flush=True,
    )
    print(
        "Stop: Ctrl+C, Ctrl+Break, or run scripts/serve.py --stop in another terminal.",
        flush=True,
    )
    deadline = time.monotonic() + duration
    try:
        while (
            time.monotonic() < deadline
            and not stopping.is_set()
            and not stop_file.exists()
        ):
            server.handle_request()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        stop_file.unlink(missing_ok=True)
        for number, handler in previous_handlers.items():
            signal.signal(number, handler)
        print("Portfolio preview stopped.", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--stop", action="store_true", help="Request a running preview to stop"
    )
    parser.add_argument("--port", type=int, default=5055)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("port must be between 1 and 65535")
    if args.stop:
        stop_path(args.port).touch()
        print(f"Stop requested for the preview on port {args.port}.")
    else:
        serve(args.port)
