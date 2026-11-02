from flask import Flask, render_template, request, redirect, url_for, flash, session
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )
    return conn

# Helper to toggle dark mode
def toggle_dark_mode():
    session['dark_mode'] = not session.get('dark_mode', False)

@app.route('/')
def index():
    return render_template('index.html', dark_mode=session.get('dark_mode', False))

@app.route('/create', methods=['POST'])
def create_user():
    name = request.form.get('name')
    email = request.form.get('email')
    
    if not name or not email:
        flash('Name and email are required.', 'danger')
        return redirect(url_for('index'))
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", (name, email))
        conn.commit()
        flash('User created successfully!', 'success')
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
    finally:
        if 'conn' in locals():
            conn.close()
    
    return redirect(url_for('index'))

@app.route('/users')
def list_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users")
        users = cur.fetchall()
        return render_template('users.html', users=users, dark_mode=session.get('dark_mode', False))
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('index'))
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/edit/<int:user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        
        if not name or not email:
            flash('Name and email are required.', 'danger')
            return redirect(url_for('edit_user', user_id=user_id))
        
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("UPDATE users SET name = %s, email = %s WHERE id = %s", (name, email, user_id))
            conn.commit()
            flash('User updated successfully!', 'success')
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
        finally:
            if 'conn' in locals():
                conn.close()
        
        return redirect(url_for('list_users'))
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        return render_template('edit_user.html', user=user, dark_mode=session.get('dark_mode', False))
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('list_users'))
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/delete/<int:user_id>')
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        flash('User deleted successfully!', 'success')
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
    finally:
        if 'conn' in locals():
            conn.close()
    
    return redirect(url_for('list_users'))

# @app.route('/toggle-dark-mode')
# def toggle_dark_mode_route():
#     toggle_dark_mode()
#     return redirect(request.referrer or url_for('index'))

@app.route('/toggle-dark-mode')
def toggle_dark_mode():
    session['dark_mode'] = not session.get('dark_mode', False)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)