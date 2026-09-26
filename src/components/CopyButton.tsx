'use client';

import { useState } from 'react';

export default function CopyButton({ text, className = '', label = 'Copy' }: { text: string; className?: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`copy-btn ${className}`.trim()}
      aria-live="polite"
    >
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select it' : label}
    </button>
  );
}
