# Use an official Python runtime as a parent image
FROM python:3.14.0a7-bookworm

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Make port 5000 available to the outside world
EXPOSE 5000

# Run the app using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]