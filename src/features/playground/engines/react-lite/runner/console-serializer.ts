import type { SerializedValue } from '../../../types';

export const SERIALIZER_LIMITS = {
  maxDepth: 5,
  maxObjectKeys: 100,
  maxArrayItems: 100,
  maxStringLength: 10_000,
  maxMessagesPerRun: 500,
};

export function serializeValue(
  val: unknown,
  depth = 0,
  seen = new WeakSet<object>()
): SerializedValue {
  // 1. Primitive types
  if (val === null) return { type: 'null' };
  if (val === undefined) return { type: 'undefined' };

  const valType = typeof val;

  if (valType === 'string') {
    const str = val as string;
    const truncated =
      str.length > SERIALIZER_LIMITS.maxStringLength
        ? `${str.slice(0, SERIALIZER_LIMITS.maxStringLength)}... [truncated]`
        : str;
    return { type: 'string', value: truncated };
  }

  if (valType === 'number') {
    return { type: 'number', value: Number.isNaN(val) ? 0 : (val as number) };
  }

  if (valType === 'boolean') {
    return { type: 'boolean', value: val as boolean };
  }

  if (valType === 'bigint') {
    return { type: 'bigint', value: `${val.toString()}n` };
  }

  if (valType === 'symbol') {
    return { type: 'symbol', value: val.toString() };
  }

  if (valType === 'function') {
    const fn = val as (...args: unknown[]) => unknown;
    return { type: 'function', name: fn.name || 'anonymous' };
  }

  // 2. Objects & Errors
  if (valType === 'object') {
    const obj = val as object;

    // Check for Error instances
    if (val instanceof Error) {
      return {
        type: 'error',
        message: val.message,
        stack: val.stack,
      };
    }

    // Check DOM Node
    if (typeof Node !== 'undefined' && val instanceof Node) {
      const nodeName = val.nodeName.toLowerCase();
      const id = (val as HTMLElement).id ? `#${(val as HTMLElement).id}` : '';
      return { type: 'string', value: `<${nodeName}${id} />` };
    }

    // Circular reference protection
    if (seen.has(obj)) {
      return { type: 'string', value: '[Circular]' };
    }

    // Depth limit
    if (depth >= SERIALIZER_LIMITS.maxDepth) {
      return { type: 'string', value: Array.isArray(obj) ? '[Array]' : '[Object]' };
    }

    seen.add(obj);

    // Arrays
    if (Array.isArray(obj)) {
      const items: SerializedValue[] = [];
      const len = Math.min(obj.length, SERIALIZER_LIMITS.maxArrayItems);

      for (let i = 0; i < len; i++) {
        items.push(serializeValue(obj[i], depth + 1, seen));
      }

      if (obj.length > SERIALIZER_LIMITS.maxArrayItems) {
        items.push({
          type: 'string',
          value: `... (${obj.length - SERIALIZER_LIMITS.maxArrayItems} more items)`,
        });
      }

      return { type: 'array', value: items };
    }

    // Plain objects
    const result: Record<string, SerializedValue> = {};
    const keys = Object.keys(obj).slice(0, SERIALIZER_LIMITS.maxObjectKeys);

    for (const key of keys) {
      try {
        result[key] = serializeValue(
          (obj as Record<string, unknown>)[key],
          depth + 1,
          seen
        );
      } catch {
        result[key] = { type: 'string', value: '[Unreadable property]' };
      }
    }

    if (Object.keys(obj).length > SERIALIZER_LIMITS.maxObjectKeys) {
      result['...'] = {
        type: 'string',
        value: `[${Object.keys(obj).length - SERIALIZER_LIMITS.maxObjectKeys} more keys]`,
      };
    }

    return { type: 'object', value: result };
  }

  return { type: 'string', value: String(val) };
}

export function serializeArgs(args: unknown[]): SerializedValue[] {
  const seen = new WeakSet<object>();
  return args.map((arg) => serializeValue(arg, 0, seen));
}
