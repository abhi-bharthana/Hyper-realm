"use client";

import { useState } from "react";
import { X, Link2, Copy, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
  apiBase: string;
  isLight: boolean;
}

export function ShareModal({ isOpen, onClose, file, apiBase, isLight }: ShareModalProps) {
  const [duration, setDuration] = useState("60"); // default 1 hour (in mins)
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setCopied(false);
      const res = await axios.post(`${apiBase}/asset/share`, {
        object_key: file.object_name,
        expires_in_mins: parseInt(duration, 10)
      });
      setGeneratedLink(res.data.share_url);
    } catch (err) {
      console.error("Token generation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-md border p-6 rounded-[2.5rem] flex flex-col gap-5 shadow-2xl relative ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
      }`}>
        
        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h4 className="text-xs font-black uppercase tracking-wider italic flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-primary" /> Secure Token Link Forge
          </h4>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-hidden">
          <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Inspected Target Shard:</p>
          <h3 className="font-bold text-xs truncate uppercase mt-0.5">{file.file_name}</h3>
        </div>

        {/* Expiration Config Selector */}
        {!generatedLink && (
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Select Token Expiry Lease Window:
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full p-3 border rounded-xl font-mono text-xs focus:outline-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/40 border-white/5 text-white'
              }`}
            >
              <option value="15">15 Minutes (Ultra Secure)</option>
              <option value="60">1 Hour (Standard Standard)</option>
              <option value="1440">1 Day (24 Hours Duration)</option>
              <option value="10080">7 Days (Maximum Lease Boundary)</option>
            </select>

            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 disabled:opacity-40"
            >
              {loading ? "Forging Signed Signature..." : "Generate Sharing Token"}
            </button>
          </div>
        )}

        {/* Generated Public Link Content Block */}
        {generatedLink && (
          <div className="flex flex-col gap-3 animate-slide-up">
            <p className="text-[9px] font-mono uppercase text-emerald-400 tracking-wider font-bold">
              ✔ Secure Crypto-Signed Matrix Token Generated:
            </p>
            
            <div className={`flex items-center gap-2 p-3 border rounded-xl overflow-hidden ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
            }`}>
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="bg-transparent font-mono text-[10px] w-full focus:outline-none text-zinc-400 select-all truncate"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/5 rounded-xl transition text-primary"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => { setGeneratedLink(""); setCopied(false); }}
              className="text-[9px] font-mono text-center uppercase tracking-widest underline opacity-40 hover:opacity-100 mt-1"
            >
              Configure Another Lease
            </button>
          </div>
        )}
      </div>
    </div>
  );
}