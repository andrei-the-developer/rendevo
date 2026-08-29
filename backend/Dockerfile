FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requisiti.txt .
RUN pip install --no-cache-dir -r requisiti.txt

COPY alembic.ini .
COPY migrazioni ./migrazioni
COPY app ./app

RUN useradd --create-home --uid 10001 inviti && chown -R inviti /app
USER inviti

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
