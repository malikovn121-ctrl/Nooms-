import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, X } from "lucide-react";
import { Pet, PetType } from "../types";

import phoneSnapDogImg from "../assets/images/phone_snap_dog_1784890252597.jpg";
import phoneSnapCatImg from "../assets/images/phone_snap_cat_1784890268155.jpg";
import phoneSnapRabbitImg from "../assets/images/phone_snap_rabbit_1784890284532.jpg";
import phoneSnapRodentImg from "../assets/images/phone_snap_rodent_1784890299304.jpg";
import phoneSnapBirdImg from "../assets/images/phone_snap_bird_1784890315864.jpg";
import phoneSnapReptileImg from "../assets/images/phone_snap_reptile_1784890330925.jpg";
import phoneSnapUnicornImg from "../assets/images/phone_snap_unicorn_1784890347484.jpg";

interface AddPetQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPet: (newPet: Pet) => void;
}

const PET_TYPE_OPTIONS = [
  { id: "dog", label: "🐶 Dog", emoji: "🐶", species: "Dog", fallbackImage: phoneSnapDogImg },
  { id: "cat", label: "🐱 Cat", emoji: "🐱", species: "Cat", fallbackImage: phoneSnapCatImg },
  { id: "rabbit", label: "🐰 Rabbit", emoji: "🐰", species: "Rabbit", fallbackImage: phoneSnapRabbitImg },
  { id: "rodent", label: "🐹 Rodent", emoji: "🐹", species: "Rodent", fallbackImage: phoneSnapRodentImg },
  { id: "bird", label: "🐦 Bird", emoji: "🐦", species: "Bird", fallbackImage: phoneSnapBirdImg },
  { id: "reptile", label: "🐢 Reptile", emoji: "🐢", species: "Reptile", fallbackImage: phoneSnapReptileImg },
  { id: "another", label: "🦄 Another", emoji: "🦄", species: "Another", fallbackImage: phoneSnapUnicornImg },
];

export default function AddPetQuizModal({ isOpen, onClose, onAddPet }: AddPetQuizModalProps) {
  const [step, setStep] = useState<number>(1);
  const [quizDirection, setQuizDirection] = useState<"forward" | "backward">("forward");

  // Pet questions state (1: Type, 2: Name, 3: Age, 4: Sex)
  const [selectedPetType, setSelectedPetType] = useState<string>("dog");
  const [petNameInput, setPetNameInput] = useState<string>("");
  const [selectedPetAge, setSelectedPetAge] = useState<string>("1-3");
  const [selectedPetSex, setSelectedPetSex] = useState<string>("Male");

  const handleClose = () => {
    onClose();
    // Delay resetting state until exit slide animation finishes
    setTimeout(() => {
      setStep(1);
      setQuizDirection("forward");
      setSelectedPetType("dog");
      setPetNameInput("");
      setSelectedPetAge("1-3");
      setSelectedPetSex("Male");
    }, 350);
  };

  const handleNextStep = () => {
    setQuizDirection("forward");
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      // Complete: construct new pet with real data
      const matched = PET_TYPE_OPTIONS.find((p) => p.id === selectedPetType) || PET_TYPE_OPTIONS[0];
      const finalName = petNameInput.trim() || matched.species;

      const newPet: Pet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: finalName,
        type: (selectedPetType || "dog") as PetType,
        species: matched.species,
        emoji: matched.emoji,
        image: matched.fallbackImage,
        breed: matched.species,
        age: selectedPetAge || "1-3",
        sex: selectedPetSex || "Male",
        weight: selectedPetType === "dog" ? "6.8 kg" : selectedPetType === "cat" ? "4.2 kg" : "1.2 kg",
        isCustom: true,
      };

      onAddPet(newPet);
      handleClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setQuizDirection("backward");
      setStep((prev) => prev - 1);
    } else {
      handleClose();
    }
  };

  const handleSelectPetType = (typeId: string) => {
    setSelectedPetType(typeId);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleSelectPetAge = (age: string) => {
    setSelectedPetAge(age);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleSelectPetSex = (sex: string) => {
    setSelectedPetSex(sex);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // Check whether user can continue at each step
  const canContinue =
    step === 1
      ? !!selectedPetType
      : step === 2
      ? petNameInput.trim().length > 0
      : step === 3
      ? !!selectedPetAge
      : step === 4
      ? !!selectedPetSex
      : true;

  // Progress percentage (4 steps)
  const progressPercent = step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%";

  const cardContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
  };

  const cardItemVariants: any = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  // Dynamic age options per species, identical to onboarding step 4
  const getAgeOptions = () => {
    if (selectedPetType === "rodent") {
      return ["Under 1", "1-3", "4+", "I don't know for sure"];
    } else if (selectedPetType === "rabbit") {
      return ["Under 1", "1-3", "4-7", "8-12+", "I don't know for sure"];
    } else if (selectedPetType === "reptile") {
      return ["Under 1", "1-3", "4-7", "8-12", "13-100", "I don't know for sure"];
    }
    return ["Under 1", "1-3", "4-7", "8-12", "13+", "I don't know for sure"];
  };

  const currentSpeciesTitle =
    selectedPetType === "cat"
      ? "cat's"
      : selectedPetType === "dog"
      ? "dog's"
      : selectedPetType === "rabbit"
      ? "rabbit's"
      : "pet's";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="add-pet-fullscreen-quiz"
          key="add-pet-fullscreen-quiz-container"
          drag="y"
          dragDirectionLock
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0.15 }}
          dragSnapToOrigin
          onDragEnd={(_event, info) => {
            if (info.offset.y > 80 || (info.velocity.y > 200 && info.offset.y > 20)) {
              handleClose();
            }
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[100] w-full h-[100dvh] bg-[#f5f4fa] dark:bg-[#000000] flex flex-col justify-between pt-2 pb-3 font-sf select-none overflow-hidden shadow-2xl"
        >
          {/* iOS Drag Handle */}
          <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-1 mb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

          {/* 1. Header Bar - Identical to onboarding header bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between px-6 pt-2 flex-none relative">
        {/* Curved Chevron style back button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/90 flex items-center justify-center transition-all cursor-pointer active:scale-95 border-none outline-none focus:outline-none text-black dark:text-white"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Progress bar in the middle */}
        <div className="flex-1 mx-4 h-[10px] bg-zinc-200/50 dark:bg-zinc-800/60 rounded-full relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-black dark:bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: progressPercent }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/90 flex items-center justify-center transition-all cursor-pointer active:scale-95 border-none outline-none focus:outline-none text-black dark:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. Question Area - Identical layout & typography to onboarding */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start px-6 pt-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence mode="wait" custom={quizDirection}>
          {/* Question 1: Who is your pet? */}
          {step === 1 && (
            <motion.div
              key="quiz-step-1"
              custom={quizDirection}
              initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col justify-start"
            >
              <div className="mt-3 mb-5 overflow-hidden">
                <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] dark:from-[#D1D1D6] dark:to-[#FFFFFF] text-left w-full select-none">
                  Who is your pet?
                </h1>
              </div>

              <div className="flex-1 pb-2 flex flex-col">
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-3"
                >
                  {PET_TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedPetType === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        variants={cardItemVariants}
                        onClick={() => handleSelectPetType(opt.id)}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full py-[15px] px-6 rounded-[25px] bg-white dark:bg-[#1C1C1E] text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                          isSelected
                            ? "border-black dark:border-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                            : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                        }`}
                      >
                        <span className="text-[18px] font-semibold text-black dark:text-white select-none">
                          {opt.label}
                        </span>

                        {/* Circle checkmark indicator on right */}
                        <div
                          className={`relative w-[26px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-black/40 group-hover:border-zinc-400 dark:group-hover:border-white/35 shadow-2xs"
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isSelected ? 1 : 0,
                              opacity: isSelected ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.18,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            className="absolute inset-0 bg-black dark:bg-white rounded-full"
                          />
                          <svg
                            className="relative z-10 w-3.5 h-3.5 text-white dark:text-black pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.polyline
                              points="20 6 9 17 4 12"
                              initial={false}
                              animate={{
                                pathLength: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.16,
                                ease: "easeOut",
                                delay: isSelected ? 0.04 : 0,
                              }}
                            />
                          </svg>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Question 2: What is your pet's name? */}
          {step === 2 && (
            <motion.div
              key="quiz-step-2"
              custom={quizDirection}
              initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col justify-start"
            >
              <div className="mt-3 mb-5 overflow-hidden">
                <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] dark:from-[#D1D1D6] dark:to-[#FFFFFF] text-left w-full select-none">
                  What is your pet's name?
                </h1>
              </div>

              <div className="flex-1 pb-2 flex flex-col justify-center">
                <input
                  type="text"
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && petNameInput.trim().length > 0) {
                      handleNextStep();
                    }
                  }}
                  placeholder="Pet’s name"
                  className={`w-full bg-white dark:bg-[#1C1C1E] rounded-[28px] px-6 py-[20px] text-[20px] font-semibold text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none focus:outline-none border-none shadow-none ${
                    petNameInput ? "text-center placeholder:text-center" : "text-left placeholder:text-left"
                  }`}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {/* Question 3: What is your pet's age? */}
          {step === 3 && (
            <motion.div
              key="quiz-step-3"
              custom={quizDirection}
              initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col justify-start"
            >
              <div className="mt-3 mb-4 overflow-hidden">
                <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] dark:from-[#D1D1D6] dark:to-[#FFFFFF] text-left w-full select-none">
                  What is your {currentSpeciesTitle} age?
                </h1>
              </div>

              <div className="flex-1 pb-2 flex flex-col">
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-2.5"
                >
                  {getAgeOptions().map((opt) => {
                    const isSelected = selectedPetAge === opt;
                    return (
                      <motion.button
                        key={opt}
                        variants={cardItemVariants}
                        onClick={() => handleSelectPetAge(opt)}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full py-[13px] px-6 rounded-[25px] bg-white dark:bg-[#1C1C1E] text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                          isSelected
                            ? "border-black dark:border-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                            : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                        }`}
                      >
                        <span className="text-[18px] font-semibold text-black dark:text-white select-none">
                          {opt}
                        </span>

                        {/* Circle checkmark indicator on right */}
                        <div
                          className={`relative w-[26px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-black/40 group-hover:border-zinc-400 dark:group-hover:border-white/35 shadow-2xs"
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isSelected ? 1 : 0,
                              opacity: isSelected ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.18,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            className="absolute inset-0 bg-black dark:bg-white rounded-full"
                          />
                          <svg
                            className="relative z-10 w-3.5 h-3.5 text-white dark:text-black pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.polyline
                              points="20 6 9 17 4 12"
                              initial={false}
                              animate={{
                                pathLength: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.16,
                                ease: "easeOut",
                                delay: isSelected ? 0.04 : 0,
                              }}
                            />
                          </svg>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Question 4: What is your pet's sex? */}
          {step === 4 && (
            <motion.div
              key="quiz-step-4"
              custom={quizDirection}
              initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col justify-start"
            >
              <div className="mt-3 mb-4 overflow-hidden">
                <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] dark:from-[#D1D1D6] dark:to-[#FFFFFF] text-left w-full select-none">
                  What is your {currentSpeciesTitle} sex?
                </h1>
              </div>

              <div className="flex-1 pb-2 flex flex-col">
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-2.5"
                >
                  {["Male", "Female", "Prefer not to say"].map((opt) => {
                    const isSelected = selectedPetSex === opt;
                    return (
                      <motion.button
                        key={opt}
                        variants={cardItemVariants}
                        onClick={() => handleSelectPetSex(opt)}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full py-[14px] px-6 rounded-[25px] bg-white dark:bg-[#1C1C1E] text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                          isSelected
                            ? "border-black dark:border-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                            : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                        }`}
                      >
                        <span className="text-[18px] font-semibold text-black dark:text-white select-none">
                          {opt}
                        </span>

                        {/* Circle checkmark indicator on right */}
                        <div
                          className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-black/40 group-hover:border-zinc-400 dark:group-hover:border-white/35 shadow-2xs"
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isSelected ? 1 : 0,
                              opacity: isSelected ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.18,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            className="absolute inset-0 bg-black dark:bg-white rounded-full"
                          />
                          <svg
                            className="relative z-10 w-3.5 h-3.5 text-white dark:text-black pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.polyline
                              points="20 6 9 17 4 12"
                              initial={false}
                              animate={{
                                pathLength: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.16,
                                ease: "easeOut",
                                delay: isSelected ? 0.04 : 0,
                              }}
                            />
                          </svg>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Button Bar - Identical to onboarding bottom button */}
      <div className="w-full max-w-md mx-auto px-6 pb-6 pt-2 flex-none">
        <motion.button
          type="button"
          onClick={handleNextStep}
          disabled={!canContinue}
          whileTap={canContinue ? { scale: 0.98 } : undefined}
          className={`w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] transition-colors duration-300 flex items-center justify-center cursor-pointer ${
            canContinue
              ? "bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black active:scale-[0.98] shadow-lg"
              : "bg-[#E7E8E9] dark:bg-[#2C2C2E] text-[#8E8E93] dark:text-[#636366] cursor-not-allowed"
          }`}
        >
          {step === 4 ? "Add Pet" : "Continue"}
        </motion.button>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
