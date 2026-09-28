import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Pet, PetType } from "../types";
import { X, Camera, Upload, Check } from "lucide-react";

interface AddPetModalProps {
  onClose: () => void;
  onAddPet: (pet: Pet) => void;
}

export default function AddPetModal({ onClose, onAddPet }: AddPetModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("cat");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Use placeholder if no custom image is selected
    const fallbackImage = type === 'cat'
      ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop"
      : type === 'dog'
      ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=500&auto=format&fit=crop";

    const newPet: Pet = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      type,
      image: image || fallbackImage,
      breed: breed || undefined,
      age: age || undefined,
      weight: weight || undefined,
      isCustom: true,
    };

    onAddPet(newPet);
  };

  const triggerImageSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="add-pet-modal-backdrop" className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.15 }}
        dragSnapToOrigin
        onDragEnd={(_event, info) => {
          if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
            onClose();
          }
        }}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        id="add-pet-modal-content"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100">
          <h3 className="text-base font-extrabold text-[#1c1c1e]">Add a Pet</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 cursor-pointer"
          >
            <X size={14} className="text-zinc-600" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Avatar selection container */}
          <div className="flex flex-col items-center space-y-2 mb-3">
            <div
              onClick={triggerImageSelect}
              className="h-24 w-24 bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-150 transition-colors relative overflow-hidden group shadow-inner"
            >
              {image ? (
                <img src={image} alt="Pet Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={22} className="text-zinc-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">Photo</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={triggerImageSelect}
              className="text-xs font-semibold text-[#5856d6] hover:underline cursor-pointer"
            >
              Choose a photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Luna, Charlie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5856d6]"
              />
            </div>

            {/* Type selector pillbox */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Pet Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['cat', 'dog', 'parrot', 'other'] as PetType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`text-xs py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      type === t
                        ? "bg-[#5856d6] text-white border-transparent shadow-xs"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {t === 'cat' ? "🐱 Cat" : t === 'dog' ? "🐶 Dog" : t === 'parrot' ? "🦜 Parrot" : "🐾 Other"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Breed (optional)</label>
              <input
                type="text"
                placeholder="e.g. British Shorthair, Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5856d6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Age</label>
                <input
                  type="text"
                  placeholder="e.g. 2 years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5856d6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Weight (kg)</label>
                <input
                  type="text"
                  placeholder="e.g. 4.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5856d6]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-3 rounded-full hover:bg-zinc-50 transition-colors cursor-pointer text-center text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1c1c1e] text-white font-bold py-3 rounded-full hover:bg-black transition-colors cursor-pointer text-center text-xs shadow-xs"
            >
              Create Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
