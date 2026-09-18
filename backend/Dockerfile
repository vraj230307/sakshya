FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port (Cloud Run sets PORT env var automatically)
ENV PORT=8000
EXPOSE 8000

# Run Uvicorn server
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
