// vitest.setup.ts (que hace `import '@testing-library/jest-dom'`) está excluido de
// tsconfig.json, así que tsc nunca ve la augmentación de tipos de los matchers
// (toBeInTheDocument, toHaveAttribute, etc.) sobre `expect`. Este archivo, al vivir
// bajo src/, sí entra en el include de tsconfig y expone esos tipos a `tsc --noEmit`.
/// <reference types="@testing-library/jest-dom" />
