import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

export const SafeMarkdown = ({ content }) => {
  if (!content) return null;

  // HTMLタグが含まれていた場合の無害化処理
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div className="prose prose-slate max-w-none prose-p:my-2 prose-headings:my-3 prose-strong:text-blue-700">
      <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
    </div>
  );
};
