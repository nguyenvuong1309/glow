You are acting as a full product team to implement a new feature. Follow the 5-phase workflow defined in CLAUDE.md strictly.

Feature request: $ARGUMENTS

## Execute these phases in order:

### Phase 1: Discovery (run 2 agents in parallel)

**Agent 1 - Market Research:**
Launch an Agent with WebSearch and firecrawl tools to:
- Research how competitor apps (Grab, TaskRabbit, Fiverr, HomeServices apps) implement this feature
- Identify UX best practices and common patterns
- Find potential pitfalls to avoid
- Return a brief competitive analysis (max 10 bullet points)

**Agent 2 - Product Manager:**
Launch an Agent (Plan subagent) to:
- Write 3-5 user stories in format: "As a [role], I want [feature] so that [benefit]"
- Define acceptance criteria for each story
- Identify edge cases and error states
- Classify sub-features as MVP vs nice-to-have

### Phase 2: Architecture
After Phase 1 completes, launch an Architect Agent (Plan subagent) to:
- Design the technical architecture based on Phase 1 findings
- Define database schema changes (new tables, columns, RLS policies)
- Plan Redux state shape (new slice fields, saga effects)
- Map screen/navigation changes
- List all files to create/modify
- Check latest library docs via context7 MCP if needed

**STOP HERE and present the complete plan to the user. Wait for approval before continuing.**

### Phase 3: Implementation (run up to 3 agents in parallel after approval)

**Agent 1 - Frontend Dev:**
- Create new screens in `src/features/{name}/screens/`
- Create/update Redux slice and saga
- Update navigation types and AppNavigator/MainNavigator
- Add i18n strings to all 3 locale files (en.json, vi.json, zh.json)
- Update TypeScript types in `src/types/index.ts`

**Agent 2 - Backend Dev:**
- Create Supabase migration files
- Use `mcp__supabase__apply_migration` to apply migrations
- Set up RLS policies with `mcp__supabase__execute_sql`
- Create/deploy Edge Functions if needed
- Add new API methods to `src/lib/supabase.ts`

**Agent 3 - Mobile/Native Dev (only if native changes needed):**
- Update iOS/Android configurations
- Handle new permissions
- Update deep link handling if needed

### Phase 4: QA
After implementation, launch a QA Agent to:
- Run `npx tsc --noEmit` to check TypeScript
- Run `pnpm test` for unit tests
- Write a new E2E test spec following patterns in `e2e/specs/`
- If mobile MCP is available, take screenshots to verify UI

### Phase 5: Code Review
Launch a Reviewer Agent (Explore subagent) to:
- Review all changed files for quality and consistency
- Check security (no exposed secrets, proper RLS)
- Verify i18n completeness
- Check Redux patterns match existing code
- Report any issues found

Finally, present a summary of everything done to the user.
