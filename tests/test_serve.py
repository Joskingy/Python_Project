"""An idle browser connection must not prevent explicit preview shutdown."""

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_stop_command_with_idle_connection():
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", 0))
        port = reservation.getsockname()[1]
    command = [sys.executable, str(ROOT / "scripts/serve.py"), "--port", str(port)]
    process = subprocess.Popen(
        command,
        cwd=ROOT,
        env={**os.environ, "PREVIEW_DURATION_SECONDS": "30"},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    idle = None
    try:
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise AssertionError(process.stderr.read().decode(errors="replace"))
            try:
                idle = socket.create_connection(("127.0.0.1", port), timeout=0.2)
                break
            except OSError:
                time.sleep(0.05)
        assert idle is not None, "Preview did not start"
        subprocess.run(
            command + ["--stop"], cwd=ROOT, check=True, timeout=10, capture_output=True
        )
        assert process.wait(timeout=5) == 0
        assert not (ROOT / f".preview-stop-{port}").exists()
    finally:
        if idle is not None:
            idle.close()
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=5)
        process.stderr.close()
        (ROOT / f".preview-stop-{port}").unlink(missing_ok=True)
