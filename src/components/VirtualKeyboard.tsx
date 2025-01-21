import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  TouchEvent,
  ChangeEvent,
} from "react";
import { Volume2, VolumeX, Sun, Moon, Settings, X } from "lucide-react";

// Interfaces
interface KeyTimer {
  timeout?: number;
  startTime?: number;
}
interface KeyboardSettings {
  holdTime: number;
  soundEnabled: boolean;
  theme: "light" | "dark" | "high-contrast";
  numRows: number;
  fontSize: number;
  textareaFontSize: number;
  spacing: number;
  layout: "qwerty" | "abc";
  maintainLayout: boolean;
}
interface Preset {
  name: string;
  settings: KeyboardSettings;
}

// Constantes
const DEFAULT: KeyboardSettings = {
  holdTime: 0.1,
  soundEnabled: true,
  theme: "light",
  numRows: 3,
  fontSize: 1.25,
  textareaFontSize: 1.25,
  spacing: 2,
  layout: "qwerty",
  maintainLayout: true,
};
const LAYOUTS = {
  qwerty: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", "␣"],
  ],
  abc: [
    ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
    ["S", "T", "U", "V", "W", "X", "Y", "Z", "⌫"],
    ["␣"],
  ],
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
const loadPresets = (): Preset[] => load("keyboardPresets") || [];
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
    return "bg-gray-700 hover:bg-gray-600 text-gray-100 border-2";
  if (t === "high-contrast")
    return "bg-yellow-300 hover:bg-yellow-400 text-black border-2";
  return "bg-white hover:bg-gray-100 text-gray-900 border-2";
};
const ariaLabel = (k: string) =>
  k === "␣" ? "Tecla espacio" : k === "⌫" ? "Tecla borrar" : `Tecla ${k}`;

// Componente principal
export default function VirtualKeyboard() {
  const [inp, setInp] = useState("");
  const [st, setSt] = useState<KeyboardSettings>(loadSettings());
  const [prs, setPrs] = useState<Preset[]>(loadPresets());
  const [actK, setActK] = useState<string | null>(null);
  const [showSet, setShowSet] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showTA, setShowTA] = useState(false);
  const kRef = useRef<{ [k: string]: KeyTimer }>({});
  const contRef = useRef<HTMLDivElement | null>(null);

  // Guardado
  useEffect(() => {
    saveSettings(st);
  }, [st]);

  // Layout calculado
  const calcLayout = useCallback(() => {
    const allKeys = LAYOUTS[st.layout].flat();
    const spaceKey = allKeys.find((k) => k === "␣");
    const bsKey = allKeys.find((k) => k === "⌫");
    const reg = allKeys.filter((k) => k !== "␣" && k !== "⌫");
    if (st.maintainLayout) return LAYOUTS[st.layout];
    const kpRow = Math.ceil(reg.length / st.numRows),
      newLay = [];
    for (let i = 0; i < reg.length; i += kpRow)
      newLay.push(reg.slice(i, i + kpRow));
    let lr = newLay[newLay.length - 1];
    if (lr && lr.length < kpRow) {
      bsKey && lr.push(bsKey);
      spaceKey && lr.length < kpRow && lr.push(spaceKey);
    } else {
      const sp = [];
      bsKey && sp.push(bsKey);
      spaceKey && sp.push(spaceKey);
      sp.length && newLay.push(sp);
    }
    return newLay;
  }, [st.layout, st.numRows, st.maintainLayout]);

  const [layout, setLayout] = useState<string[][]>([]);
  useEffect(() => {
    const ul = () => setLayout(calcLayout());
    ul();
    window.addEventListener("resize", ul);
    return () => window.removeEventListener("resize", ul);
  }, [calcLayout]);

  // Disparo de tecla
  const down = (k: string) => {
    if (kRef.current[k]?.timeout) return;
    setActK(k);
    kRef.current[k] = { startTime: Date.now() };
  };
  const up = (k: string) => {
    const kt = kRef.current[k];
    if (!kt?.startTime) return;
    setActK(null);
    const dur = (Date.now() - kt.startTime) / 1e3;
    delete kRef.current[k];
    if (dur >= st.holdTime) {
      if (st.soundEnabled)
        new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
        ).play();
      if (k === "⌫") setInp((p) => p.slice(0, -1));
      else if (k === "␣") setInp((p) => p + " ");
      else setInp((p) => p + k);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  };

  // Key size
  const keySize = () => {
    if (!contRef.current) return60;
    const cw = contRef.current.offsetWidth - 32;
    const ch = window.innerHeight - (showTA ? 40 : 0) - 80;
    const totalRows = st.numRows + 1;
    const hpr = ch / totalRows;
    const maxK = Math.ceil(26 / st.numRows);
    const wpk = cw / maxK;
    return Math.min(hpr, wpk) * 0.9;
  };

  const SettingPanel = () => {
    const [pName, setPName] = useState("");
    const handleLoadPreset = (p: Preset) => {
      setSt(p.settings);
      saveSettings(p.settings);
    };
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 ${
          showSet ? "flex" : "hidden"
        } items-center justify-center p-4 overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`relative w-full max-w-md max-h-[90vh] flex flex-col rounded-xl shadow-lg ${
            st.theme === "dark"
              ? "bg-gray-800"
              : st.theme === "high-contrast"
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label>Tiempo de pulsación (segundos)</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={st.holdTime}
                onChange={(e) =>
                  setSt((s) => ({ ...s, holdTime: parseFloat(e.target.value) }))
                }
                className="w-full"
              />
              <span>{st.holdTime}s</span>
            </div>
            <div>
              <label>Número de filas</label>
              <input
                type="range"
                min="1"
                max="26"
                step="1"
                value={st.numRows}
                onChange={(e) =>
                  setSt((s) => ({ ...s, numRows: parseInt(e.target.value) }))
                }
                className="w-full"
              />
              <span>{st.numRows} filas</span>
            </div>
            <div>
              <label>Tamaño de texto del teclado (%)</label>
              <input
                type="range"
                min="0.5"
                max="80"
                step="0.5"
                value={st.fontSize}
                onChange={(e) =>
                  setSt((s) => ({ ...s, fontSize: parseFloat(e.target.value) }))
                }
                className="w-full"
              />
              <span>{Math.round(st.fontSize * 100)}%</span>
            </div>
            <div>
              <label>Tamaño de texto del área (%)</label>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.25"
                value={st.textareaFontSize}
                onChange={(e) =>
                  setSt((s) => ({
                    ...s,
                    textareaFontSize: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
              <span>{Math.round(st.textareaFontSize * 100)}%</span>
            </div>
            <div>
              <label>Distribución</label>
              <select
                value={st.layout}
                onChange={(e) =>
                  setSt((s) => ({
                    ...s,
                    layout: e.target.value as "qwerty" | "abc",
                  }))
                }
                className={`w-full p-2 rounded ${
                  st.theme === "dark"
                    ? "bg-gray-700"
                    : st.theme === "high-contrast"
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
                  setSt((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
                }
                className={`px-4 py-2 rounded ${
                  st.soundEnabled ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                {st.soundEnabled ? "Activado" : "Desactivado"}
              </button>
            </div>
            <div className="flex items-center justify-between mt-4">
              <label className="flex-1">Disposición del Teclado</label>
              <button
                onClick={() =>
                  setSt((s) => ({ ...s, maintainLayout: !s.maintainLayout }))
                }
                className={`px-4 py-2 rounded ${
                  st.maintainLayout ? "bg-blue-500" : "bg-gray-500"
                } text-white`}
              >
                {st.maintainLayout ? "Estándar" : "Optimizado"}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {st.maintainLayout
                ? "Mantiene layout tradicional"
                : "Layout optimizado"}
            </p>
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Presets</h3>
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
                      savePreset(pName.trim(), st);
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
            </div>
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setSt(DEFAULT);
                  localStorage.removeItem("keyboardSettings");
                }}
                className={`w-full px-4 py-2 rounded ${
                  st.theme === "dark"
                    ? "bg-red-600 hover:bg-red-700"
                    : st.theme === "high-contrast"
                    ? "bg-red-500 text-black hover:bg-red-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white font-semibold`}
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render
  return (
    <>
      <div
        className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-150 ${
          flash ? "opacity-30" : "opacity-0"
        } ${
          st.theme === "dark"
            ? "bg-gray-300"
            : st.theme === "high-contrast"
            ? "bg-yellow-300"
            : "bg-white"
        }`}
      />
      <div
        className={`min-h-screen relative ${
          st.theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : st.theme === "high-contrast"
            ? "bg-black text-yellow-300"
            : "bg-gray-100 text-gray-900"
        }`}
        role="application"
      >
        <div className="fixed top-0 left-0 right-0 bg-inherit z-20 shadow-lg">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl font-bold">Teclado Accesible</h1>
              <button
                onClick={() => {
                  setShowTA(!showTA);
                }}
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
              <div
                className={`flex-1 px-4 py-2 rounded-lg overflow-x-auto whitespace-nowrap ${
                  st.theme === "dark"
                    ? "bg-gray-800"
                    : st.theme === "high-contrast"
                    ? "bg-black border border-yellow-300"
                    : "bg-gray-200"
                }`}
                style={{
                  minWidth: "50px",
                  maxWidth: "calc(100% - 300px)",
                  minHeight: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span className="inline-block min-w-[1ch]">{inp || " "}</span>
              </div>
            </div>
            <div className="flex gap-4 ml-4" role="toolbar">
              <button
                onClick={() =>
                  setSt((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
                }
              >
                {st.soundEnabled ? <Volume2 /> : <VolumeX />}
              </button>
              <button
                onClick={() =>
                  setSt((s) => ({
                    ...s,
                    theme: s.theme === "light" ? "dark" : "light",
                  }))
                }
              >
                {st.theme === "light" ? <Moon /> : <Sun />}
              </button>
              <button onClick={() => setShowSet(true)}>
                <Settings />
              </button>
            </div>
          </div>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showTA ? "max-h-[60vh]" : "max-h-0"
            }`}
          >
            <div className="p-4">
              <textarea
                value={inp}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInp(e.target.value)
                }
                className={`w-full p-2 rounded-lg border-2 ${
                  st.theme === "dark"
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : st.theme === "high-contrast"
                    ? "bg-black border-yellow-300 text-yellow-300"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                style={{
                  minHeight: `${Math.max(1, st.textareaFontSize)}em`,
                  maxHeight: "20vh",
                  resize: "none",
                  fontSize: `${st.textareaFontSize}em`,
                  overflow: "hidden",
                  lineHeight: "1.2",
                }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  const nh = Math.min(t.scrollHeight, window.innerHeight * 0.2);
                  t.style.height = `${nh}px`;
                  document.documentElement.style.setProperty(
                    "--text-area-height",
                    `${nh + 32}px`
                  );
                }}
              />
            </div>
          </div>
        </div>

        <SettingPanel />
        <div
          style={{
            height: showTA
              ? "calc(4rem + var(--text-area-height, 0px))"
              : "4rem",
            transition: "height 300ms",
          }}
        />
        <div
          className={`fixed left-0 right-0 bottom-0 overflow-y-auto bg-inherit select-none`}
          style={{
            top: showTA ? "calc(4rem + var(--text-area-height, 0px))" : "4rem",
            transition: "top 300ms",
          }}
        >
          <div
            ref={contRef}
            className={`fixed bottom-0 left-0 right-0 p-4 ${
              st.theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            {layout.map((row, r) => (
              <div key={r} className="flex justify-center mb-2">
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
                    } rounded-lg font-semibold flex items-center justify-center
                    ${
                      actK === k
                        ? "scale-95 border-blue-500 shadow-lg"
                        : "border-transparent"
                    }`}
                    style={{
                      width: keySize() + "px",
                      height: keySize() + "px",
                      fontSize: st.fontSize + "rem",
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
    </>
  );
}
