const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("Connected to GPT-4o Realtime");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("AI Stream:", data);
  // Show partial responses, transcripts, etc.
};
