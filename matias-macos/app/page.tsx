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
  FileDown,
  Sun,
  SunMedium,
  SunDim,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Wifi,
  Bluetooth
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
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Clock state
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [dayOfWeekShort, setDayOfWeekShort] = useState("Jue");
  const [dayNumber, setDayNumber] = useState(20);

  // Control Center & Menu Bar states
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);
  const [isWifiMenuOpen, setIsWifiMenuOpen] = useState(false);
  const [isBluetoothMenuOpen, setIsBluetoothMenuOpen] = useState(false);

  // OS Screen & Connectivity levels (Datos reales del Mac)
  const [brightness, setBrightness] = useState(90);
  const [wifi, setWifi] = useState(true);
  const [selectedWifiSsid, setSelectedWifiSsid] = useState("HITRON-E050");
  const [availableWifiNetworks, setAvailableWifiNetworks] = useState([
    { ssid: "HITRON-E050", security: "WPA2 Personal", signal: "strong", locked: true, current: true },
    { ssid: "A06 de Matias", security: "WPA2 Personal", signal: "strong", locked: true, current: false },
    { ssid: "PLAZA DIGITAL-5G", security: "WPA3 Personal", signal: "strong", locked: true, current: false },
    { ssid: "ELOY&DANTE", security: "WPA2 Personal", signal: "medium", locked: true, current: false },
    { ssid: "HUAWEI-2.4G-M7gH", security: "WPA2 Personal", signal: "medium", locked: true, current: false },
    { ssid: "TeleRed-A20E-5G", security: "WPA2 Personal", signal: "medium", locked: true, current: false },
  ]);

  const [bluetooth, setBluetooth] = useState(true);
  const [bluetoothDevices, setBluetoothDevices] = useState([
    { id: "dn-n616", name: "DN-N616 (Mouse BLE)", icon: "🖱️", connected: true, battery: "100%", address: "12:DA:BC:88:B9:12" },
    { id: "airpods-mati", name: "AirPods de Matias", icon: "🎧", connected: false, battery: "95%", address: "A4:83:E7:21:40:91" },
    { id: "magic-keyboard", name: "Magic Keyboard", icon: "⌨️", connected: false, battery: "100%", address: "70:A8:D3:1A:E2:04" },
  ]);

  const connectedBtCount = bluetooth ? bluetoothDevices.filter(d => d.connected).length : 0;

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
    calendar: { isOpen: false, isMaximized: false, isMinimized: false, zIndex: 10, position: { x: 200, y: 80 }, size: { width: 880, height: 560 }, minimizedPosition: { x: 160, y: 160 } },
  });

  // Chrome URL & Tabs states (Max 5 Tabs)
  const [chromeTabs, setChromeTabs] = useState<Array<{ id: string; title: string; url: string; iconType: string }>>([
    { id: "tab-1", title: "Nueva pestaña", url: "chrome://newtab", iconType: "chrome" },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");

  const activeTab = chromeTabs.find(t => t.id === activeTabId) || chromeTabs[0];
  const chromeUrl = activeTab ? activeTab.url : "chrome://newtab";
  const [chromeInputUrl, setChromeInputUrl] = useState("chrome://newtab");
  const [isMobileTabSwitcherOpen, setIsMobileTabSwitcherOpen] = useState(false);

  const [showAllShortcuts, setShowAllShortcuts] = useState(false);
  const [showTopBarFullscreen, setShowTopBarFullscreen] = useState(false);
  const [showDockFullscreen, setShowDockFullscreen] = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  const isAnyAppMaximized = (Object.keys(openWindows) as string[]).some(
    appId => openWindows[appId].isOpen && openWindows[appId].isMaximized && !openWindows[appId].isMinimized
  );
  const isAnyAppOpen = (Object.keys(openWindows) as string[]).some(
    appId => openWindows[appId].isOpen && !openWindows[appId].isMinimized
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
  const [mobileNotesView, setMobileNotesView] = useState<"list" | "note">("list");

  // Calendar App State (Apple Calendar Design with Events: Studies & Experience)
  interface CalendarEvent {
    id: string;
    title: string;
    category: "experience" | "education" | "milestone";
    period: string;
    institution: string;
    location: string;
    description: string;
    skills: string[];
    color: string;
    year: number;
    month: number; // 0-11
    day: number;
    logo?: string;
  }

  const calendarEvents: CalendarEvent[] = [
    // 1. 04 Marzo 2022 — UNM
    {
      id: "edu-unm",
      title: "Ingeniería en Electrónica",
      category: "education",
      period: "04 Mar 2022 — 10 Dic 2024",
      institution: "Universidad Nacional de Moreno (UNM)",
      location: "Moreno, Buenos Aires",
      description: "Formación académica universitaria en la Universidad Nacional de Moreno (UNM). Fundamentos de ingeniería, cálculo, física aplicada, lógica computacional en lenguaje C e Introducción a Redes.",
      skills: ["Lenguaje C", "Lógica de Programación", "Fundamentos de Ingeniería", "Redes & Protocolos", "UNM"],
      color: "#FF9500", // Naranja Apple
      year: 2022,
      month: 2, // Marzo (0-indexed = 2)
      day: 4,
      logo: "/os/unm.jpeg"
    },
    // 2. 06 Marzo 2022 — CFP 402 (Inicio)
    {
      id: "edu-cfp402-inicio",
      title: "Inicio: Curso de Programación Integral (10 Meses)",
      category: "education",
      period: "06 Mar 2022 — 12 Dic 2022",
      institution: "C.F.P. N° 402 \"San Juan Diego\" (Moreno, Buenos Aires)",
      location: "Moreno, Buenos Aires",
      description: "Comienzo de la formación profesional intensiva de 10 meses. Aprendizaje de fundamentos sólidos de desarrollo: Algoritmos lógicos con PSeInt (estructuras condicionales y repetitivas), Programación Orientada a Objetos (POO), desarrollo web con HTML, CSS, PHP (GET, POST, PUT, DELETE) y bases de datos relacionales con MySQL (SELECT, INSERT, UPDATE, DELETE, JOINS).",
      skills: ["PSeInt", "Lógica y Algoritmos", "POO", "PHP", "MySQL", "HTML/CSS"],
      color: "#FF9500", // Naranja Apple
      year: 2022,
      month: 2, // Marzo (0-indexed = 2)
      day: 6,
      logo: "/os/cfp402.jpeg"
    },
    // 3. 10 Marzo 2022 — Argentina Programa 4.0
    {
      id: "edu-argentina-programa",
      title: "Argentina Programa 4.0",
      category: "education",
      period: "10 Mar 2022 — 11 Jun 2022",
      institution: "Argentina Programa 4.0 (Ministerio de Economía / Secretaría de Economía del Conocimiento)",
      location: "Online / Argentina",
      description: "Formación intensiva nacional en fundamentos computacionales, lógica algorítmica, estructuras de control, funciones y desarrollo de software básico con enfoque en inserción laboral tecnológica.",
      skills: ["Lógica de Programación", "Algoritmos", "Estructuras de Control", "Desarrollo de Software"],
      color: "#FF9500", // Naranja Apple
      year: 2022,
      month: 2, // Marzo (0-indexed = 2)
      day: 10,
      logo: "/os/argentina_programa4.0.png"
    },
    // 4. 01 Julio 2022 — Platzi Git & GitHub
    {
      id: "edu-platzi-git",
      title: "Curso Profesional de Git y GitHub (22 hs)",
      category: "education",
      period: "Iniciado el 01 de Julio de 2022",
      institution: "Platzi",
      location: "Online",
      description: "Certificación intensiva de 22 horas de teoría y práctica. Dominio avanzado de control de versiones, ramas (branching), merge, rebase, resolución de conflictos, flujos colaborativos en GitHub y gestión profesional de repositorios.",
      skills: ["Git", "GitHub", "Control de Versiones", "Branching Strategies", "CI/CD"],
      color: "#FF9500", // Naranja Apple
      year: 2022,
      month: 6, // Julio (0-indexed = 6)
      day: 1,
      logo: "/os/platzi.jpg"
    },
    // 5. 04 Julio 2022 — Platzi Terminal Linux
    {
      id: "edu-platzi-linux",
      title: "Introducción a la Terminal y Línea de Comandos",
      category: "education",
      period: "Iniciado el 04 de Julio de 2022",
      institution: "Platzi",
      location: "Online",
      description: "Formación de 11 horas de teoría y práctica sobre el entorno Unix/Linux. Navegación en sistemas de archivos, manipulación de permisos, variables de entorno, automatización de tareas y comandos esenciales mediante la terminal.",
      skills: ["Linux", "Terminal", "Bash & Shell", "Línea de Comandos", "CLI"],
      color: "#FF9500",
      year: 2022,
      month: 6, // Julio (0-indexed = 6)
      day: 4,
      logo: "/os/platzi.jpg"
    },
    // 6. 12 Diciembre 2022 — CFP 402 (Egreso)
    {
      id: "edu-cfp402-egreso",
      title: "Egreso y Certificación: Programación Integral",
      category: "education",
      period: "12 de Diciembre de 2022",
      institution: "C.F.P. N° 402 \"San Juan Diego\" (Moreno, Buenos Aires)",
      location: "Moreno, Buenos Aires",
      description: "Finalización y graduación con éxito del Curso de Programación Integral tras 10 meses de cursada continua, consolidando proyectos funcionales en PHP y MySQL con arquitecturas de backend estructuradas.",
      skills: ["PHP Backend", "MySQL Relacional", "CRUD Completo", "PSeInt", "POO"],
      color: "#FF9500",
      year: 2022,
      month: 11, // Diciembre (0-indexed = 11)
      day: 12,
      logo: "/os/cfp402.jpeg"
    },
    // 7. 19 Marzo 2023 — EducaciónIT HTTPS
    {
      id: "edu-educacionit-https",
      title: "Protocolo HTTPS (9 hs)",
      category: "education",
      period: "19 de Marzo de 2023",
      institution: "EducaciónIT",
      location: "Online",
      description: "Capacitación intensiva de 9 horas sobre seguridad en la web: funcionamiento del protocolo TLS/SSL, cifrado asimétrico/simétrico, certificados digitales y comunicación segura entre clientes y servidores.",
      skills: ["HTTPS", "TLS/SSL", "Seguridad Web", "Criptografía", "Certificados Digitales"],
      color: "#FF9500", // Naranja Apple
      year: 2023,
      month: 2, // Marzo (0-indexed = 2)
      day: 19,
      logo: "/os/educacionit.jpeg"
    },
    // 8. 25 Marzo 2023 — EducaciónIT Mundo Web
    {
      id: "edu-educacionit-web",
      title: "Introducción al Mundo Web (12 hs)",
      category: "education",
      period: "25 de Marzo de 2023",
      institution: "EducaciónIT",
      location: "Online",
      description: "Formación de 12 horas sobre arquitectura de Internet, modelo cliente-servidor, DNS, protocolos HTTP/HTTPS, hosting, dominios y estructura fundamental de aplicaciones web.",
      skills: ["Arquitectura Web", "Cliente-Servidor", "DNS & Hosting", "HTTP/HTTPS", "Internet"],
      color: "#FF9500",
      year: 2023,
      month: 2, // Marzo (0-indexed = 2)
      day: 25,
      logo: "/os/educacionit.jpeg"
    },
    // 9. Marzo 2025 — FLUiDevs (Freelance)
    {
      id: "exp-freelance",
      title: "Programador Full Stack — FLUiDevs",
      category: "experience",
      period: "2025 — Actualidad",
      institution: "FLUiDevs (Freelance / Independiente)",
      location: "Remoto / Argentina",
      description: "Desarrollo e implementación de soluciones completas de software bajo la marca FLUiDevs, con enfoque especializado en paneles de administración, lógica de backend con Node.js, ExpressJS y Prisma ORM, arquitectura de datos en PostgreSQL modelada en DrawDB y aplicaciones web/móviles con Flutter bajo metodología Spec Driven Development (Spec Kit).",
      skills: ["FLUiDevs", "Flutter", "Node.js", "ExpressJS", "Prisma ORM", "PostgreSQL", "Spec Driven Development", "DrawDB"],
      color: "#007AFF", // Azul Apple
      year: 2025,
      month: 2, // Marzo
      day: 1,
      logo: "/os/fluidevs-64.svg"
    },
    // 11. 01 Julio 2025 — Plaza Digital Flutter
    {
      id: "edu-plaza-flutter",
      title: "Programación en Flutter",
      category: "education",
      period: "01 Jul 2025 — 15 Dic 2025",
      institution: "Plaza Digital Moreno",
      location: "Moreno, Buenos Aires",
      description: "Formación completa en desarrollo multiplataforma con Flutter y Dart. Arquitectura de software, manejo de estado, integración de servicios REST y despliegue exitoso del proyecto final en Vercel.",
      skills: ["Flutter", "Dart", "Vercel", "Mobile & Web", "State Management"],
      color: "#FF9500",
      year: 2025,
      month: 6, // Julio (0-indexed = 6)
      day: 1,
      logo: "/os/plazadigital.jpeg"
    },
    // 12. 14 Febrero 2026 — Plaza Digital Diseño Gráfico
    {
      id: "edu-plaza-dg",
      title: "Diseño Gráfico Profesional",
      category: "education",
      period: "14 Feb 2026 — 25 Jul 2026",
      institution: "Plaza Digital Moreno",
      location: "Moreno, Buenos Aires",
      description: "Especialización integral en construcción de identidad visual, desarrollo de briefs de producto, moodboards conceptuales, tipografías, teoría del color, diseño de packaging y creación de marcas desde cero.",
      skills: ["Figma", "Identidad Visual", "Tipografía", "Packaging", "Diseño de Marca"],
      color: "#FF9500",
      year: 2026,
      month: 1, // Febrero (0-indexed = 1)
      day: 14,
      logo: "/os/plazadigital.jpeg"
    },
    // 13. 20 Agosto 2026 — Portafolio macOS Tahoe
    {
      id: "milestone-portafolio",
      title: "Lanzamiento macOS Tahoe Portfolio",
      category: "milestone",
      period: "2026",
      institution: "Proyecto Personal",
      location: "Web Global",
      description: "Diseño y desarrollo del sistema operativo virtual interactivo inspirado en macOS Tahoe 26, optimizado con simulación de ventanas, terminal Unix, explorador Finder e integración en Vercel.",
      skills: ["Next.js", "React 19", "Tailwind CSS", "react-rnd", "Framer Motion"],
      color: "#34C759", // Verde Apple
      year: 2026,
      month: 7, // Agosto
      day: 20
    }
  ];

  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(calendarEvents[0]);
  const [calendarViewMode, setCalendarViewMode] = useState<"year" | "month" | "timeline" | "week" | "day">("year");
  const [calendarYear, setCalendarYear] = useState(2022);
  const [calendarMonth, setCalendarMonth] = useState(2); // Marzo 2022 (0-indexed)
  const [calendarFilter, setCalendarFilter] = useState<"all" | "experience" | "education">("all");
  const [calendarSearch, setCalendarSearch] = useState("");
  const [isCalendarSearchOpen, setIsCalendarSearchOpen] = useState(false);

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

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        }).catch(() => {
          // Ignorar si el navegador restringe la API de batería
        });
      }

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  // Gesture listener: Swipe down from top on mobile to open Control Center (Brillo y Volumen)
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchEndY - touchStartY;
      const diffX = Math.abs(touchEndX - touchStartX);

      // If swipe started in top 120px of screen and dragged down > 40px
      if (touchStartY < 120 && diffY > 40 && diffY > diffX) {
        setIsControlCenterOpen(true);
        setIsAppleMenuOpen(false);
      }
      
      // If control center is open and user swipes up, close it
      if (diffY < -40 && diffY < -diffX) {
        setIsControlCenterOpen(false);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
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
      setDayOfWeekShort(days[date.getDay()]);
      setDayNumber(date.getDate());

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

  // Push history state to intercept Android / Mobile physical Back button (◀)
  const pushMobileHistory = (type: string, id?: string) => {
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ modalType: type, id, timestamp: Date.now() }, "");
      } catch (err) {
        // ignore
      }
    }
  };

  // Intercept Mobile / Android Physical Back Button (Volver Atrás)
  useEffect(() => {
    const handlePopState = () => {
      // 1. If Tab Switcher inside Chrome mobile is open, close it first
      if (isMobileTabSwitcherOpen) {
        setIsMobileTabSwitcherOpen(false);
        return;
      }

      // 2. If Control Center is open, close it
      if (isControlCenterOpen) {
        setIsControlCenterOpen(false);
        return;
      }

      // 3. If Menus (Apple, WiFi, Bluetooth) are open, close them
      if (isAppleMenuOpen || isWifiMenuOpen || isBluetoothMenuOpen) {
        setIsAppleMenuOpen(false);
        setIsWifiMenuOpen(false);
        setIsBluetoothMenuOpen(false);
        return;
      }

      // 4. If any App window is open on mobile, close the active / topmost app and return to Desktop
      const openKeys = (Object.keys(openWindows) as string[]).filter(k => openWindows[k].isOpen);
      if (openKeys.length > 0) {
        const topApp = openKeys.reduce((a, b) => openWindows[a].zIndex >= openWindows[b].zIndex ? a : b);
        closeApp(topApp);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobileTabSwitcherOpen, isControlCenterOpen, isAppleMenuOpen, isWifiMenuOpen, isBluetoothMenuOpen, openWindows]);

  // Open Window Action
  const openApp = (appId: string) => {
    const nextZIndex = maxZIndex + 1;
    setMaxZIndex(nextZIndex);
    setActiveWindow(appId);
    if (isMobile) {
      pushMobileHistory("app", appId);
    }
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
    if (appId === "chrome") {
      setIsMobileTabSwitcherOpen(false);
    }
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
    <div
      className="relative w-full h-full min-h-screen overflow-hidden select-none bg-[#0d1117] text-white transition-[filter] duration-150"
      style={{ filter: `brightness(${brightness}%)` }}
    >

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
        className={`absolute top-0 left-0 w-full h-[28px] bg-[#000000]/75 backdrop-blur-2xl flex items-center justify-between px-3 text-[13px] font-normal z-[999999] shadow-sm select-none text-white/90 border-b border-black/45 transition-all duration-300 ease-out ${(isMobile && isAnyAppOpen) || (isAnyAppMaximized && !showTopBarFullscreen) ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
          }`}
      >

        {/* Lado Izquierdo: Menú Apple + Apps */}
        <div className="flex items-center gap-2 relative">

          {/* Manzana Apple */}
          <div className="relative">
            <span
              onClick={() => { setIsAppleMenuOpen(!isAppleMenuOpen); setIsControlCenterOpen(false); }}
              className="cursor-pointer hover:bg-white/15 px-2.5 py-0.5 rounded transition-all duration-150 text-[15px] font-bold text-white"
            >
              
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

          {/* Nombre de la Aplicación Activa (Negrita) — oculto en mobile */}
          {!isMobile && (
            <span className="font-bold cursor-pointer hover:bg-white/15 px-2.5 py-0.5 rounded text-white">
              {activeWindow === "chrome" ? "Chrome" : activeWindow === "finder" ? "Finder" : activeWindow === "terminal" ? "Terminal" : "Finder"}
            </span>
          )}
        </div>

        {/* Lado Derecho: Estado, Red, Hora */}
        <div className="flex items-center gap-2 relative">

          {/* Icono de Wi-Fi */}
          <div className="relative">
            <span
              onClick={() => {
                setIsWifiMenuOpen(!isWifiMenuOpen);
                setIsBluetoothMenuOpen(false);
                setIsControlCenterOpen(false);
                setIsAppleMenuOpen(false);
              }}
              className="cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded flex items-center transition-all duration-150"
              title="Wi-Fi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-[14px] h-[14px] ${wifi ? "text-white" : "text-white/40"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.53 16.11a6 6 0 0 1 6.95 0M4.93 12.5a10 10 0 0 1 14.14 0M1.34 8.89a14 14 0 0 1 21.32 0M12 20h.01" />
              </svg>
            </span>

            {/* Dropdown de Wi-Fi Interactivo */}
            {isWifiMenuOpen && (
              <div className="fixed top-8 left-2 right-2 sm:left-auto sm:right-0 sm:absolute sm:top-7 z-[9999999] bg-[#1a1c23]/92 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 text-white flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150 sm:w-72 max-w-[calc(100vw-16px)]">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${wifi ? "bg-[#007AFF] text-white" : "bg-white/10 text-white/50"}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.53 16.11a6 6 0 0 1 6.95 0M4.93 12.5a10 10 0 0 1 14.14 0M1.34 8.89a14 14 0 0 1 21.32 0M12 20h.01" /></svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold">Wi-Fi</div>
                      <div className="text-[10px] text-white/50">{wifi ? selectedWifiSsid : "Desactivado"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setWifi(!wifi)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${wifi ? "bg-[#34C759]" : "bg-white/20"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${wifi ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>

                {wifi ? (
                  <div className="pt-2 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-1">Redes disponibles</div>
                    {availableWifiNetworks.map(net => {
                      const isConnected = selectedWifiSsid === net.ssid;
                      return (
                        <div
                          key={net.ssid}
                          onClick={() => setSelectedWifiSsid(net.ssid)}
                          className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                            isConnected ? "bg-white/15 border border-white/20" : "hover:bg-white/10 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${isConnected ? "text-[#34C759]" : "text-transparent"}`}>✓</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-white/90">{net.ssid}</span>
                              <span className="text-[9.5px] text-white/40">{net.security}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-white/60">
                            {net.locked && (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/40"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                            )}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.53 16.11a6 6 0 0 1 6.95 0M4.93 12.5a10 10 0 0 1 14.14 0M1.34 8.89a14 14 0 0 1 21.32 0M12 20h.01" /></svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-white/40">
                    El Wi-Fi está apagado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icono de Bluetooth */}
          <div className="relative">
            <span
              onClick={() => {
                setIsBluetoothMenuOpen(!isBluetoothMenuOpen);
                setIsWifiMenuOpen(false);
                setIsControlCenterOpen(false);
                setIsAppleMenuOpen(false);
              }}
              className="cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded flex items-center transition-all duration-150"
              title="Bluetooth"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-[14px] h-[14px] ${bluetooth ? "text-white" : "text-white/40"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m7 7 10 10-5 5V2l5 5L7 17" />
              </svg>
            </span>

            {/* Dropdown de Bluetooth */}
            {isBluetoothMenuOpen && (
              <div className="fixed top-8 left-2 right-2 sm:left-auto sm:right-0 sm:absolute sm:top-7 z-[9999999] bg-[#1a1c23]/92 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 text-white flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150 sm:w-72 max-w-[calc(100vw-16px)]">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${bluetooth ? "bg-[#007AFF] text-white" : "bg-white/10 text-white/50"}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m7 7 10 10-5 5V2l5 5L7 17" /></svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold">Bluetooth</div>
                      <div className="text-[10px] text-white/50">{bluetooth ? `${connectedBtCount} conectados` : "Desactivado"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setBluetooth(!bluetooth)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${bluetooth ? "bg-[#34C759]" : "bg-white/20"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${bluetooth ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>

                {bluetooth ? (
                  <div className="pt-2 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-1">Dispositivos conocidos</div>
                    {bluetoothDevices.map(dev => (
                      <div
                        key={dev.id}
                        onClick={() => {
                          setBluetoothDevices(prev => prev.map(d => d.id === dev.id ? { ...d, connected: !d.connected } : d));
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm">{dev.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white/90">{dev.name}</span>
                            <span className="text-[9.5px] text-white/40">Batería: {dev.battery}</span>
                          </div>
                        </div>
                        <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${dev.connected ? "bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30" : "text-white/40 bg-white/5"}`}>
                          {dev.connected ? "Conectado" : "Conectar"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-white/40">
                    Bluetooth desactivado
                  </div>
                )}
              </div>
            )}
          </div>

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

          {/* Centro de Control de macOS */}
          <div className="relative">
            <span
              onClick={() => {
                setIsControlCenterOpen(!isControlCenterOpen);
                setIsAppleMenuOpen(false);
                setIsWifiMenuOpen(false);
                setIsBluetoothMenuOpen(false);
              }}
              className={`cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded flex items-center transition-all duration-150 ${isControlCenterOpen ? "bg-white/20" : ""}`}
              title="Centro de Control"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>

            {/* Dropdown del Centro de Control Completo estilo Apple Sequoia / iOS */}
            {isControlCenterOpen && (
              <div className="fixed top-8 left-2 right-2 sm:left-auto sm:right-0 sm:absolute sm:top-7 z-[9999999] bg-[#1a1c23]/95 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl p-3.5 text-white flex flex-col gap-3 font-sans animate-in fade-in zoom-in-95 duration-150 select-none sm:w-80 max-w-[calc(100vw-16px)]">
                
                {/* Pull indicator / handle para deslizar o cerrar en móvil */}
                {isMobile && (
                  <div
                    onClick={() => setIsControlCenterOpen(false)}
                    className="w-10 h-1 bg-white/30 rounded-full mx-auto -mt-0.5 mb-1 cursor-pointer active:opacity-60 transition"
                    title="Deslizar arriba para cerrar"
                  />
                )}

                {/* Cuadrícula Superior de Conectividad (Wi-Fi y Bluetooth) */}
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Wi-Fi Tile */}
                  <div
                    onClick={() => setWifi(!wifi)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      wifi ? "bg-[#007AFF] border-[#007AFF] text-white shadow-md shadow-blue-500/25" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wifi ? "bg-white/20" : "bg-white/10"}`}>
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-xs font-bold leading-tight">Wi-Fi</div>
                      <div className="text-[10px] opacity-80 truncate">{wifi ? selectedWifiSsid : "Desactivado"}</div>
                    </div>
                  </div>

                  {/* Bluetooth Tile */}
                  <div
                    onClick={() => setBluetooth(!bluetooth)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      bluetooth ? "bg-[#007AFF] border-[#007AFF] text-white shadow-md shadow-blue-500/25" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bluetooth ? "bg-white/20" : "bg-white/10"}`}>
                      <Bluetooth className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs font-bold leading-tight">Bluetooth</div>
                      <div className="text-[10px] opacity-80">{bluetooth ? `${connectedBtCount} conectados` : "Desactivado"}</div>
                    </div>
                  </div>
                </div>

                {/* Control Deslizante de Brillo de Pantalla con Iconos Lucide */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col gap-2 shadow-inner">
                  <div className="flex justify-between items-center text-[11px] font-medium text-white/80">
                    <span className="flex items-center gap-1.5 font-semibold text-white/90">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Brillo de Pantalla</span>
                    </span>
                    <span className="font-mono text-white/60">{brightness}%</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <SunDim className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-amber-400 h-2 bg-white/20 rounded-lg cursor-pointer transition-all"
                    />
                    <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Fecha y Hora en tiempo real */}
          <span className="cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded select-none font-normal text-white/95 text-xs sm:text-[13px]">
            {isMobile ? currentTime : `${currentDate}  ${currentTime}`}
          </span>
        </div>
      </div>

      {/* Cierre de dropdowns al hacer click en el escritorio */}
      <div
        className="absolute inset-0 z-[1]"
        onClick={() => {
          setIsControlCenterOpen(false);
          setIsAppleMenuOpen(false);
          setIsWifiMenuOpen(false);
          setIsBluetoothMenuOpen(false);
        }}
      />

      {/* 2. COLUMNA DE WIDGETS DE ESCRITORIO (Lado Izquierdo) — ocultar en mobile */}
      <div className={`absolute top-[48px] left-[24px] z-[5] flex flex-col gap-4 select-none pointer-events-auto ${isMobile ? "hidden" : ""}`}>

        {/* Widget 1: Calendario (Abre App Calendario) */}
        <div
          onClick={() => openApp("calendar")}
          className="w-[145px] h-[145px] liquid-glass rounded-[24px] p-3 text-black flex flex-col justify-between font-sans shadow-lg cursor-pointer hover:scale-[1.03] transition-all group"
          title="Abrir Calendario"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-red-600 tracking-wider">AGOSTO</span>
              <span className="text-[8px] font-semibold text-black/40 group-hover:text-red-500 transition">Ver ↗</span>
            </div>
            <div className="grid grid-cols-7 text-[8px] font-bold text-black/55 text-center mt-1">
              <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
            <div className="grid grid-cols-7 text-[9px] font-medium text-black/90 text-center gap-y-1 mt-1">
              <span className="text-black/30">3</span><span className="text-black/30">4</span><span className="text-black/30">5</span><span className="text-black/30">6</span><span className="text-black/30">7</span><span>1</span><span>2</span>
              <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span>
              <span>17</span><span>18</span><span>19</span>
              {/* Resaltamos el día actual con fondo blanco */}
              <span className="bg-white text-black font-bold rounded-full flex items-center justify-center w-4 h-4 mx-auto shadow-sm">{dayNumber}</span>
              <span>21</span><span>22</span><span>23</span>
              <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
              <span>31</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ICONOS DEL ESCRITORIO (Derecha) — ocultar en mobile */}
      <div className={`absolute top-[48px] right-[24px] z-[5] flex flex-col gap-5 items-center select-none text-center ${isMobile ? "hidden" : ""}`}>

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
      <div className={`absolute inset-0 ${isMobile && isAnyAppOpen ? "z-[999999]" : "z-[10]"} pointer-events-none select-none`}>

        {/* ==================== APLICACIÓN: ADOBE ACROBAT (CV) ==================== */}
        {openWindows.acrobat && openWindows.acrobat.isOpen && !openWindows.acrobat.isMinimized && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.acrobat.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.acrobat.size.width, height: openWindows.acrobat.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.acrobat.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.acrobat.position.x, y: openWindows.acrobat.position.y }}
            onDragStart={() => setIsDraggingActive(true)}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.acrobat.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                acrobat: {
                  ...prev.acrobat,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.acrobat.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                acrobat: {
                  ...prev.acrobat,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 300}
            minHeight={isMobile ? 0 : 200}
            cancel=".window-control-buttons, input, iframe, button, a, .ios-action-btn"
            enableResizing={isMobile || openWindows.acrobat.isMaximized ? false : {
              top: !openWindows.acrobat.isMaximized,
              right: !openWindows.acrobat.isMaximized,
              bottom: !openWindows.acrobat.isMaximized,
              left: !openWindows.acrobat.isMaximized,
              topRight: !openWindows.acrobat.isMaximized,
              bottomRight: !openWindows.acrobat.isMaximized,
              bottomLeft: !openWindows.acrobat.isMaximized,
              topLeft: !openWindows.acrobat.isMaximized,
            }}
            disableDragging={isMobile || openWindows.acrobat.isMaximized}
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
            className={`absolute ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "liquid-glass rounded-2xl border border-white/10 shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.acrobat.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#1c1c1e]">
              {/* Header: iOS Nav Bar en mobile vs macOS Window Header en Desktop */}
              {isMobile ? (
                <div className="h-[50px] ios-nav-blur border-b border-white/10 flex items-center justify-between px-3.5 shrink-0 select-none text-white z-20">
                  <button
                    onClick={(e) => closeApp("acrobat", e)}
                    className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                  >
                    <span className="text-xl leading-none">‹</span>
                    <span>Inicio</span>
                  </button>
                  <div className="flex items-center gap-1.5 max-w-[55%] truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[15px] h-[15px] shrink-0">
                      <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                      <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
                    </svg>
                    <span className="text-[14.5px] font-semibold text-white truncate">CV Matias Bazan</span>
                  </div>
                  <button
                    onClick={(e) => closeApp("acrobat", e)}
                    className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <div className="window-header h-[46px] bg-[#2d2d2d] border-b border-black/30 flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none text-white shrink-0">
                  {/* Botones de control estilo macOS */}
                  <div className="flex gap-2 items-center window-control-buttons">
                    <div onClick={(e) => closeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                    <div onClick={(e) => minimizeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                    <div onClick={(e) => toggleMaximizeApp("acrobat", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                  </div>
                  <div className="flex items-center gap-2 max-w-[60%] sm:max-w-[80%] truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[18px] h-[18px] shrink-0">
                      <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                      <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
                    </svg>
                    <span className="text-[12px] sm:text-[13px] font-semibold text-white/90 truncate">CV_Matias_Bazan.pdf</span>
                  </div>
                  <div className="w-[30px] sm:w-[60px]" /> {/* Spacer */}
                </div>
              )}

              {/* Cuerpo del PDF */}
              <div className="flex flex-1 overflow-hidden bg-white">
                <iframe
                  src="/os/cv/CV-Matias-Bazan.pdf"
                  className="w-full h-full border-none"
                  style={{ pointerEvents: isDraggingActive ? "none" : "auto" }}
                  title="CV Matias Bazan"
                />
              </div>

              {/* iOS Home Indicator Bar en Mobile */}
              {isMobile && (
                <div
                  onClick={(e) => closeApp("acrobat", e)}
                  className="h-[22px] bg-[#1c1c1e] flex items-center justify-center cursor-pointer shrink-0 active:opacity-60 transition"
                  title="Deslizar para ir a Inicio"
                >
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              )}
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: FINDER (Apple File Explorer / iOS Files) ==================== */}
        {openWindows.finder && openWindows.finder.isOpen && !openWindows.finder.isMinimized && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.finder.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.finder.size.width, height: openWindows.finder.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.finder.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.finder.position.x, y: openWindows.finder.position.y }}
            onDragStart={() => setIsDraggingActive(true)}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.finder.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                finder: {
                  ...prev.finder,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.finder.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                finder: {
                  ...prev.finder,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 450}
            minHeight={isMobile ? 0 : 300}
            cancel=".window-control-buttons, input, .sidebar-link, button, a, .finder-draggable-item, .ios-action-btn"
            enableResizing={isMobile || openWindows.finder.isMaximized ? false : {
              top: !openWindows.finder.isMaximized,
              right: !openWindows.finder.isMaximized,
              bottom: !openWindows.finder.isMaximized,
              left: !openWindows.finder.isMaximized,
              topRight: !openWindows.finder.isMaximized,
              bottomRight: !openWindows.finder.isMaximized,
              bottomLeft: !openWindows.finder.isMaximized,
              topLeft: !openWindows.finder.isMaximized,
            }}
            disableDragging={isMobile || openWindows.finder.isMaximized}
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
            className={`absolute ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "liquid-glass rounded-2xl border border-white/10 shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none text-white font-sans transition-all duration-300 ${openWindows.finder.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#181a20] text-white overflow-hidden relative">

              {/* Toolbar del Finder: iOS Nav Bar en Mobile vs macOS Header en Desktop */}
              {isMobile ? (
                <div className="ios-nav-blur border-b border-white/10 flex flex-col px-3.5 pt-2 pb-2 shrink-0 select-none z-20 gap-2">
                  <div className="h-[38px] flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        if (finderHistoryIndex > 0) {
                          navigateFinderBack();
                        } else {
                          closeApp("finder", e);
                        }
                      }}
                      className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                    >
                      <span className="text-xl leading-none">‹</span>
                      <span>{finderHistoryIndex > 0 ? "Atrás" : "Inicio"}</span>
                    </button>
                    <span className="text-[15px] font-semibold text-white truncate max-w-[55%]">
                      {finderPath.replace("~", "Archivos").split("/").pop()}
                    </span>
                    <button
                      onClick={(e) => closeApp("finder", e)}
                      className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                    >
                      Listo
                    </button>
                  </div>

                  {/* iOS Search Bar */}
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar en Archivos"
                      value={finderSearch}
                      onChange={(e) => setFinderSearch(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:bg-white/15 transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="window-header h-[52px] bg-[#1c1f26] border-b border-white/5 flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-2 sm:gap-5">
                    {/* Botones de control macOS */}
                    <div className="flex gap-2 items-center window-control-buttons">
                      <div onClick={(e) => closeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                      <div onClick={(e) => minimizeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                      <div onClick={(e) => toggleMaximizeApp("finder", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                    </div>

                    {/* Botones de Navegación Atrás / Adelante */}
                    <div className="flex gap-0.5 sm:gap-1 items-center font-sans">
                      <button
                        onClick={navigateFinderBack}
                        disabled={finderHistoryIndex <= 0}
                        className="p-1 rounded hover:bg-white/10 transition cursor-pointer text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={navigateFinderForward}
                        disabled={finderHistoryIndex >= finderHistory.length - 1}
                        className="p-1 rounded hover:bg-white/10 transition cursor-pointer text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Título de la Carpeta Actual */}
                    <span className="text-[13px] sm:text-[14px] font-bold text-white/90 truncate max-w-[90px] sm:max-w-[200px]">
                      {finderPath.replace("~", "Home").split("/").pop()}
                    </span>
                  </div>

                  {/* Controles de vista del Finder */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Grupo selector de layouts */}
                    <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-lg p-0.5 items-center">
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

                    {/* Input de Búsqueda */}
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Buscar"
                        value={finderSearch}
                        onChange={(e) => setFinderSearch(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition w-[70px] sm:w-[110px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido Principal de Finder */}
              <div className="flex-1 flex overflow-hidden">

                {/* Sidebar Izquierda (Categorías de macOS) */}
                <div className="w-[100px] sm:w-[185px] bg-[#121419]/70 border-r border-white/5 p-2 sm:p-2.5 flex flex-col gap-3 sm:gap-4.5 shrink-0 select-none overflow-y-auto">

                  {/* Favoritos */}
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-bold text-white/25 uppercase tracking-wider px-1 sm:px-2 block mb-1">Favoritos</span>
                    <div className="flex flex-col gap-0.5">
                      <div
                        onClick={() => navigateToFinderFolder("~/Desktop")}
                        className={`sidebar-link flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[12.5px] transition cursor-pointer ${finderPath === "~/Desktop" ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Monitor className="w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Escritorio</span>
                      </div>
                      <div
                        onClick={() => navigateToFinderFolder("~/Documents")}
                        className={`sidebar-link flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[12.5px] transition cursor-pointer ${finderPath.startsWith("~/Documents") && !finderPath.includes("Proyectos") ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <FileText className="w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Documentos</span>
                      </div>
                      <div
                        onClick={() => navigateToFinderFolder("~")}
                        className="sidebar-link flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[12.5px] text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
                      >
                        <FileDown className="w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">Descargas</span>
                      </div>
                    </div>
                  </div>

                  {/* Ubicaciones */}
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-bold text-white/25 uppercase tracking-wider px-1 sm:px-2 block mb-1">Ubicaciones</span>
                    <div className="flex flex-col gap-0.5">
                      <div
                        onClick={() => navigateToFinderFolder("~")}
                        className={`sidebar-link flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[12.5px] transition cursor-pointer ${finderPath === "~" ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <HomeIcon className="w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] text-[#0a84ff] shrink-0" />
                        <span className="truncate">matybazan</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Panel de Archivos (Grid de macOS) */}
                <div className="flex-1 flex flex-col bg-[#181a20] overflow-hidden p-2 sm:p-5 select-none">

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
                      <div className="w-full flex flex-col font-sans text-[12px] sm:text-[12.5px] select-none text-white/95">
                        <div className="flex border-b border-white/10 pb-2 mb-2 px-2 text-white/40 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
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

                              const openItem = () => {
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
                              };

                              return (
                                <div
                                  key={name}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFileName(name);
                                    if (isMobile) openItem();
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    openItem();
                                  }}
                                  className={`flex py-2 px-2 rounded-md cursor-pointer transition items-center text-xs sm:text-sm ${isSelected ? "bg-[#2563eb]/30 text-white font-medium shadow-sm" : "hover:bg-white/5 text-white/80"
                                    }`}
                                >
                                  <div className="w-1/2 flex items-center gap-2 truncate">
                                    <span className="text-[14px] sm:text-[15px]">{isFolder ? "📁" : isPdf ? "📄" : isChromeShortcut ? "🌐" : "📄"}</span>
                                    <span className="truncate">{name}</span>
                                  </div>
                                  <span className="w-1/4 text-white/40 truncate text-[11px]">{kind}</span>
                                  <span className="w-1/4 text-white/40 text-[11px]">{isFolder ? "--" : "4 KB"}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      /* Grid View Mode */
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 p-1 sm:p-2">
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

                            const openItem = () => {
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
                            };

                            return (
                              <motion.div
                                drag={!isMobile}
                                dragConstraints={finderGridRef}
                                dragElastic={0.08}
                                dragMomentum={false}
                                whileDrag={{ scale: 1.05, zIndex: 99, cursor: "grabbing" }}
                                key={name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileName(name);
                                  if (isMobile) openItem();
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  openItem();
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

              {/* iOS Bottom Tab Bar & Home Indicator en Mobile */}
              {isMobile ? (
                <div className="ios-nav-blur border-t border-white/10 flex flex-col shrink-0 select-none z-20">
                  <div className="h-[48px] flex items-center justify-around px-2">
                    <button
                      onClick={() => navigateToFinderFolder("~/Documents")}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${finderPath.startsWith("~/Documents") && !finderPath.includes("Proyectos") && !finderPath.includes("CV") ? "text-[#007AFF]" : "text-white/50"}`}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Documentos</span>
                    </button>
                    <button
                      onClick={() => navigateToFinderFolder("~/Documents/Proyectos")}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${finderPath.includes("Proyectos") ? "text-[#007AFF]" : "text-white/50"}`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <span>Proyectos</span>
                    </button>
                    <button
                      onClick={() => navigateToFinderFolder("~/Documents/CV")}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${finderPath.includes("CV") ? "text-[#007AFF]" : "text-white/50"}`}
                    >
                      <FileDown className="w-5 h-5" />
                      <span>Mi CV</span>
                    </button>
                  </div>
                  {/* Home Indicator */}
                  <div
                    onClick={(e) => closeApp("finder", e)}
                    className="h-[20px] flex items-center justify-center cursor-pointer active:opacity-60 transition"
                  >
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
                  </div>
                </div>
              ) : null}

            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: NOTAS (Carta de Presentación / iOS Notes) ==================== */}
        {openWindows.notes.isOpen && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.notes.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.notes.size.width, height: openWindows.notes.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.notes.isMaximized ? { x: 0, y: 0 } : { x: openWindows.notes.position.x, y: openWindows.notes.position.y }}
            onDrag={(e, d) => {
              if (openWindows.notes.isMaximized || isMobile) return;
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
              if (openWindows.notes.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                notes: {
                  ...prev.notes,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.notes.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                notes: {
                  ...prev.notes,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 300}
            minHeight={isMobile ? 0 : 200}
            cancel=".window-control-buttons, input, iframe, button, a, .ios-action-btn"
            enableResizing={isMobile || openWindows.notes.isMaximized ? false : {
              top: !openWindows.notes.isMaximized,
              right: !openWindows.notes.isMaximized,
              bottom: !openWindows.notes.isMaximized,
              left: !openWindows.notes.isMaximized,
              topRight: !openWindows.notes.isMaximized,
              bottomRight: !openWindows.notes.isMaximized,
              bottomLeft: !openWindows.notes.isMaximized,
              topLeft: !openWindows.notes.isMaximized,
            }}
            disableDragging={isMobile || openWindows.notes.isMaximized}
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
            className={`absolute ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "liquid-glass rounded-2xl border border-white/10 shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.notes.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#1e1e1f] text-white font-sans overflow-hidden">
              {/* Header: iOS Nav Bar en mobile vs macOS Header en Desktop */}
              {isMobile ? (
                <div className="h-[50px] ios-nav-blur border-b border-white/10 flex items-center justify-between px-3.5 shrink-0 select-none z-20">
                  {mobileNotesView === "note" ? (
                    <button
                      onClick={() => setMobileNotesView("list")}
                      className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                    >
                      <span className="text-xl leading-none">‹</span>
                      <span>Notas</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => closeApp("notes", e)}
                      className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                    >
                      <span className="text-xl leading-none">‹</span>
                      <span>Inicio</span>
                    </button>
                  )}
                  <span className="text-[15px] font-semibold text-white truncate max-w-[55%]">
                    {mobileNotesView === "note" ? (notesList.find(n => n.id === activeNoteId)?.title || "Nota") : "Notas"}
                  </span>
                  <button
                    onClick={(e) => closeApp("notes", e)}
                    className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <div className="window-header h-[50px] bg-[#1e1e1f] border-b border-white/10 flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-3">
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
                    <button
                      onClick={() => {
                        handleCreateNote();
                      }}
                      className="hover:text-white transition cursor-pointer"
                      title="Nueva Nota"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Layout de 3 columnas de Apple Notes de macOS */}
              <div className="flex-1 flex overflow-hidden">
                {/* Columna 1: Carpetas (Oculta en mobile) */}
                {showNotesSidebar && !isMobile && (
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
                <div className={`${isMobile && mobileNotesView === "note" ? "hidden" : "w-full"} sm:w-[220px] bg-[#232324] border-r border-white/5 p-2 flex flex-col gap-1 shrink-0 overflow-y-auto select-none`}>
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
                          onClick={() => {
                            setActiveNoteId(note.id);
                            if (isMobile) setMobileNotesView("note");
                          }}
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
                    <div className={`${isMobile && mobileNotesView === "list" ? "hidden" : "flex-1"} bg-[#1c1c1e] p-4 sm:p-8 overflow-y-auto text-[13px] sm:text-[13.5px] text-white/90 font-sans leading-relaxed select-text flex flex-col`}>
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

              {/* iOS Bottom Notes Bar & Home Indicator en Mobile */}
              {isMobile ? (
                <div className="ios-nav-blur border-t border-white/10 flex flex-col shrink-0 select-none z-20">
                  <div className="h-[44px] flex items-center justify-between px-4">
                    <span className="text-[12px] text-white/50 font-sans">
                      {notesList.length} {notesList.length === 1 ? "nota" : "notas"}
                    </span>
                    <button
                      onClick={() => {
                        handleCreateNote();
                        setMobileNotesView("note");
                      }}
                      className="text-[#007AFF] hover:text-blue-400 p-1.5 rounded-lg active:bg-white/10 transition cursor-pointer"
                      title="Nueva Nota"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                  </div>
                  {/* Home Indicator */}
                  <div
                    onClick={(e) => closeApp("notes", e)}
                    className="h-[20px] flex items-center justify-center cursor-pointer active:opacity-60 transition"
                  >
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
                  </div>
                </div>
              ) : null}
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: TERMINAL (CLI / iOS Terminal) ==================== */}
        {openWindows.terminal.isOpen && !openWindows.terminal.isMinimized && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.terminal.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.terminal.size.width, height: openWindows.terminal.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.terminal.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.terminal.position.x, y: openWindows.terminal.position.y }}
            onDrag={(e, d) => {
              if (openWindows.terminal.isMaximized || isMobile) return;
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
              if (openWindows.terminal.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.terminal.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 300}
            minHeight={isMobile ? 0 : 200}
            cancel=".window-control-buttons, input, iframe, button, a, .terminal-shortcut, .ios-action-btn"
            enableResizing={isMobile || openWindows.terminal.isMaximized ? false : {
              top: !openWindows.terminal.isMaximized,
              right: !openWindows.terminal.isMaximized,
              bottom: !openWindows.terminal.isMaximized,
              left: !openWindows.terminal.isMaximized,
              topRight: !openWindows.terminal.isMaximized,
              bottomRight: !openWindows.terminal.isMaximized,
              bottomLeft: !openWindows.terminal.isMaximized,
              topLeft: !openWindows.terminal.isMaximized,
            }}
            disableDragging={isMobile || openWindows.terminal.isMaximized}
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
            className={`absolute ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "liquid-glass rounded-2xl border border-white/10 shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.terminal.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-black">
              {/* Header: iOS Nav Bar en mobile vs macOS Window Header en Desktop */}
              {isMobile ? (
                <div className="h-[50px] ios-nav-blur border-b border-white/10 flex items-center justify-between px-3.5 shrink-0 select-none z-20">
                  <button
                    onClick={(e) => closeApp("terminal", e)}
                    className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                  >
                    <span className="text-xl leading-none">‹</span>
                    <span>Inicio</span>
                  </button>
                  <span className="text-[15px] font-semibold text-white font-mono truncate max-w-[55%]">
                    Terminal — zsh
                  </span>
                  <button
                    onClick={(e) => closeApp("terminal", e)}
                    className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <div className="window-header h-[36px] bg-black/60 border-b border-white/10 flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex gap-2 items-center window-control-buttons">
                    <div onClick={(e) => closeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                    <div onClick={(e) => minimizeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                    <div onClick={(e) => toggleMaximizeApp("terminal", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                  </div>
                  <span className="text-[10.5px] sm:text-[11.5px] font-mono text-white/50 truncate max-w-[65%] sm:max-w-[80%]">matias@tahoe-mac: {terminalCwd} — zsh</span>
                  <div className="w-[30px] sm:w-[60px]" />
                </div>
              )}

              {/* Contenido Terminal */}
              <div ref={terminalContainerRef} className="flex-1 bg-black/90 p-3 sm:p-4 font-mono text-emerald-400 text-[11px] sm:text-[12px] overflow-y-auto flex flex-col gap-1 leading-normal cursor-text">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap break-words">
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
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-emerald-300 font-semibold text-[11px] sm:text-[12px]"><span className="text-blue-400">matias</span> <span className="text-yellow-300">{terminalCwd}</span> %</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-emerald-300 font-mono text-[11px] sm:text-[12px] p-0"
                    autoFocus
                    spellCheck={false}
                  />
                </form>
                <div ref={terminalBottomRef} />
              </div>

              {/* Barra de atajos rápidos para Mobile */}
              {isMobile && (
                <div className="bg-[#111] border-t border-white/10 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
                  {["help", "neofetch", "skills", "about", "ls", "clear"].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => {
                        setTerminalInput(cmd);
                        // Trigger submit
                        setTimeout(() => {
                          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                          // Execute command directly
                          setTerminalHistory(prev => [
                            ...prev,
                            { type: "input", text: `matias@tahoe-mac ${terminalCwd} % ${cmd}` }
                          ]);
                          setTerminalInput("");
                          if (cmd === "clear") {
                            setTerminalHistory([]);
                          } else if (cmd === "help") {
                            setTerminalHistory(prev => [
                              ...prev,
                              { type: "output", text: "Comandos disponibles:" },
                              { type: "output", text: "  about     - Resumen profesional" },
                              { type: "output", text: "  skills    - Stack técnico" },
                              { type: "output", text: "  neofetch  - Especificaciones del sistema" },
                              { type: "output", text: "  ls        - Listar archivos" },
                              { type: "output", text: "  clear     - Limpiar pantalla" },
                            ]);
                          } else if (cmd === "neofetch") {
                            setTerminalHistory(prev => [
                              ...prev,
                              { type: "success", text: "OS: macOS Tahoe 26.0" },
                              { type: "success", text: "Host: MacBook Pro 16\" (Apple M3 Max)" },
                              { type: "success", text: "Kernel: Darwin 24.0.0" },
                              { type: "success", text: "Uptime: 99.9% disponibilidad" },
                              { type: "success", text: "Shell: zsh 5.9" },
                              { type: "success", text: "Role: Full Stack Developer & UI/UX" },
                            ]);
                          } else if (cmd === "about") {
                            setTerminalHistory(prev => [
                              ...prev,
                              { type: "output", text: "Matias Bazan — Desarrollador Full Stack & Diseñador UI/UX" },
                              { type: "output", text: "Especialista en React, Next.js, TypeScript, Tailwind, Node.js y Flutter." },
                            ]);
                          } else if (cmd === "skills") {
                            setTerminalHistory(prev => [
                              ...prev,
                              { type: "output", text: "Frontend: React 19, Next.js, TypeScript, TailwindCSS, Framer Motion" },
                              { type: "output", text: "Mobile: Flutter, Dart" },
                              { type: "output", text: "Backend: Node.js, Express, PostgreSQL, Supabase, Vercel" },
                              { type: "output", text: "Diseño: Figma, Adobe Illustrator, Photoshop" },
                            ]);
                          } else if (cmd === "ls") {
                            const files = Object.keys(terminalFS[terminalCwd] || {});
                            setTerminalHistory(prev => [
                              ...prev,
                              { type: "output", text: files.join("   ") || "(carpeta vacía)" }
                            ]);
                          }
                        }, 50);
                      }}
                      className="terminal-shortcut px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-emerald-300 font-mono text-[11px] font-semibold transition shrink-0 cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              )}

              {/* iOS Home Indicator en Mobile */}
              {isMobile && (
                <div
                  onClick={(e) => closeApp("terminal", e)}
                  className="h-[22px] bg-black flex items-center justify-center cursor-pointer shrink-0 active:opacity-60 transition"
                  title="Deslizar para ir a Inicio"
                >
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              )}
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: GOOGLE CHROME (Navegador / iOS Safari & Chrome) ==================== */}
        {openWindows.chrome.isOpen && !openWindows.chrome.isMinimized && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.chrome.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.chrome.size.width, height: openWindows.chrome.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.chrome.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.chrome.position.x, y: openWindows.chrome.position.y }}
            onDrag={(e, d) => {
              if (openWindows.chrome.isMaximized || isMobile) return;
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
              if (openWindows.chrome.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                chrome: {
                  ...prev.chrome,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.chrome.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                chrome: {
                  ...prev.chrome,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 300}
            minHeight={isMobile ? 0 : 200}
            cancel=".window-control-buttons, .window-no-drag, input, iframe, button, a, .ios-action-btn"
            enableResizing={isMobile || openWindows.chrome.isMaximized ? false : {
              top: !openWindows.chrome.isMaximized,
              right: !openWindows.chrome.isMaximized,
              bottom: !openWindows.chrome.isMaximized,
              left: !openWindows.chrome.isMaximized,
              topRight: !openWindows.chrome.isMaximized,
              bottomRight: !openWindows.chrome.isMaximized,
              bottomLeft: !openWindows.chrome.isMaximized,
              topLeft: !openWindows.chrome.isMaximized,
            }}
            disableDragging={isMobile || openWindows.chrome.isMaximized}
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
            className={`absolute ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "bg-[#b2cbdc] border border-[#8da4b4] rounded-2xl shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none transition-all duration-300 ${openWindows.chrome.isMinimized ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="w-full h-full flex flex-col bg-[#f2f2f7]">
              {/* Header: iOS Nav Bar en mobile vs macOS Tabs & Omnibox en Desktop */}
              {isMobile ? (
                <div className="ios-nav-blur border-b border-black/10 flex flex-col px-3 pt-2 pb-2 shrink-0 select-none z-20 gap-2 bg-[#f6f6f6]/95 text-black">
                  <div className="h-[36px] flex items-center justify-between">
                    <button
                      onClick={(e) => closeApp("chrome", e)}
                      className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                    >
                      <span className="text-xl leading-none">‹</span>
                      <span>Inicio</span>
                    </button>
                    <span className="text-[14px] font-semibold text-black truncate max-w-[50%]">
                      {chromeUrl === "chrome://newtab" ? "Nueva Pestaña" : (chromeUrl.replace("https://", "").replace("http://", "").split("/")[0])}
                    </span>
                    <button
                      onClick={(e) => closeApp("chrome", e)}
                      className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                    >
                      Listo
                    </button>
                  </div>

                  {/* iOS Omnibox */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const frameUrl = getChromeIframeUrl(chromeInputUrl);
                      setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: frameUrl, title: frameUrl === "chrome://newtab" ? "Nueva pestaña" : frameUrl } : t));
                      setChromeInputUrl(frameUrl);
                    }}
                    className="relative w-full"
                  >
                    <div className="h-[34px] bg-black/5 border border-black/10 rounded-xl px-3 flex items-center gap-2">
                      <span className="text-gray-400 text-xs">🔒</span>
                      <input
                        type="text"
                        value={chromeInputUrl}
                        onChange={(e) => setChromeInputUrl(e.target.value)}
                        placeholder="Buscar o escribir URL"
                        className="bg-transparent border-none outline-none text-black text-[13px] w-full font-sans"
                        spellCheck={false}
                      />
                      {chromeInputUrl && chromeInputUrl !== "chrome://newtab" && (
                        <button
                          type="button"
                          onClick={() => {
                            setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "chrome://newtab", title: "Nueva pestaña" } : t));
                            setChromeInputUrl("chrome://newtab");
                          }}
                          className="text-gray-400 hover:text-black text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Tira Horizontal de Pestañas Móviles (Mobile Tabs Bar) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                    {chromeTabs.map((tab) => {
                      const isActive = tab.id === activeTabId;
                      return (
                        <div
                          key={tab.id}
                          onClick={() => {
                            setActiveTabId(tab.id);
                            setChromeInputUrl(tab.url);
                            setIsMobileTabSwitcherOpen(false);
                          }}
                          className={`h-[28px] pl-2.5 pr-2 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer shadow-sm ${
                            isActive
                              ? "bg-white text-[#007AFF] border border-[#007AFF]/30 font-semibold ring-1 ring-[#007AFF]/20"
                              : "bg-black/5 text-black/70 hover:bg-black/10 border border-black/5"
                          }`}
                        >
                          <span className="truncate max-w-[100px]">{tab.title || "Pestaña"}</span>
                          {chromeTabs.length > 1 && (
                            <button
                              type="button"
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
                              className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center text-[10px] text-gray-500 hover:text-black transition ml-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Botón '+' para agregar pestaña en móvil */}
                    {chromeTabs.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newTabId = `tab-${Date.now()}`;
                          const newTab = { id: newTabId, title: "Nueva pestaña", url: "chrome://newtab", iconType: "chrome" };
                          setChromeTabs(prev => [...prev, newTab]);
                          setActiveTabId(newTabId);
                          setChromeInputUrl("chrome://newtab");
                          setIsMobileTabSwitcherOpen(false);
                        }}
                        className="w-7 h-[28px] rounded-lg bg-black/5 hover:bg-black/10 border border-black/5 text-gray-600 font-bold flex items-center justify-center text-sm shrink-0 transition"
                        title="Nueva Pestaña"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Header de Chrome: Tabs */}
                  <div className="window-header h-[42px] bg-gradient-to-b from-[#c5d8e7] to-[#abbfcb] border-b border-[#8da4b4] flex items-end justify-between px-3 cursor-grab active:cursor-grabbing select-none relative shrink-0">
                    {/* Botones de control estilo macOS */}
                    <div className="flex gap-2 items-center window-control-buttons mb-2.5">
                      <div onClick={(e) => closeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[9px] text-[#5e0000] font-black leading-none">✕</div>
                      <div onClick={(e) => minimizeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#E0A82E] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#5c3e00] font-black leading-none">–</div>
                      <div onClick={(e) => toggleMaximizeApp("chrome", e)} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 cursor-pointer flex items-center justify-center text-[10px] text-[#05400d] font-black leading-none">+</div>
                    </div>

                    {/* Tabs de Chrome */}
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
            </>
          )}

              {/* Viewport de Chrome */}
              <div className="flex-1 bg-white overflow-hidden text-black select-text relative">
                {chromeUrl === "chrome://newtab" ? (
                  <div className="w-full h-full bg-white text-[#222222] flex flex-col items-center justify-center font-sans p-3 sm:p-6 overflow-y-auto select-none">

                    {/* Classic Google Logo */}
                    <img src="/os/LogosGoogle.svg" className="w-[180px] sm:w-[260px] h-auto object-contain mb-4 sm:mb-6 select-none pointer-events-none" alt="Google" />

                    {/* Search Bar Mock matching design */}
                    <div className="w-full max-w-[95%] sm:max-w-[560px] h-[42px] sm:h-[48px] bg-white rounded-full border border-gray-200/90 shadow-sm flex items-center justify-between px-4 sm:px-5 hover:shadow-md focus-within:shadow-md transition-all mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 sm:gap-3.5 flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 cursor-pointer hover:text-black shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Preguntar a Google"
                          className="bg-transparent border-none outline-none text-[#222222] text-[13px] sm:text-[14.5px] flex-1 leading-none font-sans"
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
                      <div className="flex items-center gap-2 sm:gap-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-gray-500 cursor-pointer hover:text-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-gray-500 cursor-pointer hover:text-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Grid de Accesos Directos (Pill Style con logos del portafolio) */}
                    <div className="flex flex-col items-center gap-4 w-full max-w-[580px]">
                      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 w-full">

                        {/* Portafolio Premium */}
                        <div
                          onClick={() => {
                            const target = "https://portafolio-matias-bazan.vercel.app/";
                            setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: "Premium" } : t));
                            setChromeInputUrl(target);
                          }}
                          className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer transition w-[58px] sm:w-[64px]"
                        >
                          <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] flex items-center justify-center shadow-sm transition-all">
                            <img src="/os/premium.svg" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" alt="" />
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
                          className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer transition w-[58px] sm:w-[64px]"
                        >
                          <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] flex items-center justify-center shadow-sm transition-all">
                            <img src="/os/logo-desktop.svg" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" alt="" />
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
                          className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer transition w-[58px] sm:w-[64px]"
                        >
                          <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center shadow-sm transition-all">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500">
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

                {/* Modal / Selector de Pestañas Móvil (iOS Tab Switcher Grid) */}
                {isMobile && isMobileTabSwitcherOpen && (
                  <div className="absolute inset-0 bg-[#1c1c1e]/95 backdrop-blur-2xl z-50 flex flex-col p-4 text-white font-sans animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-[44px] flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-base font-bold text-white">
                        Pestañas ({chromeTabs.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMobileTabSwitcherOpen(false)}
                        className="text-[#007AFF] text-sm font-semibold hover:opacity-80 active:opacity-60 cursor-pointer"
                      >
                        Listo
                      </button>
                    </div>

                    {/* Grid de Pestañas */}
                    <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto pb-4">
                      {chromeTabs.map((tab) => {
                        const isActive = tab.id === activeTabId;
                        return (
                          <div
                            key={tab.id}
                            onClick={() => {
                              setActiveTabId(tab.id);
                              setChromeInputUrl(tab.url);
                              setIsMobileTabSwitcherOpen(false);
                            }}
                            className={`rounded-2xl p-3 flex flex-col justify-between border transition cursor-pointer relative shadow-lg ${
                              isActive
                                ? "bg-white/15 border-[#007AFF] ring-2 ring-[#007AFF]/50"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                            style={{ minHeight: "140px" }}
                          >
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <span className="text-xs font-semibold text-white/90 line-clamp-2 leading-tight">
                                {tab.title || "Nueva pestaña"}
                              </span>
                              {chromeTabs.length > 1 && (
                                <button
                                  type="button"
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
                                  className="w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-[10px] text-white/80 hover:text-white shrink-0 ml-1"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            <div className="flex-1 bg-black/30 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                              <span className="text-[10px] text-white/50 truncate w-full">
                                {tab.url === "chrome://newtab" ? "Google" : tab.url.replace("https://", "").replace("http://", "").split("/")[0]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer de Pestañas */}
                    <div className="h-[48px] border-t border-white/10 pt-2 flex items-center justify-between shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const newTabId = `tab-${Date.now()}`;
                          const newTab = { id: newTabId, title: "Nueva pestaña", url: "chrome://newtab", iconType: "chrome" };
                          setChromeTabs(prev => [...prev, newTab]);
                          setActiveTabId(newTabId);
                          setChromeInputUrl("chrome://newtab");
                          setIsMobileTabSwitcherOpen(false);
                        }}
                        className="text-[#007AFF] text-sm font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="text-lg">+</span>
                        <span>Nueva Pestaña</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMobileTabSwitcherOpen(false)}
                        className="text-white/60 hover:text-white text-sm cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* iOS Bottom Toolbar & Home Indicator en Mobile */}
              {isMobile ? (
                <div className="ios-nav-blur border-t border-black/10 flex flex-col shrink-0 select-none z-20 bg-[#f6f6f6]/95 text-black pb-[max(6px,env(safe-area-inset-bottom,6px))]">
                  <div className="h-[46px] flex items-center justify-around px-2 text-[#007AFF]">
                    {/* Botón Atrás / Salir */}
                    <button
                      type="button"
                      onClick={() => {
                        if (chromeUrl && chromeUrl !== "chrome://newtab") {
                          setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "chrome://newtab", title: "Nueva pestaña" } : t));
                          setChromeInputUrl("chrome://newtab");
                        } else {
                          closeApp("chrome");
                        }
                      }}
                      className="p-2 active:opacity-60 transition cursor-pointer flex items-center justify-center"
                      title="Atrás / Inicio"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
                    </button>
                    {/* Botón Home */}
                    <button
                      type="button"
                      onClick={() => {
                        setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "chrome://newtab", title: "Nueva pestaña" } : t));
                        setChromeInputUrl("chrome://newtab");
                        setIsMobileTabSwitcherOpen(false);
                      }}
                      className="p-2 active:opacity-60 transition text-lg cursor-pointer"
                      title="Nueva Pestaña"
                    >
                      <HomeIcon className="w-5 h-5 stroke-[2]" />
                    </button>
                    {/* Botón Recargar */}
                    <button
                      type="button"
                      onClick={() => {
                        const temp = chromeUrl;
                        setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "" } : t));
                        setTimeout(() => {
                          setChromeTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: temp } : t));
                        }, 50);
                      }}
                      className="p-2 active:opacity-60 transition cursor-pointer"
                      title="Recargar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                    {/* Botón Nueva Pestaña */}
                    <button
                      type="button"
                      onClick={() => {
                        const newTabId = `tab-${Date.now()}`;
                        setChromeTabs(prev => [...prev.slice(0, 4), { id: newTabId, title: "Nueva pestaña", url: "chrome://newtab", iconType: "chrome" }]);
                        setActiveTabId(newTabId);
                        setChromeInputUrl("chrome://newtab");
                        setIsMobileTabSwitcherOpen(false);
                      }}
                      className="p-2 active:opacity-60 transition text-lg font-bold cursor-pointer"
                      title="Nueva Pestaña"
                    >
                      +
                    </button>
                    {/* Botón Contador / Switcher de Pestañas */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isMobileTabSwitcherOpen;
                        setIsMobileTabSwitcherOpen(nextState);
                        if (nextState) pushMobileHistory("switcher");
                      }}
                      className={`w-6 h-6 rounded-md border text-[11px] font-bold flex items-center justify-center cursor-pointer active:scale-95 transition ${
                        isMobileTabSwitcherOpen ? "bg-[#007AFF] text-white border-[#007AFF]" : "border-[#007AFF] text-[#007AFF]"
                      }`}
                      title="Ver Pestañas"
                    >
                      {chromeTabs.length}
                    </button>
                  </div>
                  {/* Home Indicator */}
                  <div
                    onClick={(e) => closeApp("chrome", e)}
                    className="h-[24px] flex items-center justify-center cursor-pointer active:opacity-60 transition"
                    title="Cerrar y volver al escritorio"
                  >
                    <div className="w-32 h-1 bg-black/30 rounded-full" />
                  </div>
                </div>
              ) : null}
            </div>
          </Rnd>
        )}

        {/* ==================== APLICACIÓN: CALENDARIO DE APPLE (Diseño Nativo macOS Tahoe / iOS Calendar) ==================== */}
        {openWindows.calendar && openWindows.calendar.isOpen && !openWindows.calendar.isMinimized && (
          <Rnd
            size={isMobile ? { width: "100%", height: "100%" } : openWindows.calendar.isMaximized ? { width: "100%", height: "100%" } : { width: openWindows.calendar.size.width, height: openWindows.calendar.size.height }}
            position={isMobile ? { x: 0, y: 0 } : openWindows.calendar.isMaximized ? { x: 0, y: 0 } : isDraggingActive ? undefined : { x: openWindows.calendar.position.x, y: openWindows.calendar.position.y }}
            onDragStart={() => setIsDraggingActive(true)}
            onDragStop={(e, d) => {
              setIsDraggingActive(false);
              if (openWindows.calendar.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                calendar: {
                  ...prev.calendar,
                  position: { x: d.x, y: d.y }
                }
              }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (openWindows.calendar.isMaximized || isMobile) return;
              setOpenWindows(prev => ({
                ...prev,
                calendar: {
                  ...prev.calendar,
                  size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                  position
                }
              }));
            }}
            minWidth={isMobile ? 0 : 500}
            minHeight={isMobile ? 0 : 350}
            cancel=".window-control-buttons, input, button, select, .no-drag, .ios-action-btn"
            enableResizing={isMobile || openWindows.calendar.isMaximized ? false : {
              top: !openWindows.calendar.isMaximized,
              right: !openWindows.calendar.isMaximized,
              bottom: !openWindows.calendar.isMaximized,
              left: !openWindows.calendar.isMaximized,
              topRight: !openWindows.calendar.isMaximized,
              bottomRight: !openWindows.calendar.isMaximized,
              bottomLeft: !openWindows.calendar.isMaximized,
              topLeft: !openWindows.calendar.isMaximized,
            }}
            disableDragging={isMobile || openWindows.calendar.isMaximized}
            style={{
              zIndex: openWindows.calendar.zIndex,
              display: openWindows.calendar.isOpen && !openWindows.calendar.isMinimized ? "block" : "none"
            }}
            className="absolute"
          >
            <div
              onClick={() => focusWindow("calendar")}
              className={`w-full h-full bg-[#1e222d] ${isMobile ? "ios-app-animate inset-0 rounded-none border-none shadow-none" : "rounded-2xl border border-white/10 shadow-2xl"} overflow-hidden flex flex-col pointer-events-auto select-none text-white font-sans`}
            >
              {/* Header: iOS Nav Bar en mobile vs macOS Header en Desktop */}
              {isMobile ? (
                <div className="ios-nav-blur border-b border-white/10 flex flex-col px-3.5 pt-2 pb-2 shrink-0 select-none z-20 gap-2">
                  <div className="h-[38px] flex items-center justify-between">
                    <button
                      onClick={(e) => closeApp("calendar", e)}
                      className="ios-action-btn flex items-center gap-1 text-[#007AFF] active:opacity-60 text-[15px] font-medium transition cursor-pointer"
                    >
                      <span className="text-xl leading-none">‹</span>
                      <span>Inicio</span>
                    </button>
                    <span className="text-[15px] font-semibold text-white truncate max-w-[55%]">
                      {calendarViewMode === "year" ? `Año ${calendarYear}` : calendarViewMode === "month" ? `${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][calendarMonth]} ${calendarYear}` : "Cronología"}
                    </span>
                    <button
                      onClick={(e) => closeApp("calendar", e)}
                      className="ios-action-btn text-[#007AFF] active:opacity-60 text-[15px] font-semibold transition cursor-pointer"
                    >
                      Listo
                    </button>
                  </div>

                  {/* iOS View Mode Segmented Control */}
                  <div className="flex bg-white/10 rounded-xl p-1 text-xs font-semibold text-white/70">
                    <button
                      onClick={() => setCalendarViewMode("year")}
                      className={`flex-1 py-1 rounded-lg transition text-center ${calendarViewMode === "year" ? "bg-white text-black shadow font-bold" : "hover:text-white"}`}
                    >
                      Año
                    </button>
                    <button
                      onClick={() => setCalendarViewMode("month")}
                      className={`flex-1 py-1 rounded-lg transition text-center ${calendarViewMode === "month" ? "bg-white text-black shadow font-bold" : "hover:text-white"}`}
                    >
                      Mes
                    </button>
                    <button
                      onClick={() => setCalendarViewMode("timeline")}
                      className={`flex-1 py-1 rounded-lg transition text-center ${calendarViewMode === "timeline" ? "bg-white text-black shadow font-bold" : "hover:text-white"}`}
                    >
                      Cronología
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[52px] bg-[#1a1d26]/90 border-b border-white/5 flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none shrink-0">
                  {/* Lado Izquierdo: Botones Semáforo + Botones de Vista/Acciones Apple */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Semáforo macOS */}
                    <div className="flex gap-2 items-center window-control-buttons">
                      <div
                        onClick={(e) => closeApp("calendar", e)}
                        className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:bg-[#ff493d] cursor-pointer flex items-center justify-center text-[8px] text-black font-bold shadow-sm"
                      >
                        ×
                      </div>
                      <div
                        onClick={(e) => minimizeApp("calendar", e)}
                        className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:bg-[#e6a81e] cursor-pointer flex items-center justify-center text-[8px] text-black font-bold shadow-sm"
                      >
                        –
                      </div>
                      <div
                        onClick={(e) => toggleMaximizeApp("calendar", e)}
                        className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:bg-[#1fd339] cursor-pointer flex items-center justify-center text-[7px] text-black font-bold shadow-sm"
                      >
                        +
                      </div>
                    </div>

                    {/* Iconos de Barra de Herramientas Apple Calendar */}
                    <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 no-drag">
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Lado Derecho: Switcher (Año, Mes, Cronología) + Búsqueda */}
                  <div className="flex items-center gap-2 sm:gap-3 no-drag">
                    {/* Selector de Vistas estilo Apple (Año / Mes / Cronología) */}
                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 sm:p-1 text-[11px] sm:text-[12px] font-medium text-white/75">
                      <button
                        onClick={() => setCalendarViewMode("year")}
                        className={`px-2 sm:px-3 py-0.5 rounded-md transition ${calendarViewMode === "year" ? "bg-white/20 text-white font-semibold shadow-sm" : "hover:text-white"}`}
                      >
                        Año
                      </button>
                      <button
                        onClick={() => setCalendarViewMode("month")}
                        className={`px-2 sm:px-3 py-0.5 rounded-md transition ${calendarViewMode === "month" ? "bg-white/20 text-white font-semibold shadow-sm" : "hover:text-white"}`}
                      >
                        Mes
                      </button>
                      <button
                        onClick={() => setCalendarViewMode("timeline")}
                        className={`px-2 sm:px-3 py-0.5 rounded-md transition flex items-center gap-1 ${calendarViewMode === "timeline" ? "bg-white/20 text-white font-semibold shadow-sm" : "hover:text-white"}`}
                      >
                        <span>📜</span>
                        <span className="hidden sm:inline">Cronología</span>
                      </button>
                    </div>

                  {/* Botón y Barra de Búsqueda Interactiva Apple */}
                  <div className="relative flex items-center">
                    {isCalendarSearchOpen ? (
                      <div className="flex items-center gap-1.5 bg-black/50 border border-white/20 rounded-full px-2.5 py-1 text-xs text-white backdrop-blur-md shadow-lg transition-all animate-in fade-in zoom-in-95 duration-150">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-white/50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                          type="text"
                          value={calendarSearch}
                          onChange={(e) => setCalendarSearch(e.target.value)}
                          placeholder="Buscar..."
                          autoFocus
                          className="bg-transparent border-none outline-none text-xs text-white placeholder-white/40 w-24 sm:w-44 font-sans"
                        />
                        {calendarSearch && (
                          <button
                            onClick={() => setCalendarSearch("")}
                            className="text-white/40 hover:text-white text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsCalendarSearchOpen(false);
                            setCalendarSearch("");
                          }}
                          className="text-[10.5px] text-white/60 hover:text-white pl-1 border-l border-white/10"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsCalendarSearchOpen(true)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition shadow-sm"
                        title="Buscar en Calendario"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current stroke-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

              {/* Sub-cabecera con Año Dinámico, Selector Rápido de Años y Botón "Hoy" */}
              <div className="px-3 sm:px-8 pt-3 sm:pt-5 pb-3 flex justify-between items-center no-drag border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar max-w-full">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white/95 font-sans shrink-0">
                    {calendarYear}
                  </h1>

                  {/* Selector Rápido de Años para navegar trayectoria */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0">
                    {[2022, 2023, 2024, 2025, 2026].map(y => (
                      <button
                        key={y}
                        onClick={() => {
                          setCalendarYear(y);
                          if (calendarViewMode !== "year" && calendarViewMode !== "timeline") {
                            setCalendarViewMode("year");
                          }
                        }}
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold transition ${calendarYear === y ? "bg-[#007AFF] text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                  <button
                    onClick={() => setCalendarYear(prev => Math.max(2020, prev - 1))}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs transition"
                    title="Año anterior"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => { setCalendarYear(2026); setCalendarMonth(7); setCalendarViewMode("year"); }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] sm:text-xs font-semibold text-white/90 transition shadow-sm"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setCalendarYear(prev => Math.min(2030, prev + 1))}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs transition"
                    title="Año siguiente"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Contenedor Principal: Vistas de Calendario */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-3 sm:py-5 no-drag">
                {/* Panel de Resultados de Búsqueda Activa */}
                {calendarSearch.trim() ? (
                  <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🔍 Resultados para</span>
                        <span className="text-[#007AFF]">"{calendarSearch}"</span>
                      </h2>
                      <button
                        onClick={() => setCalendarSearch("")}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>

                    {calendarEvents.filter(ev => {
                      const q = calendarSearch.toLowerCase();
                      return (
                        ev.title.toLowerCase().includes(q) ||
                        ev.institution.toLowerCase().includes(q) ||
                        ev.description.toLowerCase().includes(q) ||
                        ev.period.toLowerCase().includes(q) ||
                        ev.skills.some(s => s.toLowerCase().includes(q))
                      );
                    }).length === 0 ? (
                      <div className="py-12 text-center text-white/40">
                        <p className="text-sm">No se encontraron eventos o tecnologías que coincidan con tu búsqueda.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {calendarEvents
                          .filter(ev => {
                            const q = calendarSearch.toLowerCase();
                            return (
                              ev.title.toLowerCase().includes(q) ||
                              ev.institution.toLowerCase().includes(q) ||
                              ev.description.toLowerCase().includes(q) ||
                              ev.period.toLowerCase().includes(q) ||
                              ev.skills.some(s => s.toLowerCase().includes(q))
                            );
                          })
                          .map(ev => (
                            <div
                              key={ev.id}
                              onClick={() => {
                                setSelectedCalendarEvent(ev);
                                setCalendarYear(ev.year);
                                setCalendarMonth(ev.month);
                              }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                                selectedCalendarEvent?.id === ev.id
                                  ? "bg-white/15 border-white/30 shadow-lg"
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                              }`}
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white shrink-0 mt-0.5 overflow-hidden border border-white/15 bg-white/10 shadow-sm"
                                style={!ev.logo ? { backgroundColor: ev.color } : {}}
                              >
                                {ev.logo ? (
                                  <img src={ev.logo} alt={ev.institution} className="w-full h-full object-cover" />
                                ) : (
                                  ev.category === "experience" ? "💼" : ev.category === "education" ? "🎓" : "🚀"
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                                  <span className="text-xs font-mono text-white/50">{ev.period}</span>
                                </div>
                                <div className="text-xs text-white/75 font-medium mt-0.5">
                                  {ev.institution} • {ev.location}
                                </div>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">{ev.description}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {ev.skills.map((skill, sIdx) => (
                                    <span key={sIdx} className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/80">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : calendarViewMode === "timeline" ? (
                  /* ==================== VISTA CRONOLOGÍA / LÍNEA DE TIEMPO (2022 — 2026) ==================== */
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">Cronología de Trayectoria Profesional & Académica</h2>
                        <p className="text-xs text-white/60 mt-0.5">Evolución técnica desde los primeros fundamentos algorítmicos hasta la arquitectura Full Stack en producción.</p>
                      </div>

                      {/* Filtros de Categoría */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          onClick={() => setCalendarFilter("all")}
                          className={`px-2.5 py-1 rounded-md transition border ${calendarFilter === "all" ? "bg-white/20 border-white/30 text-white font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setCalendarFilter("experience")}
                          className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 border ${calendarFilter === "experience" ? "bg-[#007AFF]/30 border-[#007AFF] text-white font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                          Experiencia
                        </button>
                        <button
                          onClick={() => setCalendarFilter("education")}
                          className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 border ${calendarFilter === "education" ? "bg-[#FF9500]/30 border-[#FF9500] text-white font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                          Estudios
                        </button>
                      </div>
                    </div>

                    {/* Timeline Vertical Interactivo */}
                    <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
                      {calendarEvents
                        .filter(ev => calendarFilter === "all" || ev.category === calendarFilter)
                        .sort((a, b) => a.year - b.year)
                        .map(ev => {
                          const isSelected = selectedCalendarEvent?.id === ev.id;

                          return (
                            <div
                              key={ev.id}
                              onClick={() => {
                                setSelectedCalendarEvent(ev);
                                setCalendarYear(ev.year);
                                setCalendarMonth(ev.month);
                              }}
                              className={`relative group cursor-pointer p-4.5 rounded-2xl border transition-all ${
                                isSelected
                                  ? "bg-white/15 border-white/30 shadow-xl scale-[1.01]"
                                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                              }`}
                            >
                              {/* Nodo del timeline */}
                              <div
                                className={`absolute -left-[31px] top-6 w-4 h-4 rounded-full border-2 border-[#1e222d] shadow-md transition transform group-hover:scale-125 ${
                                  isSelected ? "ring-2 ring-white" : ""
                                }`}
                                style={{ backgroundColor: ev.color }}
                              />

                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2.5">
                                    {ev.logo ? (
                                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-white/10 shadow-sm shrink-0">
                                        <img src={ev.logo} alt={ev.institution} className="w-full h-full object-cover" />
                                      </div>
                                    ) : null}
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                                      style={{ backgroundColor: ev.color }}
                                    >
                                      {ev.category === "experience" ? "Experiencia Laboral" : ev.category === "education" ? "Estudios & Formación" : "Hito"}
                                    </span>
                                    <span className="text-xs font-bold text-white/90">{ev.period}</span>
                                  </div>
                                  <span className="text-[11px] font-mono text-white/40">Año {ev.year}</span>
                                </div>

                                <div>
                                  <h3 className="text-base font-bold text-white group-hover:text-white/90">
                                    {ev.title}
                                  </h3>
                                  <div className="text-xs text-white/80 font-medium mt-0.5">
                                    🏛️ {ev.institution} &nbsp;•&nbsp; <span className="text-white/50">📍 {ev.location}</span>
                                  </div>
                                </div>

                                <p className="text-xs text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">
                                  {ev.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {ev.skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10.5px] font-mono text-white/85"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : calendarViewMode === "year" ? (
                  /* ==================== VISTA AÑO: GRID DE 12 MESES (EXACTO A APPLE) ==================== */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-x-8 sm:gap-y-6 pt-1">
                    {[
                      { name: "Enero", index: 0, days: 31, offset: 3, prevDays: [29, 30, 31] },
                      { name: "Febrero", index: 1, days: (calendarYear % 4 === 0 ? 29 : 28), offset: 6, prevDays: [26, 27, 28, 29, 30, 31] },
                      { name: "Marzo", index: 2, days: 31, offset: 6, prevDays: [23, 24, 25, 26, 27, 28] },
                      { name: "Abril", index: 3, days: 30, offset: 2, prevDays: [30, 31] },
                      { name: "Mayo", index: 4, days: 31, offset: 4, prevDays: [27, 28, 29, 30] },
                      { name: "Junio", index: 5, days: 30, offset: 0, prevDays: [] },
                      { name: "Julio", index: 6, days: 31, offset: 2, prevDays: [29, 30] },
                      { name: "Agosto", index: 7, days: 31, offset: 5, prevDays: [27, 28, 29, 30, 31] },
                      { name: "Septiembre", index: 8, days: 30, offset: 1, prevDays: [31] },
                      { name: "Octubre", index: 9, days: 31, offset: 3, prevDays: [28, 29, 30] },
                      { name: "Noviembre", index: 10, days: 30, offset: 6, prevDays: [26, 27, 28, 29, 30] },
                      { name: "Diciembre", index: 11, days: 31, offset: 1, prevDays: [30] },
                    ].map((m) => {
                      return (
                        <div
                          key={m.name}
                          onClick={() => {
                            setCalendarMonth(m.index);
                            setCalendarViewMode("month");
                          }}
                          className="flex flex-col group cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition"
                        >
                          {/* Título de Mes en Rojo Apple */}
                          <div className="flex justify-between items-center mb-2">
                            <h2 className="text-[#FF3B30] text-[15px] font-medium tracking-tight group-hover:underline">
                              {m.name}
                            </h2>
                            {calendarEvents.some(ev => ev.year === calendarYear && ev.month === m.index) && (
                              <span className="w-2 h-2 rounded-full bg-[#007AFF] shadow-sm animate-pulse" title="Hay eventos este mes" />
                            )}
                          </div>

                          {/* Días de la semana (L M X J V S D) */}
                          <div className="grid grid-cols-7 text-[10px] font-medium text-white/40 text-center mb-1">
                            <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                          </div>

                          {/* Cuadrícula de Días */}
                          <div className="grid grid-cols-7 text-[11px] font-medium text-center gap-y-1">
                            {/* Días previos en gris tenue */}
                            {m.prevDays.map((pd, pidx) => (
                              <span key={`p-${pidx}`} className="text-white/20">
                                {pd}
                              </span>
                            ))}

                            {/* Días del mes actual */}
                            {Array.from({ length: m.days }, (_, i) => i + 1).map((day) => {
                              // Eventos en este día, mes y año activo
                              const event = calendarEvents.find(ev => ev.year === calendarYear && ev.month === m.index && ev.day === day);
                              const isToday = calendarYear === 2026 && m.index === 7 && day === 20;

                              return (
                                <div
                                  key={`d-${day}`}
                                  onClick={(e) => {
                                    if (event) {
                                      e.stopPropagation();
                                      setSelectedCalendarEvent(event);
                                    }
                                  }}
                                  className="relative flex items-center justify-center h-[22px]"
                                >
                                  {isToday || event ? (
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10.5px] text-white shadow-sm transition transform hover:scale-110 ${
                                        isToday ? "bg-[#FF3B30]" : ""
                                      }`}
                                      style={!isToday && event ? { backgroundColor: event.color } : {}}
                                      title={event ? `${event.title} (${event.institution})` : "Hoy"}
                                    >
                                      {day}
                                    </span>
                                  ) : (
                                    <span className="text-white/85 hover:text-white">
                                      {day}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ==================== VISTA MES / DETALLE ==================== */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCalendarViewMode("year")}
                        className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
                      >
                        ‹ Volver al Año {calendarYear}
                      </button>
                      <div className="flex gap-2 text-[11px] sm:text-xs">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" /> Experiencia
                        </span>
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" /> Estudios
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-[10px] sm:text-xs font-bold text-white/40 text-center pb-2 border-b border-white/10">
                      <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const event = calendarEvents.find(ev => ev.year === calendarYear && ev.month === calendarMonth && ev.day === day);
                        const isToday = calendarYear === 2026 && calendarMonth === 7 && day === 20;

                        return (
                          <div
                            key={day}
                            onClick={() => event && setSelectedCalendarEvent(event)}
                            className={`min-h-[50px] sm:min-h-[85px] p-1 sm:p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
                              isToday
                                ? "bg-white/10 border-white/30"
                                : event
                                ? "bg-white/5 border-white/15 hover:bg-white/10"
                                : "border-white/5 hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-[11px] sm:text-xs font-semibold ${isToday ? "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-bold" : "text-white/80"}`}>
                                {day}
                              </span>
                              {event && (
                                <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full uppercase font-bold text-white shadow-sm" style={{ backgroundColor: event.color }}>
                                  {event.category === "experience" ? "Exp" : "Est"}
                                </span>
                              )}
                            </div>
                            {event && (
                              <div className="mt-0.5 sm:mt-1 p-1 sm:p-1.5 rounded bg-black/30 border border-white/5">
                                <div className="text-[9.5px] sm:text-[10.5px] font-bold text-white truncate">{event.title}</div>
                                <div className="hidden sm:block text-[9px] text-white/60 truncate">{event.institution}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal / Inspector Flotante al seleccionar un Evento de Experiencia o Estudios */}
              {selectedCalendarEvent && (
                <div className="border-t border-white/10 bg-[#161820]/95 p-3 px-3 sm:px-8 flex items-start sm:items-center justify-between gap-3 sm:gap-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 shrink-0">
                  <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base sm:text-lg text-white shadow-md shrink-0 mt-0.5 overflow-hidden border border-white/15 bg-white/10"
                      style={!selectedCalendarEvent.logo ? { backgroundColor: selectedCalendarEvent.color } : {}}
                    >
                      {selectedCalendarEvent.logo ? (
                        <img src={selectedCalendarEvent.logo} alt={selectedCalendarEvent.institution} className="w-full h-full object-cover" />
                      ) : (
                        selectedCalendarEvent.category === "experience" ? "💼" : selectedCalendarEvent.category === "education" ? "🎓" : "🚀"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">{selectedCalendarEvent.title}</h3>
                        <span className="text-[9.5px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                          {selectedCalendarEvent.period}
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-white/80 font-medium mt-0.5 truncate">
                        {selectedCalendarEvent.institution} • <span className="text-white/50">{selectedCalendarEvent.location}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed max-w-4xl line-clamp-2 sm:line-clamp-none">
                        {selectedCalendarEvent.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selectedCalendarEvent.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-white/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCalendarEvent(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs font-bold transition shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* iOS Home Indicator en Mobile */}
              {isMobile && (
                <div
                  onClick={(e) => closeApp("calendar", e)}
                  className="h-[22px] bg-[#1e222d] border-t border-white/10 flex items-center justify-center cursor-pointer shrink-0 active:opacity-60 transition"
                  title="Deslizar para ir a Inicio"
                >
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              )}

            </div>
          </Rnd>
        )}
      </div>
      {/* ==================== CHIPS DE VENTANAS MINIMIZADAS (libres por toda la pantalla) ==================== */}
      {(Object.keys(openWindows) as string[]).map((appId) => {
        const win = openWindows[appId];
        if (isMobile || !win.isOpen || !win.isMinimized) return null;

        const labels: Record<string, string> = {
          finder: "Mi CV",
          acrobat: "Acrobat",
          notes: "Notas",
          terminal: "Terminal",
          chrome: "Chrome",
          calendar: "Calendario",
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
        className={`absolute bottom-[max(16px,env(safe-area-inset-bottom,16px))] left-[50%] -translate-x-1/2 z-[9999] select-none transition-all duration-300 ease-out ${(isMobile && isAnyAppOpen) || (isAnyAppMaximized && !showDockFullscreen)
          ? "translate-y-[150%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
          }`}
      >
        <div className={`index-dock-container flex items-end shadow-2xl relative ${isMobile ? "px-[14px] py-[8px] rounded-[22px] gap-[12px]" : "px-[30px] py-[12px] rounded-[28px] gap-[22px]"}`}>

          {/* Finder Icon (Abre Finder) */}
          <motion.div
            onClick={() => openApp("finder")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`flex items-center justify-center cursor-pointer shadow-lg rounded-[12px] sm:rounded-[14px] overflow-hidden ${isMobile ? "w-[42px] h-[42px]" : "w-[52px] h-[52px]"}`}>
              <img src="/os/image.png" className="w-full h-full object-cover" alt="Finder" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Finder
            </span>
            {openWindows.finder.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Acrobat PDF Icon (Abre Acrobat / CV) */}
          <motion.div
            onClick={() => openApp("acrobat")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`flex items-center justify-center cursor-pointer rounded-[12px] sm:rounded-[14px] overflow-hidden ${isMobile ? "w-[42px] h-[42px]" : "w-[52px] h-[52px]"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={`${isMobile ? "w-[36px] h-[36px]" : "w-[48px] h-[48px]"} drop-shadow-lg`}>
                <path fill="#fa0f00" d="M90.5 0h331C471.8 0 512 40.2 512 90.5v331c0 50.3-40.2 90.5-90.5 90.5h-331C40.2 512 0 471.8 0 421.5v-331C0 40.2 40.2 0 90.5 0" />
                <path fill="#fff" d="M408.3 295.3c-23.8-24.7-88.7-14.6-104.2-12.8c-22.9-21.9-38.4-48.5-43.9-57.6c8.2-24.7 13.7-49.4 14.6-75.9c0-22.9-9.1-47.5-34.7-47.5c-9.1 0-17.4 5.5-21.9 12.8c-11 19.2-6.4 57.6 11 96.9c-10.1 28.3-19.2 55.8-44.8 104.2c-26.5 11-82.3 36.6-86.9 64c-1.8 8.2.9 16.5 7.3 22.9c6.4 5.5 14.6 8.2 22.9 8.2c33.8 0 66.7-46.6 89.6-85.9c19.2-6.4 49.4-15.5 79.5-21c35.7 31.1 66.7 35.7 83.2 35.7c21.9 0 30.2-9.1 32.9-17.4c4.5-9.2 1.8-19.3-4.6-26.6m-22.9 15.6c-.9 6.4-9.1 12.8-23.8 9.1c-17.4-4.6-32.9-12.8-46.6-23.8c11.9-1.8 38.4-4.6 57.6-.9c7.3 1.8 14.7 6.4 12.8 15.6M232.7 122.5c1.8-2.7 4.6-4.6 7.3-4.6c8.2 0 10.1 10.1 10.1 18.3c-.9 19.2-4.6 38.4-11 56.7c-13.7-36.6-10.9-62.2-6.4-70.4m-1.8 177.4c7.3-14.6 17.4-40.2 21-51.2c8.2 13.7 21.9 30.2 29.3 37.5c0 .9-28.3 6.4-50.3 13.7M177 336.5c-21 34.7-43 56.7-54.9 56.7c-1.8 0-3.7-.9-5.5-1.8c-2.7-1.8-3.7-4.6-2.7-8.2c2.7-12.9 26.5-30.3 63.1-46.7" />
              </svg>
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Mi CV
            </span>
            {openWindows.acrobat.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Chrome Icon */}
          <motion.div
            onClick={() => openApp("chrome")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`bg-white rounded-[12px] sm:rounded-[14px] flex items-center justify-center cursor-pointer shadow-lg border border-white/5 overflow-hidden ${isMobile ? "w-[42px] h-[42px]" : "w-[52px] h-[52px]"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={isMobile ? "w-[34px] h-[34px]" : "w-[44px] h-[44px]"}>
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
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Calendar Icon (Exacto a Apple Calendar: Cabecera Roja 'Jue' + Número '20') */}
          <motion.div
            onClick={() => openApp("calendar")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`bg-white flex flex-col items-center justify-between pt-1 pb-0.5 cursor-pointer border border-black/5 overflow-hidden font-sans select-none ${isMobile ? "w-[42px] h-[42px] rounded-[10px] shadow-md" : "w-[52px] h-[52px] rounded-[13px] shadow-[0_8px_16px_rgba(0,0,0,0.28)] pt-1.5 pb-1"}`}>
              {/* Día en Rojo Apple (ej. 'Jue') */}
              <span className={`text-[#FF3B30] font-bold tracking-tight leading-none ${isMobile ? "text-[9px]" : "text-[11px]"}`}>
                {dayOfWeekShort}
              </span>
              {/* Número del Día en Negro Oscuro Apple (ej. '20') */}
              <span className={`font-[350] text-[#1D1D1F] tracking-tight leading-none mb-0.5 font-sans ${isMobile ? "text-[19px]" : "text-[27px]"}`}>
                {dayNumber}
              </span>
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Calendario
            </span>
            {openWindows.calendar?.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Notes Icon */}
          <motion.div
            onClick={() => openApp("notes")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`flex items-center justify-center cursor-pointer shadow-lg rounded-[12px] sm:rounded-[14px] overflow-hidden ${isMobile ? "w-[42px] h-[42px]" : "w-[52px] h-[52px]"}`}>
              <img src="/os/notas-apple.png" className="w-full h-full object-cover" alt="Notas" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Notas
            </span>
            {openWindows.notes.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

          {/* Terminal Icon */}
          <motion.div
            onClick={() => openApp("terminal")}
            whileHover={{ scale: 1.25, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-0.5 relative group"
          >
            <div className={`rounded-[12px] sm:rounded-[14px] flex items-center justify-center cursor-pointer shadow-lg overflow-hidden ${isMobile ? "w-[42px] h-[42px]" : "w-[52px] h-[52px]"}`}>
              <img src="/os/terminal.png" className="w-full h-full object-cover" alt="Terminal" />
            </div>
            <span className="absolute bottom-[72px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 group-hover:bottom-[66px] index-dock-tooltip index-dock-tooltip-arrow shadow-md font-medium whitespace-nowrap transition-all pointer-events-none z-[99999]">
              Terminal
            </span>
            {openWindows.terminal.isOpen && (
              <div className="w-[4px] h-[4px] rounded-full bg-white absolute bottom-[-8px] left-1/2 -translate-x-1/2" />
            )}
          </motion.div>

        </div>
      </div>

    </div>
  );
}
