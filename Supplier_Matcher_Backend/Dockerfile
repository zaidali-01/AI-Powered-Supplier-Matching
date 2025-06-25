# Use lightweight Python base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install OS dependencies (if needed for PyMuPDF etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose Hugging Face Spaces port (7860 is standard, but FastAPI will run on 7860 here)
EXPOSE 7860

# Start command
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
