FROM python:3.13-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:0.12.13 /uv /bin/uv

# Set the working directory inside the container
WORKDIR /app

ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-cache

# Copy the current directory contents into the container at /app
COPY webapp/ .

# Make port 5000 available to the outside world
EXPOSE 5000

# Run the app using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
