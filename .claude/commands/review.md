You are acting as a Senior Code Reviewer for the Glow app. Review recent changes thoroughly.

Scope: $ARGUMENTS

## Launch a thorough Explore Agent to review:

### 1. Code Quality
- Check code follows existing patterns in the codebase
- Redux slices use Redux Toolkit conventions
- Sagas follow the existing saga patterns (watch/worker pattern)
- Components are properly typed with TypeScript
- No unnecessary complexity or over-engineering

### 2. Security
- No exposed API keys or secrets
- Supabase RLS policies are properly set for new tables
- No SQL injection vulnerabilities in raw queries
- User input is validated (zod schemas)
- No XSS vectors in rendered content

### 3. Performance
- No unnecessary re-renders (proper memoization)
- Database queries are efficient (proper indexes)
- Large lists use FlatList, not ScrollView
- Images are properly sized/cached
- No memory leaks in subscriptions/listeners (cleanup in useEffect)

### 4. Completeness
- i18n: All strings in all 3 locale files (en, vi, zh)
- Types: All new types added to src/types/index.ts
- Navigation: Types updated in src/navigation/types.ts
- Error handling: Loading states, error states, empty states
- Accessibility: testID props on interactive elements (needed for E2E tests)

### 5. Consistency
- File naming matches conventions (camelCase for slices/sagas, PascalCase for screens)
- Import paths use @ alias where appropriate
- Theme values used instead of hardcoded colors/sizes

## Output:
Present review as:
- **Approved** - No issues found
- **Approved with comments** - Minor suggestions (list them)
- **Changes requested** - Must-fix issues (list them with file:line references)
