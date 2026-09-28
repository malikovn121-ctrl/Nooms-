import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Crown, LockOpen, Bell, Check } from "lucide-react";
import { Pet } from "../types";

import phoneSnapDogImg from "../assets/images/candid_dog_framed_1785492882790.jpg";
import phoneSnapCatImg from "../assets/images/candid_cat_snap_1785492300647.jpg";
import phoneSnapRabbitImg from "../assets/images/candid_rabbit_snap_1785492315316.jpg";
import phoneSnapRodentImg from "../assets/images/candid_hamster_snap_1785492326254.jpg";
import phoneSnapBirdImg from "../assets/images/candid_parrot_snap_1785492340213.jpg";
import phoneSnapReptileImg from "../assets/images/candid_turtle_snap_1785492353236.jpg";
import phoneSnapUnicornImg from "../assets/images/candid_unicorn_snap_1785492366270.jpg";

interface PaywallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onNavigateToSettings?: () => void;
  activePet?: Pet;
  pets?: Pet[];
  selectedPetType?: string;
  currentLanguage?: string;
}

export default function PaywallScreen({
  isOpen,
  onClose,
  onSubscribe: _onSubscribe,
  onNavigateToSettings,
  activePet,
  pets = [],
  selectedPetType,
  currentLanguage = "en",
}: PaywallScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  // Reset to step 1 whenever paywall page is reopened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setShowSettingsHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lang = currentLanguage || "en";

  // Match the exact pet type selected in the initial screens (onboarding)
  const getPetPhoto = () => {
    let matchedType = (selectedPetType || "").toLowerCase().trim();

    if (!matchedType && typeof window !== "undefined") {
      matchedType = (localStorage.getItem("pethealth_selected_pet_type") || "").toLowerCase().trim();
    }

    if (!matchedType && typeof window !== "undefined") {
      try {
        const realPetRaw = localStorage.getItem("pethealth_real_user_pet");
        if (realPetRaw) {
          const parsed = JSON.parse(realPetRaw);
          if (parsed?.type) matchedType = String(parsed.type).toLowerCase().trim();
        }
      } catch {}
    }

    if (!matchedType) {
      if (activePet?.type) {
        matchedType = activePet.type.toLowerCase().trim();
      } else if (pets && pets.length > 0) {
        const custom = pets.find((p) => p.isCustom);
        matchedType = (custom?.type || pets[0]?.type || "").toLowerCase().trim();
      }
    }

    if (matchedType === "dog" || matchedType.includes("dog")) return phoneSnapDogImg;
    if (matchedType === "cat" || matchedType.includes("cat")) return phoneSnapCatImg;
    if (matchedType === "rabbit" || matchedType.includes("rabbit")) return phoneSnapRabbitImg;
    if (matchedType === "rodent" || matchedType.includes("rodent") || matchedType.includes("hamster")) return phoneSnapRodentImg;
    if (matchedType === "bird" || matchedType.includes("bird") || matchedType === "parrot" || matchedType.includes("parrot")) return phoneSnapBirdImg;
    if (matchedType === "reptile" || matchedType.includes("reptile") || matchedType.includes("turtle")) return phoneSnapReptileImg;
    if (matchedType === "another" || matchedType.includes("unicorn")) return phoneSnapUnicornImg;

    if (activePet?.image && activePet.image.length > 100 && !activePet.image.includes("pet_ai_logo")) {
      return activePet.image;
    }

    return phoneSnapDogImg;
  };

  const petPhoto = getPetPhoto();

  // Calculate formatted date 7 days from now (matches IMG_6967 style)
  const getTrialEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    if (lang === "ru") {
      const months = [
        "янв.", "февр.", "мар.", "апр.", "мая", "июн.",
        "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."
      ];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    const monthsEn = [
      "Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
      "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
    ];
    return `${monthsEn[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const trialEndDate = getTrialEndDate();

  const handleCtaClick = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      setShowSettingsHint(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="paywall-screen-page"
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.12 }}
        dragSnapToOrigin
        onDragEnd={(_event, info) => {
          if (info.offset.y > 100 || (info.velocity.y > 300 && info.offset.y > 20)) {
            onClose();
          }
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        // Strictly white/light appearance in both light and dark mode, protected from dark theme inversion
        className="onboarding-scope paywall-screen-scope fixed inset-0 z-[120] bg-[#F6F7F9] text-black flex flex-col justify-between select-none overflow-hidden"
        style={{
          backgroundColor: "#F6F7F9",
          color: "#000000",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
        }}
      >
        {/* Top Header Bar: Streak-style circular close button on top-left, 'Recover' text on top-right */}
        <div className="w-full flex items-center justify-between px-6 pt-5 pb-1 relative z-30">
          {/* Top-left circular close button styled identically to the Streak page (white disc + black X) */}
          <button
            id="close-paywall-screen-btn"
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10 outline-none focus:outline-none"
            style={{ backgroundColor: "#ffffff" }}
            aria-label="Close"
          >
            <X
              className="w-5 h-5 text-black keep-black"
              strokeWidth={2.2}
              style={{ color: "#000000", stroke: "#000000" }}
            />
          </button>

          {/* Top-right 'Recover' action - lighter font weight as requested */}
          <button
            id="recover-subscription-btn"
            type="button"
            onClick={() => setShowSettingsHint(true)}
            className="text-[15px] sm:text-[16px] font-normal text-zinc-500 hover:text-black active:scale-95 transition-colors cursor-pointer outline-none focus:outline-none px-2 py-1"
            style={{ color: "#71717A" }}
          >
            {lang === "ru" ? "Восстановить" : "Recover"}
          </button>
        </div>

        {/* Dynamic Title area for Steps 1 and 2 */}
        {step !== 3 && (
          <div className="w-full max-w-md mx-auto flex flex-col items-start text-left px-6 pt-1 z-20 min-h-[82px] justify-center">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="title-step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="w-full"
                >
                  <h1 className="text-[31px] sm:text-[34px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000]">
                    {lang === "ru" ? "Сканируйте питомца ежедневно —" : "Scan Your Pet Daily —"}
                  </h1>
                  <h2 className="text-[31px] sm:text-[34px] font-bold tracking-tight leading-tight mt-0.5 text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000]">
                    {lang === "ru" ? "Следите за здоровьем." : "Track Their Health."}
                  </h2>
                </motion.div>
              ) : (
                <motion.div
                  key="title-step-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="w-full"
                >
                  <h1
                    className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.18] paywall-title-black"
                    style={{ color: "#000000" }}
                  >
                    {lang === "ru" ? (
                      <>
                        <span className="paywall-title-black" style={{ color: "#000000" }}>Мы напомним вам за </span>
                        <span
                          style={{ color: "#006AFF" }}
                          className="text-[#006AFF] keep-accent-blue font-bold"
                        >
                          2 дня
                        </span>
                        <span className="paywall-title-black" style={{ color: "#000000" }}> до окончания пробного периода</span>
                      </>
                    ) : (
                      <>
                        <span className="paywall-title-black" style={{ color: "#000000" }}>We'll remind you </span>
                        <span
                          style={{ color: "#006AFF" }}
                          className="text-[#006AFF] keep-accent-blue font-bold"
                        >
                          2 days before
                        </span>
                        <span className="paywall-title-black" style={{ color: "#000000" }}> your free trial ends</span>
                      </>
                    )}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Center Area: Step 1 (Phone Mockup), Step 2 (Animated Bell), Step 3 (Timeline Stages + Black Card) */}
        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden px-5 min-h-0 z-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="center-step-1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[270px] sm:max-w-[290px] mb-[-24px] sm:mb-[-18px] flex items-end justify-center h-full"
              >
                {/* Outer Phone Frame Contour */}
                <div
                  className="relative w-full rounded-t-[48px] border-t-[5.5px] border-x-[5.5px] border-black bg-[#F6F7F9] p-2.5 pt-3 shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "#F6F7F9", borderColor: "#000000" }}
                >
                  {/* Left side button stubs */}
                  <div className="absolute -left-[5.5px] top-[44px] w-[3px] h-[15px] bg-black rounded-l-sm" style={{ backgroundColor: "#000000" }} />
                  <div className="absolute -left-[5.5px] top-[70px] w-[3px] h-[24px] bg-black rounded-l-sm" style={{ backgroundColor: "#000000" }} />
                  <div className="absolute -left-[5.5px] top-[102px] w-[3px] h-[24px] bg-black rounded-l-sm" style={{ backgroundColor: "#000000" }} />

                  {/* Right side power button stub */}
                  <div className="absolute -right-[5.5px] top-[80px] w-[3px] h-[34px] bg-black rounded-r-sm" style={{ backgroundColor: "#000000" }} />

                  {/* Top Dynamic Island pill notch */}
                  <div className="w-[70px] h-[20px] bg-black rounded-full mx-auto mb-3 flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: "#000000" }} />

                  {/* Inner 3:4 realistic pet photo container with rounded corners */}
                  <div className="relative aspect-[3/4] w-full rounded-[30px] overflow-hidden bg-zinc-100 border-0 outline-none">
                    <img
                      src={petPhoto}
                      alt="Pet snapshot"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-[30px]"
                    />

                    {/* Scanner Corner Brackets positioned directly at the 4 corners of the photo */}
                    <div className="absolute inset-0 pointer-events-none select-none z-10">
                      {/* Top-Left Bracket */}
                      <svg
                        className="absolute top-3.5 left-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        <path d="M 28 4 L 16 4 A 12 12 0 0 0 4 16 L 4 28" />
                      </svg>
                      {/* Top-Right Bracket */}
                      <svg
                        className="absolute top-3.5 right-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        <path d="M 4 4 L 16 4 A 12 12 0 0 1 28 16 L 28 28" />
                      </svg>
                      {/* Bottom-Left Bracket */}
                      <svg
                        className="absolute bottom-3.5 left-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        <path d="M 4 4 L 4 16 A 12 12 0 0 0 16 28 L 28 28" />
                      </svg>
                      {/* Bottom-Right Bracket */}
                      <svg
                        className="absolute bottom-3.5 right-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        <path d="M 28 4 L 28 16 A 12 12 0 0 1 16 28 L 4 28" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Gentle, light fade at the bottom */}
                <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-[#F6F7F9] via-[#F6F7F9]/50 to-transparent pointer-events-none z-20" />
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="center-step-2"
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -15 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-sm flex flex-col items-center justify-center py-6"
              >
                {/* Center Animated Pure Black Bell (Enlarged) */}
                <div className="relative flex items-center justify-center">
                  {/* Subtle soft neutral soundwave pulse 1 */}
                  <motion.div
                    animate={{
                      scale: [0.95, 1.35, 1.7],
                      opacity: [0.28, 0.08, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="absolute w-68 h-68 sm:w-80 sm:h-80 rounded-full border border-black/15 pointer-events-none"
                  />

                  {/* Subtle soft neutral soundwave pulse 2 */}
                  <motion.div
                    animate={{
                      scale: [0.95, 1.25, 1.55],
                      opacity: [0.22, 0.06, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: 0.7,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="absolute w-58 h-58 sm:w-70 sm:h-70 rounded-full border border-black/10 pointer-events-none"
                  />

                  {/* Clean pure black animated swinging bell - balanced sizing */}
                  <motion.div
                    animate={{
                      rotate: [0, -18, 16, -14, 11, -7, 4, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 1.1,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "top center" }}
                    className="relative flex items-center justify-center p-3"
                  >
                    <svg
                      className="w-44 h-44 sm:w-50 sm:h-50 paywall-bell-icon drop-shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: "#000000" }}
                    >
                      {/* Classic bell body matching IMG_6985.png */}
                      <path
                        d="M10.8 3.5V1.8C10.8 1.1 11.3 0.5 12 0.5C12.7 0.5 13.2 1.1 13.2 1.8V3.5C16.8 3.85 19.3 6.8 19.3 10.8V13C19.3 14.8 20.5 16.1 21.6 17C22 17.3 21.8 18 21.2 18H2.8C2.2 18 2 17.3 2.4 17C3.5 16.1 4.7 14.8 4.7 13V10.8C4.7 6.8 7.2 3.85 10.8 3.5Z"
                        fill="#000000"
                      />
                      {/* Semi-circular clapper bowl matching IMG_6985.png (made more compact) - animated swing */}
                      <motion.path
                        d="M9.6 19.4H14.4C14.4 20.8 13.3 21.9 12 21.9C10.7 21.9 9.6 20.8 9.6 19.4Z"
                        fill="#000000"
                        animate={{
                          x: [0, 2, -2, 1.5, -1, 0],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          repeatDelay: 1.1,
                          ease: "easeInOut",
                        }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* Step 3: Vertical timeline stages scale + Plaque centered together */
              <motion.div
                key="center-step-3"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md mx-auto flex flex-col justify-center items-center my-auto gap-5 sm:gap-6 py-1 overflow-y-auto"
              >
                {/* Vertical Timeline Stages Scale */}
                <div className="w-full relative pl-13 pr-1 pt-1 pb-1 flex flex-col space-y-4 sm:space-y-5">
                  {/* Thick rounded grey connecting line - matches IMG_6967 */}
                  <div
                    className="absolute left-[19px] top-4 bottom-5 w-3.5 bg-[#D1D5DB] rounded-full pointer-events-none -translate-x-1/2"
                    style={{ backgroundColor: "#D1D5DB" }}
                  />

                  {/* Stage 1: Today */}
                  <div className="relative flex items-start">
                    {/* Black circle with white open lock icon */}
                    <div
                      className="absolute -left-13 top-0 w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-sm z-10 shrink-0"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <LockOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.4} style={{ color: "#ffffff" }} />
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className="text-[18px] sm:text-[19px] font-bold text-black paywall-title-black keep-black tracking-tight"
                        style={{ color: "#000000" }}
                      >
                        {lang === "ru" ? "Сегодня" : "Today"}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-zinc-600 leading-snug mt-0.5">
                        {lang === "ru"
                          ? "Разблокируйте Petkit Pro и присоединяйтесь к пользователям, использующим Petkit каждый день."
                          : "Unlock Petkit Pro and join users who use Petkit every day"}
                      </p>
                    </div>
                  </div>

                  {/* Stage 2: In 5 days */}
                  <div className="relative flex items-start">
                    {/* Black circle with white bell icon */}
                    <div
                      className="absolute -left-13 top-0 w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-sm z-10 shrink-0"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.8 3.5V1.8C10.8 1.1 11.3 0.5 12 0.5C12.7 0.5 13.2 1.1 13.2 1.8V3.5C16.8 3.85 19.3 6.8 19.3 10.8V13C19.3 14.8 20.5 16.1 21.6 17C22 17.3 21.8 18 21.2 18H2.8C2.2 18 2 17.3 2.4 17C3.5 16.1 4.7 14.8 4.7 13V10.8C4.7 6.8 7.2 3.85 10.8 3.5Z" />
                        <path d="M9.6 19.4H14.4C14.4 20.8 13.3 21.9 12 21.9C10.7 21.9 9.6 20.8 9.6 19.4Z" />
                      </svg>
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className="text-[18px] sm:text-[19px] font-bold text-black paywall-title-black keep-black tracking-tight"
                        style={{ color: "#000000" }}
                      >
                        {lang === "ru" ? "Через 5 дней" : "In 5 days"}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-zinc-600 leading-snug mt-0.5">
                        {lang === "ru"
                          ? "Мы отправим напоминание, что пробный период скоро закончится."
                          : "We’ll remind you when your trial is about to end"}
                      </p>
                    </div>
                  </div>

                  {/* Stage 3: In 7 days */}
                  <div className="relative flex items-start">
                    {/* Black circle with white checkmark icon */}
                    <div
                      className="absolute -left-13 top-0 w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-sm z-10 shrink-0"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} style={{ color: "#ffffff" }} />
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className="text-[18px] sm:text-[19px] font-bold text-black paywall-title-black keep-black tracking-tight"
                        style={{ color: "#000000" }}
                      >
                        {lang === "ru" ? "Через 7 дней" : "In 7 days"}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-zinc-600 leading-snug mt-0.5">
                        {lang === "ru"
                          ? `С вас спишется ${trialEndDate}, если вы не отмените раньше.`
                          : `You’ll be charged on ${trialEndDate} unless you cancel before then`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plaque styled per IMG_6966 (Black top banner with white text, #F6F7F9 lower section with black border and black text) */}
                <div
                  className="w-full rounded-[24px] bg-[#F6F7F9] border-[2.5px] border-black overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] select-none shrink-0 paywall-plan-card"
                  style={{ backgroundColor: "#F6F7F9", borderColor: "#000000" }}
                >
                  {/* Top strip: Black background with White bold text */}
                  <div
                    className="w-full bg-black py-2.5 sm:py-3 px-4 text-center font-extrabold text-[15px] sm:text-[16px] uppercase tracking-wider text-white card-banner"
                    style={{ backgroundColor: "#000000", color: "#ffffff" }}
                  >
                    <span
                      className="text-white !text-white keep-text-white font-extrabold tracking-wider"
                      style={{ color: "#ffffff" }}
                    >
                      {lang === "ru" ? "7 ДНЕЙ БЕСПЛАТНО" : "7 DAYS FREE"}
                    </span>
                  </div>

                  {/* Card lower details row: #F6F7F9 background, black text */}
                  <div
                    className="px-5 py-4 sm:py-4.5 bg-[#F6F7F9] flex items-center justify-between"
                    style={{ backgroundColor: "#F6F7F9" }}
                  >
                    <div className="flex flex-col">
                      <span
                        className="text-[18px] sm:text-[19px] font-bold tracking-tight paywall-title-black card-text-black keep-black text-black"
                        style={{ color: "#000000" }}
                      >
                        {lang === "ru" ? "Попробовать бесплатно" : "Try it for free"}
                      </span>
                      <span
                        className="text-[13px] sm:text-[14px] font-medium mt-0.5 text-zinc-600"
                        style={{ color: "#52525B" }}
                      >
                        {lang === "ru" ? "12 мес. • 79.99$" : "12 mo • 79.99$"}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                      <span
                        className="text-[18px] sm:text-[19px] font-bold tracking-tight paywall-title-black card-text-black keep-black text-black"
                        style={{ color: "#000000" }}
                      >
                        {lang === "ru" ? "1.64$/нед." : "1.64$/week"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA Area */}
        <div
          className="w-full max-w-md mx-auto px-6 pb-8 pt-2 flex flex-col items-center z-30 relative bg-[#F6F7F9]"
          style={{ backgroundColor: "#F6F7F9" }}
        >
          {/* Inscription above the button */}
          <div
            className="flex items-center justify-center gap-1.5 text-[15px] sm:text-[16px] font-semibold text-black mb-3 select-none"
            style={{ color: "#000000" }}
          >
            <span className="text-[14px]">✔️</span>
            <span style={{ color: "#000000" }}>
              {step === 1
                ? (lang === "ru" ? "Без списаний сейчас" : "No payment now")
                : step === 2
                ? (lang === "ru" ? "Легко отменить, бесплатно" : "Easy to cancel, no fees")
                : (lang === "ru" ? "Отмена в любой момент, без обязательств" : "Cancel anytime, no commitment")}
            </span>
          </div>

          {/* 'Start a free week' button in #006AFF (sRGB), rounded-[25px], no shadows, text explicitly white */}
          <button
            id="start-free-week-btn"
            type="button"
            onClick={handleCtaClick}
            style={{ backgroundColor: "#006AFF", color: "#ffffff" }}
            className="w-full bg-[#006AFF] !text-white keep-text-white text-[19px] sm:text-[20px] font-bold py-4 rounded-[25px] shadow-none hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center tracking-tight border-0 outline-none"
          >
            <span
              className="!text-white keep-text-white font-bold"
              style={{ color: "#ffffff" }}
            >
              {lang === "ru" ? "Начать бесплатную неделю" : "Start a free week"}
            </span>
          </button>
        </div>

        {/* iOS Notice Sheet: Prompt to use Settings button to make paywall disappear */}
        <AnimatePresence>
          {showSettingsHint && (
            <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 bg-black/45 backdrop-blur-xs select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl flex flex-col items-center text-center border border-black/5"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#006AFF] flex items-center justify-center mb-3.5">
                  <Crown className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <h3 className="text-[20px] font-bold text-black tracking-tight mb-2">
                  {lang === "ru" ? "Страница подписки" : "Subscription Page"}
                </h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed mb-5">
                  {lang === "ru"
                    ? "Чтобы эта страница подписки пропала, нажмите специальную кнопку в Настройках приложения."
                    : "To make this subscription page disappear, tap the special button in Settings."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsHint(false);
                    if (onNavigateToSettings) {
                      onNavigateToSettings();
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full bg-[#006AFF] text-white font-bold py-3.5 rounded-[20px] mb-2 active:scale-[0.98] transition-all cursor-pointer shadow-none"
                >
                  <span className="text-white !text-white keep-text-white">
                    {lang === "ru" ? "Перейти в Настройки" : "Open Settings"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsHint(false)}
                  className="w-full py-2 text-zinc-500 font-semibold text-[15px] hover:text-black transition-colors cursor-pointer"
                >
                  {lang === "ru" ? "Назад" : "Back"}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
