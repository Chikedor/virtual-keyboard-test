import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
} from "react";
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Settings,
  X,
  Maximize,
  Play,
} from "lucide-react";

// Interfaces
interface KeyTimer {
  timeout?: number;
  startTime?: number;
}
interface KeyboardSettings {
  holdTime: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  instantInput: boolean;
  theme: "light" | "dark" | "high-contrast";
  fontSize: number; // Percentage of key size (1-100)
  textareaFontSize: number; // In pixels (8-142)
  spacing: number;
  layout: "qwerty" | "abc";
  specialKeysPosition: "bottom" | "sides";
  voiceRate: number; // Velocidad de la voz (0.1-3)
  voiceVolume: number; // Volumen de la voz (0-1)
  voicePitch: number; // Tono de la voz (0-2)
}
interface Preset {
  name: string;
  settings: KeyboardSettings;
}

// Constantes
const DEFAULT: KeyboardSettings = {
  holdTime: 0.1,
  soundEnabled: true,
  vibrationEnabled: true,
  instantInput: false,
  theme: "light",
  fontSize: 50,
  textareaFontSize: 16,
  spacing: 2,
  layout: "qwerty",
  specialKeysPosition: "bottom",
  voiceRate: 2,
  voiceVolume: 0.8,
  voicePitch: 1,
};

const DEFAULT_PRESETS: Preset[] = [
  {
    name: "Configuración 100%",
    settings: {
      ...DEFAULT,
      fontSize: 100,
      textareaFontSize: 10,
      layout: "qwerty",
      specialKeysPosition: "bottom",
    },
  },
  {
    name: "QWERTY 75/25",
    settings: {
      ...DEFAULT,
      fontSize: 75,
      textareaFontSize: 25,
      layout: "qwerty",
      specialKeysPosition: "bottom",
    },
  },
];

const LAYOUTS = {
  qwerty: {
    bottom: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
      ["Z", "X", "C", "V", "B", "N", "M"],
      ["␣", "⌫"],
    ],
    sides: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
      ["␣", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
    ],
  },
  abc: {
    bottom: [
      ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      ["J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"],
      ["R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      ["␣", "⌫"],
    ],
    sides: [
      ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      ["J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"],
      ["␣", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "⌫"],
    ],
  },
};

// Funciones de Storage
const save = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));
const load = (k: string) => {
  const data = localStorage.getItem(k);
  return data ? JSON.parse(data) : null;
};
const loadSettings = (): KeyboardSettings =>
  load("keyboardSettings")
    ? { ...DEFAULT, ...load("keyboardSettings") }
    : DEFAULT;
const saveSettings = (s: KeyboardSettings) => save("keyboardSettings", s);
const loadPresets = (): Preset[] => {
  const savedPresets = load("keyboardPresets") || [];
  return [...DEFAULT_PRESETS, ...savedPresets];
};
const savePreset = (name: string, set: KeyboardSettings) => {
  const p = loadPresets();
  p.push({ name, settings: set });
  save("keyboardPresets", p);
};
const deletePreset = (name: string) => {
  const filtered = loadPresets().filter((p) => p.name !== name);
  save("keyboardPresets", filtered);
};

// Helpers
const themeClasses = (t: string) => {
  if (t === "dark")
    return "bg-gray-700 hover:bg-gray-600 text-gray-100 border-2 border-gray-600 shadow-inner flex items-center justify-center transition-all duration-150 ease-in-out hover:shadow-lg hover:-translate-y-0.5";
  if (t === "high-contrast")
    return "bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-yellow-400 shadow-inner flex items-center justify-center transition-all duration-150 ease-in-out hover:shadow-lg hover:-translate-y-0.5";
  return "bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm flex items-center justify-center transition-all duration-150 ease-in-out hover:shadow-lg hover:-translate-y-0.5";
};
const ariaLabel = (k: string) =>
  k === "␣" ? "Tecla espacio" : k === "⌫" ? "Tecla borrar" : `Tecla ${k}`;

// Utility functions
const useAudio = (settings: KeyboardSettings) => {
  const synth = window.speechSynthesis;
  const lastSpokenRef = useRef<{ [key: string]: number }>({});
  const GRACE_PERIOD = 500; // 500ms de período de gracia

  return useCallback(
    (text: string, isSpecialKey: boolean = false) => {
      if (!synth) return;

      const now = Date.now();

      // Si es una tecla especial, verificar el período de gracia
      if (isSpecialKey) {
        const lastSpoken = lastSpokenRef.current[text] || 0;
        if (now - lastSpoken < GRACE_PERIOD) {
          return; // No reproducir si no ha pasado suficiente tiempo
        }
        lastSpokenRef.current[text] = now;
      }

      // Cancelar cualquier pronunciación anterior
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = settings.voiceRate;
      utterance.volume = settings.voiceVolume;
      utterance.pitch = settings.voicePitch;

      synth.speak(utterance);
    },
    [settings]
  );
};

const useVibration = (duration: number = 50) => {
  return useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }, [duration]);
};

const useFullscreen = (elementRef: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await elementRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [elementRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return { isFullscreen, toggleFullscreen };
};

// Añadir al inicio del archivo, después de los imports
const FlashOverlay = ({ active }: { active: boolean }) => (
  <div
    className={`absolute inset-0 transition-opacity duration-200 pointer-events-none bg-gradient-to-r from-transparent via-current to-transparent ${
      active ? "opacity-20" : "opacity-0"
    }`}
    style={{
      mixBlendMode: "overlay",
    }}
  />
);

// Componente principal
export default function VirtualKeyboard() {
  const [inp, setInp] = useState("");
  const [st, setSt] = useState<KeyboardSettings>(loadSettings());
  const [prs, setPrs] = useState<Preset[]>(loadPresets());
  const [actK, setActK] = useState<string | null>(null);
  const [showSet, setShowSet] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showTA, setShowTA] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");
  const kRef = useRef<{ [k: string]: KeyTimer }>({});
  const contRef = useRef<HTMLDivElement | null>(null);
  const speakKey = useAudio(st);
  const triggerVibration = useVibration(50);
  const { isFullscreen, toggleFullscreen } = useFullscreen(contRef);

  // Guardado
  useEffect(() => {
    saveSettings(st);
  }, [st]);

  // Layout calculado
  const calcLayout = useCallback(() => {
    return LAYOUTS[st.layout][st.specialKeysPosition];
  }, [st.layout, st.specialKeysPosition]);

  const [layout, setLayout] = useState<string[][]>([]);
  useEffect(() => {
    const ul = () => setLayout(calcLayout());
    ul();
    window.addEventListener("resize", ul);
    return () => window.removeEventListener("resize", ul);
  }, [calcLayout, st.layout, st.specialKeysPosition]);

  // Disparo de tecla
  const down = (k: string) => {
    if (kRef.current[k]?.timeout) return;
    setActK(k);
    kRef.current[k] = { startTime: Date.now() };

    if (st.instantInput) {
      if (st.soundEnabled) {
        const textToSpeak = k === "␣" ? "espacio" : k === "⌫" ? "borrar" : k;
        const isSpecialKey = k === "␣" || k === "⌫";
        speakKey(textToSpeak, isSpecialKey);
      }
      triggerVibration();
      if (k === "⌫") setInp((p) => p.slice(0, -1));
      else if (k === "␣") setInp((p) => p + " ");
      else setInp((p) => p + k);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  };

  const up = (k: string) => {
    const kt = kRef.current[k];
    if (!kt?.startTime) return;
    setActK(null);
    const dur = (Date.now() - kt.startTime) / 1e3;
    delete kRef.current[k];
    if (!st.instantInput && dur >= st.holdTime) {
      if (st.soundEnabled) {
        const textToSpeak = k === "␣" ? "espacio" : k === "⌫" ? "borrar" : k;
        const isSpecialKey = k === "␣" || k === "⌫";
        speakKey(textToSpeak, isSpecialKey);
      }
      triggerVibration();
      if (k === "⌫") setInp((p) => p.slice(0, -1));
      else if (k === "␣") setInp((p) => p + " ");
      else setInp((p) => p + k);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  };

  // Key size
  const keySize = () => {
    if (!contRef.current) return 60;

    const containerWidth = window.innerWidth - 16; // Reducido a 16px de padding total
    const headerHeight = 56; // Reducido a 3.5rem
    const textAreaHeight = showTA ? st.textareaFontSize * 1.5 : 0; // Reducido el multiplicador
    const safeAreaBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-inset-bottom"
      ) || "8",
      10
    );

    // Altura disponible total (reducidos los márgenes)
    const availableHeight =
      window.innerHeight - headerHeight - textAreaHeight - 16 - safeAreaBottom;

    const currentLayout = layout || LAYOUTS[st.layout][st.specialKeysPosition];
    const numRows = currentLayout.length;
    const maxKeysInRow = Math.max(...currentLayout.map((row) => row.length));

    // Calcular tamaño basado en el espacio disponible (reducido el espaciado)
    const keyWidth =
      (containerWidth - (maxKeysInRow - 1) * st.spacing * 4) / maxKeysInRow;
    const keyHeight =
      (availableHeight - (numRows - 1) * st.spacing * 4) / numRows;

    // Usar el menor valor para mantener teclas cuadradas, pero no menos de 36px
    return Math.max(
      Math.min(keyWidth, keyHeight, availableHeight / numRows) * 0.98,
      36
    );
  };

  // Actualizar el tamaño cuando cambia el textarea
  useEffect(() => {
    const updateLayout = () => setLayout(calcLayout());
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [calcLayout, showTA, st.textareaFontSize]);

  // Función para leer texto completo
  const readFullText = () => {
    if (inp.trim() && st.soundEnabled) {
      speakKey(inp.trim());
    }
  };

  const SettingPanel = () => {
    const [pName, setPName] = useState("");
    const [editingSettings, setEditingSettings] = useState(st);

    useEffect(() => {
      setEditingSettings(st);
    }, [showSet]); // Reset cuando se abre el panel

    const handleSettingChange = (changes: Partial<KeyboardSettings>) => {
      const newSettings = { ...editingSettings, ...changes };
      setEditingSettings(newSettings);
      setSt(newSettings);
      saveSettings(newSettings);
    };

    const handleLoadPreset = (p: Preset) => {
      handleSettingChange(p.settings);
    };

    const tabs = [
      { id: "general", label: "General" },
      { id: "keyboard", label: "Teclado" },
      { id: "presets", label: "Presets" },
    ];

    const renderTabContent = () => {
      switch (activeSettingsTab) {
        case "general":
          return (
            <>
              <div>
                <label>Tiempo de pulsación (segundos)</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={editingSettings.holdTime}
                  onChange={(e) =>
                    handleSettingChange({
                      holdTime: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                  disabled={editingSettings.instantInput}
                />
                <span>{editingSettings.holdTime}s</span>
              </div>
              <div className="flex items-center justify-between">
                <label>Sonido</label>
                <button
                  onClick={() =>
                    handleSettingChange({
                      soundEnabled: !editingSettings.soundEnabled,
                    })
                  }
                  className={`px-4 py-2 rounded transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                    editingSettings.soundEnabled
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {editingSettings.soundEnabled ? "Activado" : "Desactivado"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label>Vibración</label>
                <button
                  onClick={() =>
                    handleSettingChange({
                      vibrationEnabled: !editingSettings.vibrationEnabled,
                    })
                  }
                  className={`px-4 py-2 rounded transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                    editingSettings.vibrationEnabled
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {editingSettings.vibrationEnabled
                    ? "Activada"
                    : "Desactivada"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label>Input Instantáneo</label>
                <button
                  onClick={() =>
                    handleSettingChange({
                      instantInput: !editingSettings.instantInput,
                    })
                  }
                  className={`px-4 py-2 rounded transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                    editingSettings.instantInput
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {editingSettings.instantInput ? "Activado" : "Desactivado"}
                </button>
              </div>
              {editingSettings.soundEnabled && (
                <>
                  <div>
                    <label>Velocidad de voz</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={editingSettings.voiceRate}
                      onChange={(e) =>
                        handleSettingChange({
                          voiceRate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span>{editingSettings.voiceRate}x</span>
                  </div>

                  <div>
                    <label>Volumen de voz</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editingSettings.voiceVolume}
                      onChange={(e) =>
                        handleSettingChange({
                          voiceVolume: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span>
                      {Math.round(editingSettings.voiceVolume * 100)}%
                    </span>
                  </div>

                  <div>
                    <label>Tono de voz</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={editingSettings.voicePitch}
                      onChange={(e) =>
                        handleSettingChange({
                          voicePitch: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span>{editingSettings.voicePitch}</span>
                  </div>
                </>
              )}
            </>
          );
        case "keyboard":
          return (
            <>
              <div>
                <label>
                  Tamaño de texto del teclado (% del tamaño de tecla)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={editingSettings.fontSize}
                  onChange={(e) =>
                    handleSettingChange({
                      fontSize: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span>{editingSettings.fontSize}%</span>
              </div>
              <div>
                <label>Tamaño de texto del área (px)</label>
                <input
                  type="range"
                  min="8"
                  max="142"
                  step="2"
                  value={editingSettings.textareaFontSize}
                  onChange={(e) =>
                    handleSettingChange({
                      textareaFontSize: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span>{editingSettings.textareaFontSize}px</span>
              </div>
              <div>
                <label>Distribución</label>
                <select
                  value={editingSettings.layout}
                  onChange={(e) =>
                    handleSettingChange({
                      layout: e.target.value as "qwerty" | "abc",
                    })
                  }
                  className={`w-full p-2 rounded ${
                    editingSettings.theme === "dark"
                      ? "bg-gray-700"
                      : editingSettings.theme === "high-contrast"
                      ? "bg-black border border-yellow-300"
                      : "bg-white"
                  }`}
                >
                  <option value="qwerty">QWERTY</option>
                  <option value="abc">ABC</option>
                </select>
              </div>
              <div>
                <label>Posición teclas especiales</label>
                <select
                  value={editingSettings.specialKeysPosition}
                  onChange={(e) =>
                    handleSettingChange({
                      specialKeysPosition: e.target.value as "bottom" | "sides",
                    })
                  }
                  className={`w-full p-2 rounded ${
                    editingSettings.theme === "dark"
                      ? "bg-gray-700"
                      : editingSettings.theme === "high-contrast"
                      ? "bg-black border border-yellow-300"
                      : "bg-white"
                  }`}
                >
                  <option value="bottom">Abajo (75/25)</option>
                  <option value="sides">A los lados</option>
                </select>
              </div>
            </>
          );
        case "presets":
          return (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Nombre del preset"
                  className="flex-1 px-2 py-1 border rounded"
                />
                <button
                  onClick={() => {
                    if (pName.trim()) {
                      savePreset(pName.trim(), editingSettings);
                      setPrs(loadPresets());
                      setPName("");
                    }
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
              <div className="space-y-2">
                {prs.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                  >
                    <span>{p.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadPreset(p)}
                        className="px-2 py-1 bg-green-500 text-white rounded"
                      >
                        Cargar
                      </button>
                      <button
                        onClick={() => {
                          deletePreset(p.name);
                          setPrs(loadPresets());
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => handleSettingChange(DEFAULT)}
                  className={`w-full px-4 py-2 rounded ${
                    editingSettings.theme === "dark"
                      ? "bg-red-600 hover:bg-red-700"
                      : editingSettings.theme === "high-contrast"
                      ? "bg-red-500 text-black hover:bg-red-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-semibold`}
                >
                  Restablecer
                </button>
              </div>
            </>
          );
      }
    };

    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 ${
          showSet ? "flex opacity-100" : "hidden opacity-0"
        } items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`relative w-full max-w-md max-h-[90vh] flex flex-col rounded-xl shadow-lg transform transition-all duration-300 ease-in-out ${
            showSet ? "scale-100 opacity-100" : "scale-95 opacity-0"
          } ${
            editingSettings.theme === "dark"
              ? "bg-gray-800"
              : editingSettings.theme === "high-contrast"
              ? "bg-black border-2 border-yellow-300"
              : "bg-white"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-inherit rounded-t-xl">
            <h2 className="text-xl font-bold">Configuración</h2>
            <button
              onClick={() => setShowSet(false)}
              className="p-2 hover:bg-opacity-10 hover:bg-black rounded-full transition-colors"
              aria-label="Cerrar configuración"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex border-b bg-inherit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex-1 px-4 py-2 text-center transition-colors ${
                  activeSettingsTab === tab.id
                    ? "border-b-2 border-blue-500 font-semibold"
                    : "hover:bg-opacity-10 hover:bg-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  };

  // Render
  return (
    <div ref={contRef} className="h-screen flex flex-col bg-inherit">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 bg-inherit z-20">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Teclado Accesible</h1>
            <button
              onClick={() => setShowTA(!showTA)}
              className={`px-3 py-1 rounded-lg ${
                st.theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : st.theme === "high-contrast"
                  ? "bg-yellow-300 hover:bg-yellow-400 text-black"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {showTA ? "Ocultar Texto" : "Mostrar Texto"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setSt((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
              }
              className="p-2 rounded hover:bg-gray-100"
              aria-label={
                st.soundEnabled ? "Desactivar sonido" : "Activar sonido"
              }
            >
              {st.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <button
              onClick={() =>
                setSt((p) => ({
                  ...p,
                  theme: p.theme === "light" ? "dark" : "light",
                }))
              }
              className="p-2 rounded hover:bg-gray-100"
              aria-label={
                st.theme === "light"
                  ? "Cambiar a tema oscuro"
                  : "Cambiar a tema claro"
              }
            >
              {st.theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={
                isFullscreen
                  ? "Salir de pantalla completa"
                  : "Pantalla completa"
              }
            >
              <Maximize size={24} />
            </button>
            <button
              onClick={() => setShowSet(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Configuración"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* Input display y Textarea intercambiables */}
        <div className="p-4 relative h-16">
          <div
            className={`absolute inset-0 p-4 transition-all duration-300 ease-in-out ${
              !showTA ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <div className="flex gap-2 items-center">
              <div
                className={`flex-1 px-4 py-2 rounded-lg overflow-x-auto whitespace-nowrap relative ${
                  st.theme === "dark"
                    ? "bg-gray-800"
                    : st.theme === "high-contrast"
                    ? "bg-black border border-yellow-300"
                    : "bg-gray-200"
                }`}
                style={{
                  minHeight: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span className="inline-block min-w-[1ch]">{inp || " "}</span>
                <FlashOverlay active={flash} />
              </div>
              {st.soundEnabled && inp.trim() && (
                <button
                  onClick={readFullText}
                  className={`p-2 rounded-lg ${
                    st.theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : st.theme === "high-contrast"
                      ? "bg-yellow-300 hover:bg-yellow-400 text-black"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  aria-label="Leer texto"
                >
                  <Play size={20} />
                </button>
              )}
            </div>
          </div>

          <div
            className={`absolute inset-0 p-4 transition-all duration-300 ease-in-out ${
              showTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex gap-2 items-center">
              <textarea
                value={inp}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInp(e.target.value)
                }
                readOnly
                className={`flex-1 p-2 rounded-lg border-2 relative ${
                  st.theme === "dark"
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : st.theme === "high-contrast"
                    ? "bg-black border-yellow-300 text-yellow-300"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none`}
                style={{
                  height: `${st.textareaFontSize * 1.5}px`,
                  resize: "none",
                  fontSize: `${st.textareaFontSize}px`,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  lineHeight: "1.2",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                  position: "relative",
                }}
                onInput={() => {
                  document.documentElement.style.setProperty(
                    "--text-area-height",
                    `${st.textareaFontSize * 2}px`
                  );
                }}
              />
              {st.soundEnabled && inp.trim() && (
                <button
                  onClick={readFullText}
                  className={`p-2 rounded-lg ${
                    st.theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : st.theme === "high-contrast"
                      ? "bg-yellow-300 hover:bg-yellow-400 text-black"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  aria-label="Leer texto"
                >
                  <Play size={20} />
                </button>
              )}
            </div>
            <FlashOverlay active={flash} />
          </div>
        </div>
      </header>

      {/* Spacer para el contenido bajo el header */}
      <div
        style={{
          height: showTA ? "8rem" : "8rem",
          transition: "height 300ms",
        }}
      />

      {/* Teclado */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`fixed left-0 right-0 bottom-0 p-4 bg-inherit ${
            st.theme === "dark" ? "bg-gray-800" : "bg-gray-200"
          }`}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
            transition: "padding-bottom 300ms ease-in-out",
          }}
        >
          <div className="flex flex-col gap-1">
            {layout.map((row, r) => (
              <div key={r} className="flex justify-center gap-1">
                {row.map((k) => (
                  <button
                    key={k}
                    aria-label={ariaLabel(k)}
                    onMouseDown={() => down(k)}
                    onMouseUp={() => up(k)}
                    onMouseLeave={() => up(k)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      down(k);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      up(k);
                    }}
                    className={`${themeClasses(st.theme)} mx-${
                      st.spacing
                    } rounded-lg font-semibold select-none
                      ${
                        actK === k
                          ? "scale-[0.97] shadow-inner border-blue-500/50 transform -translate-y-0 transition-all duration-75"
                          : "border-transparent transform transition-all duration-150 ease-out hover:shadow-md"
                      }`}
                    style={{
                      width:
                        r === layout.length - 1 &&
                        st.specialKeysPosition === "bottom"
                          ? k === "␣"
                            ? `calc((100% - ${st.spacing * 2}px) / 2)`
                            : `calc((100% - ${st.spacing * 3}px) / 3)`
                          : `calc((100% - ${
                              st.spacing * (row.length - 1)
                            }px) / ${row.length})`,
                      height: keySize(),
                      fontSize: `${(keySize() * st.fontSize) / 100}px`,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      <SettingPanel />
    </div>
  );
}
