export * from './types';
export * from './react-lite';

import type { IExecutionEngine, EngineKind } from './types';
import { createReactLiteEngine } from './react-lite';

/**
 * Engine factory to instantiate the appropriate execution engine by kind
 */
export function getExecutionEngine(kind: EngineKind = 'react-lite'): IExecutionEngine {
  switch (kind) {
    case 'react-lite':
      return createReactLiteEngine();
    case 'webcontainer':
    case 'wasm-linux':
    case 'mock-arena':
    default:
      // Fallback to React Lite for now until WASM engines are plugged in
      return createReactLiteEngine();
  }
}
