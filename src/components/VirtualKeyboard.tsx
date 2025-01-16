import React, { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Sun, Moon, Settings, X } from "lucide-react";

interface KeyTimer {
  timeout?: number;
  startTime?: number;
}

interface KeyboardSettings {
  holdTime: number;
  soundEnabled: boolean;
  theme: "light" | "dark" | "high-contrast";
  scanningEnabled: boolean;
  keySize: number;
  fontSize: number;
  textareaFontSize: number;
  spacing: number;
  layout: "qwerty" | "abc";
}

// Definir las teclas en ambos órdenes
const LAYOUTS = {
  qwerty: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", "␣"],
  ],
  abc: [
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
    ["U", "V", "W", "X", "Y", "Z", "⌫", "␣"],
  ],
};

const getThemeClasses = (theme: string) => {
  switch (theme) {
    case "dark":
      return "bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600";
    case "high-contrast":
      return "bg-yellow-300 hover:bg-yellow-400 text-black";
    default:
      return "bg-white hover:bg-gray-100 text-gray-900";
  }
};

const VirtualKeyboard: React.FC = () => {
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<KeyboardSettings>({
    holdTime: 0.2,
    soundEnabled: true,
    theme: "light",
    scanningEnabled: false,
    keySize: 3.5,
    fontSize: 1.25,
    textareaFontSize: 1.25,
    spacing: 2,
    layout: "qwerty",
  });
  const [predictions, setPredictions] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const keyTimers = useRef<{ [key: string]: KeyTimer }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTextArea, setShowTextArea] = useState(false);

  // Prevent scrolling when touching keyboard
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(".virtual-keyboard")) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => document.removeEventListener("touchmove", preventDefault);
  }, []);

  const predictWords = (text: string) => {
    const commonWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "that",
      "have",
      "with",
    ];
    return commonWords.filter((word) =>
      word.startsWith(text.split(" ").pop() || "")
    );
  };

  const handleKeyDown = useCallback((key: string) => {
    if (keyTimers.current[key]?.timeout) return;

    setActiveKey(key);
    keyTimers.current[key] = {
      startTime: Date.now(),
    };
  }, []);

  const handleKeyUp = useCallback(
    (key: string) => {
      const keyTimer = keyTimers.current[key];
      if (!keyTimer?.startTime) return;

      const holdDuration = (Date.now() - keyTimer.startTime) / 1000;
      setActiveKey(null);

      if (holdDuration >= settings.holdTime) {
        const keySound = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
        );
        if (settings.soundEnabled) {
          keySound.play();
        }

        if (key === "⌫" || key === "backspace") {
          setInput((prev) => prev.slice(0, -1));
        } else if (key === "␣" || key === "space") {
          setInput((prev) => prev + " ");
        } else {
          setInput((prev) => prev + key);
        }
      }

      delete keyTimers.current[key];
    },
    [settings.holdTime, settings.soundEnabled]
  );

  useEffect(() => {
    setPredictions(predictWords(input));
  }, [input]);

  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return [];
    const rows = LAYOUTS[settings.layout];

    // Calcular el número de teclas en la última fila sin contar el espacio
    const lastRowKeysWithoutSpace = rows[rows.length - 1].filter(
      (k) => k !== "␣"
    ).length;
    const maxKeysPerRow = Math.max(...rows.map((row) => row.length));

    // Calcular cuántos espacios necesitamos añadir
    const spacesToAdd = maxKeysPerRow - lastRowKeysWithoutSpace - 1; // -1 por el espacio existente

    // Crear una nueva última fila con los espacios distribuidos
    const modifiedLastRow = [...rows[rows.length - 1]];
    const spaceIndex = modifiedLastRow.indexOf("␣");
    if (spaceIndex !== -1) {
      modifiedLastRow[spaceIndex] = "␣".repeat(spacesToAdd + 1);
    }

    return [...rows.slice(0, -1), modifiedLastRow];
  }, [settings.layout]);

  const [layout, setLayout] = useState<string[][]>([]);

  useEffect(() => {
    const updateLayout = () => {
      setLayout(calculateLayout());
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [calculateLayout]);

  const calculateBaseKeySize = useCallback(() => {
    if (!containerRef.current) return 60;

    const containerWidth = containerRef.current.offsetWidth - 16; // 16 = px-2 * 2
    const maxKeysInRow = 10; // QWERTYUIOP
    const totalGaps = maxKeysInRow - 1;
    const gapSize = 4; // gap-1 = 4px

    const baseSize = (containerWidth - totalGaps * gapSize) / maxKeysInRow;
    const minSize = Math.max(40, containerWidth / 20);
    const maxSize = Math.min(100, containerWidth / 6);

    return Math.min(Math.max(baseSize, minSize), maxSize);
  }, [containerRef.current?.offsetWidth]);

  const getKeySize = useCallback(() => {
    const baseSize = calculateBaseKeySize();
    const userSizeMultiplier = settings.keySize / 3.5;
    return baseSize * userSizeMultiplier;
  }, [calculateBaseKeySize, settings.keySize]);

  const findClosestKey = (x: number, y: number) => {
    if (!containerRef.current) return null;
    const elements = containerRef.current.getElementsByTagName("button");
    let closest = null;
    let minDistance = Infinity;

    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = element.textContent;
      }
    }

    return closest;
  };

  // Componente de Settings
  const SettingsPanel = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-30 ${
        showSettings ? "flex" : "hidden"
      } items-center justify-center p-4`}
    >
      <div
        className={`relative w-full max-w-md p-6 rounded-xl shadow-lg ${
          settings.theme === "dark"
            ? "bg-gray-800"
            : settings.theme === "high-contrast"
            ? "bg-black border-2 border-yellow-300"
            : "bg-white"
        }`}
      >
        <button
          onClick={() => setShowSettings(false)}
          className="absolute top-4 right-4"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Configuración</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Tiempo de pulsación (segundos)</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.holdTime}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  holdTime: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <span className="text-sm">{settings.holdTime}s</span>
          </div>

          <div>
            <label className="block mb-2">Tamaño de teclas (%)</label>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={settings.keySize}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  keySize: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <span className="text-sm">
              {Math.round((settings.keySize * 100) / 3.5)}%
            </span>
          </div>

          <div>
            <label className="block mb-2">
              Tamaño de texto del teclado (%)
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.25"
              value={settings.fontSize}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  fontSize: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <span className="text-sm">
              {Math.round(settings.fontSize * 100)}%
            </span>
          </div>

          <div>
            <label className="block mb-2">Tamaño de texto del área (%)</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={settings.textareaFontSize}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  textareaFontSize: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <span className="text-sm">
              {Math.round(settings.textareaFontSize * 100)}%
            </span>
          </div>

          <div>
            <label className="block mb-2">Distribución</label>
            <select
              value={settings.layout}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  layout: e.target.value as "qwerty" | "abc",
                }))
              }
              className={`w-full p-2 rounded ${
                settings.theme === "dark"
                  ? "bg-gray-700"
                  : settings.theme === "high-contrast"
                  ? "bg-black border border-yellow-300"
                  : "bg-white"
              }`}
            >
              <option value="qwerty">QWERTY</option>
              <option value="abc">ABC</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label>Sonido</label>
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
              }
              className={`px-4 py-2 rounded ${
                settings.soundEnabled ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {settings.soundEnabled ? "Activado" : "Desactivado"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen relative ${
        settings.theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : settings.theme === "high-contrast"
          ? "bg-black text-yellow-300"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Barra superior fija */}
      <div className="fixed top-0 left-0 right-0 bg-inherit z-20 shadow-lg">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Teclado Accesible</h1>
            <button
              onClick={() => setShowTextArea(!showTextArea)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                settings.theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : settings.theme === "high-contrast"
                  ? "bg-yellow-300 hover:bg-yellow-400 text-black"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {showTextArea ? "Ocultar Texto" : "Mostrar Texto"}
            </button>
            <div
              className={`flex-1 px-4 py-2 rounded-lg overflow-x-auto whitespace-nowrap ${
                settings.theme === "dark"
                  ? "bg-gray-800"
                  : settings.theme === "high-contrast"
                  ? "bg-black border border-yellow-300"
                  : "bg-gray-200"
              }`}
            >
              {input}
            </div>
          </div>
          <div className="flex gap-4 ml-4">
            {settings.soundEnabled ? (
              <Volume2
                className="w-6 h-6 cursor-pointer"
                onClick={() =>
                  setSettings((s) => ({ ...s, soundEnabled: false }))
                }
              />
            ) : (
              <VolumeX
                className="w-6 h-6 cursor-pointer"
                onClick={() =>
                  setSettings((s) => ({ ...s, soundEnabled: true }))
                }
              />
            )}
            {settings.theme === "light" ? (
              <Moon
                className="w-6 h-6 cursor-pointer"
                onClick={() => setSettings((s) => ({ ...s, theme: "dark" }))}
              />
            ) : (
              <Sun
                className="w-6 h-6 cursor-pointer"
                onClick={() => setSettings((s) => ({ ...s, theme: "light" }))}
              />
            )}
            <Settings
              className="w-6 h-6 cursor-pointer"
              onClick={() => setShowSettings(true)}
            />
          </div>
        </div>

        {/* Área de texto desplegable */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showTextArea ? "max-h-[60vh]" : "max-h-0"
          }`}
        >
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                settings.theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-400 focus:ring focus:ring-blue-400/20"
                  : settings.theme === "high-contrast"
                  ? "bg-black border-yellow-300 text-yellow-300 focus:border-yellow-400 focus:ring focus:ring-yellow-400/20"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200"
              }`}
              style={{
                height: "40vh",
                resize: "none",
                fontSize: `${settings.textareaFontSize}em`,
              }}
            />
          </div>
        </div>
      </div>

      <SettingsPanel />

      {/* Espacio para la barra superior y área de texto */}
      <div
        style={{
          height: showTextArea ? "calc(40vh + 4rem)" : "4rem",
          transition: "height 300ms ease-in-out",
        }}
      />

      {/* Área del teclado con scroll independiente */}
      <div
        className="fixed left-0 right-0 bottom-0 overflow-y-auto bg-inherit"
        style={{
          top: showTextArea ? "calc(40vh + 4rem)" : "4rem",
          transition: "top 300ms ease-in-out",
        }}
      >
        <div
          ref={containerRef}
          className="virtual-keyboard w-full mx-auto px-2 pb-20"
          onTouchStart={(e) => {
            const key = findClosestKey(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
            if (key) {
              const isSpecial = key === "⌫" || key === "␣";
              handleKeyDown(isSpecial ? key : key.toLowerCase());
            }
          }}
          onTouchEnd={(e) => {
            const key = findClosestKey(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            );
            if (key) {
              const isSpecial = key === "⌫" || key === "␣";
              handleKeyUp(isSpecial ? key : key.toLowerCase());
            }
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const key = findClosestKey(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
            if (key && key !== activeKey) {
              if (activeKey) handleKeyUp(activeKey);
              const isSpecial = key === "⌫" || key === "␣";
              handleKeyDown(isSpecial ? key : key.toLowerCase());
            }
          }}
        >
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-between gap-1 px-2 mb-1"
            >
              {row.map((key) => {
                const keySize = getKeySize();
                const isSpaceKey = key.includes("␣");
                const isBackspaceKey = key === "⌫";
                const spaceMultiplier = isSpaceKey ? key.length : 1;
                const width = keySize * spaceMultiplier;

                return (
                  <button
                    key={key}
                    onMouseDown={() => {
                      const processedKey =
                        isSpaceKey || isBackspaceKey ? key : key.toLowerCase();
                      handleKeyDown(processedKey);
                    }}
                    onMouseUp={() => {
                      const processedKey =
                        isSpaceKey || isBackspaceKey ? key : key.toLowerCase();
                      handleKeyUp(processedKey);
                    }}
                    onMouseLeave={() => {
                      const processedKey =
                        isSpaceKey || isBackspaceKey ? key : key.toLowerCase();
                      handleKeyUp(processedKey);
                    }}
                    onTouchStart={() => {
                      const processedKey =
                        isSpaceKey || isBackspaceKey ? key : key.toLowerCase();
                      handleKeyDown(processedKey);
                    }}
                    onTouchEnd={() => {
                      const processedKey =
                        isSpaceKey || isBackspaceKey ? key : key.toLowerCase();
                      handleKeyUp(processedKey);
                    }}
                    className={`
                      font-semibold rounded-xl transition-all duration-200
                      ${
                        activeKey ===
                        (isSpaceKey || isBackspaceKey ? key : key.toLowerCase())
                          ? "scale-95"
                          : "scale-100"
                      }
                      ${getThemeClasses(settings.theme)}
                      shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300
                      flex items-center justify-center touch-manipulation
                      ${isSpaceKey ? "text-2xl" : ""}
                    `}
                    style={{
                      width: `${width}px`,
                      height: `${keySize}px`,
                      fontSize: isSpaceKey ? "1.5em" : `${settings.fontSize}em`,
                      minWidth: `${keySize}px`,
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
