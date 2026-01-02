---
applyTo: 'console/**/*'
---

# Console Workspace Instructions

## Tech Stack & Versions

- Language: TypeScript
- Framework: React 19.2.0

## Architecture & Project Structure

- Design intent:
  - Infrastructure-as-code (CDK) aggregating infra. Intended to synthesize/deploy EKS and other resources.
- Primary design pattern: infrastructure is declaratively defined by CDK.

## Coding Standards (Implicit)

- Naming conventions: use camelCase for variables/functions in TypeScript/React, and PascalCase for React components and type names.
- Component design: prefer function components with React 19 + hooks; favor lightweight, reusable single-responsibility components.
- Error handling guidance: explicitly use try/catch at boundary layers (API layers, build/deploy boundaries), leverage type safety, and fail fast when appropriate.
- Type definition rules:
  - enable strict mode and checks like noUnusedLocals/Parameters.
  - Encourage explicit interface/type declarations and avoid implicit any.
  - resolveJsonModule is enabled so typed JSON imports are allowed.
