'use client';

import { useEffect, useState } from 'react';
import { Link2, Check, MessageCircle, Mail } from 'lucide-react';

/** Share controls for articles. Copies an absolute URL built from the current origin. */
export default function ShareRow({ title, path }: { title: string; path: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="share-row" style={{ display: 'grid', gap: 8 }}>
      <button
        type="button"
        onClick={copy}
        className="button ghost small"
        style={{ justifyContent: 'flex-start', gap: 8 }}
        aria-live="polite"
      >
        {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="button ghost small"
        style={{ justifyContent: 'flex-start', gap: 8 }}
      >
        <MessageCircle size={15} aria-hidden="true" /> WhatsApp
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className="button ghost small"
        style={{ justifyContent: 'flex-start', gap: 8 }}
      >
        <Mail size={15} aria-hidden="true" /> Email
      </a>
    </div>
  );
}
