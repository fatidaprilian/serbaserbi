import React, { useRef } from "react";

interface LogoUploadProps {
  logo?: string;
  onLogoChange: (logoBase64: string) => void;
  onLogoRemove: () => void;
}

export default function LogoUpload({ logo, onLogoChange, onLogoRemove }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onLogoChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700">Logo Bisnis (Opsional)</label>
      <div className="flex items-center gap-4">
        {logo ? (
          <div className="relative">
            <div className="w-16 h-16 border border-zinc-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <button
              onClick={onLogoRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm z-10"
              title="Hapus Logo"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:border-black hover:text-black transition-colors"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        )}
        
        {!logo && (
          <div className="text-xs text-zinc-500 max-w-[200px]">
            Format PNG/JPG transparan direkomendasikan. Maks 2MB.
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
      />
    </div>
  );
}
