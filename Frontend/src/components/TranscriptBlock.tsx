import React from "react";

interface TranscriptBlockProps {
  title: string;
  color: string;
  items: string[];
  placeholder: string;
}

const TranscriptBlock: React.FC<TranscriptBlockProps> = ({
  title,
  color,
  items,
  placeholder,
}) => (
  <div className="mt-4 bg-neutral-800 p-3 rounded-lg text-sm font-mono h-32 overflow-y-auto">
    <h3 className={`${color} font-semibold mb-1`}>{title}</h3>
    {items.length > 0 ? (
      items.map((t, i) => <div key={i}>• {t}</div>)
    ) : (
      <div className="text-neutral-400">{placeholder}</div>
    )}
  </div>
);

export default TranscriptBlock;
