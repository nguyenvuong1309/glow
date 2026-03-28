You are acting as a Development Team Lead coordinating implementation for the Glow app.

Task: $ARGUMENTS

## Before starting:
- Read the conversation history for any existing plan/architecture decisions
- If no plan exists, first run a quick analysis of what needs to be built

## Execute implementation with parallel agents:

### Agent 1 - Frontend Dev (always runs)
Launch a general-purpose Agent to handle:
- Create/modify screens in `src/features/{name}/screens/`
- Create/update Redux slice (`{name}Slice.ts`) using Redux Toolkit patterns
- Create/update Redux saga (`{name}Saga.ts`) following existing saga patterns
- Update navigation: `types.ts`, `AppNavigator.tsx` or `MainNavigator.tsx`
- Update `src/store/rootReducer.ts` and `src/store/rootSaga.ts`
- Add i18n keys to `src/i18n/locales/en.json`, `vi.json`, `zh.json`
- Update `src/types/index.ts` with new TypeScript types
- Create reusable components in `src/components/` if needed

### Agent 2 - Backend Dev (run if DB/API changes needed)
Launch a general-purpose Agent to handle:
- Create Supabase migration SQL files
- Apply migrations via `mcp__supabase__apply_migration`
- Set up RLS policies via `mcp__supabase__execute_sql`
- Add API functions to `src/lib/supabase.ts`
- Create/deploy Edge Functions in `supabase/functions/`

### Agent 3 - Native Dev (run only if native changes needed)
Launch a general-purpose Agent to handle:
- iOS: Podfile, Info.plist, entitlements, AppDelegate
- Android: AndroidManifest.xml, build.gradle, MainActivity
- Run `cd ios && pod install` if needed

## After all agents complete:
Run a quick TypeScript check: `npx tsc --noEmit`
Report any errors and fix them.
Present a summary of all files created/modified.
