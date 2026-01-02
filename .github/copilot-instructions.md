# Project Guidelines

## Project Overview

This repository is a monorepo for experimenting with web application infrastructure (a web app running on AWS EKS). The main components are:

- Infrastructure definitions using AWS CDK (awscdk package)
- A React-based administrative console static site (console package)
- A docker-compose setup for local development using Traefik + nginx

## Architecture & Project Structure

- Monorepo (pnpm-workspace.yaml) layout:
  - Top-level packages include awscdk (CDK TypeScript app), console (React SPA), etc. Each package is independently buildable/deployable.
- Design intent:
  - docker-compose.yml: Uses Traefik as a reverse-proxy/load-balancer for local dev and serves the console statically via nginx as a local network service.
- Data flow: Browser → Traefik (entrypoint) → nginx (console/dist) → APIs (outside this repo) → backend (intended to be deployed on EKS).
- Primary design pattern: Responsibilities are clearly separated by package in the monorepo.

## Development Workflow

- Use mise as the development task runner.
- Install monorepo dependencies: `mise run setup`
- Lint: run `mise run lint` at project root
- Format: run `mise run format` at project root
- Build console: `cd console && mise run build`
- CDK operations: `cd awscdk && mise run synth`
- Local integrated run: `docker-compose up -d`
