import { createContext, useContext } from "react";
import useAudioDownload from "../hooks/useAudioDownload";

const AudioRecorderContext = createContext<any>(null);

export const AudioRecorderProvider = ({ children }: { children: React.ReactNode }) => {
  const recorder = useAudioDownload();
  return <AudioRecorderContext.Provider value={recorder}>{children}</AudioRecorderContext.Provider>;
};

export const useAudioRecorder = () => useContext(AudioRecorderContext);
