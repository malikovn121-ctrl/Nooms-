import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "motion/react";
import { Plus, Camera } from "lucide-react";

export type NavTabId = "home" | "groups" | "progress" | "settings";

export interface FloatingBottomNavProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
  onAddClick?: () => void;
  isAddMenuOpen?: boolean;
  onToggleAddMenu?: () => void;
  onCloseAddMenu?: () => void;
  onAddPet?: () => void;
  onCheckPet?: () => void;
  currentLanguage?: string;
}

interface SoftIconProps {
  filled?: boolean;
  className?: string;
}

// 1. Soft Home Icon (Friendly rounded organic roof and soft arched door with seamless floor)
export function SoftHomeIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.36 3.6C11.27 2.69 12.73 2.69 13.64 3.6L20.2 10.15C20.84 10.79 21.2 11.66 21.2 12.57V18.5C21.2 20.16 19.86 21.5 18.2 21.5H14.8V15.8C14.8 14.25 13.55 13 12 13C10.45 13 9.2 14.25 9.2 15.8V21.5H5.8C4.14 21.5 2.8 20.16 2.8 18.5V12.57C2.8 11.66 3.16 10.79 3.8 10.15L10.36 3.6Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.8 10.15L10.36 3.6C11.27 2.69 12.73 2.69 13.64 3.6L20.2 10.15C20.84 10.79 21.2 11.66 21.2 12.57V18.5C21.2 20.16 19.86 21.5 18.2 21.5H14.8V15.8C14.8 14.25 13.55 13 12 13C10.45 13 9.2 14.25 9.2 15.8V21.5H5.8C4.14 21.5 2.8 20.16 2.8 18.5V12.57C2.8 11.66 3.16 10.79 3.8 10.15Z" />
    </svg>
  );
}

// 2. Soft Message / Chat Icon (Clean iOS rounded speech bubble with tail)
export function SoftGroupsIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C6.48 3 2 7.03 2 12C2 14.18 2.86 16.18 4.3 17.74C3.88 19.34 2.97 20.44 2.89 20.53C2.65 20.82 2.68 21.25 2.96 21.51C3.12 21.65 3.32 21.72 3.53 21.72C4.94 21.72 7.22 20.89 8.65 19.92C9.72 20.61 10.82 21 12 21C17.52 21 22 16.97 22 12C22 7.03 17.52 3 12 3Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8c0 2.054.872 3.932 2.32 5.378-.292 1.543-1.07 2.69-1.083 2.709a.75.75 0 0 0 .763 1.163c1.65-.33 3.61-1.096 4.79-1.888A9.7 9.7 0 0 0 12 20c4.97 0 9-3.582 9-8z" />
    </svg>
  );
}

// 3. Soft Progress / Chart Icon (Smooth rounded capsule bars in Apple Health aesthetic)
export function SoftChartIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" className={className}>
        <rect x="3.5" y="11" width="4" height="9.5" rx="2" fill="currentColor" />
        <rect x="10" y="3.5" width="4" height="17" rx="2" fill="currentColor" />
        <rect x="16.5" y="7.5" width="4" height="13" rx="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="11" width="4" height="9.5" rx="2" />
      <rect x="10" y="3.5" width="4" height="17" rx="2" />
      <rect x="16.5" y="7.5" width="4" height="13" rx="2" />
    </svg>
  );
}

// 4. Soft Settings Icon (Rounded smooth gear with circular center)
export function SoftSettingsIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const TABS: { id: NavTabId; label: string; icon: React.ComponentType<SoftIconProps> }[] = [
  { id: "home", label: "Home", icon: SoftHomeIcon },
  { id: "groups", label: "Groups", icon: SoftGroupsIcon },
  { id: "progress", label: "Analytics", icon: SoftChartIcon },
  { id: "settings", label: "Settings", icon: SoftSettingsIcon },
];

interface TabItemProps {
  tab: { id: NavTabId; label: string; icon: React.ComponentType<SoftIconProps> };
  index: number;
  tabWidth: number;
  isActive: boolean;
  isDark: boolean;
  currentX: MotionValue<number>;
  onSelect: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  index,
  tabWidth,
  isActive,
  isDark,
  currentX,
  onSelect,
}) => {
  const tabCenter = index * tabWidth;
  
  // High contrast adaptive icon colors:
  // Light theme: white on dark pill; Dark theme: pure black (#000000) on white pill
  const inactiveColor = isDark ? "#98989D" : "#71717A";
  const activeColor = isDark ? "#000000" : "#FFFFFF";

  const iconColor = useTransform(
    currentX,
    [tabCenter - tabWidth * 0.45, tabCenter, tabCenter + tabWidth * 0.45],
    [inactiveColor, activeColor, inactiveColor]
  );

  const IconComponent = tab.icon;

  return (
    <button
      id={`nav-tab-${tab.id}`}
      type="button"
      onClick={onSelect}
      className="relative z-10 w-[64px] h-[52px] rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none"
    >
      <motion.div
        animate={{
          scale: isActive ? 1.06 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        style={{ color: iconColor }}
        className="flex items-center justify-center"
      >
        <IconComponent
          filled={isActive}
          className="w-[23px] h-[23px]"
        />
      </motion.div>
    </button>
  );
};

export default function FloatingBottomNav({
  activeTab,
  onChangeTab,
  onAddClick,
  isAddMenuOpen = false,
  onToggleAddMenu,
  onCloseAddMenu,
  onAddPet,
  onCheckPet,
  currentLanguage = "en",
}: FloatingBottomNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabWidth, setTabWidth] = useState(64);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Track dark theme state reactively
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => checkDark();
    mql.addEventListener?.("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mql.removeEventListener?.("change", handleMediaChange);
    };
  }, []);

  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  
  // Base raw position
  const pillX = useMotionValue(activeIndex * tabWidth);
  // Ultra-responsive high-stiffness spring for snappy motion
  const springX = useSpring(pillX, { stiffness: 600, damping: 35, mass: 0.75 });

  // Update when active tab or tab width changes
  useEffect(() => {
    if (!isDraggingRef.current) {
      pillX.set(activeIndex * tabWidth);
    }
  }, [activeIndex, tabWidth, pillX]);

  useEffect(() => {
    if (containerRef.current) {
      const firstBtn = containerRef.current.querySelector("button");
      if (firstBtn && firstBtn.offsetWidth > 0) {
        setTabWidth(firstBtn.offsetWidth);
      }
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 8;
      const rawX = e.clientX - rect.left - padding - tabWidth / 2;
      const maxX = (TABS.length - 1) * tabWidth;
      const clampedX = Math.max(0, Math.min(maxX, rawX));
      
      pillX.set(clampedX);

      // Smoothly switch active tab as finger passes midway
      const nearestIndex = Math.round(clampedX / tabWidth);
      const targetTab = TABS[nearestIndex]?.id;
      if (targetTab && targetTab !== activeTab) {
        onChangeTab(targetTab);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (isDraggingRef.current) {
      pillX.set(activeIndex * tabWidth);
    }
    isDraggingRef.current = false;
  };

  const handleTabSelect = (tabId: NavTabId) => {
    onChangeTab(tabId);
    const newIdx = TABS.findIndex((t) => t.id === tabId);
    if (newIdx !== -1) {
      pillX.set(newIdx * tabWidth);
    }
  };

  return (
    <>
      {/* 1. Left-aligned floating navigation pill with Liquid Glass effect (rendered at z-30) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex items-center justify-start pointer-events-none z-30 select-none">
        <div
          ref={containerRef}
          onPointerDown={isAddMenuOpen ? undefined : handlePointerDown}
          onPointerMove={isAddMenuOpen ? undefined : handlePointerMove}
          onPointerUp={isAddMenuOpen ? undefined : handlePointerUp}
          onPointerCancel={isAddMenuOpen ? undefined : handlePointerUp}
          className={`pointer-events-auto bg-white/60 dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] backdrop-blur-2xl backdrop-saturate-150 border border-white/75 dark:border-white/[0.08] p-2 rounded-full flex items-center shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] relative cursor-pointer touch-none transition-all duration-300 ${
            isAddMenuOpen ? "opacity-30 blur-[4px] scale-[0.97] pointer-events-none" : "opacity-100 blur-0 scale-100"
          }`}
        >
          {/* Continuous Interactive Sliding Pill: dark theme is pure white, light theme is dark #18181B */}
          <motion.div
            style={{ 
              x: springX, 
              width: tabWidth 
            }}
            className="absolute top-2 bottom-2 left-2 bg-[#18181B] dark:bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] pointer-events-none z-0"
          />

          {TABS.map((tab, idx) => (
            <TabItem
              key={`${tab.id}-${isDark ? "dark" : "light"}`}
              tab={tab}
              index={idx}
              tabWidth={tabWidth}
              isActive={activeTab === tab.id}
              isDark={isDark}
              currentX={springX}
              onSelect={() => handleTabSelect(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* 2. Full-screen backdrop blur when '+' menu is active (rendered at z-40, blurring the page AND bottom pill nav at z-30) */}
      <AnimatePresence>
        {isAddMenuOpen && (
          <motion.div
            key="plus-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onCloseAddMenu}
            className="fixed inset-0 z-40 bg-black/50 dark:bg-black/75 backdrop-blur-xl pointer-events-auto cursor-pointer select-none"
          />
        )}
      </AnimatePresence>

      {/* 3. Right-aligned container with Plus/Cross button and vertical menu above (rendered at z-[45], sharp and unblurred) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex items-center justify-end pointer-events-none z-[45] select-none">
        <div className="relative flex flex-col items-end">
          {/* Floating Menu options above the button */}
          <AnimatePresence>
            {isAddMenuOpen && (
              <motion.div
                key="plus-action-items"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="absolute bottom-[104px] right-0 flex flex-col items-end gap-5 pointer-events-auto pb-1"
              >
                {/* 1. Add a Pet [large white circle with plus icon] */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, y: 22, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 460, damping: 26, delay: 0.05 }}
                  onClick={() => {
                    onCloseAddMenu?.();
                    onAddPet?.();
                  }}
                  className="flex items-center gap-4 cursor-pointer group pointer-events-auto focus:outline-none"
                >
                  <span className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] select-none whitespace-nowrap">
                    Add a Pet
                  </span>
                  <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-white text-black shadow-[0_10px_28px_rgba(0,0,0,0.28)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 active:scale-95 transition-transform duration-150">
                    <Plus className="w-8 h-8 text-black stroke-[2.6]" />
                  </div>
                </motion.button>

                {/* 2. Check Pet [large white circle with camera icon] */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, y: 22, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 460, damping: 26, delay: 0.02 }}
                  onClick={() => {
                    onCloseAddMenu?.();
                    onCheckPet?.();
                  }}
                  className="flex items-center gap-4 cursor-pointer group pointer-events-auto focus:outline-none"
                >
                  <span className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] select-none whitespace-nowrap">
                    Check Pet
                  </span>
                  <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-white text-black shadow-[0_10px_28px_rgba(0,0,0,0.28)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 active:scale-95 transition-transform duration-150">
                    <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-black stroke-[2.3]" />
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Plus button that morphs into a cross by rotating 45 degrees, preserving exact color */}
          <motion.button
            id="bottom-nav-plus-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleAddMenu || onAddClick}
            className="pointer-events-auto w-16 h-16 rounded-full bg-white/60 dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] backdrop-blur-2xl backdrop-saturate-150 border border-white/75 dark:border-white/[0.08] shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] flex items-center justify-center text-zinc-900 dark:text-white hover:text-black dark:hover:text-white hover:bg-white/75 dark:hover:from-[#242426] dark:hover:to-[#1F1F21] active:bg-white/85 transition-all cursor-pointer flex-shrink-0"
            aria-label={isAddMenuOpen ? "Close menu" : "Add"}
          >
            <motion.div
              animate={{ rotate: isAddMenuOpen ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Plus className="w-7 h-7 stroke-[2.4]" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </>
  );
}

