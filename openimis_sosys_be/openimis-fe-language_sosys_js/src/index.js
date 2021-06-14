import messages_np from "./translations/np.json";

const DEFAULT_CONFIG = {
  "translations": [{ key: "np", messages: messages_np }],
}

export const Language_sosysModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}