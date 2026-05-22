FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn aiokafka
COPY . .
# FastAPI ko serve karne ke liye uvicorn ka use
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]