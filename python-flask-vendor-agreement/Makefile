.PHONY: install dev backend frontend build clean

# macOS: WeasyPrint needs Homebrew's library path for pango/glib
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    export DYLD_FALLBACK_LIBRARY_PATH := $(shell brew --prefix)/lib
endif

# Install all dependencies
install:
	uv sync
	cd frontend && npm install

# Run both backend and frontend in development mode
dev:
	@echo "Starting backend on http://localhost:5001"
	@echo "Starting frontend on http://localhost:5173"
	@echo ""
	@make -j2 backend frontend

# Run Flask backend (port 5001 to avoid macOS AirPlay conflict on 5000)
backend:
	uv run flask --app app.main run --port 5001

# Run Vite frontend dev server
frontend:
	cd frontend && npm run dev

# Build frontend for production
build:
	cd frontend && npm run build

# Run production server (serves built frontend from Flask)
prod: build
	uv run flask --app app.main run --port 5001

# Lint and format check
lint:
	uv run ruff check .
	uv run ruff format --check .
	cd frontend && npm run lint
	cd frontend && npm run format:check

# Format code
format:
	uv run ruff format .
	cd frontend && npm run format

# Clean build artifacts
clean:
	rm -rf static/
	rm -rf frontend/node_modules/
	rm -rf .venv/
	rm -rf __pycache__/
	rm -rf .ruff_cache/
