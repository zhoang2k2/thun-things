import { describe, expect, it } from 'vitest';

import { analyticsMode, DEBUG_KEY, readDebugFlag } from '@/lib/analytics/env';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

describe('analyticsMode', () => {
  const gaId = 'G-ABC123';

  it('is off without a measurement id', () => {
    expect(analyticsMode({ gaId: undefined, vercelEnv: 'production', debugFlag: true })).toBe(
      'off',
    );
  });

  it('collects in production', () => {
    expect(analyticsMode({ gaId, vercelEnv: 'production', debugFlag: false })).toBe('production');
  });

  it('is off on previews and locally without the debug flag', () => {
    expect(analyticsMode({ gaId, vercelEnv: 'preview', debugFlag: false })).toBe('off');
    expect(analyticsMode({ gaId, vercelEnv: undefined, debugFlag: false })).toBe('off');
  });

  it('runs in debug mode anywhere with the flag', () => {
    expect(analyticsMode({ gaId, vercelEnv: 'preview', debugFlag: true })).toBe('debug');
    expect(analyticsMode({ gaId, vercelEnv: 'development', debugFlag: true })).toBe('debug');
    expect(analyticsMode({ gaId, vercelEnv: 'production', debugFlag: true })).toBe('debug');
  });
});

describe('readDebugFlag', () => {
  it('turns on from ?ga_debug=1 and remembers it for the tab', () => {
    const storage = memory();
    expect(readDebugFlag('?ga_debug=1', storage)).toBe(true);
    expect(storage.getItem(DEBUG_KEY)).toBe('1');
    expect(readDebugFlag('', storage)).toBe(true);
  });

  it('is off otherwise, and when storage throws', () => {
    expect(readDebugFlag('?ga_debug=0', memory())).toBe(false);
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(readDebugFlag('', throwing)).toBe(false);
    expect(readDebugFlag('?ga_debug=1', throwing)).toBe(true);
  });
});
