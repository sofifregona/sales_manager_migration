# Sales Manager Architecture

## System Overview
- Sales Manager is a full-stack TypeScript application that provides business management tooling for accounts, products, sales, and supporting catalog data.
- The solution is split into a React Router front end (`app/`) and an Express + TypeORM back end (`backend/`), coordinated through a REST API exposed under `/api`.
- Both applications are designed to run locally during development and connect to a shared MySQL instance defined in `.env`.

## Technology Stack
- Front end: React 19 with React Router v7 data APIs, Vite bundler, and Tailwind CSS 4 for styling.
- Back end: Express 5 with TypeORM 0.3, using repositories and services for business logic, and MySQL 8+ for persistence.
- Shared tooling: TypeScript strict mode, path aliases (`~/` -> `app`, `@back/*` -> `backend/*`), dotenv for configuration, and npm scripts for development and build workflows.

## Runtime Topology
- The Vite-powered front end is served by React Router's dev server in development and produces a server bundle (`react-router build`) for production.
- The API server (`backend/src/app.ts`) initializes the TypeORM data source and mounts feature routes under the `/api` prefix.
- Client requests flow: React Router route -> loader or action -> `app/api/*` helper -> fetch call to Express -> controller -> service -> TypeORM repository -> MySQL.

## Frontend Application
- Routing (`app/routes.ts`, `app/router/*`): Declarative route config fans out into domain-specific route files (for example `employee`, `product`). Each route file concentrates UI logic for that feature.
- Data fetching (`app/loaders/*` and `app/actions/*`): React Router loaders provide SSR-friendly data hydration while actions implement the Post/Redirect/Get pattern with granular validation.
- API clients (`app/api/*`): Typed fetch wrappers encapsulate REST calls, standardizing headers and error parsing through utilities such as `~/utils/api/fetchJson` and `~/utils/helpers/parseAppError`.
- Types and DTOs (`app/types/*`): Shared TypeScript interfaces mirror the backend entities and shape the contract between layers.
- Utilities: Validation helpers and JSON response helpers enforce consistent user feedback and reduce duplication across loaders and actions.

## Backend Application
- Entry point (`backend/src/app.ts`): Configures Express middleware (CORS, JSON parsing, Morgan logging) and registers feature routers once `AppDataSource` connects.
- Routes (`backend/src/routes/*`): Define resource-specific endpoints mapped to controller handlers; all endpoints are namespaced under `/api` and follow REST conventions.
- Controllers (`backend/src/controllers/*`): Translate HTTP requests into service calls and convert domain errors (`AppError`) into HTTP responses.
- Services (`backend/src/services/*`): Encapsulate domain logic, orchestrating validation, deduplication, and repository access. They never deal with HTTP concerns.
- Repositories (`backend/src/repositories/*`): Thin TypeORM repository exports (for example `employeeRepo`) that enable dependency injection and consistent data access patterns.
- Errors and utilities (`backend/src/errors`, `backend/src/utils`): Custom `AppError` class with HTTP status codes plus shared validation and normalization helpers reused by services.

## Persistence Layer
- `backend/src/data-source.ts` configures a single MySQL data source using environment variables. It auto-loads entity schemas for Account, Bartable, Brand, Category, Employee, Payment, Product, ProductSold, Sale, and Provider.
- TypeORM is running with `synchronize: true` and `dropSchema: false` for a frictionless development experience; both flags should be hardened for production deployments.
- Entities (`backend/src/entities/*.ts`) model the database tables with relations that TypeORM leverages for eager or lazy loading and cascading rules.

## API Design
- Base URL: `${VITE_API_HOST}:${VITE_API_PORT}/api` (defaults to `http://localhost:3001/api`).
- Resources expose CRUD-oriented endpoints (`GET /employees`, `POST /employees`, `PATCH /employees/:id`, `PATCH /employees/:id/deactivate`, and so on). The pattern repeats across accounts, products, providers, payments, sales, bar tables, brands, and categories.
- Errors bubble up as JSON payloads with an `AppError`-defined message and status code; unhandled errors return `500` with a generic message while being logged server-side.

## Cross-Cutting Concerns
- Validation: Client-side helpers validate form intent and identifiers before issuing requests; services repeat critical validations (for example `validateNumberID`, `validateCUI`) to protect the domain.
- Error handling: Controllers wrap service calls, catching `AppError` instances to maintain consistent HTTP semantics. Front-end actions parse these errors and surface user-friendly messages.
- Logging and monitoring: Morgan runs in `dev` mode for concise request logs; `console.error` captures unexpected failures. Structured logging or telemetry can be added later.
- Authentication and authorization: Not yet implemented; all endpoints are open. Introduce middleware and session or token handling when security requirements emerge.

## Configuration and Environment
- `.env` drives both layers: API host and port for the front end (`VITE_API_HOST`, `VITE_API_PORT`) and MySQL credentials for the back end (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`).
- `app/config/api.ts` composes `VITE_API_URL`, while `backend/src/data-source.ts` reads the same variables through dotenv.
- React Router relies on `.react-router` generated artifacts; `tsconfig.base.json` ensures TypeScript resolves aliases in both applications.

## Build and Development Workflow
- Front end: `npm run dev` launches the React Router dev server; `npm run build` produces production assets.
- Back end: `npm run dev:back` concurrently watches TypeScript (`tsc -w`) and restarts the Node process; `npm run build:back` compiles to `backend/dist` for production.
- Type safety: `npm run typecheck` validates both layers by generating React Router types and running `tsc` in project references.

## Deployment Notes
- Replace React Router's dev server with a static host or Node adapter when deploying (`react-router build` output lives in `./build`).
- Harden TypeORM configuration: disable `synchronize`, manage migrations, and configure logging according to the target environment.
- Configure CORS rules and HTTP security headers (for example Helmet) before exposing the API publicly.

## Extensibility Guidelines
- Add new features by mirroring the existing vertical slices: create entity, repository, service, controller, and route files in the back end and corresponding types, API helpers, routes, actions, and loaders in the front end.
- Reuse shared validation and error helpers to keep consistency; prefer extending utilities rather than duplicating logic.
- Ensure TypeScript DTOs stay aligned between layers by updating both `app/types/*` and backend entities or services when contracts evolve.

