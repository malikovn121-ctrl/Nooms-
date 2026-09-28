import React, { useState, useRef, useEffect } from "react";
import { Pet, AnalysisReport } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Heart,
  UserPlus,
  Flame,
  Pencil,
  MoreHorizontal,
  ArrowUpDown,
  Edit2,
  Image as ImageIcon,
  LogOut,
  UserRound,
  Trophy,
  PawPrint,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { SoftGroupsIcon } from "./FloatingBottomNav";
import petsTrioImg from "../assets/images/corgi_pets_transparent.png";
import petsTrioDarkImg from "../assets/images/pets_trio_dark_transparent.png";

interface GroupsViewProps {
  activePet: Pet;
  currentLanguage: string;
  animateEntrance?: boolean;
  reportsList?: AnalysisReport[];
  pets?: Pet[];
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  petName: string;
  petImage?: string;
  lastCheck: string;
  status: "checked" | "resting" | "pending";
  streak: number;
  bestStreak?: number;
  totalChecks: number;
  petsCount?: number;
}

export interface ActiveGroup {
  id: string;
  name: string;
  code: string;
  streakDays: number;
  bestStreak: number;
  totalChecks: number;
  iconImage?: string;
  iconGradient?: string;
  members: GroupMember[];
}

const STORAGE_KEY = "petkit_active_group";

// Classic iOS SF Symbol solid filled profile (human person) icon
const ClassicFilledUserIcon = ({ className = "w-7 h-7 text-[#8E8E93]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <circle cx="12" cy="7.5" r="4.2" />
    {/* Shoulders / Torso */}
    <path d="M12 13.5C7.2 13.5 3.5 17 3.5 21a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1c0-4-3.7-7.5-8.5-7.5z" />
  </svg>
);

// Official custom Tinder-style flame icon matching the app's Streak card
const StreakFlameIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.317 9.451c.045.073.123.12.212.12.06 0 .116-.021.158-.057l.015-.012c.39-.325.741-.66 1.071-1.017 3.209-3.483 1.335-7.759 1.32-7.799-.09-.21-.03-.459.15-.594.195-.135.435-.12.615.033 10.875 10.114 7.995 17.818 7.785 18.337-.87 3.141-4.335 5.414-8.444 5.53-.138.008-.242.008-.363.008-4.852 0-8.977-2.989-8.977-6.807v-.06c0-5.297 4.795-10.522 5.009-10.744.136-.149.345-.195.525-.105.18.076.297.255.291.451-.043 1.036.167 1.935.631 2.7v.015l.002.001z"
      fill="#FF8B00"
    />
  </svg>
);

// High-fidelity Flame icon for stats card
const StreakFlameIconBig = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.5 2C11.5 2 15.5 6 15.5 10C15.5 11.8 14.7 13.2 13.5 14.2C13.1 13.5 12.6 12.8 12.2 12.2C10.8 10.3 10.2 8.2 10.2 5.8C8 8.2 5.8 11.8 5.8 15.8C5.8 19.8 9 22.5 13 22.5C17.2 22.5 20.5 19.2 20.5 15C20.5 10.2 16.5 5.5 11.5 2Z"
      fill="url(#statFlameGrad)"
    />
    <path
      d="M12.5 14.5C12.5 14.5 14.5 16.2 14.5 18C14.5 19.2 13.6 20.2 12.5 20.2C11.4 20.2 10.5 19.2 10.5 18C10.5 16.2 12.5 14.5 12.5 14.5Z"
      fill="#FFE600"
    />
    <defs>
      <linearGradient id="statFlameGrad" x1="12" y1="2" x2="16" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF9500" />
        <stop offset="1" stopColor="#FF3B30" />
      </linearGradient>
    </defs>
  </svg>
);

// Gold medal / ribbon badge icon matching "Best streak" card from IMG_6885
const GoldMedalRibbonIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8.5" r="5" stroke="#E69500" strokeWidth="2" fill="none" />
    <path
      d="M9 13L8 20L12 18L16 20L15 13"
      stroke="#E69500"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#E69500"
    />
  </svg>
);

// Total pet checks sun icon matching "Total checks" card from IMG_6885
const TotalChecksSunIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="#E69500" />
    <path
      d="M12 3V5M12 19V21M3 12H5M19 12H21M5.636 5.636L7.05 7.05M16.95 16.95L18.364 18.364M5.636 18.364L7.05 16.95M16.95 7.05L18.364 5.636"
      stroke="#E69500"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Pets tracked stacked layers icon matching "Pets tracked" card from IMG_6885
const PetsTrackedLayersIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="14" height="6.5" rx="2.5" fill="#F4B89A" />
    <rect x="4" y="8" width="16" height="6.5" rx="2.5" fill="#EE9C73" />
    <rect x="3" y="12" width="18" height="7" rx="3" fill="#E67B48" />
  </svg>
);

// Frame / Scan icon representing pet checks matching the main screen check pet frame
const CheckFrameIcon = ({ className = "w-4 h-4 text-[#007AFF]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Corner 1: Top-Left */}
    <path
      d="M8 3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Corner 2: Top-Right */}
    <path
      d="M16 3.5H18.5C19.6046 3.5 20.5 4.39543 20.5 5.5V8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Corner 3: Bottom-Left */}
    <path
      d="M8 20.5H5.5C4.39543 20.5 3.5 19.6046 3.5 18.5V16"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Corner 4: Bottom-Right */}
    <path
      d="M16 20.5H18.5C19.6046 20.5 20.5 19.6046 20.5 18.5V16"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center subtle dot / focal point */}
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// Perfectly proportioned, 100% solid filled symmetrical Trophy cup
const SolidTrophyIcon = ({ className = "w-6 h-6 text-[#FFB800]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Handle Loop */}
    <path d="M3 5.5C3 4.67 3.67 4 4.5 4H6V8.5C6 9.88 7.12 11 8.5 11H9.2C7.3 12.3 5 11.8 4.1 10.3C3.4 9.1 3 7.7 3 6.3V5.5Z" />
    {/* Right Handle Loop */}
    <path d="M21 5.5C21 4.67 20.33 4 19.5 4H18V8.5C18 9.88 16.88 11 15.5 11H14.8C16.7 12.3 19 11.8 19.9 10.3C20.6 9.1 21 7.7 21 6.3V5.5Z" />
    {/* Cup Bowl */}
    <path d="M5 3.5C5 2.67 5.67 2 6.5 2H17.5C18.33 2 19 2.67 19 3.5V8C19 11.87 15.87 15 12 15C8.13 15 5 11.87 5 8V3.5Z" />
    {/* Stem */}
    <path d="M10.5 14.5H13.5V17.5H10.5V14.5Z" />
    {/* Pedestal Base */}
    <path d="M7 18.5C7 17.67 7.67 17 8.5 17H15.5C16.33 17 17 17.67 17 18.5V20.5C17 21.33 16.33 22 15.5 22H8.5C7.67 22 7 21.33 7 20.5V18.5Z" />
  </svg>
);

// Scan frames viewfinder icon matching the exact rounded corner brackets from the main screen / pet scanner
const ScanViewfinderIcon = ({ className = "w-6 h-6 text-[#007AFF]" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    stroke="currentColor"
    strokeWidth="9"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top-Left Bracket */}
    <path d="M 32 12 L 25 12 A 13 13 0 0 0 12 25 L 12 32" />
    {/* Top-Right Bracket */}
    <path d="M 68 12 L 75 12 A 13 13 0 0 1 88 25 L 88 32" />
    {/* Bottom-Left Bracket */}
    <path d="M 12 68 L 12 75 A 13 13 0 0 0 25 88 L 32 88" />
    {/* Bottom-Right Bracket */}
    <path d="M 88 68 L 88 75 A 13 13 0 0 1 75 88 L 68 88" />
  </svg>
);

// Helper to calculate consecutive day streak from real scan reports
const calculateStreak = (reports: AnalysisReport[] = []): number => {
  if (!reports || reports.length === 0) return 0;
  const uniqueDates = Array.from(new Set(reports.map((r) => r.date.split("T")[0])));
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let startStr = "";
  if (uniqueDates.includes(todayStr)) {
    startStr = todayStr;
  } else if (uniqueDates.includes(yesterdayStr)) {
    startStr = yesterdayStr;
  } else {
    return 0;
  }

  let streak = 0;
  let currentDate = startStr;
  while (uniqueDates.includes(currentDate)) {
    streak++;
    const d = new Date(currentDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    currentDate = d.toISOString().split("T")[0];
  }
  return streak;
};

// Helper to calculate best all-time streak from real scan reports
const calculateBestStreak = (reports: AnalysisReport[] = []): number => {
  if (!reports || reports.length === 0) return 0;
  const uniqueDates = Array.from(new Set(reports.map((r) => r.date.split("T")[0])))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr + "T00:00:00Z");
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  maxStreak = Math.max(maxStreak, currentStreak);
  const liveStreak = calculateStreak(reports);
  return Math.max(maxStreak, liveStreak);
};

const REGISTERED_GROUPS_KEY = "registered_groups_registry_v1";

const DEFAULT_PRESET_GROUPS: ActiveGroup[] = [
  {
    id: "preset-paws",
    name: "Paws & Whiskers Club",
    code: "PET 884",
    streakDays: 8,
    bestStreak: 14,
    totalChecks: 42,
    members: [
      {
        id: "m_sarah",
        name: "Sarah & Milo",
        petName: "Milo",
        lastCheck: "Today, 10:20 AM",
        status: "checked",
        streak: 8,
        totalChecks: 15,
        petsCount: 2,
      },
      {
        id: "m_alex",
        name: "Alex & Bella",
        petName: "Bella",
        lastCheck: "Today, 09:15 AM",
        status: "checked",
        streak: 6,
        totalChecks: 12,
        petsCount: 1,
      },
    ],
  },
  {
    id: "preset-dogs",
    name: "Daily Dog Walkers",
    code: "DOG 101",
    streakDays: 12,
    bestStreak: 21,
    totalChecks: 68,
    members: [
      {
        id: "m_emma",
        name: "Emma & Luna",
        petName: "Luna",
        lastCheck: "Today, 11:00 AM",
        status: "checked",
        streak: 12,
        totalChecks: 25,
        petsCount: 2,
      },
      {
        id: "m_dan",
        name: "Dan & Max",
        petName: "Max",
        lastCheck: "Yesterday",
        status: "resting",
        streak: 9,
        totalChecks: 18,
        petsCount: 1,
      },
    ],
  },
  {
    id: "preset-care",
    name: "Pet Care Circle",
    code: "PET 2025",
    streakDays: 5,
    bestStreak: 10,
    totalChecks: 31,
    members: [
      {
        id: "m_oliver",
        name: "Elena & Oliver",
        petName: "Oliver",
        lastCheck: "Today, 08:30 AM",
        status: "checked",
        streak: 5,
        totalChecks: 14,
        petsCount: 3,
      },
    ],
  },
];

const getRegisteredGroups = (): ActiveGroup[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_GROUPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_PRESET_GROUPS;
};

const saveRegisteredGroup = (group: ActiveGroup) => {
  try {
    const existing = getRegisteredGroups();
    const normalize = (c: string) => c.replace(/[\s\-_]/g, "").toUpperCase();
    const filtered = existing.filter(
      (g) => g.id !== group.id && normalize(g.code) !== normalize(group.code)
    );
    const updated = [group, ...filtered];
    localStorage.setItem(REGISTERED_GROUPS_KEY, JSON.stringify(updated));
  } catch {}
};

export default function GroupsView({
  activePet,
  currentLanguage = "en",
  animateEntrance = false,
  reportsList = [],
  pets = [],
}: GroupsViewProps) {
  const isRu = currentLanguage === "ru";
  const liveStreak = calculateStreak(reportsList);
  const liveBestStreak = calculateBestStreak(reportsList);
  const liveTotalChecks = reportsList?.length || 0;

  // Real count of pets tracked by the user in the app
  const realUserPetsCount = (() => {
    if (pets && pets.length > 0) {
      const custom = pets.filter((p) => p.isCustom);
      if (custom.length > 0) return custom.length;
      return pets.length;
    }
    try {
      const stored = localStorage.getItem("pethealth_pets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const custom = parsed.filter((p: any) => p.isCustom);
          return custom.length > 0 ? custom.length : parsed.length;
        }
      }
    } catch {}
    try {
      const single = localStorage.getItem("pethealth_real_user_pet");
      if (single) return 1;
    } catch {}
    return 1;
  })();

  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any stale fake members so only real creator/user exists
        const cleanedMembers: GroupMember[] = (parsed.members || []).filter(
          (m: any) =>
            m.id === "m1" ||
            m.name === "You" ||
            m.isUser ||
            m.petName === activePet.name
        );

        const finalMembers =
          cleanedMembers.length > 0
            ? cleanedMembers
            : [
                {
                  id: "m1",
                  name: "You",
                  petName: activePet.name,
                  lastCheck: "-",
                  status: "resting" as const,
                  streak: 0,
                  totalChecks: 0,
                  petsCount: realUserPetsCount,
                },
              ];

        return {
          ...parsed,
          streakDays: 0,
          bestStreak: 0,
          totalChecks: 0,
          members: finalMembers.map((m) => ({
            ...m,
            petName: m.petName || (m.name === "You" ? activePet.name : m.name),
            petsCount: m.id === "m1" || m.name === "You" ? realUserPetsCount : (m.petsCount || 1),
            // Only keep real user-uploaded avatars (not default animal assets or emoji)
            avatar:
              m.avatar &&
              m.avatar !== "👤" &&
              (m.avatar.startsWith("data:image") || m.avatar.startsWith("http") || m.avatar.startsWith("blob:"))
                ? m.avatar
                : undefined,
            petImage: undefined,
            streak: 0,
            totalChecks: 0,
          })),
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdGroupCode, setCreatedGroupCode] = useState<string>("");
  const [pendingGroup, setPendingGroup] = useState<ActiveGroup | null>(null);
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [userNickname, setUserNickname] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("pethealth_user_nickname");
      if (saved) return saved;
      const userProfileRaw = localStorage.getItem("pethealth_user_profile");
      if (userProfileRaw) {
        const parsed = JSON.parse(userProfileRaw);
        if (parsed?.name) return parsed.name;
      }
    } catch {}
    return "";
  });
  const [userNicknameInput, setUserNicknameInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("pethealth_user_nickname");
      if (saved) return saved;
      const userProfileRaw = localStorage.getItem("pethealth_user_profile");
      if (userProfileRaw) {
        const parsed = JSON.parse(userProfileRaw);
        if (parsed?.name) return parsed.name;
      }
    } catch {}
    return "";
  });
  const [showAddGroupPopup, setShowAddGroupPopup] = useState<boolean>(false);
  const [groupNameInput, setGroupNameInput] = useState<string>("");
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinError, setJoinError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Group Details view & interactions state
  const [showGroupDetails, setShowGroupDetails] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>("");
  const [showChangeIconModal, setShowChangeIconModal] = useState<boolean>(false);
  const [editUploadedIcon, setEditUploadedIcon] = useState<string | null>(null);
  const [leaderboardSort, setLeaderboardSort] = useState<"streak" | "checks">("streak");
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<GroupMember | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editIconInputRef = useRef<HTMLInputElement | null>(null);

  // Compress image helper to reduce megabyte-sized uploads down to ~15-25KB
  const compressImage = (
    fileOrDataUrl: File | string,
    maxWidth = 256,
    maxHeight = 256,
    quality = 0.75
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : "");
        }
      };
      img.onerror = () => {
        resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : "");
      };

      if (typeof fileOrDataUrl === "string") {
        img.src = fileOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            resolve("");
          }
        };
        reader.readAsDataURL(fileOrDataUrl);
      }
    });
  };

  // Synchronize active group with localStorage safely with quota-overflow handling
  useEffect(() => {
    const saveGroup = async () => {
      if (!activeGroup) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeGroup));
      } catch {
        // Quota exceeded: compress heavy images or strip them to fit inside storage
        try {
          const compressedIcon =
            activeGroup.iconImage && activeGroup.iconImage.length > 40000
              ? await compressImage(activeGroup.iconImage, 160, 160, 0.65)
              : activeGroup.iconImage;

          const sanitizedGroup = {
            ...activeGroup,
            iconImage: compressedIcon,
            members: activeGroup.members.map((m) => ({
              ...m,
              petImage: m.petImage && m.petImage.length > 40000 ? undefined : m.petImage,
            })),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedGroup));
        } catch {
          // Minimal fallback: remove images completely from storage to guarantee persistence
          try {
            const minGroup = {
              ...activeGroup,
              iconImage: undefined,
              members: activeGroup.members.map((m) => ({
                ...m,
                petImage: undefined,
              })),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minGroup));
          } catch (e) {
            console.warn("Storage quota full, maintaining group state in-memory", e);
          }
        }
      }
    };

    saveGroup();
  }, [activeGroup]);

  // Keep 'You' member updated with activePet info (name only)
  useEffect(() => {
    if (activeGroup && activePet) {
      setActiveGroup((prev) => {
        if (!prev) return null;
        let changed = false;
        const updatedMembers = prev.members.map((m) => {
          if (m.id === "m1" || m.name === "You") {
            if (m.petName !== activePet.name || m.petImage) {
              changed = true;
              return {
                ...m,
                petName: activePet.name,
                petImage: undefined,
              };
            }
          }
          return m;
        });
        if (!changed) return prev;
        return {
          ...prev,
          members: updatedMembers,
        };
      });
    }
  }, [activePet?.id, activePet?.name]);

  const generateGroupCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 3; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${part1} ${part2}`;
  };

  const handleStartCreate = () => {
    setCreateStep(1);
    const initialNick = userNickname || (localStorage.getItem("pethealth_user_nickname") || "");
    setUserNicknameInput(initialNick);
    setGroupNameInput("");
    setUploadedIcon(null);
    setCreatedGroupCode("");
    setPendingGroup(null);
    setShowCreateModal(true);
  };

  const handleContinueFromNickname = () => {
    const trimmed = userNicknameInput.trim();
    if (!trimmed) return;
    setUserNickname(trimmed);
    try {
      localStorage.setItem("pethealth_user_nickname", trimmed);
    } catch {}
    setCreateStep(2);
  };

  const handleGoToIconPicker = () => {
    if (!groupNameInput.trim()) return;
    setCreateStep(3);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 256, 256, 0.75);
      if (compressed) {
        setUploadedIcon(compressed);
      }
    }
  };

  const handleEditIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 256, 256, 0.75);
      if (compressed) {
        setEditUploadedIcon(compressed);
      }
    }
  };

  const handleOpenChangeIcon = () => {
    if (activeGroup) {
      setEditUploadedIcon(activeGroup.iconImage || null);
      setShowMoreMenu(false);
      setShowChangeIconModal(true);
    }
  };

  const handleSaveChangeIcon = () => {
    if (activeGroup) {
      setActiveGroup({
        ...activeGroup,
        iconImage: editUploadedIcon || undefined,
      });
      setShowChangeIconModal(false);
    }
  };

  const handleCreateGroup = () => {
    if (!groupNameInput.trim()) return;
    const randomCode = generateGroupCode();
    setCreatedGroupCode(randomCode);

    const displayName = userNicknameInput.trim() || userNickname.trim() || "You";

    const newGroup: ActiveGroup = {
      id: Math.random().toString(36).substring(2, 9),
      name: groupNameInput.trim(),
      code: randomCode,
      streakDays: 0,
      bestStreak: 0,
      totalChecks: 0,
      iconImage: uploadedIcon || undefined,
      members: [
        {
          id: "m1",
          name: displayName,
          petName: activePet.name,
          lastCheck: "-",
          status: "resting",
          streak: 0,
          totalChecks: 0,
          petsCount: realUserPetsCount,
        },
      ],
    };

    saveRegisteredGroup(newGroup);
    setPendingGroup(newGroup);
    setCreateStep(4);
  };

  const handleFinishCreateGroup = () => {
    if (pendingGroup) {
      setActiveGroup(pendingGroup);
    }
    setShowCreateModal(false);
    setCreateStep(1);
    setGroupNameInput("");
    setUploadedIcon(null);
    setCreatedGroupCode("");
    setPendingGroup(null);
  };

  const getShareMessage = (group?: ActiveGroup | null) => {
    const targetGroup = group || activeGroup || pendingGroup;
    const name = targetGroup?.name || groupNameInput.trim() || "Pet Care";
    const code = targetGroup?.code || createdGroupCode || "";
    return `Have you tried Petkit? I’ve got a little pet care group going where we share our pet checks and keep a streak. Come join “${name}” with code "${code}".`;
  };

  const handleTextToFriend = (group?: ActiveGroup | null) => {
    const message = getShareMessage(group);
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
  };

  const handleShareAnotherWay = async (group?: ActiveGroup | null) => {
    const targetGroup = group || activeGroup || pendingGroup;
    const message = getShareMessage(targetGroup);
    if (navigator.share) {
      try {
        await navigator.share({
          title: targetGroup?.name || groupNameInput.trim() || "Pet Care Group",
          text: message,
        });
      } catch {
        // User dismissed or share error
      }
    } else {
      handleCopyCode(message);
    }
  };

  const handleJoinGroup = () => {
    const trimmed = joinCodeInput.trim();
    if (!trimmed) return;

    const normalize = (c: string) => c.replace(/[\s\-_]/g, "").toUpperCase();
    const normalizedInput = normalize(trimmed);

    const allGroups = getRegisteredGroups();
    const found = allGroups.find((g) => normalize(g.code) === normalizedInput);

    if (!found) {
      setJoinError("Group with this code was not found. Please check the code.");
      return;
    }

    const hasUser = found.members.some(
      (m) => m.id === "m1" || m.name === "You" || m.petName === activePet.name
    );
    const updatedMembers: GroupMember[] = hasUser
      ? found.members
      : [
          {
            id: "m1",
            name: "You",
            petName: activePet.name,
            lastCheck: "-",
            status: "resting",
            streak: 0,
            totalChecks: 0,
            petsCount: realUserPetsCount,
          },
          ...found.members,
        ];

    const joinedGroup: ActiveGroup = {
      ...found,
      members: updatedMembers,
    };

    saveRegisteredGroup(joinedGroup);
    setActiveGroup(joinedGroup);
    setShowJoinModal(false);
    setJoinCodeInput("");
    setJoinError("");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenRename = () => {
    if (activeGroup) {
      setRenameInput(activeGroup.name);
      setShowMoreMenu(false);
      setShowRenameModal(true);
    }
  };

  const handleSaveRename = () => {
    if (activeGroup && renameInput.trim()) {
      setActiveGroup({
        ...activeGroup,
        name: renameInput.trim(),
      });
      setShowRenameModal(false);
    }
  };

  const handleLeaveGroup = () => {
    setShowMoreMenu(false);
    setShowGroupDetails(false);
    setShowCreateModal(false);
    setCreateStep(1);
    setPendingGroup(null);
    setActiveGroup(null);
  };

  // Sort members for leaderboard
  const sortedMembers = activeGroup
    ? [...activeGroup.members].sort((a, b) => {
        if (leaderboardSort === "streak") {
          return (b.streak || 0) - (a.streak || 0);
        }
        return (b.totalChecks || 0) - (a.totalChecks || 0);
      })
    : [];

  // Render member profile full-screen view (like Streak & Status pages)
  const renderMemberProfileModal = () => (
    <AnimatePresence>
      {selectedMemberForProfile && (
        <motion.div
          key={`member-profile-screen-${selectedMemberForProfile.id}`}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 bg-[#f5f4fa] dark:bg-[#000000] z-[120] flex flex-col justify-between p-6 pb-12 overflow-y-auto select-none text-[#1c1c1e] dark:text-white transition-colors"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
          }}
        >
          {/* Top Header with circular Close (X) button on top-left */}
          <div className="flex items-center justify-between w-full pt-3 relative">
            <button
              id="close-member-profile-btn"
              onClick={() => setSelectedMemberForProfile(null)}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
            </button>

            {/* Invisible spacer for symmetry */}
            <div className="w-12 h-12 invisible flex-shrink-0" />
          </div>

          {/* Main Content Area */}
          <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center my-auto py-4">
            {(() => {
              const isSelectedUser =
                selectedMemberForProfile.id === "m1" ||
                selectedMemberForProfile.name === "You" ||
                (Boolean(userNickname) && selectedMemberForProfile.name === userNickname) ||
                (selectedMemberForProfile as any).isUser ||
                (pets || []).some(
                  (p) =>
                    p.name?.trim().toLowerCase() === selectedMemberForProfile.petName?.trim().toLowerCase() ||
                    p.name?.trim().toLowerCase() === selectedMemberForProfile.name?.trim().toLowerCase()
                ) ||
                selectedMemberForProfile.petName === activePet?.name;
              const memberDisplayName = isSelectedUser
                ? (selectedMemberForProfile.name && selectedMemberForProfile.name !== "You"
                    ? selectedMemberForProfile.name
                    : (userNickname || activePet?.name || "You"))
                : (selectedMemberForProfile.petName || selectedMemberForProfile.name || "Member");
              const memberAvatarUrl =
                selectedMemberForProfile.avatar &&
                selectedMemberForProfile.avatar !== "👤" &&
                (selectedMemberForProfile.avatar.startsWith("data:image") ||
                  selectedMemberForProfile.avatar.startsWith("http") ||
                  selectedMemberForProfile.avatar.startsWith("blob:"))
                  ? selectedMemberForProfile.avatar
                  : undefined;

              // 1. Current streak at that moment:
              const currentStreakVal = isSelectedUser
                ? liveStreak
                : (selectedMemberForProfile.streak || 0);

              // 2. Max consecutive days streak:
              const bestStreakVal = isSelectedUser
                ? liveBestStreak
                : (selectedMemberForProfile.bestStreak !== undefined
                    ? selectedMemberForProfile.bestStreak
                    : Math.max(selectedMemberForProfile.streak || 0, 0));

              // 3. Total checks count:
              const totalChecksVal = isSelectedUser
                ? liveTotalChecks
                : (selectedMemberForProfile.totalChecks || 0);

              // 4. Total tracked pets (strictly real user count when user profile is opened):
              const petsTrackedVal = isSelectedUser
                ? realUserPetsCount
                : (selectedMemberForProfile.petsCount !== undefined && selectedMemberForProfile.petsCount > 0
                    ? selectedMemberForProfile.petsCount
                    : ((Math.abs(selectedMemberForProfile.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 2) + 1));

              return (
                <>
                  {/* Large Avatar */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center overflow-hidden shadow-xs border border-black/5 dark:border-white/10 flex-shrink-0">
                    {memberAvatarUrl ? (
                      <img
                        src={memberAvatarUrl}
                        alt={memberDisplayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ClassicFilledUserIcon className="w-16 h-16 text-[#8E8E93] dark:text-[#98989D]" />
                    )}
                  </div>

                  {/* Member / Pet Name */}
                  <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#1C1C1E] dark:text-white text-center mt-4 tracking-tight leading-tight">
                    {memberDisplayName}
                  </h2>

                  {/* Stats Title */}
                  <div className="w-full mt-7 mb-3 px-1">
                    <span className="text-[14px] font-bold text-[#8E8E93] dark:text-[#98989D] text-left uppercase tracking-wider">
                      Stats
                    </span>
                  </div>

                  {/* 2x2 Stats Plates Grid */}
                  <div className="grid grid-cols-2 gap-3.5 w-full">
                    {/* Plate 1: Current streak */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-5 shadow-xs border border-black/[0.03] dark:border-white/10 flex flex-col justify-between min-h-[135px] transition-colors">
                      <div className="flex items-center justify-start">
                        <Flame className="w-6 h-6 text-[#FF8B00] fill-[#FF8B00]" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">
                          {currentStreakVal}
                        </span>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#8E8E93] dark:text-[#98989D] mt-1.5 leading-tight">
                          Current streak
                        </p>
                      </div>
                    </div>

                    {/* Plate 2: Best streak */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-5 shadow-xs border border-black/[0.03] dark:border-white/10 flex flex-col justify-between min-h-[135px] transition-colors">
                      <div className="flex items-center justify-start">
                        <SolidTrophyIcon className="w-6 h-6 text-[#FFB800]" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">
                          {bestStreakVal}
                        </span>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#8E8E93] dark:text-[#98989D] mt-1.5 leading-tight">
                          Best streak
                        </p>
                      </div>
                    </div>

                    {/* Plate 3: Total checks */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-5 shadow-xs border border-black/[0.03] dark:border-white/10 flex flex-col justify-between min-h-[135px] transition-colors">
                      <div className="flex items-center justify-start">
                        <ScanViewfinderIcon className="w-6 h-6 text-[#007AFF]" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">
                          {totalChecksVal}
                        </span>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#8E8E93] dark:text-[#98989D] mt-1.5 leading-tight">
                          Total checks
                        </p>
                      </div>
                    </div>

                    {/* Plate 4: Pets tracked */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-5 shadow-xs border border-black/[0.03] dark:border-white/10 flex flex-col justify-between min-h-[135px] transition-colors">
                      <div className="flex items-center justify-start">
                        <PawPrint className="w-6 h-6 text-[#AF52DE] fill-[#AF52DE]" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">
                          {petsTrackedVal}
                        </span>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#8E8E93] dark:text-[#98989D] mt-1.5 leading-tight">
                          Pets tracked
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Bottom spacing helper */}
          <div className="w-full h-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Full-Screen Create Group Page (4-step flow: 1. Nickname -> 2. Group name -> 3. Pick icon -> 4. Share code)
  const renderCreateGroupModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 bg-[#f5f4fa] dark:bg-[#000000] z-50 flex flex-col justify-start p-6 overflow-y-auto select-none text-[#1c1c1e] dark:text-white transition-colors"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
        >
          {/* Top Navigation Row: Back (when on Step 2 or 3) and Close (X) */}
          <div className="flex items-center justify-between w-full pt-1">
            {createStep > 1 && createStep < 4 ? (
              <button
                onClick={() => setCreateStep((prev) => (prev - 1) as any)}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-[#374151] dark:text-white" strokeWidth={2.2} />
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}

            <button
              id="close-create-group-btn"
              onClick={
                createStep === 4
                  ? handleFinishCreateGroup
                  : () => {
                      setShowCreateModal(false);
                      setCreateStep(1);
                      setGroupNameInput("");
                      setUploadedIcon(null);
                    }
              }
              className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#374151] dark:text-white" strokeWidth={2.2} />
            </button>
          </div>

          {/* Step 1: User Nickname (First screen on creating a group) */}
          {createStep === 1 && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center mt-3 px-1">
              <h2 className="text-[28px] sm:text-[30px] font-bold text-black dark:text-white tracking-tight text-center">
                {isRu ? "Ваш никнейм" : "Your nickname"}
              </h2>
              <p className="text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-1.5 text-center">
                {isRu
                  ? "Как вас будут видеть в группе?"
                  : "How should members in the group see you?"}
              </p>

              <div className="flex flex-col gap-5 w-full mt-8">
                <input
                  id="user-nickname-input"
                  type="text"
                  value={userNicknameInput}
                  onChange={(e) => setUserNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userNicknameInput.trim().length > 0) {
                      handleContinueFromNickname();
                    }
                  }}
                  placeholder={isRu ? "Ваш никнейм" : "Your nickname"}
                  autoFocus
                  className="w-full bg-[#eaedf0] dark:bg-[#2C2C2E] text-zinc-900 dark:text-white placeholder-[#9ca3af] dark:placeholder-[#636366] font-medium text-[17px] rounded-[22px] px-5 py-4 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-none transition-all"
                />

                <button
                  id="nickname-continue-btn"
                  disabled={!userNicknameInput.trim()}
                  onClick={handleContinueFromNickname}
                  className={`w-full py-4 text-[17px] font-bold tracking-tight rounded-[22px] transition-all text-center ${
                    userNicknameInput.trim().length > 0
                      ? "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] cursor-pointer shadow-sm"
                      : "bg-[#dce0e6] dark:bg-[#2C2C2E] text-[#8e98a4] dark:text-[#636366] cursor-not-allowed"
                  }`}
                >
                  {isRu ? "Далее" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Group Name */}
          {createStep === 2 && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center mt-3 px-1">
              <h2 className="text-[28px] sm:text-[30px] font-bold text-black dark:text-white tracking-tight text-center">
                {isRu ? "Создать группу" : "Start a group"}
              </h2>
              <p className="text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-1.5 text-center">
                {isRu ? "Как назовём её?" : "What should we call it?"}
              </p>

              <div className="flex flex-col gap-5 w-full mt-8">
                <input
                  id="group-name-input"
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && groupNameInput.trim().length > 0) {
                      handleGoToIconPicker();
                    }
                  }}
                  placeholder={isRu ? "Название группы" : "Group name"}
                  autoFocus
                  className="w-full bg-[#eaedf0] dark:bg-[#2C2C2E] text-zinc-900 dark:text-white placeholder-[#9ca3af] dark:placeholder-[#636366] font-medium text-[17px] rounded-[22px] px-5 py-4 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-none transition-all"
                />

                <button
                  id="create-group-continue-btn"
                  disabled={!groupNameInput.trim()}
                  onClick={handleGoToIconPicker}
                  className={`w-full py-4 text-[17px] font-bold tracking-tight rounded-[22px] transition-all text-center ${
                    groupNameInput.trim().length > 0
                      ? "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] cursor-pointer shadow-sm"
                      : "bg-[#dce0e6] dark:bg-[#2C2C2E] text-[#8e98a4] dark:text-[#636366] cursor-not-allowed"
                  }`}
                >
                  {isRu ? "Далее" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload an icon */}
          {createStep === 3 && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center mt-3 px-1">
              <h2 className="text-[28px] sm:text-[30px] font-bold text-black dark:text-white tracking-tight text-center">
                {isRu ? "Загрузить значок" : "Upload an icon"}
              </h2>
              <p className="text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-1.5 text-center">
                {isRu ? "Придайте группе стиль." : "Give your group a look."}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="group-icon-file-input"
              />

              <div className="my-10 flex flex-col items-center justify-center">
                <div
                  id="group-avatar-upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] hover:bg-[#DCDCE2] dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer flex items-center justify-center select-none border border-black/5 dark:border-white/10"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload icon"
                >
                  {uploadedIcon ? (
                    <img
                      src={uploadedIcon}
                      alt="Uploaded group icon"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <SoftGroupsIcon filled className="w-14 h-14 text-[#8E8E93] dark:text-[#98989D]" />
                  )}

                  <div className="absolute bottom-0.5 right-0.5 w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-transform active:scale-90 shadow-sm">
                    <Pencil className="w-4 h-4 text-white dark:text-black stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div className="w-full mt-2">
                <button
                  id="confirm-create-group-btn"
                  onClick={handleCreateGroup}
                  className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[17px] tracking-tight rounded-[22px] transition-all cursor-pointer shadow-sm text-center"
                >
                  {isRu ? "Создать группу" : "Create Group"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Share Group Code Screen */}
          {createStep === 4 && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center mt-3 px-1">
              <div className="w-16 h-16 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center overflow-hidden shadow-xs select-none border border-black/5 dark:border-white/10">
                {uploadedIcon ? (
                  <img
                    src={uploadedIcon}
                    alt={groupNameInput}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <SoftGroupsIcon filled className="w-8 h-8 text-[#8E8E93] dark:text-[#98989D]" />
                )}
              </div>

              <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1c1c1e] dark:text-white tracking-tight text-center mt-3.5">
                {groupNameInput.trim()}
              </h2>

              <p className="text-[15px] sm:text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-2 text-center max-w-[320px] leading-snug">
                {isRu
                  ? "Отправьте код друзьям. Когда они введут код, вы сможете делиться чеками питомцев друг с другом."
                  : "Send it to friends. When they enter the code, you’ll be able to share your pet checks with each other."}
              </p>

              <div
                id="group-code-card"
                onClick={() => handleCopyCode(createdGroupCode)}
                className="w-full bg-[#eaedf0] dark:bg-[#1C1C1E] hover:bg-[#e2e6eb] dark:hover:bg-[#2C2C2E] active:scale-[0.99] rounded-[24px] py-6 px-4 mt-7 flex flex-col items-center justify-center cursor-pointer transition-all select-none border border-transparent dark:border-white/10"
                role="button"
                tabIndex={0}
                aria-label="Group code, tap to copy"
              >
                <span className="text-[12px] font-bold text-[#8e8e93] dark:text-[#98989D] uppercase tracking-[0.14em]">
                  {isRu ? "КОД ВАШЕЙ ГРУППЫ" : "YOUR GROUP CODE"}
                </span>
                <span className="text-[34px] sm:text-[38px] font-extrabold text-[#1c1c1e] dark:text-white tracking-[0.08em] mt-1 select-all font-sans leading-tight">
                  {createdGroupCode}
                </span>
                <span className="text-[13.5px] font-medium mt-1.5 min-h-[20px] flex items-center justify-center">
                  {copied ? (
                    <span className="text-[#34C759] font-medium">{isRu ? "Скопировано" : "Copied"}</span>
                  ) : (
                    <span className="text-[#8e8e93] dark:text-[#98989D] font-medium">{isRu ? "Нажмите чтобы скопировать" : "Tap to copy"}</span>
                  )}
                </span>
              </div>

              <button
                id="text-to-friend-btn"
                onClick={() => handleTextToFriend()}
                className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[17px] tracking-tight rounded-[22px] transition-all cursor-pointer shadow-sm text-center mt-5"
              >
                {isRu ? "Отправить другу" : "Text it to a friend"}
              </button>

              <button
                id="share-another-way-btn"
                onClick={() => handleShareAnotherWay()}
                className="mt-3.5 text-[15.5px] font-semibold text-[#6b7280] dark:text-[#98989D] hover:text-black dark:hover:text-white active:opacity-75 transition-colors cursor-pointer py-1.5 text-center"
              >
                {isRu ? "Поделиться иначе" : "Share another way"}
              </button>

              <button
                id="done-create-group-btn"
                onClick={handleFinishCreateGroup}
                className="w-full py-4 bg-[#eaedf0] dark:bg-[#2C2C2E] hover:bg-[#dfe3e8] dark:hover:bg-[#3A3A3C] active:scale-[0.98] text-[#1c1c1e] dark:text-white font-bold text-[17px] tracking-tight rounded-[22px] transition-all cursor-pointer shadow-xs text-center mt-3"
              >
                {isRu ? "Готово" : "Done"}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // iOS-Style Join Group Bottom Sheet
  const renderJoinModal = () => (
    <AnimatePresence>
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
            onClick={() => {
              setShowJoinModal(false);
              setJoinError("");
            }}
          />

          <motion.div
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.15 }}
            dragSnapToOrigin
            onDragEnd={(_event, info) => {
              if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                setShowJoinModal(false);
                setJoinError("");
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-9 sm:pb-8 shadow-2xl border-t border-black/[0.04] dark:border-white/10 flex flex-col pointer-events-auto text-[#1c1c1e] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />
            <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

            <div className="w-full flex items-center justify-between mb-5 pt-1">
              <h3 className="text-[22px] font-bold text-[#1c1c1e] dark:text-white tracking-tight">
                {isRu ? "Войти в группу" : "Join a Group"}
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError("");
                }}
                className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10 outline-none focus:outline-none"
                title="Close"
              >
                <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <label className="text-[13px] font-semibold text-[#8e8e93] dark:text-[#98989D] uppercase tracking-wider">
                {isRu ? "Введите код приглашения" : "Enter invite code"}
              </label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value.toUpperCase());
                  if (joinError) setJoinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && joinCodeInput.trim()) {
                    handleJoinGroup();
                  }
                }}
                placeholder={isRu ? "Введите код группы" : "Enter group code"}
                className="w-full bg-[#f2f2f7] dark:bg-[#2C2C2E] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-none rounded-[20px] px-5 py-4 text-[17px] font-sans font-medium text-zinc-900 dark:text-white placeholder:font-normal placeholder:text-[#8e8e93] dark:placeholder:text-[#98989D] transition-all text-center"
              />
              {joinError && (
                <p className="text-[13.5px] text-[#FF3B30] font-medium text-center mt-1 px-2">
                  {joinError}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleJoinGroup}
              disabled={!joinCodeInput.trim()}
              className={`w-full py-4 font-bold text-[17px] rounded-[50px] transition-all cursor-pointer mt-3 shadow-sm ${
                joinCodeInput.trim()
                  ? "bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-black active:scale-[0.98]"
                  : "bg-[#e5e5ea] dark:bg-[#2C2C2E] text-[#8e98a4] dark:text-[#636366] cursor-not-allowed shadow-none"
              }`}
            >
              {isRu ? "Войти в группу" : "Join Group"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // If user has an active group, render the group card matching IMG_6879.jpeg
  if (activeGroup) {
    return (
      <div className="w-full max-w-md min-h-[calc(100vh-140px)] flex flex-col justify-start select-none pb-16">
        {/* Hidden input for editing group icon */}
        <input
          type="file"
          ref={editIconInputRef}
          onChange={handleEditIconChange}
          accept="image/*"
          className="hidden"
        />

        {/* Top Left iOS Large Title and Right Plus Button */}
        <div className="w-full flex items-center justify-between mb-6 sm:mb-7 px-1 relative">
          <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#1c1c1e] dark:text-white leading-none font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
            {isRu ? "Группы" : "Groups"}
          </h1>

          <div className="relative">
            {/* Small circular button with plus icon in the corner */}
            <button
              id="open-group-actions-popup-btn"
              onClick={() => setShowAddGroupPopup(true)}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/10 shadow-xs flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-90 transition-all cursor-pointer z-20"
              title={isRu ? "Создать или войти в группу" : "Start or Join Group"}
              aria-label="Start or Join Group"
            >
              <Plus
                className="w-5 h-5 text-black dark:text-white"
                strokeWidth={2.4}
              />
            </button>
          </div>
        </div>

        {/* iOS-Style Slide-Up Bottom Sheet Popup ("Попап выходит снизу") */}
        <AnimatePresence>
          {showAddGroupPopup && (
            <div className="fixed inset-0 z-50 flex items-end justify-center select-none p-0 overflow-hidden">
              {/* iOS Translucent Dim Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => setShowAddGroupPopup(false)}
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md cursor-pointer"
              />

              {/* Bottom Sheet Modal Container */}
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(_event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowAddGroupPopup(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-9 sm:pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col pointer-events-auto text-[#1c1c1e] dark:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
                <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

                {/* iOS Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

                {/* Top Close Button */}
                <div className="flex items-center justify-end w-full mb-1">
                  <button
                    type="button"
                    id="close-group-popup-btn"
                    onClick={() => setShowAddGroupPopup(false)}
                    className="w-10 h-10 rounded-full bg-[#f5f4fa] dark:bg-[#2C2C2E] flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer border border-transparent dark:border-white/5 outline-none"
                    title={isRu ? "Закрыть" : "Close"}
                  >
                    <X className="w-5 h-5 text-[#374151] dark:text-[#98989D]" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Content: Realistic Pets Photo */}
                <div className="w-full flex justify-center items-center pt-0 pb-3 overflow-hidden">
                  <div className="relative w-56 sm:w-60 h-28 sm:h-32 flex items-center justify-center bg-transparent rounded-2xl p-1">
                    {/* Light Theme Photo */}
                    <img
                      src={petsTrioImg}
                      alt="Pets trio"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain pointer-events-none select-none block dark:hidden"
                    />
                    {/* Dark Theme Photo */}
                    <img
                      src={petsTrioDarkImg}
                      alt="Pets trio dark"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain pointer-events-none select-none hidden dark:block"
                    />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-[24px] sm:text-[26px] font-bold tracking-tight text-[#111827] dark:text-white leading-snug mb-2 text-center">
                  {isRu ? "Заботьтесь вместе" : "Check Pet Together"}
                </h2>

                {/* Subtitle */}
                <p className="text-[14px] sm:text-[14.5px] text-[#4b5563] dark:text-[#98989D] font-medium leading-[1.46] max-w-[300px] mb-6 mx-auto text-center">
                  {isRu
                    ? "Создайте группу и приглашайте друзей заботиться о питомцах вместе. Делитесь чеками и сохраняйте серию!"
                    : "Start a group and invite others to care for pets together. See each other’s pet checks and keep your streak going."}
                </p>

                {/* Primary Button */}
                <button
                  id="popup-start-group-btn"
                  onClick={() => {
                    setShowAddGroupPopup(false);
                    handleStartCreate();
                  }}
                  className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[16.5px] tracking-tight rounded-[24px] transition-all cursor-pointer shadow-sm text-center"
                >
                  {isRu ? "Создать группу" : "Start Group"}
                </button>

                {/* Secondary Link Button */}
                <button
                  id="popup-join-group-btn"
                  onClick={() => {
                    setShowAddGroupPopup(false);
                    setShowJoinModal(true);
                  }}
                  className="mt-3.5 text-[14.5px] font-semibold text-[#374151] dark:text-[#98989D] hover:text-black dark:hover:text-white active:opacity-75 transition-colors cursor-pointer py-1 text-center"
                >
                  {isRu ? "Есть код? Войти в группу" : "Have a code? Join a group"}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Group Card Matching IMG_6879.jpeg */}
        <div className="w-full max-w-[364px] mx-auto bg-white dark:bg-[#1C1C1E] rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 shadow-[0_6px_28px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.3)] border border-black/[0.04] dark:border-white/10 flex flex-col transition-colors">
          {/* Top Row: Avatar, Name, Subtitle, Chevron (Clickable to open Group Details) */}
          <div
            id="open-group-details-header"
            onClick={() => setShowGroupDetails(true)}
            className="flex items-center justify-between w-full cursor-pointer group hover:opacity-90 active:scale-[0.99] transition-all"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {activeGroup.iconImage ? (
                <div className="w-13 h-13 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex-shrink-0 flex items-center justify-center overflow-hidden select-none border border-black/5 dark:border-white/10">
                  <img
                    src={activeGroup.iconImage}
                    alt={activeGroup.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ) : (
                <div className="w-13 h-13 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex-shrink-0 flex items-center justify-center text-[#8E8E93] dark:text-[#98989D] border border-black/5 dark:border-white/10">
                  <SoftGroupsIcon filled className="w-7 h-7" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h2 className="text-[19px] sm:text-[20px] font-bold text-[#1c1c1e] dark:text-white tracking-tight truncate leading-tight group-hover:text-black dark:group-hover:text-zinc-200">
                  {activeGroup.name}
                </h2>
                <p className="text-[14px] font-normal text-[#8E8E93] dark:text-[#98989D] mt-0.5 truncate leading-tight">
                  {activeGroup.members.length > 1
                    ? `${activeGroup.members.length} members`
                    : "Add your first friend"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8E8E93] dark:text-[#98989D] group-hover:text-black dark:group-hover:text-white flex-shrink-0 ml-2 transition-colors" strokeWidth={2.2} />
          </div>

          {/* Code Bar Container */}
          <div
            id="active-group-code-card"
            onClick={() => handleCopyCode(activeGroup.code)}
            className="w-full bg-[#eaedf0] dark:bg-[#2C2C2E] hover:bg-[#e2e6eb] dark:hover:bg-[#3A3A3C] active:scale-[0.99] rounded-[18px] py-3.5 px-4 mt-5 flex items-center justify-center gap-3 cursor-pointer transition-all select-none border border-transparent dark:border-white/5"
            role="button"
            tabIndex={0}
            aria-label="Group code, tap to copy"
          >
            <span className="text-[20px] sm:text-[22px] font-bold text-[#1c1c1e] dark:text-white tracking-[0.06em] leading-none font-sans">
              {activeGroup.code}
            </span>
            <span className="text-[14px] font-medium leading-none">
              {copied ? (
                <span className="text-[#34C759] font-medium">Copied</span>
              ) : (
                <span className="text-[#8E8E93] dark:text-[#98989D]">Tap to copy</span>
              )}
            </span>
          </div>

          {/* Black Button: Text it to a friend */}
          <button
            id="active-group-text-friend-btn"
            onClick={() => handleTextToFriend(activeGroup)}
            className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[17px] tracking-tight rounded-[22px] transition-all cursor-pointer shadow-sm text-center mt-3.5"
          >
            Text it to a friend
          </button>
        </div>

        {/* FULL SCREEN GROUP DETAILS VIEW (MATCHING IMG_6880.jpeg) */}
        <AnimatePresence>
          {showGroupDetails && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="fixed inset-0 bg-[#f5f4fa] dark:bg-[#000000] z-50 flex flex-col justify-start p-5 sm:p-6 overflow-y-auto select-none text-[#1c1c1e] dark:text-white transition-colors"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
              }}
            >
              {/* Top Navigation Row: Left Close (X), Right More (...) */}
              <div className="flex items-center justify-between w-full pt-1 relative">
                <button
                  id="close-group-details-btn"
                  onClick={() => {
                    setShowGroupDetails(false);
                    setShowMoreMenu(false);
                  }}
                  className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                  title="Close"
                >
                  <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
                </button>

                <div className="relative">
                  <button
                    id="group-more-options-btn"
                    onClick={() => setShowMoreMenu(true)}
                    className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                    title="Options"
                  >
                    <MoreHorizontal className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Group Avatar, Name, and Member Count */}
              <div className="w-full flex flex-col items-center mt-2">
                <div className="w-20 h-20 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center overflow-hidden shadow-xs select-none border border-black/5 dark:border-white/10">
                  {activeGroup.iconImage ? (
                    <img
                      src={activeGroup.iconImage}
                      alt={activeGroup.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <SoftGroupsIcon filled className="w-10 h-10 text-[#8E8E93] dark:text-[#98989D]" />
                  )}
                </div>

                <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1c1c1e] dark:text-white tracking-tight text-center mt-3 leading-tight">
                  {activeGroup.name}
                </h2>

                <span className="text-[15px] font-medium text-[#8E8E93] dark:text-[#98989D] text-center mt-1">
                  {activeGroup.members.length}{" "}
                  {activeGroup.members.length === 1 ? "member" : "members"}
                </span>
              </div>

              {/* Group Stats Card (with 2 stats & ? question mark icon) */}
              <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 sm:p-6 shadow-[0_6px_28px_rgba(0,0,0,0.03)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.25)] border border-black/[0.04] dark:border-white/10 mt-6 flex flex-col transition-colors">
                <div className="flex items-center justify-between w-full mb-4">
                  <h3 className="text-[20px] sm:text-[21px] font-bold text-[#1c1c1e] dark:text-white tracking-tight">
                    Group Stats
                  </h3>
                  <button
                    id="group-stats-help-btn"
                    onClick={() => setShowHelpModal(true)}
                    className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-[#f2f2f7] dark:bg-[#2C2C2E] hover:bg-[#e5e5ea] dark:hover:bg-[#3A3A3C] active:scale-95 text-[#8e8e93] dark:text-[#98989D] hover:text-[#1c1c1e] dark:hover:text-white text-[16px] font-bold flex items-center justify-center transition-all cursor-pointer border border-transparent dark:border-white/5"
                    title="How it works"
                  >
                    ?
                  </button>
                </div>

                {/* 2 Stats Values side-by-side strictly from real metrics */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Stat 1: Best streak */}
                  <div className="bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[20px] p-4 flex flex-col items-center justify-center text-center transition-colors border border-transparent dark:border-white/5">
                    <span className="text-[26px] sm:text-[28px] font-extrabold text-[#1c1c1e] dark:text-white tracking-tight leading-none">
                      {liveBestStreak}
                    </span>
                    <span className="text-[13px] font-medium text-[#8e8e93] dark:text-[#98989D] mt-2 leading-tight">
                      Best streak
                    </span>
                  </div>

                  {/* Stat 2: Pets checks */}
                  <div className="bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[20px] p-4 flex flex-col items-center justify-center text-center transition-colors border border-transparent dark:border-white/5">
                    <span className="text-[26px] sm:text-[28px] font-extrabold text-[#1c1c1e] dark:text-white tracking-tight leading-none">
                      {liveTotalChecks}
                    </span>
                    <span className="text-[13px] font-medium text-[#8e8e93] dark:text-[#98989D] mt-2 leading-tight">
                      Pets checks
                    </span>
                  </div>
                </div>
              </div>

              {/* Members Section (Avatar + Pet Name/Nickname only, no plates or cards) */}
              <div className="w-full max-w-sm sm:max-w-md mx-auto mt-6">
                <h4 className="text-[15px] font-semibold text-[#8E8E93] dark:text-[#98989D] mb-3 px-1">
                  Members
                </h4>

                <div className="flex items-start gap-4 overflow-x-auto pb-2 pt-0.5 scrollbar-none px-1">
                  {activeGroup.members.map((member) => {
                    const isUser =
                      member.id === "m1" ||
                      member.name === "You" ||
                      (Boolean(userNickname) && member.name === userNickname);
                    const petName = isUser
                      ? (member.name && member.name !== "You" ? member.name : (userNickname || activePet?.name || "You"))
                      : (member.petName || member.name);
                    const memberAvatar =
                      member.avatar &&
                      member.avatar !== "👤" &&
                      (member.avatar.startsWith("data:image") ||
                        member.avatar.startsWith("http") ||
                        member.avatar.startsWith("blob:"))
                        ? member.avatar
                        : undefined;

                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMemberForProfile(isUser ? { ...member, petsCount: realUserPetsCount } : member)}
                        className="flex flex-col items-center min-w-[64px] max-w-[76px] flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        role="button"
                        tabIndex={0}
                        aria-label={`View stats for ${petName}`}
                      >
                        {/* Avatar: photo if present, otherwise clean profile person icon (human) */}
                        <div className="w-14 h-14 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center overflow-hidden shadow-xs border border-black/5 dark:border-white/10 flex-shrink-0">
                          {memberAvatar ? (
                            <img
                              src={memberAvatar}
                              alt={petName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ClassicFilledUserIcon className="w-8 h-8 text-[#8E8E93] dark:text-[#98989D]" />
                          )}
                        </div>

                        {/* Nickname (Pet Name) */}
                        <span className="text-[13px] font-semibold text-[#1c1c1e] dark:text-white text-center truncate w-full mt-2 leading-tight">
                          {petName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard Section */}
              <div className="w-full max-w-sm sm:max-w-md mx-auto mt-7 pb-12">
                <div className="flex items-center justify-between w-full mb-3 px-1">
                  <h4 className="text-[15px] font-semibold text-[#8E8E93] dark:text-[#98989D]">
                    Leaderboard
                  </h4>

                  {/* Smooth Metric Switcher Toggle (Distinct subtle pill, no flame/check icon, only double arrows) */}
                  <button
                    id="leaderboard-metric-toggle-btn"
                    onClick={() =>
                      setLeaderboardSort((prev) => (prev === "streak" ? "checks" : "streak"))
                    }
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E5EA]/80 dark:bg-[#2C2C2E] hover:bg-[#DCDCE2] dark:hover:bg-[#3A3A3C] active:scale-95 transition-all text-[13px] font-semibold text-[#1c1c1e] dark:text-white cursor-pointer select-none border-0"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={leaderboardSort}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.14 }}
                        className="tracking-tight capitalize"
                      >
                        {leaderboardSort === "streak" ? "Streak" : "Checks"}
                      </motion.span>
                    </AnimatePresence>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93] dark:text-[#98989D]" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Leaderboard List with smooth layout animations */}
                <motion.div layout className="flex flex-col space-y-2.5 w-full">
                  <AnimatePresence mode="popLayout">
                    {sortedMembers.map((member, index) => {
                      const isUser =
                        member.id === "m1" ||
                        member.name === "You" ||
                        (Boolean(userNickname) && member.name === userNickname);
                      const petName = isUser
                        ? (member.name && member.name !== "You" ? member.name : (userNickname || activePet?.name || "You"))
                        : (member.petName || member.name);
                      const memberAvatar =
                        member.avatar &&
                        member.avatar !== "👤" &&
                        (member.avatar.startsWith("data:image") ||
                          member.avatar.startsWith("http") ||
                          member.avatar.startsWith("blob:"))
                          ? member.avatar
                          : undefined;
                      const rank = index + 1;
                      const value =
                        leaderboardSort === "streak"
                          ? (isUser ? liveStreak : member.streak || 0)
                          : (isUser ? liveTotalChecks : member.totalChecks || 0);

                      return (
                        <motion.div
                          layout
                          key={member.id}
                          onClick={() => setSelectedMemberForProfile(isUser ? { ...member, petsCount: realUserPetsCount } : member)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          className="w-full bg-white dark:bg-[#1C1C1E] rounded-[22px] px-4 py-3.5 shadow-2xs border border-black/[0.04] dark:border-white/10 flex items-center justify-between cursor-pointer active:scale-[0.98] hover:bg-zinc-50/80 dark:hover:bg-[#2C2C2E]/60 transition-all"
                          role="button"
                          tabIndex={0}
                          aria-label={`View stats for ${petName}`}
                        >
                          {/* Left: Rank, Avatar, Pet Name */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="text-[15px] font-bold text-[#8E8E93] dark:text-[#98989D] w-4 text-center">
                              {rank}
                            </span>

                            <div className="w-9 h-9 rounded-full bg-[#F2F3F5] dark:bg-[#2C2C2E] flex items-center justify-center overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
                              {memberAvatar ? (
                                <img
                                  src={memberAvatar}
                                  alt={petName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ClassicFilledUserIcon className="w-5 h-5 text-[#8E8E93] dark:text-[#98989D]" />
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[16px] font-bold text-[#1c1c1e] dark:text-white truncate">
                                {petName}
                              </span>
                              {isUser && (
                                <span className="text-[11px] font-semibold text-[#8E8E93] dark:text-[#98989D] bg-[#F2F3F5] dark:bg-[#2C2C2E] px-1.5 py-0.5 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Metric badge with smooth value transition */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-[15px] text-[#1c1c1e] dark:text-white min-w-[36px] justify-end">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={`${member.id}-${leaderboardSort}`}
                                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex items-center gap-1.5"
                                >
                                  {leaderboardSort === "streak" ? (
                                    <>
                                      <StreakFlameIcon className="w-4.5 h-4.5" />
                                      <span>{value}</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckFrameIcon className="w-4 h-4 text-[#007AFF]" />
                                      <span>{value}</span>
                                    </>
                                  )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#C7C7CC] dark:text-[#48484A]" strokeWidth={2.2} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3-Dots More Options Slide-Up Popup (iOS Bottom Sheet matching language popup) */}
        <AnimatePresence>
          {showMoreMenu && (
            <div className="fixed inset-0 z-60 flex flex-col justify-end overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                onClick={() => setShowMoreMenu(false)}
              />
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowMoreMenu(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col z-10 select-none text-[#1c1c1e] dark:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
                <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

                {/* iOS Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

                <div className="flex justify-between items-center mb-5 w-full">
                  <h3 className="text-[19px] font-bold text-[#1c1c1e] dark:text-white tracking-tight">
                    {activeGroup.name}
                  </h3>
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="w-12 h-12 rounded-full bg-white dark:bg-[#2C2C2E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                  >
                    <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
                  </button>
                </div>

                {/* Actions list: icon + button text only */}
                <div className="flex flex-col space-y-2 w-full">
                  <button
                    id="group-action-add-friend-btn"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleTextToFriend(activeGroup);
                    }}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-[#f5f4fa] dark:bg-[#2C2C2E] hover:bg-[#eaebee] dark:hover:bg-[#3A3A3C] active:scale-[0.99] transition-all w-full text-left cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <UserPlus className="w-5 h-5 text-[#1c1c1e] dark:text-white" strokeWidth={2} />
                    <span className="text-[16px] font-semibold text-[#1c1c1e] dark:text-white">Add friend</span>
                  </button>

                  <button
                    id="group-action-rename-btn"
                    onClick={handleOpenRename}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-[#f5f4fa] dark:bg-[#2C2C2E] hover:bg-[#eaebee] dark:hover:bg-[#3A3A3C] active:scale-[0.99] transition-all w-full text-left cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <Edit2 className="w-5 h-5 text-[#1c1c1e] dark:text-white" strokeWidth={2} />
                    <span className="text-[16px] font-semibold text-[#1c1c1e] dark:text-white">Rename group</span>
                  </button>

                  <button
                    id="group-action-change-icon-btn"
                    onClick={handleOpenChangeIcon}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-[#f5f4fa] dark:bg-[#2C2C2E] hover:bg-[#eaebee] dark:hover:bg-[#3A3A3C] active:scale-[0.99] transition-all w-full text-left cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <ImageIcon className="w-5 h-5 text-[#1c1c1e] dark:text-white" strokeWidth={2} />
                    <span className="text-[16px] font-semibold text-[#1c1c1e] dark:text-white">Change icon</span>
                  </button>

                  <button
                    id="group-action-leave-btn"
                    onClick={handleLeaveGroup}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100/70 dark:hover:bg-red-900/50 active:scale-[0.99] transition-all w-full text-left cursor-pointer border border-transparent dark:border-red-900/20"
                  >
                    <LogOut className="w-5 h-5 text-[#FF3B30]" strokeWidth={2} />
                    <span className="text-[16px] font-semibold text-[#FF3B30]">Leave group</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Stats Question Mark Slide-Up Popup (iOS Bottom Sheet matching language popup) */}
        <AnimatePresence>
          {showHelpModal && (
            <div className="fixed inset-0 z-60 flex flex-col justify-end overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                onClick={() => setShowHelpModal(false)}
              />
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowHelpModal(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col z-10 select-none text-[#1c1c1e] dark:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
                <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

                {/* iOS Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[19px] font-bold text-[#1c1c1e] dark:text-white tracking-tight">
                    How Group Stats Work
                  </h3>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-12 h-12 rounded-full bg-white dark:bg-[#2C2C2E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                  >
                    <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex flex-col space-y-3 text-[14.5px] text-[#4b5563] dark:text-[#98989D] leading-relaxed">
                  <div className="p-4 bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-2xl border border-transparent dark:border-white/5 transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-[#1c1c1e] dark:text-white mb-1">
                      <StreakFlameIcon className="w-4.5 h-4.5" />
                      <span>Best streak:</span>
                    </div>
                    The highest consecutive days of daily checks by the whole group. The streak only increases when <b>all members</b> complete their pet check that day.
                  </div>
                  <div className="p-4 bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-2xl border border-transparent dark:border-white/5 transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-[#1c1c1e] dark:text-white mb-1">
                      <CheckFrameIcon className="w-4 h-4 text-[#007AFF]" />
                      <span>Pets checks:</span>
                    </div>
                    The total cumulative number of pet health check-ins performed across all members since joining this group.
                  </div>
                </div>

                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[16px] rounded-full mt-5 transition-all cursor-pointer"
                >
                  Got it
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Rename Group Slide-Up Popup (Exact match with Step 1 creation screen style inside bottom sheet) */}
        <AnimatePresence>
          {showRenameModal && (
            <div className="fixed inset-0 z-60 flex flex-col justify-end overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                onClick={() => setShowRenameModal(false)}
              />
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowRenameModal(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col z-10 select-none text-[#1c1c1e] dark:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
                <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

                {/* iOS Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

                {/* Top Close Button */}
                <div className="flex items-center justify-start w-full mb-2">
                  <button
                    onClick={() => setShowRenameModal(false)}
                    className="w-12 h-12 rounded-full bg-[#f5f4fa] dark:bg-[#2C2C2E] flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <X className="w-5 h-5 text-[#374151] dark:text-[#98989D]" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Content matching Step 1 Start a group */}
                <div className="w-full flex flex-col items-center px-1">
                  <h2 className="text-[28px] sm:text-[30px] font-bold text-black dark:text-white tracking-tight text-center">
                    Rename group
                  </h2>
                  <p className="text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-1 text-center">
                    What should we call it?
                  </p>

                  <div className="flex flex-col gap-5 w-full mt-7">
                    <input
                      id="rename-group-input"
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && renameInput.trim().length > 0) {
                          handleSaveRename();
                        }
                      }}
                      placeholder="Group name"
                      maxLength={30}
                      autoFocus
                      className="w-full bg-[#eaedf0] dark:bg-[#2C2C2E] text-zinc-900 dark:text-white placeholder-[#9ca3af] dark:placeholder-[#636366] font-medium text-[17px] rounded-[22px] px-5 py-4 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-none transition-all"
                    />

                    <button
                      id="save-rename-group-btn"
                      disabled={!renameInput.trim()}
                      onClick={handleSaveRename}
                      className={`w-full py-4 text-[17px] font-bold tracking-tight rounded-[22px] transition-all text-center ${
                        renameInput.trim().length > 0
                          ? "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] cursor-pointer shadow-sm"
                          : "bg-[#dce0e6] dark:bg-[#2C2C2E] text-[#8e98a4] dark:text-[#636366] cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Change Icon Slide-Up Popup (Exact match with Step 2 Upload an icon screen style inside bottom sheet) */}
        <AnimatePresence>
          {showChangeIconModal && (
            <div className="fixed inset-0 z-60 flex flex-col justify-end overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                onClick={() => setShowChangeIconModal(false)}
              />
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowChangeIconModal(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col z-10 select-none text-[#1c1c1e] dark:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
                <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

                {/* iOS Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

                {/* Top Close Button */}
                <div className="flex items-center justify-start w-full mb-2">
                  <button
                    onClick={() => setShowChangeIconModal(false)}
                    className="w-12 h-12 rounded-full bg-[#f5f4fa] dark:bg-[#2C2C2E] flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <X className="w-5 h-5 text-[#374151] dark:text-[#98989D]" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Content matching Step 2 Upload an icon */}
                <div className="w-full flex flex-col items-center px-1">
                  <h2 className="text-[28px] sm:text-[30px] font-bold text-black dark:text-white tracking-tight text-center">
                    Change icon
                  </h2>
                  <p className="text-[16px] text-[#6b7280] dark:text-[#98989D] font-normal mt-1 text-center">
                    Give your group a look.
                  </p>

                  {/* Circle Avatar with Person/Current Icon and Edit badge in the corner */}
                  <div className="my-8 flex flex-col items-center justify-center">
                    <div
                      id="edit-group-avatar-upload-trigger"
                      onClick={() => editIconInputRef.current?.click()}
                      className="relative w-32 h-32 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] hover:bg-[#DCDCE2] dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer flex items-center justify-center select-none border border-black/5 dark:border-white/10"
                      role="button"
                      tabIndex={0}
                      aria-label="Change icon"
                    >
                      {editUploadedIcon ? (
                        <img
                          src={editUploadedIcon}
                          alt="Group icon"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <SoftGroupsIcon filled className="w-14 h-14 text-[#8E8E93] dark:text-[#98989D]" />
                      )}

                      {/* Small circle in the corner with edit pencil icon */}
                      <div className="absolute bottom-0.5 right-0.5 w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-transform active:scale-90 shadow-sm">
                        <Pencil className="w-4 h-4 text-white dark:text-black stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Save Button */}
                  <div className="w-full mt-2">
                    <button
                      id="save-group-icon-btn"
                      onClick={handleSaveChangeIcon}
                      className="w-full py-4 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[17px] tracking-tight rounded-[22px] transition-all cursor-pointer shadow-sm text-center"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modals inside Active Group view */}
        {renderCreateGroupModal()}
        {renderJoinModal()}
        {renderMemberProfileModal()}
      </div>
    );
  }

  // Default Initial Screen: Matching user uploaded reference photo exactly
  return (
    <div className="w-full max-w-md min-h-[calc(100vh-140px)] flex flex-col justify-start select-none pb-16">
      {/* Top Left iOS Large Title, static, no moving */}
      <div className="w-full text-left mb-6 sm:mb-7 px-1">
        <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#1c1c1e] dark:text-white leading-none font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          Groups
        </h1>
      </div>

      {/* Main Centered White Card with reduced compact width */}
      <div className="w-full flex-1 flex items-center justify-center px-1">
        <motion.div
          initial={animateEntrance ? { opacity: 0, scale: 0.95, y: 28 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.08 }}
          className="w-full max-w-[358px] bg-white dark:bg-[#1C1C1E] rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-black/[0.04] dark:border-white/10 flex flex-col items-center text-center mx-auto transition-colors"
        >
          {/* Realistic Pets Photo: Pembroke Welsh Corgi in center with cat and rabbit */}
          <div className="w-full flex justify-center items-center pt-1 pb-3 overflow-hidden">
            <div className="relative w-56 sm:w-64 h-32 sm:h-36 flex items-center justify-center bg-transparent rounded-2xl p-1">
              {/* Light Theme Photo */}
              <img
                src={petsTrioImg}
                alt="Realistic pets trio - Corgi dog in center with cat and rabbit"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-500 hover:scale-105 block dark:hidden"
              />
              {/* Dark Theme Photo tailored for dark background */}
              <img
                src={petsTrioDarkImg}
                alt="Realistic pets trio in dark theme - Corgi dog in center with cat and rabbit"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-500 hover:scale-105 hidden dark:block"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[24px] sm:text-[26px] font-bold tracking-tight text-[#111827] dark:text-white leading-snug mb-2.5">
            {isRu ? "Заботьтесь вместе" : "Check Pet Together"}
          </h2>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[14.5px] text-[#4b5563] dark:text-[#98989D] font-medium leading-[1.48] max-w-[280px] mb-7">
            {isRu
              ? "Создайте группу и приглашайте друзей заботиться о питомцах вместе. Делитесь чеками и сохраняйте серию!"
              : "Start a group and invite others to care for pets together. See each other’s pet checks and keep your streak going."}
          </p>

          {/* Primary Button */}
          <button
            id="start-group-btn"
            onClick={handleStartCreate}
            className="w-full py-[15px] bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] text-white dark:text-black font-bold text-[16.5px] tracking-tight rounded-[25px] transition-all cursor-pointer shadow-sm"
          >
            {isRu ? "Создать группу" : "Start Group"}
          </button>

          {/* Secondary Link Button */}
          <button
            id="join-group-btn"
            onClick={() => setShowJoinModal(true)}
            className="mt-3.5 text-[14.5px] font-semibold text-[#374151] dark:text-[#98989D] hover:text-black dark:hover:text-white active:opacity-75 transition-colors cursor-pointer py-1"
          >
            {isRu ? "Есть код? Войти в группу" : "Have a code? Join a group"}
          </button>
        </motion.div>
      </div>

      {/* Modals inside Initial view */}
      {renderCreateGroupModal()}
      {renderJoinModal()}
      {renderMemberProfileModal()}
    </div>
  );
}
