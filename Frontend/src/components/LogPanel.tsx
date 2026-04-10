import React from "react";

const LogPanel: React.FC<{ log: string[] }> = ({ log }) => (
  <div className="mt-4 h-40 overflow-y-auto bg-neutral-800 p-3 rounded-lg text-xs font-mono text-neutral-400">
    {log.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

export default LogPanel;
