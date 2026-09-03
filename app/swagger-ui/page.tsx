'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    SwaggerUIBundle: (config: Record<string, unknown>) => void;
    SwaggerUIStandalonePreset: unknown;
  }
}

export default function SwaggerUIPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.onload = () => {
      if (containerRef.current && window.SwaggerUIBundle) {
        window.SwaggerUIBundle({
          url: '/api/swagger',
          dom_id: '#swagger-ui-container',
          deepLinking: true,
          layout: 'BaseLayout',
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          docExpansion: 'list',
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(cssLink)) document.head.removeChild(cssLink);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#1F2421] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-[#2F3531]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-serif font-bold text-base text-white hover:text-[#B76E79] transition-colors"
          >
            <Shield className="w-4 h-4 text-[#B76E79]" />
            NHÀ CÓ TIỆC
          </Link>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-xs text-gray-400 font-semibold">API Documentation v1.0</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/admin"
            className="px-3 py-1 rounded-lg bg-[#B76E79]/20 text-[#B76E79] font-semibold hover:bg-[#B76E79]/30 transition-colors"
          >
            Admin Center
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1 rounded-lg bg-gray-700/50 text-gray-300 font-semibold hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <a
            href="/api/swagger"
            target="_blank"
            className="px-3 py-1 rounded-lg bg-blue-900/30 text-blue-300 font-semibold hover:bg-blue-900/50 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> OpenAPI JSON
          </a>
        </div>
      </header>

      <div id="swagger-ui-container" ref={containerRef} className="max-w-7xl mx-auto py-4" />
    </div>
  );
}
