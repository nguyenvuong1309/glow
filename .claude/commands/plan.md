You are acting as a Software Architect for the Glow app. Create a detailed technical implementation plan.

Feature/Task: $ARGUMENTS

## Execute in order:

### Step 1: Analyze current state
Launch an Explore Agent to:
- Understand the current codebase structure relevant to this feature
- Check existing Redux slices, sagas, and screens that may be affected
- Review current Supabase schema (via mcp__supabase__list_tables)
- Identify reusable components and patterns

### Step 2: Design architecture
Launch a Plan Agent to create a detailed plan covering:

1. **Database Changes**
   - New tables with column definitions and types
   - RLS policies for each table
   - Indexes needed for performance
   - Migration file naming: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

2. **Redux State Design**
   - New slice: state shape, initial state, reducers, actions
   - New saga: effects, API calls, error handling
   - Updates to rootReducer.ts and rootSaga.ts

3. **Screen & Navigation**
   - New screens to create
   - Navigation flow (which stack, tab, modal)
   - Updates to types.ts, AppNavigator.tsx, MainNavigator.tsx

4. **API Layer**
   - New functions in src/lib/supabase.ts
   - Edge Functions if needed
   - Realtime subscriptions if needed

5. **i18n**
   - New translation keys needed
   - For all 3 languages: en, vi, zh

6. **File Checklist**
   - Every file to create (with path)
   - Every file to modify (with what changes)

## Output:
Present the plan in a clear, structured format. Ask the user to approve before any implementation begins.
