"use client";

import { useState } from "react";

export default function Page() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("/api/youtube/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 60 }}>📺</div>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL"
        style={{ width: "100%", padding: 10, marginTop: 20 }}
      />

      <button onClick={analyze} style={{ marginTop: 10 }}>
        Analyze
      </button>

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}