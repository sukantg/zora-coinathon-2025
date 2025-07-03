"use client";

import { useState, useRef } from "react";

export default function MemeHome() {
  const [tab, setTab] = useState<"upload" | "generate">("generate");
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Meme Prompt Builder state
  const [memeSubject, setMemeSubject] = useState("");
  const [memeStyle, setMemeStyle] = useState("Classic");
  const [memeVibe, setMemeVibe] = useState("Funny");
  const [extraDetails, setExtraDetails] = useState("");

  // Compose the advanced prompt
  const advancedPrompt = `A ${memeVibe.toLowerCase()} ${memeStyle.toLowerCase()} meme about ${memeSubject || "[subject]"}${extraDetails ? ", " + extraDetails : ""}`;

  // Placeholder: handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Placeholder: handle AI image generation
  const handleGenerateImage = async () => {
    setAiLoading(true);
    setStatus("Generating image with AI...");
    setImage(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: advancedPrompt }),
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setImage(data.imageUrl);
        setStatus(null);
      } else if (data.error) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus("Failed to generate image. Try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error generating image. Try again.");
    }
    setAiLoading(false);
  };

  // Placeholder: handle AI caption generation
  const handleGenerateCaption = async () => {
    setCaptionLoading(true);
    setStatus("Generating caption with GPT-4...");
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: advancedPrompt }),
      });
      const data = await res.json();
      if (res.ok && data.caption) {
        setCaption(data.caption);
        setStatus(null);
      } else if (data.error) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus("Failed to generate caption. Try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error generating caption. Try again.");
    }
    setCaptionLoading(false);
  };

  // Placeholder: handle minting
  const handleMint = async () => {
    setStatus("Minting meme as Zora Coin...");
    // TODO: Call your minting API here
    setTimeout(() => {
      setStatus("Meme minted successfully! 🎉");
    }, 2000);
  };

  // Placeholder: handle Farcaster cast
  const handleCast = async () => {
    setStatus("Casting to Farcaster...");
    // TODO: Call your Farcaster API here
    setTimeout(() => {
      setStatus("Cast sent! 🚀");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] flex flex-col items-center py-8 px-2">
      {/* App Title */}
      <div className="w-full flex justify-center mb-8">
        <span
          className="text-5xl md:text-7xl font-extrabold tracking-tight select-none drop-shadow-2xl"
          style={{
            background: 'linear-gradient(90deg, #38b48e 0%, #a7d7c5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Geist, Inter, Montserrat, Arial, sans-serif',
            letterSpacing: '0.08em',
            textShadow: '0 4px 32px #38b48e55, 0 1px 0 #fff',
          }}
        >
          Memetic Protocol
        </span>
      </div>
      {/* Hero Section */}
      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight text-[var(--app-accent)] drop-shadow">Create & Mint Your Meme</h1>
        <p className="text-lg md:text-xl text-[var(--app-foreground-muted)] mb-4">Upload an image or let AI generate one. Caption it. Mint it. Share it.</p>
      </div>

      {/* Main Meme Creation Card */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-3xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center transition-all duration-300">
        {/* Tabs */}
        <div className="flex mb-8 w-full gap-2">
          <button
            className={`flex-1 py-3 rounded-l-full font-semibold transition-colors text-lg shadow-sm ${tab === "generate" ? "bg-[var(--app-accent)] text-white" : "bg-[var(--app-gray-dark)] text-[var(--app-foreground-muted)]"}`}
            onClick={() => setTab("generate")}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            Generate with AI
          </button>
          <button
            className={`flex-1 py-3 rounded-r-full font-semibold transition-colors text-lg shadow-sm ${tab === "upload" ? "bg-[var(--app-accent)] text-white" : "bg-[var(--app-gray-dark)] text-[var(--app-foreground-muted)]"}`}
            onClick={() => setTab("upload")}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            Upload Image
          </button>
        </div>

        {/* Image Preview */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative w-72 h-72 bg-[var(--app-gray-dark)] rounded-3xl flex items-center justify-center overflow-hidden border border-[var(--app-card-border)] shadow-inner">
            {image ? (
              <>
                {/* Meme image with caption overlay */}
                <img src={image} alt="Meme preview" className="object-contain w-full h-full" />
                {caption && (
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--app-accent)]/80 text-white text-xl font-extrabold rounded-full shadow text-center w-11/12 break-words" style={{textShadow: "2px 2px 0 #237a5e"}}>
                    {caption}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[var(--app-foreground-muted)]">No image selected</span>
            )}
          </div>
        </div>

        {/* Upload or Generate Controls */}
        {tab === "upload" ? (
          <div className="w-full flex flex-col items-center mb-8 gap-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              className="bg-[var(--app-accent)] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[var(--app-accent-hover)] transition text-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </button>
            <span className="text-xs text-[var(--app-foreground-muted)]">PNG, JPG, GIF supported</span>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center mb-8 gap-3">
            {/* Advanced Meme Generator Prompt Builder */}
            <div className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-2xl shadow p-5 mb-2">
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-[var(--app-foreground)]">Meme Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base text-black"
                  placeholder="e.g. cat on a skateboard"
                  value={memeSubject}
                  onChange={e => setMemeSubject(e.target.value)}
                  disabled={aiLoading}
                />
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-[var(--app-foreground)]">Style</label>
                  <select
                    className="w-full px-4 py-2 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base text-black"
                    value={memeStyle}
                    onChange={e => setMemeStyle(e.target.value)}
                    disabled={aiLoading}
                  >
                    <option>Classic</option>
                    <option>Surreal</option>
                    <option>Dank</option>
                    <option>Wholesome</option>
                    <option>Minimal</option>
                    <option>Retro</option>
                    <option>Pixel Art</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-[var(--app-foreground)]">Vibe</label>
                  <select
                    className="w-full px-4 py-2 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base text-black"
                    value={memeVibe}
                    onChange={e => setMemeVibe(e.target.value)}
                    disabled={aiLoading}
                  >
                    <option>Funny</option>
                    <option>Ironic</option>
                    <option>Motivational</option>
                    <option>Sarcastic</option>
                    <option>Absurd</option>
                    <option>Dark</option>
                    <option>Wholesome</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-[var(--app-foreground)]">Extra Details <span className="font-normal text-xs text-[var(--app-foreground-muted)]">(optional)</span></label>
                <textarea
                  className="w-full px-4 py-2 rounded-2xl border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base resize-none text-black"
                  placeholder="e.g. add sunglasses, vaporwave background"
                  value={extraDetails}
                  onChange={e => setExtraDetails(e.target.value)}
                  rows={2}
                  disabled={aiLoading}
                />
              </div>
              <div className="mt-4">
                <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Prompt Preview:</div>
                <div className="bg-[var(--app-gray)] rounded-xl px-4 py-2 text-sm text-[var(--app-foreground)] font-mono break-words border border-[var(--app-card-border)]">
                  {advancedPrompt}
                </div>
              </div>
            </div>
            <button
              className="bg-[var(--app-accent)] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[var(--app-accent-hover)] transition text-lg"
              onClick={handleGenerateImage}
              disabled={aiLoading || !memeSubject}
            >
              {aiLoading ? "Generating..." : "Generate Image"}
            </button>
          </div>
        )}

        {/* Caption Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="flex w-full gap-4">
            <input
              type="text"
              placeholder="Add a caption or let AI help..."
              className="flex-1 px-5 py-3 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-lg text-black"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              disabled={captionLoading}
            />
            <button
              className="bg-[var(--app-accent)] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[var(--app-accent-hover)] transition text-lg"
              onClick={handleGenerateCaption}
              disabled={captionLoading || !image}
            >
              {captionLoading ? "..." : "AI Caption"}
            </button>
          </div>
        </div>

        {/* Mint & Share Buttons */}
        <div className="w-full flex gap-6 mb-2 mt-2">
          <button
            className="flex-1 bg-gradient-to-r from-green-400 to-[var(--app-accent)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-green-500 hover:to-[var(--app-accent-hover)] transition text-lg"
            onClick={handleMint}
            disabled={!image || !caption}
          >
            Mint Meme
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-[var(--app-accent)] to-green-400 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:to-green-500 hover:from-[var(--app-accent-hover)] transition text-lg"
            onClick={handleCast}
            disabled={!image || !caption}
          >
            Cast to Farcaster
          </button>
        </div>

        {/* Status/Feedback */}
        {status && (
          <div className="w-full text-center text-base text-[var(--app-accent)] mt-3 animate-fade-in">{status}</div>
        )}
      </div>

      {/* Gallery Teaser */}
      <div className="mt-10 text-center">
        <a
          href="/gallery"
          className="inline-block text-[var(--app-accent)] font-semibold hover:underline text-xl rounded-full px-6 py-2 bg-[var(--app-accent-light)] shadow-sm transition-all"
        >
          See what others are minting →
        </a>
      </div>
    </div>
  );
}
