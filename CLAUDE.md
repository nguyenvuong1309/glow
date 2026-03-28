# Glow - Project Guidelines

## Project Overview
Glow is a React Native service booking app (like TaskRabbit/Grab Services). Tech stack: React Native, TypeScript, Redux Toolkit + Saga, Supabase backend, Firebase (Analytics/Crashlytics/Push).

## Agent Team Workflow

When the user requests a new feature or significant change, follow this company-like workflow with specialized agents. Always confirm the plan with the user before starting development.

### Phase 1: Discovery (Parallel)

**Market Research Agent** (`Agent` with `WebSearch`, `firecrawl`)
- Research how competitor apps (Grab, TaskRabbit, Fiverr, etc.) implement similar features
- Identify UX patterns, best practices, and pitfalls
- Output: Brief competitive analysis with recommendations

**Product Manager Agent** (`Agent` with `Plan` subagent + `sequential-thinking`)
- Define user stories and acceptance criteria
- Identify edge cases and error states
- Prioritize sub-features (MVP vs nice-to-have)
- Output: User stories with acceptance criteria

### Phase 2: Architecture

**Architect Agent** (`Agent` with `Plan` subagent + `Explore` subagent)
- Design system architecture based on Phase 1 findings
- Define database schema changes (Supabase migrations)
- Plan Redux state shape (slice + saga)
- Map navigation flow changes
- Identify API endpoints / Edge Functions needed
- Use `context7` MCP to check latest docs for libraries
- Output: Technical design document with file list

**Present the plan to the user for approval before proceeding to Phase 3.**

### Phase 3: Implementation (Parallel - up to 3 agents)

**Frontend Dev Agent** (`Agent` - general-purpose)
- Create/modify screens, components, navigation
- Implement Redux slices and sagas
- Update i18n translations (en, vi, zh)
- Update TypeScript types

**Backend Dev Agent** (`Agent` - general-purpose)
- Create Supabase migrations via `mcp__supabase__apply_migration`
- Set up RLS policies via `mcp__supabase__execute_sql`
- Deploy Edge Functions via `mcp__supabase__deploy_edge_function`
- Configure Realtime subscriptions if needed

**Mobile/Native Dev Agent** (`Agent` - general-purpose, only if needed)
- Update iOS/Android native configs
- Handle permissions, deep links, native modules
- Run `pod install` if iOS dependencies change

### Phase 4: Quality Assurance

**QA Agent** (`Agent` - general-purpose)
- Run TypeScript check: `npx tsc --noEmit`
- Run unit tests: `pnpm test`
- Write new E2E test specs in `e2e/specs/` following existing patterns
- Run E2E tests: `pnpm e2e:single:spec`
- Use `mcp__mobile__*` tools for visual verification on simulator if available

### Phase 5: Code Review

**Reviewer Agent** (`Agent` with `Explore` subagent)
- Review all changes for code quality, consistency with existing patterns
- Check for security issues (SQL injection, XSS, exposed secrets)
- Verify i18n completeness across all 3 languages
- Check Redux state shape consistency
- Output: Review summary with any issues found

### When to use which phases

| Request Type | Phases |
|---|---|
| New major feature | All 5 phases |
| Small feature / enhancement | Phase 2 + 3 + 4 |
| Bug fix | Phase 3 + 4 only |
| Refactoring | Phase 2 + 3 + 4 |
| Quick question / exploration | No phases needed |

The user can also request individual phases, e.g., "just do market research on chat features" or "skip to implementation."

## Code Conventions

### Architecture
- Feature-based folder structure: `src/features/{featureName}/`
- Each feature has: `screens/`, `{name}Slice.ts`, `{name}Saga.ts`
- Shared components in `src/components/`
- Supabase client and API methods in `src/lib/supabase.ts`
- Navigation types in `src/navigation/types.ts`

### State Management
- Redux Toolkit for state slices
- Redux-Saga for async side effects (not thunks)
- Redux-Persist whitelists: `auth`, `favorites`

### Navigation
- React Navigation v7 with native-stack
- Bottom tabs: Home, Services, Bookings, Profile
- All screen names defined in `src/navigation/types.ts`

### i18n
- All user-facing strings must be in all 3 locale files: `en.json`, `vi.json`, `zh.json`
- Use `useTranslation()` hook, never hardcode strings

### Testing
- Unit tests: Jest in `__tests__/`
- E2E tests: Appium + WebDriverIO in `e2e/specs/`
- Test helpers in `e2e/helpers/` (auth.ts, utils.ts)

### Supabase
- Migrations in `supabase/migrations/`
- Edge functions in `supabase/functions/`
- Always add RLS policies for new tables
- Use Supabase MCP tools when available

### Forms
- react-hook-form + zod for validation
- Define zod schemas alongside the form component

### Styling
- Theme values from `src/utils/theme.ts`
- Use React Native StyleSheet, not inline styles
