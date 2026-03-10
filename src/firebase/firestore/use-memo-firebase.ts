
'use client';

import { useMemo, useRef } from 'react';

/**
 * A hook to memoize Firebase references and queries.
 * 
 * Firestore references and queries are objects that change on every creation,
 * even with the same parameters. This hook ensures that the reference/query
 * only changes when its actual dependencies change, preventing infinite loops
 * in hooks like useCollection and useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
