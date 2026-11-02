"""Temporary UI preview: sample records, no database driver or credentials."""
import os
from pathlib import Path
import time

from flask import Flask, flash, redirect, render_template, request, session, url_for
from werkzeug.serving import make_server

# Use the same file both in the preview container and with local Python.
webapp = Path('/app') if Path('/app/templates').is_dir() else Path(__file__).resolve().parents[1] / 'webapp'
app = Flask(__name__, template_folder=str(webapp / 'templates'), static_folder=str(webapp / 'static'))
app.secret_key = os.urandom(32)
app.config['TEMPLATES_AUTO_RELOAD'] = True
people = [(1, 'Alex Morgan', 'alex@example.com'), (2, 'Jamie Chen', 'jamie@example.com'), (3, 'Sam Rivera', 'sam@example.com'), (4, 'Taylor Brooks', 'taylor@example.com')]


@app.context_processor
def theme():
    return {'dark_mode': session.get('dark_mode', False)}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/users')
def list_users():
    return render_template('users.html', users=people)


@app.route('/create', methods=['POST'])
def create_user():
    flash('Design preview: changes are not saved. All people shown are sample records.', 'success')
    return redirect(url_for('index'))


@app.route('/edit/<int:user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    user = next((person for person in people if person[0] == user_id), None)
    if user is None:
        return 'Sample person not found', 404
    if request.method == 'POST':
        flash('Design preview: changes are not saved. All people shown are sample records.', 'success')
        return redirect(url_for('list_users'))
    return render_template('edit_user.html', user=user)


@app.route('/toggle-dark-mode')
def toggle_dark_mode():
    session['dark_mode'] = not session.get('dark_mode', False)
    return redirect(url_for('index'))


def serve():
    duration = int(os.environ.get('PREVIEW_DURATION_SECONDS', '1800'))
    if not 1 <= duration <= 86400:
        raise ValueError('PREVIEW_DURATION_SECONDS must be between 1 and 86400')
    # Container publishes only on loopback; direct Python defaults to loopback too.
    host = '0.0.0.0' if Path('/.dockerenv').exists() else '127.0.0.1'
    server = make_server(host, 5055, app)
    server.timeout = 1
    deadline = time.monotonic() + duration
    print(f'Design preview: sample records only. Auto-stop in {duration} seconds.', flush=True)
    print('Open http://127.0.0.1:5055. Press Ctrl+C to stop.', flush=True)
    try:
        while time.monotonic() < deadline:
            server.handle_request()
        print('Preview time limit reached. Stopping.', flush=True)
    except KeyboardInterrupt:
        print('Preview stopped.', flush=True)
    finally:
        server.server_close()


if __name__ == '__main__':
    serve()
