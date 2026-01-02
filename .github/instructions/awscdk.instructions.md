---
applyTo: 'awscdk/**/*'
---

# AWSCDK Workspace Instructions

## Tech Stack & Versions

- Language: TypeScript
- Framework: AWS CDK v2

## Architecture & Project Structure

- Design intent: awscdk: Infrastructure-as-code (CDK) aggregating infra. Intended to synthesize/deploy EKS and other resources.
- Primary design pattern: infrastructure is declaratively defined by CDK.

## Coding Standards (Implicit)

- Naming conventions: use camelCase for variables/functions in TypeScript.
- Error handling guidance: explicitly use try/catch at boundary layers (API layers, build/deploy boundaries), leverage type safety, and fail fast when appropriate.
- Type definition rules:
  - Enable strict mode and checks like noUnusedLocals/Parameters.
  - Encourage explicit interface/type declarations and avoid implicit any.
  - ResolveJsonModule is enabled so typed JSON imports are allowed.
