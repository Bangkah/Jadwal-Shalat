# Makefile for Prayer Times Application

.PHONY: help install build test clean dev prod docker-build docker-run docker-stop deploy

# Default target
help:
	@echo "Prayer Times Application - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development servers"
	@echo "  test        - Run all tests"
	@echo "  clean       - Clean build artifacts"
	@echo ""
	@echo "Production:"
	@echo "  build       - Build for production"
	@echo "  prod        - Start production servers"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker images"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  docker-stop  - Stop Docker containers"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-frontend - Deploy frontend to Vercel"
	@echo "  deploy-backend  - Deploy backend to Railway"
	@echo ""

# Install dependencies
install:
	@echo "Installing frontend dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && go mod download && go mod tidy
	@echo "Dependencies installed successfully!"

# Development
dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8080"
	@echo "Frontend will run on http://localhost:5173"
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && go run main.go

dev-frontend:
	npm run dev

# Testing
test:
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	npm test
	@echo "All tests completed!"

# Build for production
build:
	@echo "Building backend..."
	cd backend && go build -o prayer-times-api main.go
	@echo "Building frontend..."
	npm run build
	@echo "Build completed!"

# Production
prod: build
	@echo "Starting production servers..."
	@make -j2 prod-backend prod-frontend

prod-backend:
	cd backend && ./prayer-times-api

prod-frontend:
	npm run preview

# Docker commands
docker-build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "Docker images built successfully!"

docker-run:
	@echo "Starting services with Docker Compose..."
	docker-compose up -d
	@echo "Services started! Check http://localhost"

docker-stop:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "Containers stopped!"

docker-logs:
	docker-compose logs -f

# Database commands
db-setup:
	@echo "Setting up database..."
	psql -f backend/schema.sql $(DATABASE_URL)
	@echo "Database setup completed!"

db-migrate:
	@echo "Running database migrations..."
	# Add migration commands here
	@echo "Migrations completed!"

# Deployment commands
deploy-frontend:
	@echo "Deploying frontend to Vercel..."
	vercel --prod
	@echo "Frontend deployed!"

deploy-backend:
	@echo "Deploying backend to Railway..."
	cd backend && railway up
	@echo "Backend deployed!"

deploy-all: deploy-backend deploy-frontend
	@echo "Full deployment completed!"

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf backend/prayer-times-api
	rm -rf node_modules/.cache/
	go clean -cache
	@echo "Cleanup completed!"

# Linting and formatting
lint:
	@echo "Running linters..."
	cd backend && golint ./...
	npm run lint
	@echo "Linting completed!"

format:
	@echo "Formatting code..."
	cd backend && gofmt -w .
	npm run format
	@echo "Code formatted!"

# Security checks
security:
	@echo "Running security checks..."
	cd backend && gosec ./...
	npm audit
	@echo "Security checks completed!"

# Performance testing
perf:
	@echo "Running performance tests..."
	ab -n 1000 -c 10 http://localhost:8080/api/health
	@echo "Performance tests completed!"

# Backup database
backup:
	@echo "Creating database backup..."
	pg_dump $(DATABASE_URL) > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created!"

# Restore database
restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file path: \" backup_file; \
	psql $(DATABASE_URL) < $$backup_file
	@echo "Database restored!"

# Health check
health:
	@echo "Checking application health..."
	@curl -f http://localhost:8080/api/health || echo "Backend is down"
	@curl -f http://localhost:5173 || echo "Frontend is down"
	@echo "Health check completed!"

# Environment setup
env-setup:
	@echo "Setting up environment files..."
	cp .env.example .env
	cp backend/.env.example backend/.env
	@echo "Environment files created! Please edit them with your configuration."

# Generate API documentation
docs:
	@echo "Generating API documentation..."
	# Add documentation generation commands here
	@echo "Documentation generated!"

# Monitor logs
logs:
	@echo "Monitoring application logs..."
	tail -f backend/app.log &
	npm run logs

# Quick start for new developers
quickstart: env-setup install db-setup dev
	@echo "Quick start completed! Application is running."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:5173"