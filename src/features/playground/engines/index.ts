export * from './types';
export * from './react-lite';
export * from './webcontainer';

import type { IExecutionEngine, EngineKind } from './types';
import { createReactLiteEngine } from './react-lite';
import { createWebContainerEngine } from './webcontainer';

/**
 * Engine factory to instantiate the appropriate execution engine by kind
 */
export function getExecutionEngine(kind: EngineKind = 'react-lite'): IExecutionEngine {
  switch (kind) {
    case 'webcontainer':
      return createWebContainerEngine();
    case 'react-lite':
    case 'wasm-linux':
    case 'mock-arena':
    default:
      return createReactLiteEngine();
  }
}
