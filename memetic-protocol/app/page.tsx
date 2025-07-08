"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useAccount, useConnect, useDisconnect, useWalletClient, usePublicClient } from 'wagmi';
import { baseSepolia, base } from "viem/chains";
import { createCoin, DeployCurrency } from "@zoralabs/coins-sdk";

export default function MemeHome() {
  const [tab, setTab] = useState<"upload" | "generate">("upload");
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Meme Prompt Builder state
  const [memeSubject, setMemeSubject] = useState("");
  const [memeStyle, setMemeStyle] = useState("Classic");
  const [memeVibe, setMemeVibe] = useState("Funny");
  const [extraDetails, setExtraDetails] = useState("");

  // Caption customization state
  const [captionFont, setCaptionFont] = useState("Garamond, serif");
  const [captionFontSize, setCaptionFontSize] = useState(32);
  const [captionPos, setCaptionPos] = useState({ x: 50, y: 85 }); // percent, default bottom center
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Add new state for caption color, background, bold, italic
  const [captionColor, setCaptionColor] = useState('#ffffff');
  const [captionBgColor, setCaptionBgColor] = useState('rgba(0,0,0,0)');
  const [captionBold, setCaptionBold] = useState(false);
  const [captionItalic, setCaptionItalic] = useState(false);

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
  // const handleMint = async () => { ... }

  // Handle drag events for caption
  const handleCaptionMouseDown = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (!image) return;
    setDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !image) return;
    const container = document.getElementById("meme-image-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setCaptionPos({ x, y });
  };
  const handleMouseUp = () => setDragging(false);
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  // Add at the top:
  const [showCoinForm, setShowCoinForm] = useState(false);
  const [coinName, setCoinName] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [mintStatus, setMintStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [coinAddress, setCoinAddress] = useState("");
  const [mintChain, setMintChain] = useState<'base-sepolia' | 'base' | null>(null);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const publicClientBaseSepolia = usePublicClient({ chainId: baseSepolia.id });
  const publicClientBase = usePublicClient({ chainId: base.id });

  const [imageLoaded, setImageLoaded] = useState(false);

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
        <div className="flex mb-8 w-full">
          <button
            className={`flex-1 py-3 rounded-l-full font-semibold transition-colors text-lg shadow-sm ${tab === "upload" ? "bg-[var(--app-accent)] text-white" : "bg-[var(--app-gray-dark)] text-[var(--app-foreground-muted)]"}`}
            onClick={() => setTab("upload")}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: 0 }}
          >
            Upload Image
          </button>
          <button
            className={`flex-1 py-3 rounded-r-full font-semibold transition-colors text-lg shadow-sm ${tab === "generate" ? "bg-[var(--app-accent)] text-white" : "bg-[var(--app-gray-dark)] text-[var(--app-foreground-muted)]"}`}
            onClick={() => setTab("generate")}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: 0 }}
          >
            Generate with AI
          </button>
        </div>

        {/* Image Preview */}
        <div className="w-full flex flex-col items-center mb-8">
          <div
            id="meme-image-container"
            className={`relative w-[36rem] h-[36rem] bg-black rounded-3xl flex items-center justify-center overflow-hidden border border-[var(--app-card-border)] shadow-inner select-none ${tab === "upload" ? "cursor-pointer hover:opacity-90" : ""}`}
            onClick={() => {
              if (tab === "upload") fileInputRef.current?.click();
            }}
          >
            {image ? (
              <>
                {/* Removed cross (remove image) and download button as requested */}
                {/* Only show the image and caption in the frame */}
                <img src={image} alt="Meme preview" className="object-contain w-full h-full" draggable={false} onLoad={() => setImageLoaded(true)} onError={() => setImageLoaded(false)} />
                {caption && (
                  <span
                    style={{
                      position: "absolute",
                      left: `${captionPos.x}%`,
                      top: `${captionPos.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "90%",
                      fontFamily: captionFont,
                      fontSize: `${captionFontSize}px`,
                      textShadow: "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000",
                      color: captionColor,
                      background: captionBgColor,
                      fontWeight: captionBold ? 'bold' : 'normal',
                      fontStyle: captionItalic ? 'italic' : 'normal',
                      padding: "0.1em 0.2em",
                      cursor: image ? "grab" : "default",
                      userSelect: "none",
                      zIndex: 10,
                      whiteSpace: "pre-line",
                      textAlign: "center",
                    }}
                    onMouseDown={handleCaptionMouseDown}
                  >
                    {caption}
                  </span>
                )}
              </>
            ) : (
              tab === "upload" ? (
                <span className="flex flex-col items-center text-center px-4">
                  <span className="text-[var(--app-foreground-muted)] text-lg font-semibold">Click here to upload an image</span>
                  <span className="text-xs text-[var(--app-foreground-muted)] mt-1">PNG, JPG, GIF supported</span>
                </span>
              ) : (
                <span className="text-[var(--app-foreground-muted)] text-lg font-semibold text-center px-4">No image generated yet</span>
              )
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
            {/* Caption input, AI Caption button, and font/size controls for uploaded images */}
            <div className="w-full flex gap-4 mb-8 mt-4">
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
            <div className="w-full flex flex-row gap-10 mb-6 items-center relative">
              <div className="flex-1 flex flex-col items-center">
                <label className="block text-xs font-semibold mb-2 text-[var(--app-foreground-muted)] text-center">Font</label>
                <select
                  className="w-full px-3 py-2 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base text-black h-12"
                  value={captionFont}
                  onChange={e => setCaptionFont(e.target.value)}
                >
                  <option value="Impact, Arial, sans-serif">Impact</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Comic Sans MS, Comic Sans, cursive">Comic Sans</option>
                  <option value="Montserrat, Arial, sans-serif">Montserrat</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                  <option value="Courier New, Courier, monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Verdana, Geneva, sans-serif">Verdana</option>
                  <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                  <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                  <option value="Lucida Console, Monaco, monospace">Lucida Console</option>
                  <option value="Garamond, serif">Garamond</option>
                  <option value="Palatino Linotype, Book Antiqua, Palatino, serif">Palatino</option>
                  <option value="Brush Script MT, cursive">Brush Script</option>
                  <option value="Futura, Arial, sans-serif">Futura</option>
                  <option value="Franklin Gothic Medium, Arial Narrow, Arial, sans-serif">Franklin Gothic</option>
                  <option value="Copperplate, Papyrus, fantasy">Copperplate</option>
                  <option value="Gill Sans, Gill Sans MT, Calibri, sans-serif">Gill Sans</option>
                  <option value="Rockwell, Courier Bold, Courier, Georgia, Times, Times New Roman, serif">Rockwell</option>
                  <option value="Baskerville, Baskerville Old Face, Hoefler Text, Garamond, Times New Roman, serif">Baskerville</option>
                  <option value="Century Gothic, CenturyGothic, AppleGothic, sans-serif">Century Gothic</option>
                  <option value="Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif">Candara</option>
                  <option value="Optima, Segoe, Segoe UI, Candara, Calibri, Arial, sans-serif">Optima</option>
                  <option value="Didot, Didot LT STD, Hoefler Text, Garamond, Times New Roman, serif">Didot</option>
                  <option value="Geneva, Tahoma, Verdana, sans-serif">Geneva</option>
                </select>
                <div className="flex flex-row gap-4 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Text Color</label>
                    <input type="color" value={captionColor} onChange={e => setCaptionColor(e.target.value)} className="w-7 h-7 rounded-full border border-[var(--app-card-border)] shadow" />
                  </div>
                  <div className="flex flex-col items-center min-w-[70px]">
                    <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Background</label>
                    <input type="color" value={captionBgColor} onChange={e => setCaptionBgColor(e.target.value)} className="w-7 h-7 rounded-full border border-[var(--app-card-border)] shadow" />
                  </div>
                </div>
              </div>
              {/* Divider for large screens */}
              <div className="hidden md:block h-12 w-px bg-[var(--app-card-border)] mx-2"></div>
              <div className="flex-1 flex flex-col items-center">
                <label className="block text-xs font-semibold mb-2 text-[var(--app-foreground-muted)] text-center">Text Size</label>
                <input
                  type="range"
                  min={16}
                  max={64}
                  value={captionFontSize}
                  onChange={e => setCaptionFontSize(Number(e.target.value))}
                  className="w-full h-2 accent-[var(--app-accent)]"
                />
                <div className="text-xs text-[var(--app-foreground-muted)] text-center mt-2">{captionFontSize}px</div>
                <div className="flex flex-col items-center min-w-[90px] mt-4">
                  <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Style</label>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border text-lg transition ${captionBold ? 'bg-[var(--app-accent)] text-white' : 'bg-white text-black'}`} onClick={() => setCaptionBold(v => !v)} aria-label="Bold">B</button>
                    <button type="button" className={`w-8 h-8 flex items-center justify-center rounded-full italic border text-lg transition ${captionItalic ? 'bg-[var(--app-accent)] text-white' : 'bg-white text-black'}`} onClick={() => setCaptionItalic(v => !v)} aria-label="Italic">I</button>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="bg-[var(--app-gray)] rounded-xl px-4 py-2 text-sm text-[var(--app-foreground)] font-mono break-words border border-[var(--app-card-border)] mb-4">
                  {advancedPrompt}
                </div>
                <button
                  className="bg-[var(--app-accent)] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[var(--app-accent-hover)] transition text-lg w-full mb-2"
                  onClick={handleGenerateImage}
                  disabled={aiLoading || !memeSubject}
                >
                  {aiLoading ? "Generating..." : "Generate Image"}
                </button>
              </div>
            </div>
            <div className="w-full flex gap-4 mb-8">
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
            <div className="w-full flex flex-row gap-10 mb-6 items-center relative">
              <div className="flex-1 flex flex-col items-center">
                <label className="block text-xs font-semibold mb-2 text-[var(--app-foreground-muted)] text-center">Font</label>
                <select
                  className="w-full px-3 py-2 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-base text-black h-12"
                  value={captionFont}
                  onChange={e => setCaptionFont(e.target.value)}
                >
                  <option value="Impact, Arial, sans-serif">Impact</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Comic Sans MS, Comic Sans, cursive">Comic Sans</option>
                  <option value="Montserrat, Arial, sans-serif">Montserrat</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                  <option value="Courier New, Courier, monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Verdana, Geneva, sans-serif">Verdana</option>
                  <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                  <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                  <option value="Lucida Console, Monaco, monospace">Lucida Console</option>
                  <option value="Garamond, serif">Garamond</option>
                  <option value="Palatino Linotype, Book Antiqua, Palatino, serif">Palatino</option>
                  <option value="Brush Script MT, cursive">Brush Script</option>
                  <option value="Futura, Arial, sans-serif">Futura</option>
                  <option value="Franklin Gothic Medium, Arial Narrow, Arial, sans-serif">Franklin Gothic</option>
                  <option value="Copperplate, Papyrus, fantasy">Copperplate</option>
                  <option value="Gill Sans, Gill Sans MT, Calibri, sans-serif">Gill Sans</option>
                  <option value="Rockwell, Courier Bold, Courier, Georgia, Times, Times New Roman, serif">Rockwell</option>
                  <option value="Baskerville, Baskerville Old Face, Hoefler Text, Garamond, Times New Roman, serif">Baskerville</option>
                  <option value="Century Gothic, CenturyGothic, AppleGothic, sans-serif">Century Gothic</option>
                  <option value="Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif">Candara</option>
                  <option value="Optima, Segoe, Segoe UI, Candara, Calibri, Arial, sans-serif">Optima</option>
                  <option value="Didot, Didot LT STD, Hoefler Text, Garamond, Times New Roman, serif">Didot</option>
                  <option value="Geneva, Tahoma, Verdana, sans-serif">Geneva</option>
                </select>
                <div className="flex flex-row gap-4 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Text Color</label>
                    <input type="color" value={captionColor} onChange={e => setCaptionColor(e.target.value)} className="w-7 h-7 rounded-full border border-[var(--app-card-border)] shadow" />
                  </div>
                  <div className="flex flex-col items-center min-w-[70px]">
                    <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Background</label>
                    <input type="color" value={captionBgColor} onChange={e => setCaptionBgColor(e.target.value)} className="w-7 h-7 rounded-full border border-[var(--app-card-border)] shadow" />
                  </div>
                </div>
              </div>
              {/* Divider for large screens */}
              <div className="hidden md:block h-12 w-px bg-[var(--app-card-border)] mx-2"></div>
              <div className="flex-1 flex flex-col items-center">
                <label className="block text-xs font-semibold mb-2 text-[var(--app-foreground-muted)] text-center">Text Size</label>
                <input
                  type="range"
                  min={16}
                  max={64}
                  value={captionFontSize}
                  onChange={e => setCaptionFontSize(Number(e.target.value))}
                  className="w-full h-2 accent-[var(--app-accent)]"
                />
                <div className="text-xs text-[var(--app-foreground-muted)] text-center mt-2">{captionFontSize}px</div>
                <div className="flex flex-col items-center min-w-[90px] mt-4">
                  <label className="block text-xs font-semibold mb-1 text-[var(--app-foreground-muted)] text-center">Style</label>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border text-lg transition ${captionBold ? 'bg-[var(--app-accent)] text-white' : 'bg-white text-black'}`} onClick={() => setCaptionBold(v => !v)} aria-label="Bold">B</button>
                    <button type="button" className={`w-8 h-8 flex items-center justify-center rounded-full italic border text-lg transition ${captionItalic ? 'bg-[var(--app-accent)] text-white' : 'bg-white text-black'}`} onClick={() => setCaptionItalic(v => !v)} aria-label="Italic">I</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mint & Share Buttons */}
        {tab === "upload" && (
          <div className="w-full flex gap-6 mb-2 mt-2">
            <button
              className="flex-1 bg-gradient-to-r from-green-400 to-[var(--app-accent)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-green-500 hover:to-[var(--app-accent-hover)] transition text-lg"
              onClick={() => setShowCoinForm(true)}
              disabled={!image}
            >
              Mint Meme
            </button>
          </div>
        )}

        {/* Status/Feedback */}
        {status && (
          <div className="w-full text-center text-base flex items-center justify-center gap-2 mt-3 animate-fade-in">
            {(status.includes('Generating') || status.includes('AI')) && (
              <span className="inline-block w-5 h-5 align-middle">
                <svg className="animate-spin text-[var(--app-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </span>
            )}
            <span className="text-[var(--app-accent)] font-semibold animate-pulse">{status}</span>
          </div>
        )}

        {showCoinForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-xl w-full relative text-black">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowCoinForm(false)}
                disabled={mintStatus === "Minting..."}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
                Mint Meme Coin
                <button
                  className="ml-2 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 font-semibold transition"
                  title="Clear All"
                  onClick={() => {
                    setImage(null);
                    setCaption("");
                    setCoinName("");
                    setCoinSymbol("");
                    setTxHash("");
                    setCoinAddress("");
                    setMintStatus("");
                    setMintChain(null);
                  }}
                >
                  Clear
                </button>
              </h2>
              {/* Meme Preview */}
              <div className="mb-4 flex flex-col items-center">
                {image && (
                  <div className="relative w-48 h-48 mb-2 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img src={image} alt="Meme preview" className="object-contain w-full h-full" />
                    {caption && (
                      <span
                        style={{
                          position: "absolute",
                          left: `${captionPos.x}%`,
                          top: `${captionPos.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: "90%",
                          fontFamily: captionFont,
                          fontSize: `${captionFontSize}px`,
                          textShadow: "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000",
                          color: captionColor,
                          background: captionBgColor,
                          fontWeight: captionBold ? 'bold' : 'normal',
                          fontStyle: captionItalic ? 'italic' : 'normal',
                          padding: "0.1em 0.2em",
                          cursor: image ? "grab" : "default",
                          userSelect: "none",
                          zIndex: 10,
                          whiteSpace: "pre-line",
                          textAlign: "center",
                        }}
                      >
                        {caption}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <input
                className="mb-2 px-5 py-3 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-lg text-black w-full"
                placeholder="Coin Name"
                value={coinName}
                onChange={e => setCoinName(e.target.value)}
                disabled={mintStatus === "Minting..."}
              />
              <input
                className="mb-2 px-5 py-3 rounded-full border border-[var(--app-card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-lg text-black w-full"
                placeholder="Coin Symbol"
                value={coinSymbol}
                onChange={e => setCoinSymbol(e.target.value)}
                disabled={mintStatus === "Minting..."}
              />
              <div className="mb-2 text-sm text-black flex items-center justify-between w-full">
                {isConnected && address && (
                  <div className="flex items-center w-full">
                    <span
                      className="font-mono bg-gray-100 rounded px-3 py-1 text-base font-semibold max-w-[60%] truncate cursor-pointer"
                      title={address}
                    >
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <button
                      className="ml-3 underline text-[var(--app-accent)] font-semibold px-2 py-1 rounded hover:bg-[var(--app-accent-light)] transition"
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
              {!isConnected ? (
                <button
                  className="w-full bg-gradient-to-r from-green-400 to-[var(--app-accent)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-green-500 hover:to-[var(--app-accent-hover)] transition text-lg mb-4"
                  onClick={() => connect({ connector: connectors[0] })}
                  disabled={isPending}
                >
                  {isPending ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : null}
              {/* Mint Buttons for Both Chains */}
              <div className="flex gap-4 mb-4">
                <button
                  className="flex-1 bg-gradient-to-r from-green-400 to-[var(--app-accent)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-green-500 hover:to-[var(--app-accent-hover)] transition text-lg disabled:opacity-60"
                  onClick={async () => {
                    setMintChain('base-sepolia');
                    if (!isConnected || !address) {
                      setMintStatus('Please connect your wallet.');
                      return;
                    }
                    if (!publicClientBaseSepolia) {
                      setMintStatus('Public client not available.');
                      return;
                    }
                    if (!walletClient) {
                      setMintStatus('Wallet client not available.');
                      return;
                    }
                    if (!imageLoaded) {
                      setMintStatus('Image not fully loaded.');
                      return;
                    }
                    setMintStatus("Uploading meme and metadata...");
                    try {
                      const memeNode = document.getElementById("meme-image-container");
                      if (!memeNode) throw new Error("Meme image container not found");
                      const canvas = await html2canvas(memeNode, { backgroundColor: null, useCORS: true });
                      const memeImage = canvas.toDataURL("image/png");
                      // 1. Upload metadata and get parameters
                      const res = await fetch("/api/upload-metadata", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          coinName,
                          coinSymbol,
                          memeImage, // composited meme
                          userAddress: address,
                        }),
                      });
                      const { createMetadataParameters, error } = await res.json();
                      if (!res.ok || error) {
                        setMintStatus("Error: " + (error || "Failed to upload metadata"));
                        return;
                      }
                      // 2. Mint using wallet
                      setMintStatus("Minting coin on Zora...");
                      const coinParams = {
                        ...createMetadataParameters,
                        payoutRecipient: address,
                        currency: DeployCurrency.ZORA,
                      };
                      const result = await createCoin(coinParams, walletClient!, publicClientBaseSepolia!);
                      setTxHash(result.hash ?? '');
                      setCoinAddress(result.address ?? '');
                      setMintStatus("Coin minted successfully!");
                    } catch (err) {
                      setMintStatus("Error: " + (err && typeof err === "object" && "message" in err ? err.message : String(err)));
                    }
                  }}
                  disabled={!coinName || !coinSymbol || mintStatus === "Minting..." || !isConnected || !imageLoaded}
                >
                  {mintStatus === "Minting..." && mintChain === 'base-sepolia' ? "Minting..." : "Mint (Base Sepolia)"}
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-lg disabled:opacity-60"
                  onClick={async () => {
                    setMintChain('base');
                    if (!isConnected || !address) {
                      setMintStatus('Please connect your wallet.');
                      return;
                    }
                    if (!walletClient) {
                      setMintStatus('Wallet client not available.');
                      return;
                    }
                    if (!publicClientBase) {
                      setMintStatus('Public client not available.');
                      return;
                    }
                    if (!imageLoaded) {
                      setMintStatus('Image not fully loaded.');
                      return;
                    }
                    setMintStatus("Uploading meme and metadata...");
                    try {
                      const memeNode = document.getElementById("meme-image-container");
                      if (!memeNode) throw new Error("Meme image container not found");
                      const canvas = await html2canvas(memeNode, { backgroundColor: null, useCORS: true });
                      const memeImage = canvas.toDataURL("image/png");
                      // 1. Upload metadata and get parameters
                      const res = await fetch("/api/upload-metadata", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          coinName,
                          coinSymbol,
                          memeImage, // composited meme
                          userAddress: address,
                        }),
                      });
                      const { createMetadataParameters, error } = await res.json();
                      if (!res.ok || error) {
                        setMintStatus("Error: " + (error || "Failed to upload metadata"));
                        return;
                      }
                      setMintStatus("Minting coin on Zora (Base)...");
                      // Use Base mainnet
                      const coinParams = {
                        ...createMetadataParameters,
                        payoutRecipient: address,
                        currency: DeployCurrency.ZORA,
                      };
                      const result = await createCoin(coinParams, walletClient!, publicClientBase!);
                      setTxHash(result.hash ?? '');
                      setCoinAddress(result.address ?? '');
                      setMintStatus("Coin minted successfully!");
                    } catch (err) {
                      setMintStatus("Error: " + (err && typeof err === "object" && "message" in err ? err.message : String(err)));
                    }
                  }}
                  disabled={!coinName || !coinSymbol || mintStatus === "Minting..." || !isConnected || !imageLoaded}
                >
                  {mintStatus === "Minting..." && mintChain === 'base' ? "Minting..." : "Mint (Base)"}
                </button>
              </div>
              {/* Minting Status & Results */}
              {mintStatus && !txHash && (
                <div className="mt-2 text-center text-base flex items-center justify-center gap-2">
                  {/* Show animated spinner/dots for progress statuses */}
                  {(mintStatus.includes('Uploading') || mintStatus.includes('Minting') || mintStatus.includes('Generating')) && (
                    <span className="inline-block w-5 h-5 align-middle">
                      <svg className="animate-spin text-[var(--app-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    </span>
                  )}
                  <span className="text-[var(--app-accent)] font-semibold animate-pulse">{mintStatus}</span>
                </div>
              )}
              {txHash && (
                <div className="mt-4 text-center text-black">
                  <div className="text-2xl font-extrabold text-green-600 mb-3">Coin minted successfully!</div>
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="text-lg font-semibold">Coin Address Link:</div>
                    {mintChain === 'base-sepolia' ? (
                      <a href={`https://sepolia.basescan.org/address/${coinAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg break-all">{coinAddress}</a>
                    ) : (
                      <a href={`https://basescan.org/address/${coinAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg break-all">{coinAddress}</a>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="text-lg font-semibold">Coin Address:</div>
                    <span className="font-mono text-base break-all bg-gray-100 rounded px-2 py-1">{coinAddress}</span>
                  </div>
                  <div className="mt-2 flex flex-col gap-3">
                    {mintChain === 'base-sepolia' ? (
                      <a href={`https://testnet.zora.co/coin/bsep:${coinAddress}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-green-400 to-[var(--app-accent)] text-white px-4 py-3 rounded-full font-semibold shadow hover:from-green-500 hover:to-[var(--app-accent-hover)] transition text-center text-lg">View on Zora</a>
                    ) : (
                      <a href={`https://zora.co/coin/base:${coinAddress}?referrer=${address}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-full font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition text-center text-lg">View on Zora</a>
                    )}
                    {mintChain === 'base-sepolia' ? (
                      <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-200 px-4 py-3 rounded-full font-semibold text-black hover:bg-gray-300 transition text-lg">View on BaseScan</a>
                    ) : (
                      <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-200 px-4 py-3 rounded-full font-semibold text-black hover:bg-gray-300 transition text-lg">View on BaseScan</a>
                    )}
                    <button className="w-full bg-gray-200 px-4 py-3 rounded-full font-semibold text-black hover:bg-gray-300 transition text-lg" onClick={() => {navigator.clipboard.writeText(coinAddress);}}>Copy Coin Address</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
