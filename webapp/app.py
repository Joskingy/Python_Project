from flask import Flask, render_template, request, redirect, url_for
import psycopg2
import os

app = Flask(__name__)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host="db",
        database="mydb",
        user="postgres",
        password="password"
    )
    return conn

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/create_user", methods=["POST"])
def create_user():
    name = request.form.get("name")
    email = request.form.get("email")

    if not name or not email:
        return "Name and email are required", 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", (name, email))
        conn.commit()
        cur.close()
        conn.close()
        return redirect(url_for("index"))
    except Exception as e:
        return f"Error: {e}", 500
    
@app.route("/users")
def list_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users")
        users = cur.fetchall()
        cur.close()
        conn.close()
        return render_template("users.html", users=users)
    except Exception as e:
        return f"Error: {e}", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)