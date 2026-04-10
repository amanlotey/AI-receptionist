export function audioFormatForCodec(codec: string): "pcm16" | "g711_ulaw" | "g711_alaw" {
  const c = codec.toLowerCase();
  if (c === "pcmu") return "g711_ulaw";
  if (c === "pcma") return "g711_alaw";
  return "pcm16";
}

export function applyCodecPreferences(pc: RTCPeerConnection, codec: string) {
  const caps = (RTCRtpSender as any).getCapabilities?.("audio");
  const pref = caps?.codecs.find(
    (c: any) => c.mimeType.toLowerCase() === `audio/${codec.toLowerCase()}`
  );
  if (!pref) return;
  pc.getTransceivers()
    .filter((t) => t.sender && t.sender.track?.kind === "audio")
    .forEach((t) => t.setCodecPreferences([pref]));
}
