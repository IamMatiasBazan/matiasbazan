"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FileCode,
  FileImage,
  FileArchive,
  HardDrive,
  Clock,
  Users,
  Monitor,
  Cloud,
  Home as HomeIcon,
  Radio,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Tag,
  MoreHorizontal,
  LayoutGrid,
  List,
  Columns,
  Image as ImageIcon,
  SlidersHorizontal,
  File,
  FileText,
  FileDown
} from "lucide-react";

const LiquidGlass = dynamic(() => import("liquid-glass-react"), { ssr: false });
const Rnd = dynamic(() => import("react-rnd").then((mod) => mod.Rnd), { ssr: false });

// Helper to convert inputs into iframe-compatible URLs (e.g. Google search with &igu=1)
const getChromeIframeUrl = (url: string): string => {
  const clean = url.trim();
  if (!clean) return "chrome://newtab";
  if (clean === "chrome://newtab") return "chrome://newtab";

  if (clean.startsWith("../") || clean.startsWith("cv/")) {
    return clean;
  }

  const hasDot = clean.includes(".");
  const hasProtocol = clean.startsWith("http://") || clean.startsWith("https://");

  // If it's a search term (no dot, no protocol), perform Google Search
  if (!hasDot && !hasProtocol) {
    return `https://www.google.com/search?q=${encodeURIComponent(clean)}&igu=1`;
  }

  let target = clean;
  if (!hasProtocol) {
    target = "https://" + clean;
  }

  if (target.includes("google.com")) {
    if (target.includes("/search")) {
      return target + (target.includes("igu=1") ? "" : "&igu=1");
    }
    return "https://www.google.com/webhp?igu=1";
  }

  return target;
};

// Interface state types for windows
interface WindowState {
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimizedPosition: { x: number; y: number }; // NUEVO
}

interface WindowsMap {
  [key: string]: WindowState;
}

export default function Home() {
  // Clock state
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Control Center dropdown state
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);

  // OS Audio & Brightness mockup levels
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(90);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);

  // Focus tracking state
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [activeWindow, setActiveWindow] = useState("desktop");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  const [openWindows, setOpenWindows] = useState<WindowsMap>({
    finder: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 180, y: 70 }, size: { width: 900, height: 600 }, minimizedPosition: { x: 200, y: 200 } },
    acrobat: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 210, y: 90 }, size: { width: 880, height: 580 }, minimizedPosition: { x: 220, y: 220 } },
    notes: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 250, y: 100 }, size: { width: 550, height: 380 }, minimizedPosition: { x: 280, y: 260 } },
    terminal: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 220, y: 110 }, size: { width: 620, height: 400 }, minimizedPosition: { x: 320, y: 300 } },
    chrome: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 180, y: 60 }, size: { width: 850, height: 530 }, minimizedPosition: { x: 90, y: 130 } },
  });

  // Chrome URL & Tabs states (Max 5 Tabs)
  const [chromeTabs, setChromeTabs] = useState<Array<{ id: string; title: string; url: string; iconType: string }>>([
    { id: "tab-1", title: "Nueva pestaña", url: "chrome://newtab", iconType: "chrome" },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");

  const activeTab = chromeTabs.find(t => t.id === activeTabId) || chromeTabs[0];
  const chromeUrl = activeTab ? activeTab.url : "chrome://newtab";
  const [chromeInputUrl, setChromeInputUrl] = useState("chrome://newtab");

  const [showAllShortcuts, setShowAllShortcuts] = useState(false);
  const [showTopBarFullscreen, setShowTopBarFullscreen] = useState(false);
  const [showDockFullscreen, setShowDockFullscreen] = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  const isAnyAppMaximized = (Object.keys(openWindows) as string[]).some(
    appId => openWindows[appId].isOpen && openWindows[appId].isMaximized && !openWindows[appId].isMinimized
  );
  const initialFS: Record<string, Record<string, string | null>> = {
    "~": { "Documents": null, "Desktop": null },
    "~/Desktop": {
      "Google Chrome": "[Acceso Directo] Abre la aplicación Google Chrome desde el Escritorio.",
      "CV_Matias_Bazan.pdf": "[Documento PDF — Curriculum Vitae de Matias Bazan]"
    },
    "~/Documents": { "Proyectos": null, "CV_Matias_Bazan.pdf": "[Documento PDF — Curriculum Vitae de Matias Bazan]" },
    "~/Documents/Proyectos": {
      "albus-dumbledore-web": null,
      "johnny-depp-web": null,
      "mario-bros-web": null,
      "portafolio-premium": null,
      "portafolio-mati-bazan": null,
      "README.md": "# Proyectos Personales\n\nColeccion de proyectos web de Matias Bazan.\nTodos estan deployados en Vercel."
    }
  };

  const [terminalFS, setTerminalFS] = useState<Record<string, Record<string, string | null>>>(initialFS);
  const [loadedGithubRepos, setLoadedGithubRepos] = useState<Record<string, boolean>>({});
  // Finder Explorer states
  const [finderPath, setFinderPath] = useState("~");
  const [finderHistory, setFinderHistory] = useState<string[]>(["~"]);
  const [finderHistoryIndex, setFinderHistoryIndex] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [finderSearch, setFinderSearch] = useState("");
  const [viewingFileContent, setViewingFileContent] = useState<{ name: string; content: string } | null>(null);
  const [finderViewMode, setFinderViewMode] = useState<"grid" | "list">("grid");

  const navigateToFinderFolder = (targetPath: string) => {
    if (finderPath === targetPath) return;
    const newHistory = finderHistory.slice(0, finderHistoryIndex + 1);
    newHistory.push(targetPath);
    setFinderHistory(newHistory);
    setFinderHistoryIndex(newHistory.length - 1);
    setFinderPath(targetPath);
    setSelectedFileName(null);
    setViewingFileContent(null);
  };

  const navigateFinderBack = () => {
    if (finderHistoryIndex > 0) {
      const prevIdx = finderHistoryIndex - 1;
      setFinderHistoryIndex(prevIdx);
      setFinderPath(finderHistory[prevIdx]);
      setSelectedFileName(null);
      setViewingFileContent(null);
    }
  };

  const navigateFinderForward = () => {
    if (finderHistoryIndex < finderHistory.length - 1) {
      const nextIdx = finderHistoryIndex + 1;
      setFinderHistoryIndex(nextIdx);
      setFinderPath(finderHistory[nextIdx]);
      setSelectedFileName(null);
      setViewingFileContent(null);
    }
  };

  // Dynamic GitHub Project file loader
  useEffect(() => {
    if (!finderPath.startsWith("~/Documents/Proyectos/")) return;

    const pathParts = finderPath.split("/");
    const folderName = pathParts[3];
    if (!folderName) return;

    const repoMapping: Record<string, string> = {
      "albus-dumbledore-web": "proyecto-dumbledore-web",
      "johnny-depp-web": "proyecto-johnnydepp-web",
      "mario-bros-web": "proyecto-mariobros-web",
      "portafolio-premium": "portafolio-premium",
      "portafolio-mati-bazan": "portafolio-matias-bazan-web"
    };

    const repoName = repoMapping[folderName] || folderName;
    const subPath = pathParts.slice(4).join("/");
    const cacheKey = `${repoName}/${subPath}`;
    if (loadedGithubRepos[cacheKey]) return;

    fetch(`https://api.github.com/repos/IamMatiasBazan/${repoName}/contents/${subPath}`)
      .then((res) => {
        if (!res.ok) throw new Error("Repo or files not found in GitHub");
        return res.json();
      })
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;

        setLoadedGithubRepos(prev => ({ ...prev, [cacheKey]: true }));

        setTerminalFS(prev => {
          const updated = { ...prev };
          const currentDir = { ...(updated[finderPath] || {}) };

          data.forEach(item => {
            if (item.type === "dir") {
              currentDir[item.name] = null;
              const fullChildPath = `${finderPath}/${item.name}`;
              if (!updated[fullChildPath]) {
                updated[fullChildPath] = {};
              }
            } else {
              currentDir[item.name] = `[Archivo de GitHub - Clic para ver contenido]\n\nURL de descarga: ${item.download_url}`;
            }
          });

          updated[finderPath] = currentDir;
          return updated;
        });
      })
      .catch((err) => {
        console.warn("GitHub dynamic loader fallback: ", err);
      });
  }, [finderPath, loadedGithubRepos]);

  // Active note index inside macOS Notes App
  interface NoteItem {
    id: string;
    title: string;
    category: "projects" | "experience" | "about" | "user";
    date: string;
    content: string;
  }

  const [notesList, setNotesList] = useState<NoteItem[]>([
    {
      id: "about",
      title: "Sobre Mí",
      category: "about",
      date: "18 de agosto de 2026, 13:45",
      content: `¡Hola! Soy Matias, programador residente en Argentina.

Me enfoco en construir aplicaciones robustas e interfaces de usuario premium que cautiven al usuario a primera vista. Creo firmemente que la estética de un sitio web es tan importante como su código fuente; la combinación de un backend bien estructurado y microanimaciones fluidas en el frontend eleva los estándares del software.

A lo largo de mi formación y trabajo autónomo, he desarrollado sistemas con Flutter, Node.js y bases de datos relacionales como PostgreSQL.

Aprendí a programar comenzando por las bases: primero escribía el código en pseudocódigo, luego lo implementaba en PSeInt y, posteriormente, lo llevaba a un lenguaje de programación como PHP.`
    },
    {
      id: "experience",
      title: "Experiencia Laboral",
      category: "experience",
      date: "18 de agosto de 2026, 14:10",
      content: `Experiencia Laboral

Plaza Digital
Desarrollo, optimización y mantenimiento de la plataforma web. Un sistema real en producción diseñado para alto rendimiento, seguridad y experiencia de usuario fluida.`
    },
    {
      id: "projects",
      title: "Mis Proyectos Personales",
      category: "projects",
      date: "18 de agosto de 2026, 14:15",
      content: ""
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>("about");
  const [notesSearch, setNotesSearch] = useState("");
  const [showNotesSidebar, setShowNotesSidebar] = useState(true);

  const handleCreateNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote: NoteItem = {
      id: newId,
      title: "Nueva Nota",
      category: "user",
      date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) + `, ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
      content: "Nueva Nota\n"
    };
    setNotesList(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
  };

  const handleNoteContentChange = (id: string, newContent: string) => {
    setNotesList(prev => prev.map(note => {
      if (note.id === id) {
        const lines = newContent.split("\n");
        const firstLine = lines[0] || "";
        const title = firstLine.trim() || "Nueva Nota";
        const truncatedTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
        return {
          ...note,
          title: truncatedTitle,
          content: newContent
        };
      }
      return note;
    }));
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (["about", "experience", "projects"].includes(id)) return;
    setNotesList(prev => {
      const filtered = prev.filter(note => note.id !== id);
      if (activeNoteId === id) {
        const nextActive = filtered[0];
        setActiveNoteId(nextActive ? nextActive.id : "about");
      }
      return filtered;
    });
  };

  // Terminal state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalCwd, setTerminalCwd] = useState("~");
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: "input" | "output" | "error" | "success"; text: string }>>([
    { type: "output", text: "Last login: " + new Date().toLocaleString("es-AR", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
    { type: "output", text: "" },
    { type: "output", text: "macOS Tahoe 26.0 — matias@tahoe-mac" },
    { type: "output", text: 'Escribí "help" para ver todos los comandos disponibles.' },
    { type: "output", text: "" }
  ]);



  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const finderGridRef = useRef<HTMLDivElement>(null);

  // Audio/Beep on terminal error or actions
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.value = 523.25; // C5 note
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Ignorar si el navegador bloquea audio sin interacción previa
    }
  };

  // Battery Status API & Dynamic Initial Position tracking effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOpenWindows(prev => {
        const updated = { ...prev };
        (Object.keys(updated) as string[]).forEach((appId) => {
          const windowWidth = updated[appId].size.width;
          const windowHeight = updated[appId].size.height;
          const centeredX = Math.round(Math.max(10, (window.innerWidth - windowWidth) / 2));
          const centeredY = Math.round(Math.max(35, (window.innerHeight - windowHeight) / 2));
          updated[appId] = {
            ...updated[appId],
            position: { x: centeredX, y: centeredY }
          };
        });
        return updated;
      });

      // Escuchar eventos postMessage de clics en el PDF / iframe para abrir en Chrome
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "OPEN_URL_IN_CHROME" && event.data.url) {
          const target = event.data.url;
          openApp("chrome");
          setChromeTabs(prev => {
            const exists = prev.find(t => t.url === target);
            if (exists) {
              setActiveTabId(exists.id);
              setChromeInputUrl(target);
              return prev;
            }
            const newTabId = `tab-${Date.now()}`;
            setActiveTabId(newTabId);
            setChromeInputUrl(target);
            return [...prev.slice(0, 4), { id: newTabId, title: "Portafolio", url: target, iconType: "chrome" }];
          });
        }
      };
      window.addEventListener("message", handleMessage);

      if ((navigator as any).getBattery) {
        (navigator as any).getBattery().then((batt: any) => {
          setBatteryLevel(Math.round(batt.level * 100));
          setIsCharging(batt.charging);

          const levelChange = () => setBatteryLevel(Math.round(batt.level * 100));
          const chargingChange = () => setIsCharging(batt.charging);

          batt.addEventListener("levelchange", levelChange);
          batt.addEventListener("chargingchange", chargingChange);
        });
      }

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  // Clock Update Effect
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();

      // format date (e.g. Lun 17 ago)
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const formattedDate = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
      setCurrentDate(formattedDate);

      // format time (e.g. 9:47 p.m.)
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "p.m." : "a.m.";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Terminal scroll to bottom effect
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Window Focus Handler
  const focusWindow = (appId: string) => {
    if (activeWindow === appId) return;
    const nextZIndex = maxZIndex + 1;
    setMaxZIndex(nextZIndex);
    setActiveWindow(appId);
    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: false,
        zIndex: nextZIndex
      }
    }));
  };

  // Open Window Action
  const openApp = (appId: string) => {
    const nextZIndex = maxZIndex + 1;
    setMaxZIndex(nextZIndex);
    setActiveWindow(appId);
    setOpenWindows(prev => {
      let position = prev[appId].position;

      // Calcular posición centrada dinámicamente en el medio de la pantalla
      if (typeof window !== "undefined") {
        const windowWidth = prev[appId].size.width;
        const windowHeight = prev[appId].size.height;
        const centeredX = Math.round((window.innerWidth - windowWidth) / 2);
        const centeredY = Math.round((window.innerHeight - windowHeight) / 2);
        position = { x: Math.max(10, centeredX), y: Math.max(35, centeredY) };
      }

      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZIndex,
          position
        }
      };
    });
  };

  // Close Window Action
  const closeApp = (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isOpen: false
      }
    }));
    setActiveWindow("desktop");
  };

  // Minimize Window Action
  const minimizeApp = (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: true,
        minimizedPosition: {
          x: prev[appId].position.x + 40,
          y: prev[appId].position.y + 40
        }
      }
    }));
    setActiveWindow("desktop");
  };

  // Maximize / Restore Window Action
  const toggleMaximizeApp = (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMaximized: !prev[appId].isMaximized
      }
    }));
    focusWindow(appId);
  };



  // Terminal commands interpreter
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = terminalInput.trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newHistory: Array<{ type: "input" | "output" | "error" | "success"; text: string }> = [
      ...terminalHistory,
      { type: "input", text: `matias@tahoe-mac ${terminalCwd} % ${raw}` }
    ];

    const push = (text: string, type: "output" | "error" | "success" = "output") => {
      newHistory.push({ type, text });
    };

    const resolvePath = (target: string): string => {
      if (!target || target === "~") return "~";
      if (target.startsWith("~/")) return target;
      if (target === "..") {
        const segs = terminalCwd.split("/");
        if (segs.length <= 1) return "~";
        return segs.slice(0, -1).join("/") || "~";
      }
      if (target === ".") return terminalCwd;
      return terminalCwd === "~" ? `~/${target}` : `${terminalCwd}/${target}`;
    };

    const cwdEntries = terminalFS[terminalCwd] || {};

    switch (cmd) {
      case "pwd":
        push(terminalCwd.replace("~", "/Users/matias"));
        break;

      case "ls": {
        const targetPath = args[0] ? resolvePath(args[0]) : terminalCwd;
        const entries = terminalFS[targetPath];
        if (!entries) {
          push(`ls: ${args[0] || terminalCwd}: No such file or directory`, "error");
        } else {
          const dirs = Object.entries(entries).filter(([, v]) => v === null).map(([k]) => `\x1b[34m${k}/\x1b[0m`);
          const files = Object.entries(entries).filter(([, v]) => v !== null).map(([k]) => k);
          push([...dirs, ...files].join("   ") || "(directorio vacío)");
        }
        break;
      }

      case "ll":
      case "la": {
        const lsEntries = terminalFS[terminalCwd];
        if (!lsEntries) { push("No entries", "error"); break; }
        push("total " + Object.keys(lsEntries).length);
        push("drwxr-xr-x  .   (directorio actual)");
        Object.entries(lsEntries).forEach(([name, val]) => {
          const isDir = val === null;
          const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--";
          const size = isDir ? "-" : String(val?.length || 0);
          push(`${perm}  matias  staff  ${size.padStart(6)}  ${name}${isDir ? "/" : ""}`);
        });
        break;
      }

      case "cd": {
        const target = args[0] || "~";
        const resolved = resolvePath(target);
        if (terminalFS[resolved] !== undefined) {
          setTerminalCwd(resolved);
          setTerminalHistory([...newHistory]);
          setTerminalInput("");
          return;
        } else {
          const direct = terminalCwd === "~" ? `~/${target}` : `${terminalCwd}/${target}`;
          if (terminalFS[direct] !== undefined) {
            setTerminalCwd(direct);
            setTerminalHistory([...newHistory]);
            setTerminalInput("");
            return;
          }
        }
        push(`cd: no such file or directory: ${target}`, "error");
        break;
      }

      case "cat": {
        if (!args[0]) { push("cat: missing operand", "error"); break; }
        const content = cwdEntries[args[0]];
        if (content === undefined) { push(`cat: ${args[0]}: No such file or directory`, "error"); break; }
        if (content === null) { push(`cat: ${args[0]}: Is a directory`, "error"); break; }
        push(content);
        break;
      }

      case "whoami":
        push("matias");
        break;

      case "hostname":
        push("tahoe-mac.local");
        break;

      case "echo":
        push(args.join(" ").replace(/^["']|["']$/g, ""));
        break;

      case "neofetch":
        push(
          `      .uMMMMMu.     .uMMMMMu.           matias@tahoe-mac
     uMMMMMMMMMu   uMMMMMMMMMu          ─────────────────────────────────
    uMMMM/   \\MMMuuMMMM/   \\MMMu        OS: macOS Tahoe 26 x86_64
    MMMM/     \\MMMMMMM/     \\MMM        Host: MacBook Neo
    MMMM       MMMMMMM       MMMM       Kernel: 26.0.0 Darwin
    MMMM       MMMMMMM       MMMM       Uptime: ${Math.floor(Math.random() * 60 + 5)} mins
    MMMM       MMMMMMM       MMMM       Shell: zsh 5.9
    MMMM       MMMMMMM       MMMM       Resolution: Responsive x Liquid Glass
                                        DE: Aqua-Tahoe 2026
                                        WM: Quartz Compositor
                                        Terminal: Tahoe-Console v2.6
                                        CPU: Apple A18 Pro
                                        Memory: 8 GB
                                        Disk: 256 GB SSD (WebFS)`);
        break;

      case "date":
        push(new Date().toLocaleString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        break;

      case "uptime":
        push(`${new Date().toLocaleTimeString("es-AR")}  up ${Math.floor(Math.random() * 60 + 5)} mins, 1 user, load averages: 1.24 1.31 1.42`);
        break;

      case "flutter":
        if (args[0] === "--version") { push("Flutter 3.24.0 • Dart 3.5.0 • DevTools 2.37.0"); break; }
        if (args[0] === "doctor") { push("Doctor summary:\n[✓] Flutter (Channel stable, 3.24.0)\n[✓] Xcode\n[✓] Chrome\n• No issues found!", "success"); break; }
        if (args[0] === "pub" && args[1] === "get") { push("Resolving dependencies...\n✓ Pub get succeeded", "success"); break; }
        push(`flutter: Unknown option '${args.join(" ")}'. Run 'flutter --help'.`);
        break;

      case "dart":
        push(args[0] === "--version" ? "Dart SDK version: 3.5.0 (stable)" : `dart ${args.join(" ")} [simulado]`);
        break;

      case "about":
        push(`┌─────────────────────────────────────────────┐
│        MATIAS BAZAN — Desarrollador Web      │
└─────────────────────────────────────────────┘

Programador Full Stack residente en Argentina.
Especializado en diseñar interfaces web y movil
y sistemas escalables con código limpio.

Apasionado por la estetica, los detalles de UI
y las experiencias interactivas.`);
        break;

      case "skills":
        push(`Stack Tecnologico de Matias Bazan:

  * Mobile / Frontend:
    - Flutter / Dart
    - HTML5 / CSS3 / JavaScript

  * Backend / Bases de Datos:
    - Node.js / Express
    - PostgreSQL

  * Sistema de control de versiones
    - Git / GitHub
  
  * Herramientas / Diseño:
    - Figma / UI Design`);
        break;

      case "experience":
        push(`Historial de Carrera:

  * Portafolio Interactivo macOS Tahoe (2026 - Actual)
    Diseno y arquitectura de interfaces premium.
    Stack: Next.js · TypeScript · Framer Motion · Liquid Glass

  * Proyectos Web Personales
    Albus Dumbledore, Deep Style, Mario Bros, Premium Portafolio
    Stack: HTML5 · CSS3 · JavaScript · Flutter · Dart

  * Sistemas Backend
    APIs REST con Node.js y bases de datos PostgreSQL.`);
        break;

      case "contact":
        push(`Puedes contactarme en:

  Email     -> bazanmatias2004@gmail.com
  GitHub    -> github.com/IamMatiasBazan
  LinkedIn  -> linkedin.com/in/matias-bazan
  Portfolio -> portafolio-matias-bazan.vercel.app`);
        break;

      case "clear":
        setTerminalHistory([]);
        setTerminalInput("");
        return;

      case "history":
        terminalHistory
          .filter(h => h.type === "input")
          .forEach((h, i) => push(`  ${(i + 1).toString().padStart(3)}  ${h.text.replace(/^matias@tahoe-mac .+ % /, "")}`));
        break;

      case "man":
        if (!args[0]) { push("What manual page do you want?", "error"); break; }
        push(`MAN(1) - Manual for '${args[0]}'\n\nEscribi '${args[0]} --help' o 'help' para ver los comandos disponibles.`);
        break;

      case "mkdir":
        push(args[0] ? `mkdir: ${args[0]}: creado en sesion` : "mkdir: missing operand");
        break;

      case "touch":
        push(args[0] ? `touch: ${args[0]}: creado en sesion` : "touch: missing file operand");
        break;

      case "rm":
        push(args[0] ? `rm: ${args.join(" ")}: eliminado en sesion` : "rm: missing operand");
        break;

      case "cp":
        push(args.length >= 2 ? `cp: '${args[0]}' -> '${args[1]}': copiado` : "cp: missing file operand");
        break;

      case "mv":
        push(args.length >= 2 ? `mv: '${args[0]}' -> '${args[1]}': movido` : "mv: missing file operand");
        break;

      case "grep":
        push(args.length >= 2 ? `grep: buscando '${args[0]}' en '${args[1]}'...\n[1]: resultado simulado` : "usage: grep <pattern> <file>");
        break;

      case "find":
        push("./Documents/Proyectos/albus-dumbledore-web\n./Documents/Proyectos/johnny-depp-web\n./Documents/Proyectos/mario-bros-web\n./Documents/Proyectos/portafolio-premium\n./Documents/Proyectos/portafolio-mati-bazan");
        break;

      case "code":
        push(args[0] ? `Opening '${args[0]}' in VS Code...` : "code . - Opening current directory in VS Code...", "success");
        break;

      case "exit":
      case "quit":
        push("Goodbye! Cerrando terminal...");
        setTimeout(() => closeApp("terminal"), 800);
        break;

      case "help":
        push(`Comandos disponibles:

  -- Exploracion ----------------------------
  ls [dir]    Listar archivos
  ll / la     Listado detallado
  cd [dir]    Cambiar directorio
  pwd         Ruta actual
  cat [file]  Contenido de archivo
  find        Buscar proyectos

  -- Sistema --------------------------------
  neofetch    Info del sistema macOS Tahoe
  date        Fecha y hora
  uptime      Tiempo activo
  whoami      Usuario actual
  hostname    Nombre del equipo
  history     Historial de comandos

  -- Archivos -------------------------------
  mkdir touch rm cp mv grep echo

  -- Desarrollo -----------------------------
  flutter dart code

  -- Portfolio ------------------------------
  about       Sobre Matias Bazan
  skills      Stack tecnologico
  experience  Historial de carrera
  contact     Informacion de contacto

  -- Utilidades -----------------------------
  clear       Limpiar pantalla
  man [cmd]   Manual de comandos
  exit        Cerrar terminal`);
        break;

      default:
        playBeep();
        push(`zsh: command not found: ${parts[0]}\nEscribi "help" para ver todos los comandos.`, "error");
    }

    setTerminalHistory([...newHistory]);
    setTerminalInput("");
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none bg-[#a5dcff] text-white">

      {/* Fondo de pantalla Neo_Indigo.jpg */}
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/os/Neo_Indigo.jpg')" }}
      />

      {/* Zona de detección hover superior para la barra de menú cuando una app está maximizada */}
      {isAnyAppMaximized && (
        <div
          onMouseEnter={() => setShowTopBarFullscreen(true)}
          className="fixed top-0 left-0 right-0 h-[10px] z-[9999999]"
        />
      )}

      {/* 1. BARRA DE MENÚ SUPERIOR (Menu Bar macOS Sequoia) */}
      <div
        onMouseEnter={() => setShowTopBarFullscreen(true)}
        onMouseLeave={() => setShowTopBarFullscreen(false)}
        className={`absolute top-0 left-0 w-full h-[28px] bg-[#000000]/75 backdrop-blur-2xl flex items-center justify-between px-4 text-[13px] font-normal z-[999999] shadow-sm select-none text-white/90 border-b border-black/45 transition-transform duration-300 ease-out ${isAnyAppMaximized && !showTopBarFullscreen ? "-translate-y-full" : "translate-y-0"
          }`}
      >

        {/* Lado Izquierdo: Menú Apple + Apps */}
        <div className="flex items-center gap-3 relative">

          {/* Manzana Apple */}
          <div className="relative">
            <span
              onClick={() => { setIsAppleMenuOpen(!isAppleMenuOpen); setIsControlCenterOpen(false); }}
              className="cursor-pointer hover:bg-white/15 px-2.5 py-0.5 rounded transition-all duration-150 text-[15px] font-bold text-white"
            >
              
            </span>
            {isAppleMenuOpen && (
              <div className="absolute top-7 left-0 z-[9999999] bg-[#1a1c23]/85 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl w-52 p-1.5 text-white/95 flex flex-col font-sans">
                <div onClick={() => openApp("finder")} className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white rounded-md cursor-pointer text-[12px] font-normal transition duration-100">Preferencias del Sistema...</div>
                <div onClick={() => openApp("terminal")} className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white rounded-md cursor-pointer text-[12px] font-normal transition duration-100">Terminal de Diagnóstico</div>
                <div className="h-[1px] bg-white/10 my-1"></div>
                <div onClick={() => window.location.href = "../index.html"} className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white rounded-md cursor-pointer text-[12px] font-normal transition duration-100">Volver al inicio</div>
              </div>
            )}
          </div>

          {/* Nombre de la Aplicación Activa (Negrita) */}
          <span className="font-bold cursor-pointer hover:bg-white/15 px-2.5 py-0.5 rounded text-white">
            {activeWindow === "chrome" ? "Chrome" : activeWindow === "finder" ? "Finder" : activeWindow === "terminal" ? "Terminal" : "Finder"}
          </span>
        </div>

        {/* Lado Derecho: Estado, Red, Hora */}
        <div className="flex items-center gap-3.5 relative">

          {/* Batería real con icono de barra */}
          <span className="cursor-pointer text-[11.5px] hover:bg-white/15 px-1.5 py-0.5 rounded flex items-center gap-1.5 font-sans text-white/90 transition-all">
            <span>{batteryLevel !== null ? `${batteryLevel}%` : "80%"}</span>
            <div className="w-[18px] h-[9px] border border-white/70 rounded-[2px] p-[1px] flex items-center relative">
              <div
                className="h-full bg-white rounded-[1px]"
                style={{ width: `${batteryLevel !== null ? batteryLevel : 80}%` }}
              />
              <div className="w-[1.5px] h-[3px] bg-white/70 absolute right-[-2.5px] top-[2px] rounded-r-[0.5px]" />
            </div>
          </span>

          {/* Centro de Control */}
          <span
            onClick={() => { setIsControlCenterOpen(!isControlCenterOpen); setIsAppleMenuOpen(false); }}
            className="cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded flex items-center transition-all duration-150"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-[15px] h-[15px]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M3 15h18" />
              <circle cx="8" cy="9" r="1.8" fill="currentColor" />
              <circle cx="16" cy="15" r="1.8" fill="currentColor" />
            </svg>
          </span>

          {/* Fecha y Hora en tiempo real */}
          <span className="cursor-pointer hover:bg-white/15 px-2 py-0.5 rounded select-none font-normal text-white/95">
            {currentDate} &nbsp; {currentTime}
          </span>
        </div>
      </div>

      {/* Cierre de dropdowns al hacer click en el escritorio */}
      <div
        className="absolute inset-0 z-[1]"
        onClick={() => { setIsControlCenterOpen(false); setIsAppleMenuOpen(false); }}
      />

      {/* 2. COLUMNA DE WIDGETS DE ESCRITORIO (Lado Izquierdo) */}
      <div className="absolute top-[48px] left-[24px] z-[5] flex flex-col gap-4 select-none pointer-events-auto">

        {/* Widget 1: Calendario */}
        <div className="w-[145px] h-[145px] liquid-glass rounded-[24px] p-3 text-black flex flex-col justify-between font-sans shadow-lg">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-red-600 tracking-wider">AGOSTO</span>
            <div className="grid grid-cols-7 text-[8px] font-bold text-black/55 text-center mt-1">
              <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
            <div className="grid grid-cols-7 text-[9px] font-medium text-black/90 text-center gap-y-1 mt-1">
              <span className="text-black/30">3</span><span className="text-black/30">4</span><span className="text-black/30">5</span><span className="text-black/30">6</span><span className="text-black/30">7</span><span>1</span><span>2</span>
              <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span>
              {/* Resaltamos el 17 en un círculo blanco */}
              <span className="bg-white text-black font-bold rounded-full flex items-center justify-center w-4 h-4 mx-auto shadow-sm">17</span>
              <span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span>
              <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
              <span>31</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Clima */}
        <div className="w-[145px] h-[145px] liquid-glass rounded-[24px] p-4 text-black flex flex-col justify-between font-sans shadow-lg">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-black/75 flex items-center gap-1">Moreno 🧭</span>
            <span className="text-[34px] font-light leading-none my-1 tracking-tighter">14°</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-black/80">Mayormente nublado</span>
            <span className="text-[9px] text-black/60 font-semibold">Máx. 15° Mín. 10°</span>
          </div>
        </div>

        {/* Widget 3: Fotos */}
        <div className="w-[145px] h-[145px] liquid-glass rounded-[24px] p-4 text-black flex flex-col justify-between font-sans shadow-lg items-center text-center">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shadow-sm border border-white/20 mt-1">
            🌸
          </div>
          <p className="text-[9px] text-black/65 font-medium leading-normal mb-1">
            Las fotos aparecerán aquí cuando se hayan terminado de procesar.
          </p>
        </div>
      </div>

      {/* 3. ICONOS DEL ESCRITORIO (Derecha) */}
      <div className="absolute top-[48px] right-[24px] z-[5] flex flex-col gap-5 items-center select-none text-center">

        {/* Acrobat PDF (Abre Finder) */}
        <div
          onClick={() => openApp("finder")}
          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-[80px] transition-all"
        >
          <div className="relative w-12 h-12 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[42px] h-[42px] drop-shadow-md">
              <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
              <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] leading-tight">
            Mi CV
          </span>
        </div>

        {/* Google Chrome Browser */}
        <div
          onClick={() => openApp("chrome")}
          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-[80px] transition-all"
        >
          <div className="relative w-12 h-12 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-[42px] h-[42px] drop-shadow-md">
              <path fill="#fff" d="M128.003 199.216c39.335 0 71.221-31.888 71.221-71.223S167.338 56.77 128.003 56.77S56.78 88.658 56.78 127.993s31.887 71.223 71.222 71.223" />
              <path fill="#229342" d="M35.89 92.997Q27.92 79.192 17.154 64.02a127.98 127.98 0 0 0 110.857 191.981q17.671-24.785 23.996-35.74q12.148-21.042 31.423-60.251v-.015a63.993 63.993 0 0 1-110.857.017Q46.395 111.19 35.89 92.998" />
              <path fill="#fbc116" d="M128.008 255.996A127.97 127.97 0 0 0 256 127.997A128 128 0 0 0 238.837 64q-36.372-3.585-53.686-3.585q-19.632 0-57.152 3.585l-.014.01a63.99 63.99 0 0 1 55.444 31.987a63.99 63.99 0 0 1-.001 64.01z" />
              <path fill="#1a73e8" d="M128.003 178.677c27.984 0 50.669-22.685 50.669-50.67s-22.685-50.67-50.67-50.67c-27.983 0-50.669 22.686-50.669 50.67s22.686 50.67 50.67 50.67" />
              <path fill="#e33b2e" d="M128.003 64.004H238.84a127.973 127.973 0 0 0-221.685.015l55.419 95.99l.015.008a63.993 63.993 0 0 1 55.415-96.014z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] leading-tight">
            Chrome
          </span>
        </div>
      </div>

      {/* 4. CONTENEDOR MULTI-VENTANAS (Window System con react-rnd) */}
      <div className="absolute inset-0 z-[10] pointer-events-none select-none">

        {/* ==================== APLICACIÓN: ADOBE ACROBAT (CV) ==================== */}
        {openWindows.acrobat && openWindows.acrobat.isOpen && !openWindows.acrobat.isMinimized && (
          <Rnd
            size={openWindows.acrobat.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.acrobat.size.width, height: openWindows.acrobat.size.height }}
            position={openWindows.acrobat.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.acrobat.position.x, y: openWindows.acrobat.position.y }}
            onDragStart={() => setIsDraggingActive(true)}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.acrobat.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                acrobat: {
                  ...prev.acrobat,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.acrobat.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                acrobat: {
                  ...prev.acrobat,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={300}
            minHeight={200}
            cancel=".window-control-buttons, input, iframe, button, a"
            enableResizing={{
              top: !openWindows.acrobat.isMaximized,
              right: !openWindows.acrobat.isMaximized,
              bottom: !openWindows.acrobat.isMaximized,
              left: !openWindows.acrobat.isMaximized,
              topRight: !openWindows.acrobat.isMaximized,
              bottomRight: !openWindows.acrobat.isMaximized,
              bottomLeft: !openWindows.acrobat.isMaximized,
              topLeft: !openWindows.acrobat.isMaximized,
            }}
            disableDragging={openWindows.acrobat.isMaximized}
            style={{
              zIndex: openWindows.acrobat.zIndex,
              pointerEvents: openWindows.acrobat.isMinimized ? "none" : "auto",
              transform: openWindows.acrobat.isMinimized 
                ? "scale(0.15) translateY(800px)" 
                : "scale(1) translateY(0)",
              opacity: openWindows.acrobat.isMinimized ? 0 : 1,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.35s ease-in-out",
            }}
            onClick={() => focusWindow("acrobat")}
            className={`absolute liquid-glass rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto select-none border border-white/10 transition-all duration-300 ${openWindows.acrobat.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col">
              {/* Header de Acrobat */}
              <div className="window-header h-[46px] bg-[#2d2d2d] border-b border-black/30 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none text-white">
                {/* Botones de control estilo macOS */}
                <div className="flex gap-2 items-center window-control-buttons">
                  <div onClick={(e) => closeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                  <div onClick={(e) => minimizeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                  <div onClick={(e) => toggleMaximizeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[18px] h-[18px]">
                    <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                    <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
                  </svg>
                  <span className="text-[13px] font-semibold text-white/90">Adobe Acrobat — CV_Matias_Bazan.pdf</span>
                </div>
                <div className="w-[60px]" /> {/* Spacer */}
              </div>

              {/* Cuerpo del PDF */}
              <div className="flex flex-1 overflow-hidden bg-white">
                <iframe
                  src="/os/cv/CV-Matias-Bazan.pdf"
                  className="w-full h-full border-none"
                  style={{ pointerEvents: isDraggingActive ? "none" : "auto" }}
                  title="CV Matias Bazan"
                />
              </div>
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: FINDER (Apple File Explorer) ==================== */}
        {openWindows.finder && openWindows.finder.isOpen && !openWindows.finder.isMinimized && (
          <Rnd
            size={openWindows.finder.isMaximized ? { width: "100%", height: "calc(100% - 28px)" } : { width: openWindows.finder.size.width, height: openWindows.finder.size.height }}
            position={openWindows.finder.isMaximized ? { x: 0, y: 28 } : isDraggingActive ? undefined : { x: openWindows.finder.position.x, y: openWindows.finder.position.y }}
            onDragStart={() => setIsDraggingActive(true)}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.finder.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                finder: {
                  ...prev.finder,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.finder.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                finder: {
                  ...prev.finder,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={550}
            minHeight={350}
            cancel=".window-control-buttons, input, .sidebar-link, button, a, .finder-draggable-item"
            enableResizing={{
              top: !openWindows.finder.isMaximized,
              right: !openWindows.finder.isMaximized,
              bottom: !openWindows.finder.isMaximized,
              left: !openWindows.finder.isMaximized,
              topRight: !openWindows.finder.isMaximized,
              bottomRight: !openWindows.finder.isMaximized,
              bottomLeft: !openWindows.finder.isMaximized,
              topLeft: !openWindows.finder.isMaximized,
            }}
            disableDragging={openWindows.finder.isMaximized}
            style={{
              zIndex: openWindows.finder.zIndex,
              pointerEvents: openWindows.finder.isMinimized ? "none" : "auto",
              transform: openWindows.finder.isMinimized 
                ? "scale(0.15) translateY(800px)" 
                : "scale(1) translateY(0)",
              opacity: openWindows.finder.isMinimized ? 0 : 1,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.35s ease-in-out",
            }}
            onClick={() => focusWindow("finder")}
            className={`absolute liquid-glass rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto select-none border border-white/10 text-white font-sans transition-all duration-300 ${openWindows.finder.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#181a20] text-white overflow-hidden relative">

              {/* Toolbar del Finder */}
              <div className="window-header h-[52px] bg-[#1c1f26] border-b border-white/5 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                <div className="flex items-center gap-5">
                  {/* Botones de control macOS */}
                  <div className="flex gap-2 items-center window-control-buttons">
                    <div onClick={(e) => closeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                    <div onClick={(e) => minimizeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                    <div onClick={(e) => toggleMaximizeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                  </div>

                  {/* Botones de Navegación Atrás / Adelante */}
                  <div className="flex gap-1 items-center font-sans">
                    <button
                      onClick={navigateFinderBack}
                      disabled={finderHistoryIndex <= 0}
                      className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={navigateFinderForward}
                      disabled={finderHistoryIndex >= finderHistory.length - 1}
                      className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Título de la Carpeta Actual */}
                  <span className="text-[14px] font-bold text-white/90 truncate max-w-[200px]">
                    {finderPath.replace("~", "Home").split("/").pop()}
                  </span>
                </div>

                {/* Controles de vista del Finder (Igual a la imagen) */}
                <div className="flex items-center gap-4">
                  {/* Grupo selector de layouts */}
                  <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 items-center">
                    <button
                      onClick={() => setFinderViewMode("grid")}
                      className={`p-1 rounded transition-all cursor-pointer ${finderViewMode === "grid" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFinderViewMode("list")}
                      className={`p-1 rounded transition-all cursor-pointer ${finderViewMode === "list" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className="relative flex items-center bg-white/5 rounded-lg border border-white/10 px-2.5 py-1 select-text">
                    <Search className="w-3.5 h-3.5 text-white/40 mr-1.5 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar"
                      value={finderSearch}
                      onChange={(e) => setFinderSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-[11.5px] text-white placeholder-white/30 w-[110px] focus:w-[150px] transition-all p-0 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Contenido Principal de Finder */}
              <div className="flex-1 flex overflow-hidden">

                {/* Sidebar Izquierda (Categorías de macOS) */}
                <div className="w-[185px] bg-[#121419]/70 border-r border-white/5 p-2.5 flex flex-col gap-4.5 shrink-0 select-none overflow-y-auto">

                  {/* Favoritos */}
                  <div>
                    <span className="text-[9.5px] font-bold text-white/25 uppercase tracking-wider px-2 block mb-1.5">Favoritos</span>
                    <div className="flex flex-col gap-0.5">
                      <div
                        onClick={() => navigateToFinderFolder("~/Desktop")}
                        className={`sidebar-link flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition cursor-pointer ${finderPath === "~/Desktop" ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Monitor className="w-[16px] h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Escritorio</span>
                      </div>
                      <div
                        onClick={() => navigateToFinderFolder("~/Documents")}
                        className={`sidebar-link flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition cursor-pointer ${finderPath.startsWith("~/Documents") && !finderPath.includes("Proyectos") ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <FileText className="w-[16px] h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Documentos</span>
                      </div>
                      <div
                        onClick={() => navigateToFinderFolder("~")}
                        className="sidebar-link flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
                      >
                        <FileDown className="w-[16px] h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Descargas</span>
                      </div>
                    </div>
                  </div>

                  {/* Ubicaciones */}
                  <div>
                    <span className="text-[9.5px] font-bold text-white/25 uppercase tracking-wider px-2 block mb-1.5">Ubicaciones</span>
                    <div className="flex flex-col gap-0.5">
                      <div
                        onClick={() => navigateToFinderFolder("~")}
                        className={`sidebar-link flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition cursor-pointer ${finderPath === "~" ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <HomeIcon className="w-[16px] h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">matybazan</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Panel de Archivos (Grid de macOS) */}
                <div className="flex-1 flex flex-col bg-[#181a20] overflow-hidden p-5 select-none">

                  {/* Grid / List de Archivos */}
                  <div ref={finderGridRef} className="flex-1 overflow-y-auto min-h-0 pointer-events-auto">
                    {Object.keys(terminalFS[finderPath] || {}).length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        <span className="text-xs font-semibold">Carpeta Vacía</span>
                      </div>
                    ) : finderViewMode === "list" ? (
                      /* List View Mode */
                      <div className="w-full flex flex-col font-sans text-[12.5px] select-none text-white/95">
                        <div className="flex border-b border-white/10 pb-2 mb-2 px-2 text-white/40 text-[11px] font-bold uppercase tracking-wider">
                          <span className="w-1/2">Nombre</span>
                          <span className="w-1/4">Clase</span>
                          <span className="w-1/4">Tamaño</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {Object.entries(terminalFS[finderPath] || {})
                            .filter(([name]) => name.toLowerCase().includes(finderSearch.toLowerCase()))
                            .map(([name, value]) => {
                              const isFolder = value === null;
                              const isPdf = name.toLowerCase().endsWith(".pdf") || name === "CV_Matias_Bazan.pdf";
                              const isChromeShortcut = name === "Google Chrome";
                              const isSelected = selectedFileName === name;

                              let kind = "Archivo";
                              if (isFolder) kind = "Carpeta";
                              else if (isPdf) kind = "Documento PDF";
                              else if (isChromeShortcut) kind = "Acceso directo";
                              else if (name.endsWith(".json")) kind = "Configuración JSON";
                              else if (name.endsWith(".md")) kind = "Documento Markdown";

                              return (
                                <div
                                  key={name}
                                  onClick={(e) => { e.stopPropagation(); setSelectedFileName(name); }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (isFolder) {
                                      const nextPath = finderPath === "~" ? `~/${name}` : `${finderPath}/${name}`;
                                      navigateToFinderFolder(nextPath);
                                    } else if (isPdf) {
                                      openApp("acrobat");
                                    } else if (isChromeShortcut) {
                                      openApp("chrome");
                                    } else {
                                      if (value && value.startsWith("[Archivo de GitHub")) {
                                        const downloadUrl = value.match(/URL de descarga: (.*)/)?.[1];
                                        if (downloadUrl) {
                                          setViewingFileContent({ name, content: "Cargando código de GitHub..." });
                                          fetch(downloadUrl)
                                            .then(res => res.text())
                                            .then(content => {
                                              setViewingFileContent({ name, content });
                                              setTerminalFS(prev => {
                                                const updated = { ...prev };
                                                const currentDir = { ...(updated[finderPath] || {}) };
                                                currentDir[name] = content;
                                                updated[finderPath] = currentDir;
                                                return updated;
                                              });
                                            })
                                            .catch(() => {
                                              setViewingFileContent({ name, content: "Error al descargar el contenido del archivo desde GitHub." });
                                            });
                                        }
                                      } else {
                                        setViewingFileContent({ name, content: value || "" });
                                      }
                                    }
                                  }}
                                  className={`flex py-2 px-2.5 rounded-md cursor-pointer transition items-center ${isSelected ? "bg-[#2563eb]/30 text-white font-medium shadow-sm" : "hover:bg-white/5 text-white/80"
                                    }`}
                                >
                                  <div className="w-1/2 flex items-center gap-2 truncate">
                                    <span className="text-[15px]">{isFolder ? "📁" : isPdf ? "📄" : isChromeShortcut ? "🌐" : "📄"}</span>
                                    <span className="truncate">{name}</span>
                                  </div>
                                  <span className="w-1/4 text-white/40 truncate">{kind}</span>
                                  <span className="w-1/4 text-white/40">{isFolder ? "--" : "4 KB"}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      /* Grid View Mode */
                      <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
                        {Object.entries(terminalFS[finderPath] || {})
                          .filter(([name]) => name.toLowerCase().includes(finderSearch.toLowerCase()))
                          .map(([name, value]) => {
                            const isFolder = value === null;
                            const isPdf = name.toLowerCase().endsWith(".pdf") || name === "CV_Matias_Bazan.pdf";
                            const isChromeShortcut = name === "Google Chrome";
                            const isPsd = name.toLowerCase().endsWith(".psd");
                            const isZip = name.toLowerCase().endsWith(".zip");
                            const isAi = name.toLowerCase().endsWith(".ai");
                            const isMd = name.toLowerCase().endsWith(".md");

                            const isSelected = selectedFileName === name;

                            return (
                              <motion.div
                                drag
                                dragConstraints={finderGridRef}
                                dragElastic={0.08}
                                dragMomentum={false}
                                whileDrag={{ scale: 1.05, zIndex: 99, cursor: "grabbing" }}
                                key={name}
                                onClick={(e) => { e.stopPropagation(); setSelectedFileName(name); }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  if (isFolder) {
                                    const nextPath = finderPath === "~" ? `~/${name}` : `${finderPath}/${name}`;
                                    navigateToFinderFolder(nextPath);
                                  } else if (isPdf) {
                                    openApp("acrobat");
                                  } else if (isChromeShortcut) {
                                    openApp("chrome");
                                  } else {
                                    if (value && value.startsWith("[Archivo de GitHub")) {
                                      const downloadUrl = value.match(/URL de descarga: (.*)/)?.[1];
                                      if (downloadUrl) {
                                        setViewingFileContent({ name, content: "Cargando código de GitHub..." });
                                        fetch(downloadUrl)
                                          .then(res => res.text())
                                          .then(content => {
                                            setViewingFileContent({ name, content });
                                            setTerminalFS(prev => {
                                              const updated = { ...prev };
                                              const currentDir = { ...(updated[finderPath] || {}) };
                                              currentDir[name] = content;
                                              updated[finderPath] = currentDir;
                                              return updated;
                                            });
                                          })
                                          .catch(() => {
                                            setViewingFileContent({ name, content: "Error al descargar el contenido del archivo desde GitHub." });
                                          });
                                      }
                                    } else {
                                      setViewingFileContent({ name, content: value || "" });
                                    }
                                  }
                                }}
                                className={`finder-draggable-item flex flex-col items-center p-2 rounded-lg cursor-pointer text-center select-none transition group relative ${isSelected ? "bg-[#2563eb]/30 border border-[#2563eb]/60" : "hover:bg-white/5 border border-transparent"
                                  }`}
                              >
                                {/* Icono de Finder */}
                                <div className="w-16 h-14 flex items-center justify-center drop-shadow-md transition duration-150 transform group-hover:scale-105">
                                  {isFolder ? (
                                    /* Carpeta macOS Sequoia exacta */
                                    <svg className="w-13 h-11" viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M4 10C4 6.68629 6.68629 4 10 4H26L32 10H54C57.3137 10 60 12.6863 60 16V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V10Z" fill="#93a7d8" />
                                      <path d="M4 14C4 11.7909 5.79086 10 8 10H56C58.2091 10 60 11.7909 60 14V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V14Z" fill="#859bce" />
                                      <path d="M4 18H60V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V18Z" fill="#9db4e5" opacity="0.85" />
                                    </svg>
                                  ) : isChromeShortcut ? (
                                    /* Chrome Icon */
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-11 h-11">
                                      <path fill="#fff" d="M128.003 199.216c39.335 0 71.221-31.888 71.221-71.223S167.338 56.77 128.003 56.77S56.78 88.658 56.78 127.993s31.887 71.223 71.222 71.223" />
                                      <path fill="#229342" d="M35.89 92.997Q27.92 79.192 17.154 64.02a127.98 127.98 0 0 0 110.857 191.981q17.671-24.785 23.996-35.74q12.148-21.042 31.423-60.251v-.015a63.993 63.993 0 0 1-110.857.017Q46.395 111.19 35.89 92.998" />
                                      <path fill="#fbc116" d="M128.008 255.996A127.97 127.97 0 0 0 256 127.997A128 128 0 0 0 238.837 64q-36.372-3.585-53.686-3.585q-19.632 0-57.152 3.585l-.014.01a63.99 63.99 0 0 1 55.444 31.987a63.99 63.99 0 0 1-.001 64.01z" />
                                      <path fill="#1a73e8" d="M128.003 178.677c27.984 0 50.669-22.685 50.669-50.67s-22.685-50.67-50.67-50.67c-27.983 0-50.669 22.686-50.669 50.67s22.686 50.67 50.67 50.67" />
                                      <path fill="#e33b2e" d="M128.003 64.004H238.84a127.973 127.973 0 0 0-221.685.015l55.419 95.99l.015.008a63.993 63.993 0 0 1 55.415-96.014z" />
                                    </svg>
                                  ) : isZip ? (
                                    /* Zip File Icon con cremallera */
                                    <svg className="w-11 h-13" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="2" y="2" width="36" height="44" rx="4" fill="#ffffff" stroke="#c0c0c0" strokeWidth="2" />
                                      <rect x="18" y="10" width="4" height="20" fill="#95a5a6" />
                                      <path d="M16 12h8m-8 4h8m-8 4h8m-8 4h8" stroke="#34495e" strokeWidth="2" />
                                      <rect x="15" y="26" width="10" height="6" rx="1" fill="#f1c40f" />
                                      <span className="absolute bottom-[2px] right-[4px] text-[7.5px] bg-[#95a5a6] text-white px-1 rounded font-bold">ZIP</span>
                                    </svg>
                                  ) : isPsd ? (
                                    /* PSD Illustrator layout style */
                                    <div className="w-11 h-13 bg-[#0d2a4a] border border-[#1b508f] rounded-md relative flex items-center justify-center">
                                      <span className="text-white text-xs font-bold font-sans">Ps</span>
                                      <span className="absolute bottom-[1px] right-[2px] text-[6.5px] bg-[#0d2e5c] text-white/80 px-0.5 rounded font-black font-sans">PSD</span>
                                    </div>
                                  ) : isAi ? (
                                    /* Illustrator Layout */
                                    <div className="w-11 h-13 bg-[#261300] border border-[#d37300] rounded-md relative flex items-center justify-center">
                                      <span className="text-[#ffd000] text-xs font-bold font-sans">Ai</span>
                                      <span className="absolute bottom-[1px] right-[2px] text-[6.5px] bg-[#d37300] text-white px-0.5 rounded font-black font-sans">AI</span>
                                    </div>
                                  ) : isMd ? (
                                    /* Document layout */
                                    <svg className="w-11 h-13" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="2" y="2" width="36" height="44" rx="4" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
                                      <path d="M8 12h24M8 18h24M8 24h16" stroke="#cccccc" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  ) : isPdf ? (
                                    /* Acrobat Icon */
                                    <svg className="w-11 h-11" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                      <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                                      <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
                                    </svg>
                                  ) : (
                                    /* Archivo generico */
                                    <svg className="w-11 h-13" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="2" y="2" width="36" height="44" rx="3" fill="#9CA3AF" />
                                      <path d="M2 10h36" stroke="white" strokeWidth="2" />
                                      <circle cx="12" cy="20" r="2" fill="white" />
                                      <circle cx="12" cy="28" r="2" fill="white" />
                                    </svg>
                                  )}
                                </div>

                                {/* Texto del Archivo */}
                                <span className={`text-[12px] mt-2 leading-tight line-clamp-2 select-none selection:bg-transparent ${isSelected ? "text-white font-semibold" : "text-white/85 group-hover:text-white"
                                  }`}>
                                  {name}
                                </span>
                              </motion.div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Barra de estado inferior de Finder */}
                  <div className="h-[22px] border-t border-white/5 flex items-center justify-center shrink-0 mt-2 select-none">
                    <span className="text-[10.5px] text-white/40">
                      {Object.keys(terminalFS[finderPath] || {}).length} elementos, 1.25 TB disponibles
                    </span>
                  </div>
                </div>
              </div>

              {/* Vista Rápida Overlay (Quick Look) */}
              {viewingFileContent && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 z-[100] pointer-events-auto">
                  <div className="bg-[#1e1e1f] border border-white/10 rounded-2xl w-[600px] max-h-[80%] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
                    <div className="h-[44px] bg-[#141415] border-b border-white/5 flex items-center justify-between px-4">
                      <span className="text-[13px] font-semibold text-white/90">{viewingFileContent.name}</span>
                      <button
                        onClick={() => setViewingFileContent(null)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11.5px] font-medium transition cursor-pointer"
                      >
                        Cerrar Vista
                      </button>
                    </div>
                    <div className="p-5 overflow-y-auto text-[13px] font-mono whitespace-pre-wrap leading-relaxed select-text text-white/80">
                      {viewingFileContent.content}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: NOTAS (Carta de Presentación) ==================== */}
        {openWindows.notes.isOpen && (
          <Rnd
            size={openWindows.notes.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.notes.size.width, height: openWindows.notes.size.height }}
            position={openWindows.notes.isMaximized ? { x: 0, y: 0 } : { x: openWindows.notes.position.x, y: openWindows.notes.position.y }}
            onDrag={(e, d) => {
              if (openWindows.notes.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                notes: {
                  ...prev.notes,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.notes.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                notes: {
                  ...prev.notes,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.notes.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                notes: {
                  ...prev.notes,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={300}
            minHeight={200}
            cancel=".window-control-buttons, input, iframe, button, a"
            enableResizing={{
              top: !openWindows.notes.isMaximized,
              right: !openWindows.notes.isMaximized,
              bottom: !openWindows.notes.isMaximized,
              left: !openWindows.notes.isMaximized,
              topRight: !openWindows.notes.isMaximized,
              bottomRight: !openWindows.notes.isMaximized,
              bottomLeft: !openWindows.notes.isMaximized,
              topLeft: !openWindows.notes.isMaximized,
            }}
            disableDragging={openWindows.notes.isMaximized}
            style={{
              zIndex: openWindows.notes.zIndex,
              pointerEvents: openWindows.notes.isMinimized ? "none" : "auto",
              transform: openWindows.notes.isMinimized 
                ? "scale(0.15) translateY(800px)" 
                : "scale(1) translateY(0)",
              opacity: openWindows.notes.isMinimized ? 0 : 1,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.35s ease-in-out",
            }}
            onClick={() => focusWindow("notes")}
            className={`absolute liquid-glass rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.notes.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#272728] text-white font-sans overflow-hidden">
              {/* Header / Toolbar nativo estilo Apple Notes de macOS */}
              <div className="window-header h-[50px] bg-[#1e1e1f] border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                <div className="flex items-center gap-4">
                  {/* Botones de control macOS */}
                  <div className="flex gap-2 items-center window-control-buttons">
                    <div onClick={(e) => closeApp("notes", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                    <div onClick={(e) => minimizeApp("notes", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                    <div onClick={(e) => toggleMaximizeApp("notes", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                  </div>

                  {/* Iconos de la barra de herramientas de Apple Notes */}
                  <div className="flex items-center gap-3 text-white/70 ml-2">
                    <button onClick={() => setShowNotesSidebar(!showNotesSidebar)} className="hover:text-white transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/70">
                  <button onClick={handleCreateNote} className="hover:text-white transition cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Layout de 3 columnas de Apple Notes de macOS */}
              <div className="flex-1 flex overflow-hidden">
                {/* Columna 1: Carpetas */}
                {showNotesSidebar && (
                  <div className="w-[180px] bg-[#1e1e1f] border-r border-white/5 p-3 flex flex-col gap-1 text-[12px] text-white/80 shrink-0 select-none">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1">iCloud</div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 font-medium">
                      <span className="flex items-center gap-2">
                        <img src="/os/notas-apple.png" className="w-4 h-4 object-contain" alt="" />
                        <span>Notas</span>
                      </span>
                      <span className="text-[11px] text-yellow-400/80">{notesList.length}</span>
                    </div>
                  </div>
                )}

                {/* Columna 2: Lista de notas en la carpeta */}
                <div className="w-[220px] bg-[#232324] border-r border-white/5 p-2 flex flex-col gap-1 shrink-0 overflow-y-auto select-none">
                  {/* Buscador */}
                  <div className="px-2 mb-2 select-text">
                    <div className="relative flex items-center bg-[#1c1c1e] rounded-md border border-white/10 px-2 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-white/40 mr-1.5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Buscar"
                        value={notesSearch}
                        onChange={(e) => setNotesSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] text-white/90 placeholder-white/45 w-full p-0 font-sans"
                      />
                    </div>
                  </div>

                  {notesList
                    .filter(note =>
                      note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                      note.content.toLowerCase().includes(notesSearch.toLowerCase())
                    )
                    .map(note => {
                      const snippet = note.content.split("\n").slice(1).join(" ").trim() || note.content || "Sin contenido adicional";
                      const displaySnippet = snippet.length > 25 ? snippet.substring(0, 25) + "..." : snippet;
                      return (
                        <div
                          key={note.id}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition relative group ${activeNoteId === note.id ? "bg-white/10 border-white/10" : "hover:bg-white/5 border-transparent"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="text-[13px] font-semibold text-white mb-0.5 truncate">{note.title || "Nueva Nota"}</h4>
                            {note.category === "user" && (
                              <button
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/50 hover:text-red-400 transition flex items-center justify-center cursor-pointer shrink-0"
                                title="Borrar nota"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/50 mb-1">
                            <span className="shrink-0">{note.date.split(",")[1]?.trim() || "12:00"}</span>
                            <span className="truncate text-white/40">{displaySnippet}</span>
                          </div>
                          <span className="text-[10px] text-yellow-400/90 font-medium">iCloud</span>
                        </div>
                      );
                    })}
                </div>

                {/* Columna 3: Editor de Nota */}
                {(() => {
                  const activeNote = notesList.find(n => n.id === activeNoteId) || notesList[0];
                  if (!activeNote) return null;

                  return (
                    <div className="flex-1 bg-[#1c1c1e] p-8 overflow-y-auto text-[13.5px] text-white/90 font-sans leading-relaxed select-text flex flex-col">
                      <div className="max-w-[650px] mx-auto w-full flex-1 flex flex-col">
                        {activeNote.category === "projects" ? (
                          <>
                            <div className="text-[11px] text-white/40 text-center mb-6">{activeNote.date}</div>
                            <h1 className="text-3xl font-bold text-white mb-6">Mis Proyectos Personales</h1>

                            <div className="space-y-6 font-sans">
                              {/* Proyecto 1: Albus Dumbledore */}
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                  <div>
                                    <h3 className="text-xl font-bold text-yellow-400">Albus Dumbledore</h3>
                                    <p className="text-xs text-white/60">Exploración visual y conceptual de un personaje icónico aplicada al diseño web interactivo.</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const target = "https://proyecto-dumbledore-web.vercel.app/";
                                        openApp("chrome");
                                        setChromeTabs(prev => {
                                          const exists = prev.find(t => t.url === target);
                                          if (exists) {
                                            setActiveTabId(exists.id);
                                            setChromeInputUrl(target);
                                            return prev;
                                          }
                                          const newTabId = `tab-${Date.now()}`;
                                          setActiveTabId(newTabId);
                                          setChromeInputUrl(target);
                                          return [...prev.slice(0, 4), { id: newTabId, title: "Albus Dumbledore", url: target, iconType: "chrome" }];
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-lg border border-yellow-500/40 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <img src="/os/MdiWeb.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>Sitio Web</span>
                                    </button>
                                    <a
                                      href="https://github.com/IamMatiasBazan/proyecto-dumbledore-web"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold rounded-lg border border-white/15 transition flex items-center gap-1.5 cursor-pointer no-underline"
                                    >
                                      <img src="/os/DeviconGithub.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>GitHub</span>
                                    </a>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Sobre el Proyecto</h4>
                                  <p className="text-xs text-white/80 leading-relaxed">
                                    Este proyecto personal se centra en la creación de una interfaz inmersiva inspirada en el universo de Harry Potter, específicamente en el personaje de Albus Dumbledore. El objetivo fue experimentar con transiciones suaves, efectos de iluminación mágica y una tipografía que evocara la sabiduría y el misterio.
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Características clave</h4>
                                  <ul className="list-disc list-inside text-xs text-white/75 space-y-0.5">
                                    <li>Navegación fluida inspirada en elementos de fantasía.</li>
                                    <li>Paleta de colores curada para transmitir misticismo.</li>
                                    <li>Optimización de imágenes WebP para carga ultra rápida.</li>
                                  </ul>
                                </div>
                                <div className="pt-1 flex flex-wrap gap-1.5">
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">HTML5</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">CSS3</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">JavaScript</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Figma</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Vercel</span>
                                </div>
                              </div>

                              {/* Proyecto 2: Deep Style (Johnny Depp) */}
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                  <div>
                                    <h3 className="text-xl font-bold text-yellow-400">Deep Style (Johnny Depp)</h3>
                                    <p className="text-xs text-white/60">Diseño minimalista y sofisticado enfocado en la versatilidad actoral de Johnny Depp.</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const target = "https://proyecto-johnnydepp-web.vercel.app/";
                                        openApp("chrome");
                                        setChromeTabs(prev => {
                                          const exists = prev.find(t => t.url === target);
                                          if (exists) {
                                            setActiveTabId(exists.id);
                                            setChromeInputUrl(target);
                                            return prev;
                                          }
                                          const newTabId = `tab-${Date.now()}`;
                                          setActiveTabId(newTabId);
                                          setChromeInputUrl(target);
                                          return [...prev.slice(0, 4), { id: newTabId, title: "Johnny Depp", url: target, iconType: "chrome" }];
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-lg border border-yellow-500/40 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <img src="/os/MdiWeb.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>Sitio Web</span>
                                    </button>
                                    <a
                                      href="https://github.com/IamMatiasBazan/proyecto-johnnydepp-web"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold rounded-lg border border-white/15 transition flex items-center gap-1.5 cursor-pointer no-underline"
                                    >
                                      <img src="/os/DeviconGithub.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>GitHub</span>
                                    </a>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Sobre el Proyecto</h4>
                                  <p className="text-xs text-white/80 leading-relaxed">
                                    Este proyecto explora la estética de la moda y el estilo personal a través de la figura de Johnny Depp. La interfaz utiliza fotografías de alta resolución y una maquetación elegante orientada a resaltar la personalidad del artista.
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Características clave</h4>
                                  <ul className="list-disc list-inside text-xs text-white/75 space-y-0.5">
                                    <li>Galería interactiva.</li>
                                    <li>Adaptación fluida para dispositivos móviles.</li>
                                  </ul>
                                </div>
                                <div className="pt-1 flex flex-wrap gap-1.5">
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">HTML5</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">CSS3</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">JavaScript</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Photoshop</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Vercel</span>
                                </div>
                              </div>

                              {/* Proyecto 3: Super Mario Bros */}
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                  <div>
                                    <h3 className="text-xl font-bold text-yellow-400">Super Mario Bros</h3>
                                    <p className="text-xs text-white/60">Experiencia interactiva dinámica e inspirada en el clásico universo de Nintendo.</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const target = "https://proyecto-mariobros-web.vercel.app/";
                                        openApp("chrome");
                                        setChromeTabs(prev => {
                                          const exists = prev.find(t => t.url === target);
                                          if (exists) {
                                            setActiveTabId(exists.id);
                                            setChromeInputUrl(target);
                                            return prev;
                                          }
                                          const newTabId = `tab-${Date.now()}`;
                                          setActiveTabId(newTabId);
                                          setChromeInputUrl(target);
                                          return [...prev.slice(0, 4), { id: newTabId, title: "Mario Bros", url: target, iconType: "chrome" }];
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-lg border border-yellow-500/40 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <img src="/os/MdiWeb.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>Sitio Web</span>
                                    </button>
                                    <a
                                      href="https://github.com/IamMatiasBazan/proyecto-mariobros-web"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold rounded-lg border border-white/15 transition flex items-center gap-1.5 cursor-pointer no-underline"
                                    >
                                      <img src="/os/DeviconGithub.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>GitHub</span>
                                    </a>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Sobre el Proyecto</h4>
                                  <p className="text-xs text-white/80 leading-relaxed">
                                    Desarrollo enfocado en elementos interactivos, animaciones temáticas y sonidos retro característicos de Super Mario. Diseñado con una interfaz vibrante y optimizado para una alta fidelidad visual.
                                  </p>
                                </div>
                                <div className="pt-1 flex flex-wrap gap-1.5">
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">HTML5</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">CSS3</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">JavaScript</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Vercel</span>
                                </div>
                              </div>

                              {/* Proyecto 4: Premium Portafolio */}
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                  <div>
                                    <h3 className="text-xl font-bold text-yellow-400">Premium Portafolio</h3>
                                    <p className="text-xs text-white/60">Plataforma web con tecnología Flutter & Web, centrada en rendimiento y alta fidelidad estética.</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const target = "https://portafolio-matias-bazan.vercel.app/";
                                        openApp("chrome");
                                        setChromeTabs(prev => {
                                          const exists = prev.find(t => t.url === target);
                                          if (exists) {
                                            setActiveTabId(exists.id);
                                            setChromeInputUrl(target);
                                            return prev;
                                          }
                                          const newTabId = `tab-${Date.now()}`;
                                          setActiveTabId(newTabId);
                                          setChromeInputUrl(target);
                                          return [...prev.slice(0, 4), { id: newTabId, title: "Premium Portafolio", url: target, iconType: "chrome" }];
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-lg border border-yellow-500/40 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <img src="/os/MdiWeb.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>Sitio Web</span>
                                    </button>
                                    <a
                                      href="https://github.com/IamMatiasBazan"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold rounded-lg border border-white/15 transition flex items-center gap-1.5 cursor-pointer no-underline"
                                    >
                                      <img src="/os/DeviconGithub.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                                      <span>GitHub</span>
                                    </a>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Sobre el Proyecto</h4>
                                  <p className="text-xs text-white/80 leading-relaxed">
                                    Plataforma interactiva diseñada para presentar proyectos profesionales y personales con una navegación fluida, diseño adaptable y micro-animaciones en tiempo real.
                                  </p>
                                </div>
                                <div className="pt-1 flex flex-wrap gap-1.5">
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Flutter</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Dart</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Figma</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10.5px] text-white/60 font-mono">Vercel</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (activeNote.category === "experience" ? (
                          <>
                            <div className="text-[11px] text-white/40 text-center mb-6">{activeNote.date}</div>
                            <h1 className="text-3xl font-bold text-white mb-6">Experiencia Laboral</h1>

                            <div className="space-y-4 select-text">
                              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="text-lg font-bold text-yellow-400">Plaza Digital</h3>
                                    <span className="text-xs text-white/50 font-mono">Sistema Web de Gestión</span>
                                  </div>
                                </div>
                                <p className="text-xs text-white/70 leading-relaxed mt-2">
                                  Desarrollo, optimización and mantenimiento de la plataforma web. Un sistema real en producción diseñado para alto rendimiento, seguridad y experiencia de usuario fluida.
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col h-full min-h-[300px] select-text">
                            <div className="text-[11px] text-white/40 text-center mb-4 shrink-0">{activeNote.date}</div>
                            <textarea
                              value={activeNote.content}
                              onChange={(e) => handleNoteContentChange(activeNote.id, e.target.value)}
                              placeholder="Empieza a escribir aquí..."
                              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-[14.5px] text-white/95 leading-relaxed font-sans focus:ring-0 p-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: TERMINAL (CLI) ==================== */}
        {openWindows.terminal.isOpen && !openWindows.terminal.isMinimized && (
          <Rnd
            size={openWindows.terminal.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.terminal.size.width, height: openWindows.terminal.size.height }}
            position={openWindows.terminal.isMaximized ? { x: 0, y: 0 } : { x: openWindows.terminal.position.x, y: openWindows.terminal.position.y }}
            onDrag={(e, d) => {
              if (openWindows.terminal.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.terminal.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.terminal.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={300}
            minHeight={200}
            cancel=".window-control-buttons, input, iframe, button, a"
            enableResizing={{
              top: !openWindows.terminal.isMaximized,
              right: !openWindows.terminal.isMaximized,
              bottom: !openWindows.terminal.isMaximized,
              left: !openWindows.terminal.isMaximized,
              topRight: !openWindows.terminal.isMaximized,
              bottomRight: !openWindows.terminal.isMaximized,
              bottomLeft: !openWindows.terminal.isMaximized,
              topLeft: !openWindows.terminal.isMaximized,
            }}
            disableDragging={openWindows.terminal.isMaximized}
            style={{
              zIndex: openWindows.terminal.zIndex,
              pointerEvents: openWindows.terminal.isMinimized ? "none" : "auto",
              transform: openWindows.terminal.isMinimized 
                ? "scale(0.15) translateY(800px)" 
                : "scale(1) translateY(0)",
              opacity: openWindows.terminal.isMinimized ? 0 : 1,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.35s ease-in-out",
            }}
            onClick={() => focusWindow("terminal")}
            className={`absolute liquid-glass rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.terminal.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col">
              {/* Header de Terminal */}
              <div className="window-header h-[36px] bg-black/60 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none">
                <div className="flex gap-2 items-center window-control-buttons">
                  <div onClick={(e) => closeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                  <div onClick={(e) => minimizeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                  <div onClick={(e) => toggleMaximizeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                </div>
                <span className="text-[11.5px] font-mono text-white/50">matias@tahoe-mac: {terminalCwd} — zsh</span>
                <div className="w-[60px]" />
              </div>

              {/* Contenido Terminal */}
              <div ref={terminalContainerRef} className="flex-1 bg-black/90 p-4 font-mono text-emerald-400 text-[12px] overflow-y-auto flex flex-col gap-1 leading-normal cursor-text">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">
                    {line.type === "input" ? (
                      <span className="text-emerald-300 font-semibold">{line.text}</span>
                    ) : line.type === "error" ? (
                      <span className="text-red-400">{line.text}</span>
                    ) : line.type === "success" ? (
                      <span className="text-green-400">{line.text}</span>
                    ) : (
                      <span className="text-emerald-400">{line.text}</span>
                    )}
                  </div>
                ))}

                {/* Input Form */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 mt-1">
                  <span className="text-emerald-300 font-semibold"><span className="text-blue-400">matias@tahoe-mac</span> <span className="text-yellow-300">{terminalCwd}</span> %</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-[12px] p-0"
                    autoFocus
                    spellCheck={false}
                  />
                </form>
                <div ref={terminalBottomRef} />
              </div>
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: GOOGLE CHROME ==================== */}
        {openWindows.chrome.isOpen && !openWindows.chrome.isMinimized && (
          <Rnd
            size={openWindows.chrome.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.chrome.size.width, height: openWindows.chrome.size.height }}
            position={openWindows.chrome.isMaximized ? { x: 0, y: 0 } : { x: openWindows.chrome.position.x, y: openWindows.chrome.position.y }}
            onDrag={(e, d) => {
              if (openWindows.chrome.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                chrome: {
                  ...prev.chrome,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.chrome.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                chrome: {
                  ...prev.chrome,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.chrome.isMaximized) return;
              setOpenWindows(prev => ({
                ...prev,
                chrome: {
                  ...prev.chrome,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={300}
            minHeight={200}
            cancel=".window-control-buttons, .window-no-drag, input, iframe, button, a"
            enableResizing={{
              top: !openWindows.chrome.isMaximized,
              right: !openWindows.chrome.isMaximized,
              bottom: !openWindows.chrome.isMaximized,
              left: !openWindows.chrome.isMaximized,
              topRight: !openWindows.chrome.isMaximized,
              bottomRight: !openWindows.chrome.isMaximized,
              bottomLeft: !openWindows.chrome.isMaximized,
              topLeft: !openWindows.chrome.isMaximized,
            }}
            disableDragging={openWindows.chrome.isMaximized}
            style={{
              zIndex: openWindows.chrome.zIndex,
              pointerEvents: openWindows.chrome.isMinimized ? "none" : "auto",
              transform: openWindows.chrome.isMinimized 
                ? "scale(0.15) translateY(800px)" 
                : "scale(1) translateY(0)",
              opacity: openWindows.chrome.isMinimized ? 0 : 1,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.35s ease-in-out",
            }}
            onClick={() => focusWindow("chrome")}
            className={`absolute bg-[#b2cbdc] overflow-hidden shadow-2xl flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.chrome.isMaximized ? "rounded-none border-none" : "border border-[#8da4b4] rounded-2xl"
              } ${openWindows.chrome.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#b2cbdc]">
              {/* Header de Chrome: Tabs */}
              <div className="window-header h-[42px] bg-gradient-to-b from-[#c5d8e7] to-[#abbfcb] border-b border-[#8da4b4] flex items-end justify-between px-3 cursor-grab active:cursor-grabbing select-none relative">
                {/* Botones de control estilo macOS */}
                <div className="flex gap-2 items-center window-control-buttons mb-2.5">
                  <div onClick={(e) => closeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                  <div onClick={(e) => minimizeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                  <div onClick={(e) => toggleMaximizeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                </div>

                {/* Tabs de Chrome (Estilo de la imagen con divisor y pill activo) */}
                <div className="flex items-center gap-0 ml-2 flex-1 overflow-x-auto no-scrollbar pb-1">
                  {/* Chevron tab dropdown */}
                  <button className="window-no-drag w-6 h-6 hover:bg-black/10 text-gray-700 rounded flex items-center justify-center mr-1 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {chromeTabs.map((tab, index) => {
                    const isActive = tab.id === activeTabId;
                    return (
                      <div key={tab.id} className="flex items-center">
                        {/* Vertical divider line if not first tab and not active/prev active */}
                        {index > 0 && !isActive && chromeTabs[index - 1]?.id !== activeTabId && (
                          <div className="h-4 w-[1px] bg-gray-400/40 mx-0.5" />
                        )}

                        <div
                          onClick={() => {
                            setActiveTabId(tab.id);
                            setChromeInputUrl(tab.url);
                          }}
                          className={`window-no-drag h-[30px] px-3 rounded-full flex items-center gap-2 text-[11px] font-medium transition-all max-w-[190px] cursor-pointer relative ${isActive
                            ? "bg-white text-black shadow-md border border-black/10 z-10"
                            : "text-gray-700 hover:bg-black/5"
                            }`}
                        >
                          {/* Iconos de la pestaña */}
                          {tab.iconType === "gmail" && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0">
                              <path fill="#4285F4" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                              <path fill="#34A853" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" opacity=".2" />
                              <path fill="#EA4335" d="M12 13L2 6v12h4V10l6 4.5L18 10v8h4V6l-10 7z" />
                            </svg>
                          )}
                          {tab.iconType === "whatsapp" && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0">
                              <path fill="#25D366" d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.237a9.96 9.96 0 0 0 4.779 1.221h.004c5.505 0 9.988-4.478 9.989-9.985A9.99 9.99 0 0 0 12.012 2z" />
                              <path fill="#FFF" d="M17.472 14.382c-.301-.15-1.783-.88-2.059-.98-.275-.1-.476-.15-.677.15-.201.3-.777.98-.953 1.18-.175.2-.351.225-.652.075s-1.272-.469-2.424-1.496c-.896-.798-1.501-1.784-1.677-2.084-.175-.3-.019-.462.131-.611.135-.134.301-.35.451-.526.15-.175.201-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.633-.928-2.235-.244-.585-.493-.505-.677-.514-.175-.009-.376-.009-.577-.009s-.527.075-.803.375c-.276.3-1.054 1.03-1.054 2.512s1.08 2.912 1.23 3.112c.15.2 2.126 3.246 5.151 4.554.72.31 1.282.496 1.72.635.724.23 1.383.197 1.904.12.581-.087 1.783-.728 2.034-1.43.251-.702.251-1.303.175-1.43-.075-.128-.276-.203-.577-.353z" />
                            </svg>
                          )}
                          {tab.iconType === "gemini" && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0">
                              <path fill="url(#gemini-grad)" d="M12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24Z" />
                              <defs>
                                <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#4285F4" />
                                  <stop offset="0.5" stopColor="#9B51E0" />
                                  <stop offset="1" stopColor="#EA4335" />
                                </linearGradient>
                              </defs>
                            </svg>
                          )}
                          {tab.iconType === "nextjs" && (
                            <div className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[7px] font-bold flex-shrink-0">
                              ▲
                            </div>
                          )}
                          {tab.iconType === "chrome" && (
                            <svg viewBox="0 0 256 256" className="w-3.5 h-3.5 flex-shrink-0">
                              <path fill="#fff" d="M128.003 199.216c39.335 0 71.221-31.888 71.221-71.223S167.338 56.77 128.003 56.77S56.78 88.658 56.78 127.993s31.887 71.223 71.222 71.223" />
                              <path fill="#229342" d="M35.89 92.997Q27.92 79.192 17.154 64.02a127.98 127.98 0 0 0 110.857 191.981q17.671-24.785 23.996-35.74q12.148-21.042 31.423-60.251v-.015a63.993 63.993 0 0 1-110.857.017Q46.395 111.19 35.89 92.998" />
                              <path fill="#fbc116" d="M128.008 255.996A127.97 127.97 0 0 0 256 127.997A128 128 0 0 0 238.837 64q-36.372-3.585-53.686-3.585q-19.632 0-57.152 3.585l-.014.01a63.99 63.99 0 0 1 55.444 31.987a63.99 63.99 0 0 1-.001 64.01z" />
                              <path fill="#1a73e8" d="M128.003 178.677c27.984 0 50.669-22.685 50.669-50.67s-22.685-50.67-50.67-50.67c-27.983 0-50.669 22.686-50.669 50.67s22.686 50.67 50.67 50.67" />
                              <path fill="#e33b2e" d="M128.003 64.004H238.84a127.973 127.973 0 0 0-221.685.015l55.419 95.99l.015.008a63.993 63.993 0 0 1 55.415-96.014z" />
                            </svg>
                          )}

                          <span className="truncate max-w-[120px]">{tab.title}</span>

                          {/* Botón cerrar pestaña */}
                          {chromeTabs.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTabs = chromeTabs.filter(t => t.id !== tab.id);
                                setChromeTabs(newTabs);
                                if (activeTabId === tab.id) {
                                  const nextTab = newTabs[newTabs.length - 1];
                                  setActiveTabId(nextTab.id);
                                  setChromeInputUrl(nextTab.url);
                                }
                              }}
                              className="text-[11px] hover:bg-black/10 px-1 rounded-full cursor-pointer ml-auto text-gray-500 hover:text-black font-bold flex items-center justify-center w-4 h-4"
                            >
                              ×
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Botón Nueva Tab (Máximo 5 pestañas) */}
                  {chromeTabs.length < 5 && (
                    <button
                      onClick={() => {
                        const newTabId = `tab-${Date.now()}`;
                        const newTab = {
                          id: newTabId,
                          title: "Nueva pestaña",
                          url: "chrome://newtab",
                          iconType: "chrome"
                        };
                        setChromeTabs(prev => [...prev, newTab]);
                        setActiveTabId(newTabId);
                        setChromeInputUrl("chrome://newtab");
                      }}
                      className="window-no-drag w-6 h-6 hover:bg-black/10 text-gray-700 rounded-full flex items-center justify-center ml-1 cursor-pointer text-sm font-bold shadow-none"
                      title="Nueva pestaña (Máximo 5)"
                    >
                      +
                    </button>
                  )}
                </div>


                <div className="w-[60px]" />
              </div>

              {/* Barra de Navegación (Dirección y Controles) */}
              <div className="h-[44px] bg-[#f2f0f5] border-b border-[#d2cfe4] flex items-center justify-between px-3 gap-3">
                {/* Controles de navegación */}
                <div className="flex items-center gap-3.5 text-gray-600">
                  <button
                    onClick={() => {
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "chrome://newtab", title: "Nueva pestaña" } : t));
                      setChromeInputUrl("chrome://newtab");
                    }}
                    className="w-7 h-7 hover:bg-black/5 rounded-full flex items-center justify-center cursor-pointer transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[17px] h-[17px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[17px] h-[17px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const temp = chromeUrl;
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "" } : t));
                      setTimeout(() => {
                        setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: temp } : t));
                      }, 50);
                    }}
                    className="w-7 h-7 hover:bg-black/5 rounded-full flex items-center justify-center cursor-pointer transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[17px] h-[17px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                </div>

                {/* Barra de URL */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const frameUrl = getChromeIframeUrl(chromeInputUrl);
                    setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: frameUrl, title: frameUrl === "chrome://newtab" ? "Nueva pestaña" : frameUrl } : t));
                    setChromeInputUrl(frameUrl);
                  }}
                  className="flex-1 max-w-[85%] h-[32px] bg-white rounded-full border border-[#b5a3eb]/40 hover:border-[#b5a3eb]/80 flex items-center justify-between px-3 text-[11.5px] text-[#333333] relative shadow-sm focus-within:ring-2 focus-within:ring-[#b5a3eb]/30"
                >
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    {/* Icono G Colorido */}
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] flex-shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <input
                      type="text"
                      value={chromeInputUrl}
                      onChange={(e) => setChromeInputUrl(e.target.value)}
                      className="bg-transparent border-none outline-none text-[#333333] w-full p-0 leading-none text-[12px] font-sans"
                      spellCheck={false}
                    />
                  </div>
                  <button type="submit" className="hidden" />

                  {/* Elementos de la Derecha dentro del Omnibox (Solo logo M) */}
                  <div className="flex items-center gap-1 flex-shrink-0 select-none mr-1">
                    {/* Foto de perfil Mock (Inicial M) */}
                    <div className="w-[18px] h-[18px] rounded-full bg-[#008FFE] text-white text-[9.5px] flex items-center justify-center font-bold cursor-pointer shadow-sm">
                      M
                    </div>
                  </div>
                </form>
              </div>

              {/* Bookmarks Bar (Favoritos) */}
              <div className="h-[28px] bg-[#f2f0f5] border-b border-[#d2cfe4] flex items-center px-3 text-[11px] text-[#333333] font-normal select-none">

                {/* Apps Grid Icon */}
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] text-gray-600 hover:text-black cursor-pointer mr-2 flex-shrink-0">
                  <rect x="2" y="2" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="9.5" y="2" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="17" y="2" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="2" y="9.5" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="17" y="9.5" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="2" y="17" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="9.5" y="17" width="5" height="5" rx="1.2" fill="currentColor" />
                  <rect x="17" y="17" width="5" height="5" rx="1.2" fill="currentColor" />
                </svg>

                {/* Divisor */}
                <span className="text-gray-300 mr-3 text-[12px]">|</span>

                {/* Bookmarks Row */}
                <div className="flex items-center gap-3.5 overflow-hidden flex-1 mr-4">
                  {/* Favorito 1: Portafolio Premium */}
                  <div
                    onClick={() => {
                      const target = "https://portafolio-matias-bazan.vercel.app/";
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Premium" } : t));
                      setChromeInputUrl(target);
                    }}
                    className="flex items-center gap-1.5 hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition shrink-0"
                  >
                    <img src="/os/premium.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Premium</span>
                  </div>

                  {/* Favorito 2: Portafolio Tecnológico */}
                  <div
                    onClick={() => {
                      const target = "https://portafolio-matias-bazan-web.vercel.app/";
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Tecnológico" } : t));
                      setChromeInputUrl(target);
                    }}
                    className="flex items-center gap-1.5 hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition shrink-0"
                  >
                    <img src="/os/logo-desktop.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Tecnológico</span>
                  </div>

                  {/* Favorito 3: Mario Bros */}
                  <div
                    onClick={() => {
                      const target = "https://proyecto-mariobros-web.vercel.app/";
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Mario Bros" } : t));
                      setChromeInputUrl(target);
                    }}
                    className="flex items-center gap-1.5 hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition shrink-0"
                  >
                    <img src="/os/mariobros.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Mario Bros</span>
                  </div>

                  {/* Favorito 4: Johnny Depp */}
                  <div
                    onClick={() => {
                      const target = "https://proyecto-johnnydepp-web.vercel.app/";
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Johnny Depp" } : t));
                      setChromeInputUrl(target);
                    }}
                    className="flex items-center gap-1.5 hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition shrink-0"
                  >
                    <img src="/os/jhonnydepp.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Johnny Depp</span>
                  </div>

                  {/* Favorito 5: Dumbledore */}
                  <div
                    onClick={() => {
                      const target = "https://proyecto-dumbledore-web.vercel.app/";
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Dumbledore" } : t));
                      setChromeInputUrl(target);
                    }}
                    className="flex items-center gap-1.5 hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition shrink-0"
                  >
                    <img src="/os/dumbledore.svg" className="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Dumbledore</span>
                  </div>
                </div>

                {/* Doble Flecha Derecha */}
                <span className="text-gray-500 hover:text-black cursor-pointer text-xs ml-auto font-bold font-sans">»</span>
              </div>

              {/* Viewport de Chrome */}
              <div className="flex-1 bg-white overflow-hidden text-black select-text relative">
                {chromeUrl === "chrome://newtab" ? (
                  <div className="w-full h-full bg-white text-[#222222] flex flex-col items-center justify-center font-sans p-6 select-none">

                    {/* Classic Google Logo */}
                    <img src="/os/LogosGoogle.svg" className="w-[260px] h-auto object-contain mb-6 select-none pointer-events-none" alt="Google" />

                    {/* Search Bar Mock matching design */}
                    <div className="w-full max-w-[560px] h-[48px] bg-white rounded-full border border-gray-200/90 shadow-sm flex items-center justify-between px-5 hover:shadow-md focus-within:shadow-md transition-all mb-8">
                      <div className="flex items-center gap-3.5 flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px] text-gray-500 cursor-pointer hover:text-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Preguntar a Google"
                          className="bg-transparent border-none outline-none text-[#222222] text-[14.5px] flex-1 leading-none font-sans"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const inputVal = (e.target as HTMLInputElement).value;
                              const frameUrl = getChromeIframeUrl(inputVal);
                              setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: frameUrl, title: frameUrl === "chrome://newtab" ? "Nueva pestaña" : frameUrl } : t));
                              setChromeInputUrl(frameUrl);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[17px] h-[17px] text-gray-500 cursor-pointer hover:text-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[17px] h-[17px] text-gray-500 cursor-pointer hover:text-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Grid de Accesos Directos (Pill Style con logos del portafolio) */}
                    <div className="flex flex-col items-center gap-4 w-full max-w-[580px]">
                      <div className="flex flex-wrap justify-center gap-6 w-full">

                        {/* Portafolio Premium */}
                        <div
                          onClick={() => {
                            const target = "https://portafolio-matias-bazan.vercel.app/";
                            setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Premium" } : t));
                            setChromeInputUrl(target);
                          }}
                          className="flex flex-col items-center gap-2 group cursor-pointer transition w-[64px]"
                        >
                          <div className="w-[44px] h-[44px] rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] flex items-center justify-center shadow-sm transition-all">
                            <img src="/os/premium.svg" className="w-6 h-6 object-contain" alt="" />
                          </div>
                          <span className="text-[10px] text-gray-700 font-sans group-hover:text-black leading-tight text-center truncate w-full">Premium</span>
                        </div>

                        {/* Portafolio Tecnológico */}
                        <div
                          onClick={() => {
                            const target = "https://portafolio-matias-bazan-web.vercel.app/";
                            setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Tecnológico" } : t));
                            setChromeInputUrl(target);
                          }}
                          className="flex flex-col items-center gap-2 group cursor-pointer transition w-[64px]"
                        >
                          <div className="w-[44px] h-[44px] rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] flex items-center justify-center shadow-sm transition-all">
                            <img src="/os/logo-desktop.svg" className="w-6 h-6 object-contain" alt="" />
                          </div>
                          <span className="text-[10px] text-gray-700 font-sans group-hover:text-black leading-tight text-center truncate w-full">Tecnológico</span>
                        </div>

                        {/* Currículum */}
                        <div
                          onClick={() => {
                            const target = "/os/cv/CV-Matias-Bazan.pdf";
                            setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Currículum" } : t));
                            setChromeInputUrl(target);
                          }}
                          className="flex flex-col items-center gap-2 group cursor-pointer transition w-[64px]"
                        >
                          <div className="w-[44px] h-[44px] rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center shadow-sm transition-all">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-500">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-gray-700 font-sans group-hover:text-black leading-tight text-center truncate w-full">Currículum</span>
                        </div>

                      </div>
                    </div>

                  </div>
                ) : chromeUrl ? (
                  <iframe
                    src={chromeUrl}
                    className="w-full h-full border-none bg-white"
                    style={{ pointerEvents: isDraggingActive ? "none" : "auto" }}
                    title="Chrome Frame"
                  />
                ) : null}
              </div>
            </div>
          </Rnd>
        )}
      </div>
      {/* ==================== CHIPS DE VENTANAS MINIMIZADAS (libres por toda la pantalla) ==================== */}
      {(Object.keys(openWindows) as string[]).map((appId) => {
        const win = openWindows[appId];
        if (!win.isOpen || !win.isMinimized) return null;

        const labels: Record<string, string> = {
          finder: "Mi CV",
          notes: "Notas",
          terminal: "Terminal",
          chrome: "Chrome",
        };

        return (
          <Rnd
            key={`min-${appId}`}
            position={{ x: win.minimizedPosition.x, y: win.minimizedPosition.y }}
            size={{ width: 170, height: 46 }}
            enableResizing={false}
            dragHandleClassName="minimized-chip-handle"
            onDrag={(e, d) => {
              setOpenWindows(prev => ({
                ...prev,
                [appId]: { ...prev[appId], minimizedPosition: { x: d.x, y: d.y } }
              }));
            }}
            onDragStop={(e, d) => {
              setOpenWindows(prev => ({
                ...prev,
                [appId]: { ...prev[appId], minimizedPosition: { x: d.x, y: d.y } }
              }));
            }}
            style={{ zIndex: 999997 }}
            className="pointer-events-auto"
          >
            <div
              className="minimized-chip-handle liquid-glass rounded-full h-[46px] px-4 flex items-center gap-2.5 shadow-2xl cursor-grab active:cursor-grabbing select-none border border-white/15"
              onDoubleClick={() => focusWindow(appId)}
              title={`Doble clic para restaurar ${labels[appId]}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-white truncate max-w-[110px]">
                {labels[appId]}
              </span>
            </div>
          </Rnd>
        );
      })}

      {/* Zona de detección hover inferior para el Dock cuando una ventana está maximizada */}
      {isAnyAppMaximized && (
        <div
          onMouseEnter={() => setShowDockFullscreen(true)}
          className="fixed bottom-0 left-0 right-0 h-[15px] z-[999998]"
        />
      )}

      {/* 4. DOCK INFERIOR ESTILO macOS CON FRAMER MOTION */}
      <div
        onMouseEnter={() => setShowDockFullscreen(true)}
        onMouseLeave={() => setShowDockFullscreen(false)}
        className={`absolute bottom-[20px] left-[50%] -translate-x-1/2 z-[9999] select-none transition-all duration-300 ease-out ${isAnyAppMaximized && !showDockFullscreen
          ? "translate-y-[150%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
          }`}
      >
        <div className="index-dock-container px-[30px] py-[12px] rounded-[28px] flex items-end gap-[22px] shadow-2xl relative">

          {/* Finder Icon (Abre Finder) */}
          <motion.div
            onClick={() => openApp("finder")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className="w-[52px] h-[52px] flex items-center justify-center cursor-pointer shadow-lg rounded-[14px] overflow-hidden">
              <img src="/os/image.png" className="w-full h-full object-cover" alt="Finder" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Finder
            </span>
            {openWindows.finder.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-10px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Acrobat PDF Icon (Abre Acrobat / CV) */}
          <motion.div
            onClick={() => openApp("acrobat")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className="w-[52px] h-[52px] flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[48px] h-[48px] drop-shadow-lg">
                <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
              </svg>
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Mi CV
            </span>
            {openWindows.acrobat.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-10px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Chrome Icon */}
          <motion.div
            onClick={() => openApp("chrome")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className="w-[52px] h-[52px] bg-white rounded-[14px] flex items-center justify-center cursor-pointer shadow-lg border border-white/5 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-[44px] h-[44px]">
                <path fill="#fff" d="M128.003 199.216c39.335 0 71.221-31.888 71.221-71.223S167.338 56.77 128.003 56.77S56.78 88.658 56.78 127.993s31.887 71.223 71.222 71.223" />
                <path fill="#229342" d="M35.89 92.997Q27.92 79.192 17.154 64.02a127.98 127.98 0 0 0 110.857 191.981q17.671-24.785 23.996-35.74q12.148-21.042 31.423-60.251v-.015a63.993 63.993 0 0 1-110.857.017Q46.395 111.19 35.89 92.998" />
                <path fill="#fbc116" d="M128.008 255.996A127.97 127.97 0 0 0 256 127.997A128 128 0 0 0 238.837 64q-36.372-3.585-53.686-3.585q-19.632 0-57.152 3.585l-.014.01a63.99 63.99 0 0 1 55.444 31.987a63.99 63.99 0 0 1-.001 64.01z" />
                <path fill="#1a73e8" d="M128.003 178.677c27.984 0 50.669-22.685 50.669-50.67s-22.685-50.67-50.67-50.67c-27.983 0-50.669 22.686-50.669 50.67s22.686 50.67 50.67 50.67" />
                <path fill="#e33b2e" d="M128.003 64.004H238.84a127.973 127.973 0 0 0-221.685.015l55.419 95.99l.015.008a63.993 63.993 0 0 1 55.415-96.014z" />
              </svg>
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Chrome
            </span>
            {openWindows.chrome.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-10px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Notes Icon */}
          <motion.div
            onClick={() => openApp("notes")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className="w-[52px] h-[52px] flex items-center justify-center cursor-pointer shadow-lg rounded-[14px] overflow-hidden">
              <img src="/os/notas-apple.png" className="w-full h-full object-cover" alt="Notas" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Notas
            </span>
            {openWindows.notes.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-10px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Terminal Icon */}
          <motion.div
            onClick={() => openApp("terminal")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center cursor-pointer shadow-lg overflow-hidden">
              <img src="/os/terminal.png" className="w-full h-full object-cover" alt="Terminal" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Terminal
            </span>
            {openWindows.terminal.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-10px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

        </div>
      </div>

      {/* 5. CENTRO DE CONTROL LIQUID GLASS (MacBook Neo Exact Layout) */}
      {isControlCenterOpen && (
        <div className="absolute top-[34px] right-[10px] z-[9999999]">
          <LiquidGlass
            cornerRadius={28}
            displacementScale={30}
            blurAmount={0.08}
            saturation={130}
            elasticity={0.25}
          >
            <div className="w-[330px] p-4.5 text-white flex flex-col gap-3.5 text-[12px] font-sans select-none">

              {/* Fila Superior: Pills de Conexión (izq) y Widget Música (der) */}
              <div className="grid grid-cols-2 gap-3.5">

                {/* Pills de Conexión (Wi-Fi, Bluetooth, AirDrop) */}
                <div className="bg-white/10 border border-white/15 rounded-[22px] p-3 flex flex-col gap-2.5 justify-center shadow-sm">
                  {/* Wi-Fi */}
                  <div onClick={() => setWifi(!wifi)} className="flex items-center gap-2.5 cursor-pointer">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition ${wifi ? "bg-[#008FFE] text-white" : "bg-white/10 text-white/60"}`}>
                      📶
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[10.5px] leading-tight">Wi-Fi</span>
                      <span className="text-[9px] text-white/50 leading-none mt-0.5 truncate max-w-[80px]">{wifi ? "HITRON-E050" : "Desactivado"}</span>
                    </div>
                  </div>

                  {/* Bluetooth */}
                  <div onClick={() => setBluetooth(!bluetooth)} className="flex items-center gap-2.5 cursor-pointer">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition ${bluetooth ? "bg-[#008FFE] text-white" : "bg-white/10 text-white/60"}`}>
                      ᛒ
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[10.5px] leading-tight">Bluetooth</span>
                      <span className="text-[9px] text-white/50 leading-none mt-0.5">{bluetooth ? "Activado" : "Desactivado"}</span>
                    </div>
                  </div>

                  {/* AirDrop */}
                  <div className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-[10px]">
                      🌀
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[10.5px] leading-tight">AirDrop</span>
                      <span className="text-[9px] text-white/50 leading-none mt-0.5">Desactivado</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Música + Botones redondos */}
                <div className="flex flex-col gap-3.5">
                  {/* Widget Música */}
                  <div className="bg-white/10 border border-white/15 rounded-[22px] p-3 flex flex-col gap-2 flex-1 justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs shadow-inner">
                        🎵
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[10px] text-white/80 leading-tight">Sin contenido</span>
                        <span className="text-[8.5px] text-white/40 leading-none mt-0.5">Música</span>
                      </div>
                    </div>
                    {/* Controles de reproducción */}
                    <div className="flex justify-center gap-4 text-[13px] text-white/65 mt-1 pb-1">
                      <button className="hover:text-white cursor-pointer transition">⏮</button>
                      <button className="hover:text-white cursor-pointer text-[14px] transition">▶</button>
                      <button className="hover:text-white cursor-pointer transition">⏭</button>
                    </div>
                  </div>

                  {/* Botones redondos chicos (Focus / Mirroring) */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center cursor-pointer text-[14px] border border-white/15 transition shadow-sm">
                      🔲
                    </div>
                    <div className="h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center cursor-pointer text-[14px] border border-white/15 transition shadow-sm">
                      🔘
                    </div>
                  </div>
                </div>

              </div>

              {/* Fila Media: Modo Oscuro, Captura y Modos (Luna) */}
              <div className="grid grid-cols-3 gap-3.5">
                {/* Dark Mode */}
                <div className="h-10 rounded-full bg-white flex items-center justify-center cursor-pointer text-black text-lg transition shadow-md hover:bg-white/95">
                  ◐
                </div>
                {/* Screen Capture */}
                <div className="h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center cursor-pointer text-base text-white transition hover:bg-white/15">
                  📸
                </div>
                {/* Modos Wide Pill */}
                <div className="h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-start gap-2 px-3.5 cursor-pointer border border-white/15 transition shadow-sm">
                  <span className="text-sm">🌙</span>
                  <span className="font-semibold text-[10.5px]">Modos</span>
                </div>
              </div>

              {/* Deslizadores de Pantalla y Sonido */}
              <div className="flex flex-col gap-3.5">
                {/* Pantalla (Brightness) */}
                <div className="bg-white/10 border border-white/15 rounded-[22px] p-3.5 flex flex-col gap-2 shadow-sm">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1 font-sans">Pantalla</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-white/60">🔅</span>
                    <input
                      type="range" min="10" max="100" value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="liquid-slider"
                    />
                    <span className="text-[12px] text-white/60">🔆</span>
                  </div>
                </div>

                {/* Sonido (Volume) */}
                <div className="bg-white/10 border border-white/15 rounded-[22px] p-3.5 flex flex-col gap-2 shadow-sm">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1 font-sans">Sonido</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-white/60">🔈</span>
                    <input
                      type="range" min="0" max="100" value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="liquid-slider"
                    />
                    <span className="text-[12px] text-white/60">🔊</span>
                  </div>
                </div>
              </div>

              {/* Botón inferior Editar Controles */}
              <button className="w-full py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/80 cursor-pointer transition">
                Editar controles
              </button>

            </div>
          </LiquidGlass>
        </div>
      )}

    </div>
  );
}
