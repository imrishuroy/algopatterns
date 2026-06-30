.PHONY: all build run test clean deps lint docker-build docker-run migrate-up migrate-down help

# Variables
BINARY_NAME=algopatterns-api
MAIN_PATH=./cmd/server
DOCKER_IMAGE=algopatterns-api
VERSION?=1.0.0

# Git info for Sentry release tracking
GIT_COMMIT?=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_TAG?=$(shell git describe --tags --always 2>/dev/null || echo "unknown")
BUILD_TIME?=$(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOTEST=$(GOCMD) test
GOMOD=$(GOCMD) mod
GOVET=$(GOCMD) vet
GOFMT=gofmt

# Build flags
LDFLAGS=-ldflags "-w -s -X main.Version=$(VERSION) -X main.GitCommit=$(GIT_COMMIT) -X main.GitTag=$(GIT_TAG) -X main.BuildTime=$(BUILD_TIME)"

all: deps lint test build

## build: Build the binary
build:
	@echo "Building..."
	CGO_ENABLED=0 $(GOBUILD) $(LDFLAGS) -o bin/$(BINARY_NAME) $(MAIN_PATH)

## build-linux: Build for Linux (for Docker)
build-linux:
	@echo "Building for Linux..."
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o bin/$(BINARY_NAME)-linux $(MAIN_PATH)

## run: Run the application
run:
	@echo "Running..."
	$(GOCMD) run $(MAIN_PATH)

## run-dev: Run in development mode
run-dev:
	GIN_MODE=debug LOG_FORMAT=console $(GOCMD) run $(MAIN_PATH)

## test: Run tests
test:
	@echo "Testing..."
	$(GOTEST) -v -race -cover ./...

## test-coverage: Run tests with coverage report
test-coverage:
	@echo "Running tests with coverage..."
	$(GOTEST) -v -race -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

## deps: Download dependencies
deps:
	@echo "Downloading dependencies..."
	$(GOMOD) download
	$(GOMOD) tidy

## lint: Run linter
lint:
	@echo "Linting..."
	$(GOVET) ./...
	$(GOFMT) -s -w .

## clean: Clean build files
clean:
	@echo "Cleaning..."
	rm -rf bin/
	rm -f coverage.out coverage.html

## docker-build: Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build \
		--build-arg GIT_COMMIT=$(GIT_COMMIT) \
		--build-arg GIT_TAG=$(GIT_TAG) \
		--build-arg BUILD_TIME=$(BUILD_TIME) \
		-t $(DOCKER_IMAGE):$(VERSION) \
		-t $(DOCKER_IMAGE):latest .

## docker-run: Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE):latest

## docker-push: Push Docker image to registry
docker-push:
	@echo "Pushing Docker image..."
	docker push $(DOCKER_IMAGE):$(VERSION)
	docker push $(DOCKER_IMAGE):latest

## migrate-up: Run database migrations
migrate-up:
	@echo "Running migrations..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL is not set"; \
		exit 1; \
	fi
	psql "$(DATABASE_URL)" -f migrations/001_init.up.sql

## migrate-down: Rollback database migrations
migrate-down:
	@echo "Rolling back migrations..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL is not set"; \
		exit 1; \
	fi
	psql "$(DATABASE_URL)" -f migrations/001_init.down.sql

## cockroach-cert: Download CockroachDB certificate
cockroach-cert:
	@echo "Downloading CockroachDB certificate..."
	curl --create-dirs -o $$HOME/.postgresql/root.crt 'https://cockroachlabs.cloud/clusters/663a02cc-7c7d-444c-bbc3-83cef96ec83c/cert'

## seed: Seed database with initial data
seed:
	@echo "Seeding database..."
	$(GOCMD) run ./scripts/seed/main.go

## help: Show this help
help:
	@echo "FANGReady API - Available Commands:"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'
