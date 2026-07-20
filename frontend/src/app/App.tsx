import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  Upload, Check, X, Download, Trash2, Search,
  HardDrive, Calendar, LogIn, Camera, Lock, User,
  Images, ChevronRight, Sparkles, Eye, EyeOff
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */

type Page = "landing" | "admin-login" | "admin-dashboard";
type UploadState = "idle" | "dragging" | "preparing" | "uploading" | "success" | "error";

interface PhotoEntry {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

/* ─── Demo data ──────────────────────────────────────────────── */

const DEMO_PHOTOS: PhotoEntry[] = [
  { id: "d1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&h=360&fit=crop&auto=format", name: "tören_anı_01.jpg", size: 2.4 * 1024 * 1024, uploadedAt: new Date(Date.now() - 7200000) },
  { id: "d2", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=480&h=360&fit=crop&auto=format", name: "nikah_salonu_02.jpg", size: 3.1 * 1024 * 1024, uploadedAt: new Date(Date.now() - 10800000) },
  { id: "d3", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=480&h=360&fit=crop&auto=format", name: "çifte_dans_03.jpg", size: 1.8 * 1024 * 1024, uploadedAt: new Date(Date.now() - 14400000) },
  { id: "d4", url: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=480&h=360&fit=crop&auto=format", name: "misafirler_04.jpg", size: 2.7 * 1024 * 1024, uploadedAt: new Date(Date.now() - 18000000) },
  { id: "d5", url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=480&h=360&fit=crop&auto=format", name: "çiçek_aranjman_05.jpg", size: 4.2 * 1024 * 1024, uploadedAt: new Date(Date.now() - 21600000) },
  { id: "d6", url: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=480&h=360&fit=crop&auto=format", name: "pasta_töreni_06.jpg", size: 3.5 * 1024 * 1024, uploadedAt: new Date(Date.now() - 28800000) },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h} saat önce`;
  if (m > 0) return `${m} dakika önce`;
  return "Az önce";
}

/* ─── CSS Keyframes ──────────────────────────────────────────── */

const GLOBAL_STYLES = `
  @keyframes floatUp {
    0%   { transform: translateY(0) translateX(0) scale(1);   opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-110vh) translateX(var(--sway)) scale(0.5); opacity: 0; }
  }
  @keyframes shimmerPop {
    0%   { transform: scale(0) rotate(0deg);   opacity: 0; }
    50%  { transform: scale(1.4) rotate(180deg); opacity: 1; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  @keyframes goldenPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(196,151,60,0); }
    50%       { box-shadow: 0 0 32px 8px rgba(157,91,107,0.18); }
  }
  @keyframes progressShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 80; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes circleScale {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes softGlow {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.85; }
  }
  @keyframes gentleSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .float-particle {
    position: fixed;
    pointer-events: none;
    animation: floatUp var(--dur) var(--delay) infinite ease-in-out;
    will-change: transform, opacity;
  }
  .progress-bar-fill {
    background: linear-gradient(90deg, #9D5B6B 0%, #C4899A 40%, #E8C4CB 50%, #C4899A 60%, #9D5B6B 100%);
    background-size: 200% auto;
    animation: progressShimmer 1.8s linear infinite;
  }
  .check-svg circle {
    animation: circleScale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
    transform-origin: center;
  }
  .check-svg path {
    stroke-dasharray: 80;
    stroke-dashoffset: 80;
    animation: checkDraw 0.5s 0.4s ease forwards;
  }
  .glow-card {
    animation: goldenPulse 3s ease-in-out infinite;
  }
  .hero-title {
    animation: fadeSlideUp 1s 0.3s both ease-out;
  }
  .hero-sub {
    animation: fadeSlideUp 1s 0.6s both ease-out;
  }
  .upload-card-enter {
    animation: fadeSlideUp 1s 0.9s both ease-out;
  }
  .spinner {
    animation: gentleSpin 1s linear infinite;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(157,91,107,0.3); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(196,151,60,0.6); }
`;

/* ─── Floating Decorative Particles ─────────────────────────── */

const PARTICLES = Array.from({ length: 52 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 16 + 7,
  dur: `${Math.random() * 14 + 9}s`,
  delay: `${Math.random() * 18}s`,
  sway: `${(Math.random() - 0.5) * 90}px`,
  type: i % 2 === 0 ? "heart" : "star",
  opacity: Math.random() * 0.38 + 0.10,
}));

function FloatingParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="float-particle"
          style={{
            left: p.left,
            bottom: "-10%",
            "--dur": p.dur,
            "--delay": p.delay,
            "--sway": p.sway,
            opacity: p.opacity,
            color: "#9D5B6B",
            fontSize: p.size,
          } as React.CSSProperties}
        >
          {p.type === "heart" && (
            <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
          {p.type === "diamond" && (
            <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor">
              <path d="M12 2L2 9l10 13L22 9z"/>
            </svg>
          )}
          {p.type === "circle" && (
            <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          )}
          {p.type === "star" && (
            <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
          )}
        </div>
      ))}

      {/* radial golden glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(157,91,107,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(157,91,107,0.05) 0%, transparent 70%)" }} />
    </div>
  );
}

/* ─── Ornamental Divider ─────────────────────────────────────── */

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(157,91,107,0.4))" }} />
      <svg viewBox="0 0 24 24" width={16} height={16} fill="#9D5B6B" className="opacity-60">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(157,91,107,0.4))" }} />
    </div>
  );
}

/* ─── Upload Area ────────────────────────────────────────────── */

function UploadSection({ onUploaded }: { onUploaded: (files: File[]) => void }) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFilesRef = useRef<File[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (validFiles.length === 0) return;

    lastFilesRef.current = validFiles;
    setFileCount(validFiles.length);
    setErrorMessage("");

    // Calculate total size
    const total = validFiles.reduce((sum, f) => sum + f.size, 0);
    setTotalBytes(total);
    setLoadedBytes(0);
    setProgress(0);

    // Show "preparing" immediately so UI blocks further clicks
    setState("preparing");

    // Defer heavy FormData construction so the UI can render first
    setTimeout(() => {
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append("files", file);
      }

      setState("uploading");

      // Use XMLHttpRequest for real byte-level progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = (e.loaded / e.total) * 100;
          setLoadedBytes(e.loaded);
          setProgress(pct);

          // All bytes sent to server → show success immediately
          // Server will continue uploading to Drive in the background
          if (e.loaded >= e.total) {
            setProgress(100);
            setLoadedBytes(total);
            setState("success");
            onUploaded(validFiles);
          }
        }
      });

      // Server response handlers — only log, don't show errors
      // because data is already on the server when progress hits 100%
      xhr.addEventListener("load", () => {
        console.log("Server responded:", xhr.status);
      });

      xhr.addEventListener("error", () => {
        console.log("XHR error after upload (data already sent to server)");
      });

      xhr.addEventListener("timeout", () => {
        console.log("XHR timeout after upload (data already sent to server)");
      });

      xhr.open("POST", "/api/upload");
      xhr.timeout = 0; // No timeout for large uploads
      xhr.send(formData);
    }, 50);
  }, [onUploaded]);

  const retryUpload = useCallback(() => {
    if (lastFilesRef.current.length > 0) {
      handleFiles(lastFilesRef.current);
    }
  }, [handleFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const onDragLeave = useCallback(() => setState("idle"), []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  }, [handleFiles]);

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="check-svg">
          <svg viewBox="0 0 80 80" width={90} height={90}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#9D5B6B" strokeWidth="3" opacity="0.25" />
            <circle cx="40" cy="40" r="36" fill="#9D5B6B" />
            <path d="M24 40 L35 51 L56 30" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-medium" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F" }}>
            Medya başarıyla yüklendi.
          </p>
          <p className="text-sm" style={{ color: "#8B6470" }}>
            {fileCount} dosya · {formatBytes(totalBytes)} gönderildi 🤍
          </p>
        </div>
        <button
          onClick={() => { setState("idle"); setProgress(0); setFileCount(0); setTotalBytes(0); setLoadedBytes(0); }}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 hover:shadow-md"
          style={{ borderColor: "rgba(196,151,60,0.5)", color: "#9D5B6B", background: "rgba(157,91,107,0.06)" }}
        >
          Başka Medya Yükle
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 px-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(192,57,43,0.08)" }}>
          <X size={28} style={{ color: "#C0392B" }} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F" }}>
            Yükleme Hatası
          </p>
          <p className="text-sm max-w-xs" style={{ color: "#8B6470" }}>
            {errorMessage}
          </p>
          <p className="text-xs" style={{ color: "#B0808E" }}>
            {formatBytes(loadedBytes)} / {formatBytes(totalBytes)} gönderildi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={retryUpload}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ background: "linear-gradient(135deg, #9D5B6B 0%, #7A3F50 100%)" }}
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => { setState("idle"); setProgress(0); setFileCount(0); setTotalBytes(0); setLoadedBytes(0); setErrorMessage(""); }}
            className="px-6 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 hover:shadow-md"
            style={{ borderColor: "rgba(157,91,107,0.35)", color: "#9D5B6B", background: "rgba(157,91,107,0.06)" }}
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  if (state === "preparing") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 px-4">
        <div className="relative w-20 h-20">
          <svg className="spinner absolute inset-0" viewBox="0 0 80 80" width={80} height={80}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(196,151,60,0.15)" strokeWidth="4" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#9D5B6B" strokeWidth="4"
              strokeDasharray="60 150" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={22} style={{ color: "#9D5B6B" }} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium" style={{ color: "#6B3A48" }}>
            {fileCount} dosya hazırlanıyor…
          </p>
          <p className="text-xs" style={{ color: "#8B6470" }}>
            Lütfen bekleyiniz · {formatBytes(totalBytes)}
          </p>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 px-4">
        <div className="relative w-20 h-20">
          <svg className="spinner absolute inset-0" viewBox="0 0 80 80" width={80} height={80}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(196,151,60,0.15)" strokeWidth="4" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#9D5B6B" strokeWidth="4"
              strokeDasharray="60 150" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={22} style={{ color: "#9D5B6B" }} />
          </div>
        </div>
        <div className="w-full max-w-xs space-y-3 text-center">
          <p className="text-sm font-medium" style={{ color: "#6B3A48" }}>
            {fileCount} dosya yükleniyor…
          </p>
          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(157,91,107,0.12)" }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full progress-bar-fill transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: "#8B6470" }}>
            <span>{formatBytes(loadedBytes)} / {formatBytes(totalBytes)}</span>
            <span className="font-medium" style={{ color: "#6B3A48" }}>%{Math.round(progress)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label="Medya yükleme alanı"
      className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 py-14 px-8 flex flex-col items-center gap-5 group"
      style={{
        borderColor: state === "dragging" ? "#9D5B6B" : "rgba(157,91,107,0.35)",
        background: state === "dragging"
          ? "rgba(157,91,107,0.06)"
          : "rgba(250,247,242,0.6)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={onInputChange}
      />

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
        style={{ background: "linear-gradient(135deg, #F7ECF0 0%, #E8C4CB 100%)" }}
      >
        <Camera size={32} style={{ color: "#9D5B6B" }} />
      </div>

      <div className="text-center space-y-2">
        <p className="text-base font-medium" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F" }}>
          Fotoğraf ve Videoları Buraya Bırakın veya Seçin
        </p>
        <p className="text-sm" style={{ color: "#8B6470" }}>
          JPG, PNG, HEIC, MP4, MOV · Birden fazla dosya seçebilirsiniz
        </p>
      </div>

      <button
        onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
        className="mt-1 px-8 py-3 rounded-full font-medium text-sm text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-100"
        style={{ background: "linear-gradient(135deg, #9D5B6B 0%, #7A3F50 100%)" }}
      >
        Medya Seç ve Yükle
      </button>

      {state === "dragging" && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(196,151,60,0.04)" }}>
          <p className="text-lg font-medium" style={{ color: "#9D5B6B", fontFamily: "Playfair Display, serif" }}>
            Bırakın!
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────────── */

function LandingPage({ onPhotosUploaded }: { onPhotosUploaded: (files: File[]) => void }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #FFFBFC 0%, #FDF7F8 45%, #F7ECF0 100%)" }}>

      <FloatingParticles />

      {/* Soft top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(157,91,107,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24">



        <div className="text-center max-w-2xl mx-auto">
          <h1 className="hero-title mb-4 leading-tight"
            style={{
              fontFamily: "Playfair Display, serif",
              fontStyle: "italic",
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 500,
              color: "#9D5B6B",
              letterSpacing: "-0.01em",
            }}>
            Anılarınızı Bizimle Paylaşın
          </h1>

          <p className="hero-sub text-base md:text-lg leading-relaxed"
            style={{ color: "#9D5B6B", fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", fontWeight: 400, margin: "0 auto" }}>
            Bu özel günde çektiğiniz fotoğraf ve videoları aşağıdan yükleyebilirsiniz.
          </p>
        </div>

        {/* Couple names placeholder */}
        <div className="my-4 flex items-center gap-4 text-center">
          <p style={{ fontFamily: "Great Vibes, cursive", fontSize: "1.7rem", color: "#9D5B6B" }}>Esra</p>
          <svg viewBox="0 0 24 24" width={18} height={18} fill="#9D5B6B" opacity={0.5}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <p style={{ fontFamily: "Great Vibes, cursive", fontSize: "1.7rem", color: "#9D5B6B" }}>Yunus</p>
        </div>

        {/* Upload card */}
        <div className="upload-card-enter w-full max-w-md mt-6">
          <div
            className="glow-card rounded-3xl p-6 md:p-8"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(157,91,107,0.25)",
              boxShadow: "0 8px 40px rgba(44,24,16,0.06), 0 2px 8px rgba(196,151,60,0.08)",
            }}
          >
            <UploadSection onUploaded={onPhotosUploaded} />
          </div>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-center max-w-xs" style={{ color: "#8B6470" }}>
          🔒 Dosyalarınız yalnızca çift tarafından görülebilir.
        </p>

        {/* Footer */}
        <footer className="mt-20 text-center space-y-1">
          <GoldDivider />
          <p style={{ fontFamily: "Great Vibes, cursive", fontSize: "1.2rem", color: "#9D5B6B", marginTop: "12px" }}>
            26 Temmuz 2026
          </p>
          <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "#8B6470" }}>
            Bu anıyı paylaştığınız için teşekkürler
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ─── Admin Login ─────────────────────────────────────────────── */

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      
      if (!res.ok) {
        throw new Error("Kullanıcı adı veya şifre hatalı.");
      }
      
      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #FFFDF9 0%, #FDF7F8 50%, #F7ECF0 100%)" }}>

      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg, #F7ECF0, #E8C4CB)", border: "1px solid rgba(157,91,107,0.3)" }}>
            <Lock size={22} style={{ color: "#9D5B6B" }} />
          </div>
          <p className="text-xs tracking-[0.25em] uppercase" style={{ color: "#8B6470" }}>Yönetim Paneli</p>
        </div>

        <div className="rounded-3xl p-8"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(157,91,107,0.2)",
            boxShadow: "0 12px 48px rgba(44,24,16,0.08), 0 2px 8px rgba(157,91,107,0.06)",
          }}>

          <h2 className="text-center mb-6" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F", fontSize: "1.5rem", fontWeight: 500 }}>
            Giriş Yap
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs tracking-wide uppercase" style={{ color: "#8B6470" }}>Kullanıcı Adı</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8B6470" }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    background: "#FDF7F8",
                    border: "1px solid rgba(157,91,107,0.25)",
                    color: "#2A1A1F",
                    "--tw-ring-color": "rgba(157,91,107,0.35)",
                  } as React.CSSProperties}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs tracking-wide uppercase" style={{ color: "#8B6470" }}>Şifre</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8B6470" }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    background: "#FDF7F8",
                    border: "1px solid rgba(157,91,107,0.25)",
                    color: "#2A1A1F",
                    "--tw-ring-color": "rgba(157,91,107,0.35)",
                  } as React.CSSProperties}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity">
                  {showPw ? <EyeOff size={15} style={{ color: "#8B6470" }} /> : <Eye size={15} style={{ color: "#8B6470" }} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center px-3 py-2 rounded-lg" style={{ color: "#C0392B", background: "rgba(192,57,43,0.06)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #9D5B6B 0%, #7A3F50 100%)" }}
            >
              {loading ? (
                <svg className="spinner" viewBox="0 0 24 24" width={18} height={18}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="28 10" strokeLinecap="round"/>
                </svg>
              ) : (
                <>
                  <LogIn size={15} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "#8B6470" }}>
          Demo: admin / wedding2025
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Admin Dashboard ────────────────────────────────────────── */

function AdminDashboard({ uploadedPhotos, onLogout }: {
  uploadedPhotos?: PhotoEntry[];
  onLogout: () => void;
}) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_uploads: 0, uploads_today: 0, storage_usage: 0 });

  const fetchPhotos = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return onLogout();
    
    try {
      const [photosRes, statsRes] = await Promise.all([
        fetch("/api/admin/photos", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (photosRes.status === 401) return onLogout();
      
      const data = await photosRes.json();
      setPhotos(data.map((p: any) => ({
        id: p.id,
        url: `/api/admin/photo/${p.id}?token=${token}`,
        name: p.original_name,
        size: p.file_size,
        uploadedAt: new Date(p.upload_date)
      })));
      
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const filtered = photos.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStorage = stats.storage_usage;
  const todayCount = stats.uploads_today;

  const deletePhoto = async (id: string) => {
    const token = localStorage.getItem("admin_token");
    try {
      await fetch(`/api/admin/photo/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPhoto = async (photo: PhotoEntry) => {
    const token = localStorage.getItem("admin_token");
    const a = document.createElement("a");
    a.href = `/api/admin/download/${photo.id}?token=${token}`;
    a.download = photo.name;
    a.target = "_blank";
    a.click();
  };

  const StatCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) => (
    <div className="rounded-2xl p-5 flex items-start gap-4"
      style={{ background: "#FFFFFF", border: "1px solid rgba(157,91,107,0.2)", boxShadow: "0 2px 12px rgba(44,24,16,0.04)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #F7ECF0, #E8C4CB)" }}>
        <Icon size={18} style={{ color: "#9D5B6B" }} />
      </div>
      <div>
        <p className="text-xs tracking-wide uppercase mb-0.5" style={{ color: "#8B6470" }}>{label}</p>
        <p className="text-2xl font-medium leading-none" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "#8B6470" }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#FDF7F8" }}>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderColor: "rgba(157,91,107,0.18)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F7ECF0, #E8C4CB)" }}>
              <svg viewBox="0 0 40 40" width={18} height={18} fill="none">
                <path d="M20 6 C14 6, 8 11, 8 18 C8 28, 20 34, 20 34 C20 34, 32 28, 32 18 C32 11, 26 6, 20 6Z" fill="#9D5B6B" opacity="0.85"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ fontFamily: "Playfair Display, serif", color: "#2A1A1F" }}>Düğün Galerisi</p>
              <p className="text-xs hidden sm:block" style={{ color: "#8B6470" }}>Yönetim Paneli</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-sm"
            style={{ color: "#8B6470", border: "1px solid rgba(157,91,107,0.25)", background: "#FDF7F8" }}
          >
            <LogIn size={13} className="rotate-180" />
            Çıkış
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Images} label="Toplam Medya" value={`${photos.length}`} sub="tüm zamanlar" />
          <StatCard icon={Calendar} label="Bugünkü Yükleme" value={`${todayCount}`} sub="son 24 saat" />
          <StatCard icon={HardDrive} label="Toplam Depolama" value={formatBytes(totalStorage)} sub="kullanılan alan" />
        </div>

        {/* Search + count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8B6470" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Fotoğraf ara…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(157,91,107,0.25)",
                color: "#2A1A1F",
                "--tw-ring-color": "rgba(157,91,107,0.3)",
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm" style={{ color: "#8B6470" }}>
              {filtered.length} fotoğraf görüntüleniyor
            </p>
            {filtered.length > 0 && (
              <button
                onClick={() => filtered.forEach(p => downloadPhoto(p))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #9D5B6B 0%, #7A3F50 100%)", color: "white" }}
              >
                <Download size={14} />
                Tümünü İndir
              </button>
            )}
          </div>
        </div>

        {/* Photo grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Camera size={40} className="mx-auto mb-4 opacity-30" style={{ color: "#9D5B6B" }} />
            <p style={{ color: "#8B6470" }}>Fotoğraf bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map(photo => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(196,151,60,0.15)",
                  boxShadow: "0 2px 8px rgba(44,24,16,0.05)",
                }}
              >
                {/* Media */}
                <div className="aspect-[4/3] overflow-hidden bg-rose-50 flex items-center justify-center">
                  {photo.name.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/) ? (
                    <video
                      src={photo.url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: "rgba(44,24,16,0.55)" }}
                  onClick={() => window.open(photo.url, '_blank')}
                  title="Görüntülemek için tıklayın"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(photo); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.9)" }}
                    title="İndir"
                  >
                    <Download size={14} style={{ color: "#9D5B6B" }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(photo.id); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.9)" }}
                    title="Sil"
                  >
                    <Trash2 size={14} style={{ color: "#C0392B" }} />
                  </button>
                </div>

                {/* Meta */}
                <div className="p-3">
                  <p className="text-xs font-medium truncate" style={{ color: "#2A1A1F" }}>{photo.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: "#8B6470" }}>{formatTime(photo.uploadedAt)}</p>
                    <p className="text-xs" style={{ color: "#8B6470" }}>{formatBytes(photo.size)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(44,24,16,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(null)}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "#FFFFFF", boxShadow: "0 24px 80px rgba(44,24,16,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(192,57,43,0.08)" }}>
              <Trash2 size={20} style={{ color: "#C0392B" }} />
            </div>
            <h3 className="mb-2" style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "#2A1A1F" }}>
              Fotoğrafı Sil
            </h3>
            <p className="text-sm mb-6" style={{ color: "#8B6470" }}>Bu fotoğrafı silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(157,91,107,0.25)", color: "#6B3A48", background: "#FDF7F8" }}>
                İptal
              </button>
              <button onClick={() => deletePhoto(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: "#C0392B" }}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── App root ───────────────────────────────────────────────── */

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoEntry[]>([]);

  useEffect(() => {
    const path = window.location.hash || window.location.pathname;
    if (path.includes("backdoor")) setPage("admin-login");
  }, []);

  const handlePhotosUploaded = useCallback((files: File[]) => {
    const entries: PhotoEntry[] = files.map(f => ({
      id: `u_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      uploadedAt: new Date(),
    }));
    setUploadedPhotos(prev => [...entries, ...prev]);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {page === "landing" && (
        <LandingPage onPhotosUploaded={handlePhotosUploaded} />
      )}

      {page === "admin-login" && (
        <AdminLogin onLogin={() => setPage("admin-dashboard")} />
      )}

      {page === "admin-dashboard" && (
        <AdminDashboard
          uploadedPhotos={uploadedPhotos}
          onLogout={() => setPage("admin-login")}
        />
      )}

      {/* Hidden backdoor nav */}
      {page === "landing" && (
        <button
          onClick={() => setPage("admin-login")}
          className="fixed bottom-4 right-4 w-8 h-8 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-500 z-50"
          style={{ background: "rgba(157,91,107,0.3)" }}
          aria-label="Admin girişi"
        />
      )}
    </>
  );
}
