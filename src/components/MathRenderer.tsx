import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  // Function to render math formulas via KaTeX safely
  const renderMathAndText = (rawText: string) => {
    if (!rawText) return null;

    // Split text by block math $$...$$ first, then inline math $...$
    const parts = rawText.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <pre key={index} className="my-2 p-2 bg-slate-100 rounded text-sm text-indigo-700">
              {math}
            </pre>
          );
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code key={index} className="px-1 text-indigo-600 font-mono text-sm">
              {math}
            </code>
          );
        }
      }

      // Process standard markdown (bold, italic, line breaks, bullet lists)
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {formatMarkdownSpans(part)}
        </span>
      );
    });
  };

  const formatMarkdownSpans = (text: string) => {
    // Process bold **text**
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((sub, i) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
            {sub.slice(2, -2)}
          </strong>
        );
      }
      return sub;
    });
  };

  return <div className={`text-slate-700 dark:text-slate-300 text-sm md:text-base ${className}`}>{renderMathAndText(content)}</div>;
};
