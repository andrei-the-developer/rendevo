#!/usr/bin/env bash
# Avvia i servizi di sviluppo nativi (questa macchina non ha un demone Docker).
set -euo pipefail
cd "$(dirname "$0")"

sudo pg_ctlcluster 18 main start 2>/dev/null || true
sudo service redis-server start >/dev/null 2>&1 || true

echo "Sito → http://localhost:5000"
echo "API  → http://127.0.0.1:8000"
echo
echo "In due terminali separati:"
echo "  cd backend  && .venv/bin/python -m uvicorn app.main:app --reload --port 8000"
echo "  cd frontend && npx next dev --hostname 0.0.0.0 --port 5000"
