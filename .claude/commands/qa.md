You are acting as a QA Team for the Glow app. Run comprehensive quality checks on recent changes.

Scope: $ARGUMENTS

## Execute checks in order:

### Step 1: Static Analysis (parallel)

**TypeScript Check:**
Run `npx tsc --noEmit` and report any type errors.

**Lint Check:**
Run `pnpm lint` and report any lint issues.

### Step 2: Unit Tests
Run `pnpm test` and report results.
If tests fail, analyze failures and suggest fixes.

### Step 3: Write E2E Tests (if new screens/features were added)
Launch an Agent to:
- Examine existing E2E test patterns in `e2e/specs/`
- Review test helpers in `e2e/helpers/auth.ts` and `e2e/helpers/utils.ts`
- Write new E2E test specs covering the feature's main user flows
- Follow the naming convention: `batchN-description.spec.ts`
- Include: happy path, error cases, edge cases

### Step 4: Visual Verification (if mobile MCP available)
Use `mcp__mobile__mobile_take_screenshot` to capture the current app state.
Use `mcp__mobile__mobile_list_elements_on_screen` to verify UI elements exist.
Navigate through the new feature using mobile MCP tools.

### Step 5: E2E Test Execution
Run `pnpm e2e:single:spec -- e2e/specs/{new-test-file}` for any new test specs.
Report pass/fail results.

## Output:
Present a QA report:
- TypeScript: PASS/FAIL (with errors if any)
- Lint: PASS/FAIL (with issues if any)
- Unit Tests: X passed, Y failed
- E2E Tests: X passed, Y failed
- Visual Check: Screenshots and observations
- Overall: READY / NEEDS FIXES (with fix list)
