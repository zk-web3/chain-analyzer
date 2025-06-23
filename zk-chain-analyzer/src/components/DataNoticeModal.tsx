'use client';
import { useEffect, useState } from 'react';

export default function DataNoticeModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('zkca_notice_seen');
      if (!seen) setOpen(true);
    }
  }, []);
  const handleClose = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zkca_notice_seen', '1');
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-cyan-500 glass-card text-center">
        <div className="text-xl font-bold neon-text mb-4">Notice</div>
        <div className="text-gray-200 mb-6">
          This app uses <span className="text-cyan-400">free public APIs</span> to get data.<br/>
          The data may sometimes be inaccurate, unavailable, or limited due to API rate limits.<br/>
          <span className="text-pink-400">Thank you for understanding!</span>
        </div>
        <button onClick={handleClose} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow neon-text">OK</button>
      </div>
    </div>
  );
} 