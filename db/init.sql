-- Create a users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

-- Optional: Insert sample user
-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');