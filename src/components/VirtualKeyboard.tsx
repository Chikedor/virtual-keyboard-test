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
  spacing: number;
  layout: "qwerty" | "abc";
}

// Definir las teclas en ambos órdenes
const LAYOUTS = {
  qwerty: [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "N",
    "M",
    "backspace",
    "space",
  ],
  abc: [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "backspace",
    "space",
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
    spacing: 2,
    layout: "qwerty",
  });
  const [predictions, setPredictions] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const keyTimers = useRef<{ [key: string]: KeyTimer }>({});
  const containerRef = useRef<HTMLDivElement>(null);

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

        if (key === "backspace") {
          setInput((prev) => prev.slice(0, -1));
        } else if (key === "space") {
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

    const containerWidth = containerRef.current.offsetWidth - 32;
    const containerHeight = containerRef.current.offsetHeight - 32;
    const spacing = settings.spacing;
    const currentKeys = LAYOUTS[settings.layout];

    // Calcular tamaño base de teclas según el espacio disponible
    const keySize = Math.min(
      containerWidth / 7, // Aproximadamente 7 teclas por fila
      containerHeight / 4 // 4 filas aproximadamente
    );

    // Distribuir teclas dinámicamente
    let currentRow: string[] = [];
    const rows: string[][] = [];
    let currentWidth = 0;

    currentKeys.forEach((key) => {
      const isSpecialKey = key === "space" || key === "backspace";
      const keyWidth = isSpecialKey ? keySize * 2 : keySize;

      if (currentWidth + keyWidth + spacing > containerWidth) {
        rows.push([...currentRow]);
        currentRow = [];
        currentWidth = 0;
      }

      currentRow.push(key);
      currentWidth += keyWidth + spacing;
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }, [
    containerRef.current?.offsetWidth,
    containerRef.current?.offsetHeight,
    settings.spacing,
    settings.layout,
  ]);

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

    const containerWidth = containerRef.current.offsetWidth - 32;
    const maxKeysInRow = 10; // QWERTYUIOP
    const minSpacing = 2;

    const baseSize =
      (containerWidth - minSpacing * (maxKeysInRow - 1)) / maxKeysInRow;
    const minSize = Math.max(45, containerWidth / 20);
    const maxSize = Math.min(120, containerWidth / 6);

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

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden ${
        settings.theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : settings.theme === "high-contrast"
          ? "bg-black text-yellow-300"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Settings Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 z-50 ${
          showSettings ? "translate-x-0" : "translate-x-full"
        } ${
          settings.theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : settings.theme === "high-contrast"
            ? "bg-black text-yellow-300"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-xl font-bold ${
                settings.theme === "dark"
                  ? "text-gray-100"
                  : settings.theme === "high-contrast"
                  ? "text-yellow-300"
                  : "text-gray-900"
              }`}
            >
              Configuración
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className={`p-2 rounded-full ${
                settings.theme === "dark"
                  ? "hover:bg-gray-700 text-gray-300"
                  : settings.theme === "high-contrast"
                  ? "hover:bg-yellow-900 text-yellow-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  settings.theme === "dark"
                    ? "text-gray-200"
                    : settings.theme === "high-contrast"
                    ? "text-yellow-300"
                    : "text-gray-700"
                }`}
              >
                Tiempo de pulsación (segundos): {settings.holdTime.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.05"
                value={settings.holdTime}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    holdTime: parseFloat(e.target.value),
                  }))
                }
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  settings.theme === "dark"
                    ? "bg-gray-700"
                    : settings.theme === "high-contrast"
                    ? "bg-yellow-900"
                    : "bg-gray-200"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  settings.theme === "dark"
                    ? "text-gray-200"
                    : settings.theme === "high-contrast"
                    ? "text-yellow-300"
                    : "text-gray-700"
                }`}
              >
                Tamaño de teclas: {((settings.keySize / 3.5) * 350).toFixed(0)}%
              </label>
              <input
                type="range"
                min="2.5"
                max="35.0"
                step="0.1"
                value={settings.keySize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    keySize: parseFloat(e.target.value),
                  }))
                }
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  settings.theme === "dark"
                    ? "bg-gray-700"
                    : settings.theme === "high-contrast"
                    ? "bg-yellow-900"
                    : "bg-gray-200"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  settings.theme === "dark"
                    ? "text-gray-200"
                    : settings.theme === "high-contrast"
                    ? "text-yellow-300"
                    : "text-gray-700"
                }`}
              >
                Tamaño del texto: {(settings.fontSize * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.05"
                value={settings.fontSize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    fontSize: parseFloat(e.target.value),
                  }))
                }
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  settings.theme === "dark"
                    ? "bg-gray-700"
                    : settings.theme === "high-contrast"
                    ? "bg-yellow-900"
                    : "bg-gray-200"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  settings.theme === "dark"
                    ? "text-gray-200"
                    : settings.theme === "high-contrast"
                    ? "text-yellow-300"
                    : "text-gray-700"
                }`}
              >
                Modo de barrido
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.scanningEnabled}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      scanningEnabled: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Activar modo de barrido
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  settings.theme === "dark"
                    ? "text-gray-200"
                    : settings.theme === "high-contrast"
                    ? "text-yellow-300"
                    : "text-gray-700"
                }`}
              >
                Distribución del teclado
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setSettings((s) => ({ ...s, layout: "qwerty" }))
                  }
                  className={`px-4 py-2 rounded-lg ${
                    settings.layout === "qwerty"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  QWERTY
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, layout: "abc" }))}
                  className={`px-4 py-2 rounded-lg ${
                    settings.layout === "abc"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  ABC
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20 min-h-screen">
        {/* Header y área de texto fija */}
        <div className="fixed top-0 left-0 right-0 bg-inherit z-10 p-4 shadow-lg max-h-[30vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Teclado Accesible</h1>
            <div className="flex gap-4">
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

          {/* Input Area */}
          <div className="mb-2">
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
                height: "100px",
                maxHeight: "20vh",
                resize: "none",
                fontSize: `${settings.fontSize}em`,
              }}
            />
          </div>
        </div>

        {/* Espacio para el contenido fijo - ajustado */}
        <div className="h-[30vh]"></div>

        {/* Virtual Keyboard - Área interactiva */}
        <div
          ref={containerRef}
          className="virtual-keyboard w-full mx-auto p-4 pb-20"
          onTouchStart={(e) => {
            const key = findClosestKey(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
            if (key) handleKeyDown(key.toLowerCase());
          }}
          onTouchEnd={(e) => {
            const key = findClosestKey(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            );
            if (key) handleKeyUp(key.toLowerCase());
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const key = findClosestKey(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
            if (key && key !== activeKey) {
              if (activeKey) handleKeyUp(activeKey);
              handleKeyDown(key.toLowerCase());
            }
          }}
        >
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap gap-2 justify-center mb-2"
            >
              {row.map((key) => {
                const keySize = getKeySize();
                const isSpaceKey = key.toLowerCase() === "space";
                const isBackspaceKey = key.toLowerCase() === "backspace";
                const width = isSpaceKey ? keySize * 4 : keySize;

                return (
                  <button
                    key={key}
                    onMouseDown={() => handleKeyDown(key.toLowerCase())}
                    onMouseUp={() => handleKeyUp(key.toLowerCase())}
                    onMouseLeave={() => handleKeyUp(key.toLowerCase())}
                    onTouchStart={() => handleKeyDown(key.toLowerCase())}
                    onTouchEnd={() => handleKeyUp(key.toLowerCase())}
                    className={`
                      font-semibold rounded-xl transition-all duration-200
                      ${
                        activeKey === key.toLowerCase()
                          ? "scale-95"
                          : "scale-100"
                      }
                      ${getThemeClasses(settings.theme)}
                      shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300
                      flex items-center justify-center touch-manipulation
                    `}
                    style={{
                      width: `${width}px`,
                      height: `${keySize}px`,
                      fontSize: `${settings.fontSize}em`,
                    }}
                  >
                    {isBackspaceKey ? "⌫" : isSpaceKey ? "Espacio" : key}
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
