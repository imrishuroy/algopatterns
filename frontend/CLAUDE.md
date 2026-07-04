@AGENTS.md
@../AGENTS.md

# DeepSource Integration

## Skills Available
Two DeepSource skills are installed in `.agents/skills/`:
- **deepsource**: Retrieve code review issues, vulnerabilities, report cards via CLI
- **sentinel-api**: Scan code for security vulnerabilities, leaked secrets, auto-fix issues

## Using DeepSource CLI (requires authentication)
```bash
deepsource auth login
deepsource issues --severity critical --output json
deepsource report-card --output json
deepsource vulnerabilities --output json
```

## Before Committing Code
Always ensure code passes DeepSource rules. When writing TypeScript/JavaScript code, follow the rules below.

---

# DeepSource JavaScript/TypeScript Linting Rules

Follow these rules to pass DeepSource analysis. Full reference: https://deepsource.com/directory/javascript

## Critical Rules

### JS-0067: Function declarations in global scope
Don't use `function foo() {}` at module scope — use arrow functions or const.

**Bad:**
```typescript
export function getData() {
    return fetch('/api/data');
}
```

**Good:**
```typescript
export const getData = () => {
    return fetch('/api/data');
};
```

**Exception:** React components using hooks may need function declarations. Add skipcq comment:
```typescript
// skipcq: JS-0067 — Next.js page component convention
export default function Page() { ... }
```

### JS-0002: Console usage in browser code
Never use `console.log()` in browser code.

**Bad:**
```typescript
console.log('Debug:', data);
```

**Good:**
```typescript
// Use proper logging (Sentry, custom logger)
logger.debug('Debug:', data);

// Or remove entirely in production code
```

### JS-0116: Async function without await
Don't mark functions `async` if they don't use `await`.

**Bad:**
```typescript
export const fetchData = async () => {
    return somePromise();
};
```

**Good:**
```typescript
export const fetchData = () => {
    return somePromise();
};

// Or if you need Promise<T> return type for interface:
export const fetchData = (): Promise<Data> => {
    return Promise.resolve(data);
};
```

## React/JSX Rules

### JS-0415: JSX nesting too deep
Keep JSX tree depth under 5 levels. Extract nested content into components.

**Bad:**
```tsx
<html>
  <body>
    <div>
      <main>
        <section>
          <Content /> {/* Level 6 - too deep! */}
        </section>
      </main>
    </div>
  </body>
</html>
```

**Good:**
```tsx
const PageContent = () => (
  <main>
    <section>
      <Content />
    </section>
  </main>
);

// In component:
<html>
  <body>
    <PageContent />
  </body>
</html>
```

### JS-0414: Missing key prop in lists
Always provide unique `key` prop when rendering lists.

```tsx
// Bad
items.map(item => <Item data={item} />)

// Good
items.map(item => <Item key={item.id} data={item} />)
```

### JS-0437: Array index as key
Don't use array index as key — use unique identifiers.

```tsx
// Bad
items.map((item, index) => <Item key={index} />)

// Good
items.map(item => <Item key={item.id} />)
```

### JS-0417: No bind in JSX props
Don't use `.bind()` or create new functions in JSX props.

```tsx
// Bad
<button onClick={() => handleClick(id)} />
<button onClick={handleClick.bind(this, id)} />

// Good
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<button onClick={handleButtonClick} />
```

### JS-0440: Dangerous JSX properties
Avoid `dangerouslySetInnerHTML`. If necessary, sanitize content first.

### JS-0456: Unsafe lifecycle methods
Avoid deprecated lifecycle methods: `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`.

## Comment Style

Use plain, simple comments. Do not use decorative dividers made of box-drawing or repeated punctuation characters.

```typescript
// Bad
// ─── Helpers ─────────────────────────────────────────────────────────────────
// ── State (lazy-initialised from localStorage) ───────────────────────────────
// ==== Section ====
// **** Section ****

// Good
// Helpers
// State — lazy-initialised from localStorage
// Section name
```

Section headings inside a function body should be inline comments on the same line or a plain comment line above the block.

## Code Quality Rules

### JS-R1005: Cyclomatic complexity
Keep function complexity low (under 10-15). Split complex functions.

| Risk | Complexity | Action |
|------|------------|--------|
| Low | 1-5 | OK |
| Medium | 6-15 | Review |
| High | 16-25 | Refactor |
| Critical | >50 | Must refactor |

**Fix:** Extract logic into smaller helper functions.

### JS-W1042: Redundant undefined
Don't pass `undefined` explicitly to optional parameters.

**Bad:**
```typescript
setState(undefined);
someFunc(value, undefined);
```

**Good:**
```typescript
setState();
// Or use null if you need to explicitly clear
setState(null);
someFunc(value);
```

### JS-0361: Prefer for...of loops
Use `for...of` over traditional `for` loops for simple iteration.

**Bad:**
```typescript
for (let i = 0; i < items.length; i++) {
    process(items[i]);
}
```

**Good:**
```typescript
for (const item of items) {
    process(item);
}
```

**Exception:** When you need the index for complex logic, use skipcq comment.

### JS-0045: Arrow function return consistency
Be consistent with returns in arrow functions.

```typescript
// Bad - inconsistent
array.forEach(item => {
    if (condition) return true; // unexpected return
    process(item);
});

// Good
array.forEach(item => {
    if (condition) return;
    process(item);
});
```

## TypeScript Rules

### JS-0323: Avoid `any` type
Use proper types instead of `any`.

```typescript
// Bad
const data: any = fetchData();

// Good
const data: UserData = fetchData();
// Or if truly unknown:
const data: unknown = fetchData();
```

### JS-0349: Unnecessary type assertions
Don't add type assertions when TypeScript can infer.

```typescript
// Bad
const value: number = 1;
const result = getValue() as string; // if already string

// Good
const value = 1;
const result = getValue();
```

### JS-0324: Unnecessary non-null assertion
Don't use `!` when value is already non-null.

### JS-0372: Use @ts-expect-error
Prefer `@ts-expect-error` over `@ts-ignore`.

```typescript
// Bad
// @ts-ignore
brokenCode();

// Good
// @ts-expect-error — reason why this is needed
brokenCode();
```

## Security Rules

### JS-S1012: Insecure innerHTML
Avoid direct innerHTML assignment. Use safe alternatives.

```typescript
// Bad
element.innerHTML = userInput;

// Good
element.textContent = userInput;
// Or sanitize with DOMPurify if HTML needed
element.innerHTML = DOMPurify.sanitize(userInput);
```

### JS-S1010: Command injection
Validate input before using in shell commands.

### JS-S1021: Hardcoded credentials
Never hardcode passwords, API keys, or secrets in code.

### JS-0060: No eval()
Never use `eval()` — it's a security risk.

## Testing Rules

### Empty class in mocks
Use `Object` instead of empty `class {}`.

```typescript
// Bad
vi.mock('module', () => ({ SomeClass: class {} }));

// Good
vi.mock('module', () => ({ SomeClass: Object }));
```

### Async test callbacks
Don't use `async` in test callbacks unless using `await`.

```typescript
// Bad
it('test', async () => {
    expect(true).toBe(true);
});

// Good
it('test', () => {
    expect(true).toBe(true);
});

// Or with actual async:
it('test', async () => {
    const result = await fetchData();
    expect(result).toBeDefined();
});
```

### Mock return values
Use proper type casting for mock return values.

```typescript
// Bad
mockFn.mockReturnValue(undefined);

// Good  
mockFn.mockReturnValue(undefined as unknown as ReturnType<typeof realFn>);
```

## Accessibility Rules (JS-07xx)

### JS-0737: Alt text required
Provide meaningful alt text for images.

```tsx
// Bad
<img src="photo.jpg" />

// Good
<img src="photo.jpg" alt="User profile picture" />
```

### JS-0756: Avoid accessKey
Don't use `accessKey` prop — it has accessibility issues.

### JS-0769: tabIndex value
Don't use tabIndex greater than 0.

```tsx
// Bad
<div tabIndex={5} />

// Good
<div tabIndex={0} />
<div tabIndex={-1} />
```
