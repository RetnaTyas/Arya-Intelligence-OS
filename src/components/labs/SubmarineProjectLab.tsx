import React, { useState } from 'react';
import { Compass, CheckCircle2, ShieldAlert, ArrowDown, Droplets, Gauge, Sparkles, Activity } from 'lucide-react';
import { useSpringValue, playSplash, playChime, playTick } from '../../engine/labMotionFX';
import { WaterSurfaceFX } from './WaterSurfaceFX';

interface SubmarineProjectLabProps {
  onStealthResolved: () => void;
}

export const SubmarineProjectLab: React.FC<SubmarineProjectLabProps> = ({ onStealthResolved }) => {
  // Mission target parameters
  const targetDepth = 100; // meters
  const dryHullWeight = 1500; // kN
  const targetBuoyantForce = 2400; // kN for neutral hover at 100m
  // Required ballast water weight = 2400 - 1500 = 900 kN
  // Sea density factor = 1.5 kN per m3
  // Equation: 1500 + 1.5 * x = 2400 => 1.5x = 900 => x = 600 m3
  const [ballastWaterVolume, setBallastWaterVolume] = useState<number>(400); // user slider / input
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const [diveCompleted, setDiveCompleted] = useState<boolean>(false);

  const seaDensity = 1.5; // kN / m3
  const ballastWeight = ballastWaterVolume * seaDensity;
  const currentTotalWeight = dryHullWeight + ballastWeight;
  const netBuoyantDiff = targetBuoyantForce - currentTotalWeight; // 0 = perfectly neutral

  const isNeutral = Math.abs(netBuoyantDiff) < 15;
  const isTooHeavy = netBuoyantDiff < -15;
  const isTooLight = netBuoyantDiff > 15;

  // Calculated depth reached
  const calculatedDepth = isNeutral
    ? targetDepth
    : isTooHeavy
    ? Math.min(200, targetDepth + Math.abs(netBuoyantDiff) * 0.15)
    : Math.max(0, targetDepth - netBuoyantDiff * 0.15);

  const [splashTrigger, setSplashTrigger] = useState<number>(0);
  const targetSubmarineTop = Math.min(85, Math.max(10, (calculatedDepth / 200) * 80 + 10));

  const { value: submarineTop, kick: kickSub } = useSpringValue(targetSubmarineTop, {
    stiffness: 45,
    damping: 9,
  });

  const triggerSplash = () => {
    setSplashTrigger((n) => n + 1);
    kickSub(isTooHeavy ? 15 : isTooLight ? -15 : 6);
    playSplash();
  };

  const handleTestDive = () => {
    setIsDiving(true);
    triggerSplash();
    setTimeout(() => {
      setIsDiving(false);
      playChime(isNeutral);
      if (isNeutral) {
        setDiveCompleted(true);
        onStealthResolved();
      }
    }, 900);
  };

  return (
    <div id="submarine-project-lab-container" className="space-y-6">
      {/* Top Banner: Stealth Remediation Mission Context */}
      <div className="bg-slate-900/90 border border-teal-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Proyek Rekayasa Lapangan
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Stealth Insertion Mode
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide mt-1">
            Misi Kapal Selam Nautica: Kontrol Kerapatan Tangki Ballast
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Tantangan: Seimbangkan gaya apung dengan massa total kapal selam agar mampu melayang netral (hovering) di kedalaman <strong className="text-teal-300 font-mono">100 meter</strong>.
          </p>
        </div>
        <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 font-mono">Kondisi Target:</div>
          <div className="text-xs font-bold text-teal-300 font-mono">W_total = 2,400 kN</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ocean Depth Canvas / Submarine Visualizer */}
        <div className="lg:col-span-7 bg-[#0b101c] border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Depth markings */}
          <div className="absolute left-3 top-4 bottom-4 w-12 border-r border-teal-900/60 flex flex-col justify-between text-[10px] font-mono text-teal-500/60 z-10">
            <span>0 m (Laut)</span>
            <span className="text-teal-400 font-bold border-y border-teal-500/40 bg-teal-950/60 px-1">100 m [TARGET]</span>
            <span>200 m (Palung)</span>
          </div>

          {/* Ocean Water Column with Depth Gradients */}
          <div className="relative flex-1 ml-14 my-2 border border-slate-800/80 rounded-lg overflow-hidden bg-gradient-to-b from-sky-950/40 via-teal-950/60 to-slate-950 flex items-center justify-center">
            {/* Real animated water surface waves at 0m */}
            <div className="absolute top-0 inset-x-0 h-14 pointer-events-none z-10 overflow-hidden">
              <WaterSurfaceFX
                levelPercent={100}
                splashTrigger={splashTrigger}
                colorFrom="#0369a1"
                colorTo="#38bdf8"
              />
            </div>

            {/* Target Depth Line Marker */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-b-2 border-dashed border-teal-400/50 flex justify-end pr-3 z-10">
              <span className="text-[10px] font-mono text-teal-300 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-500/40">
                Zona Netral 100m
              </span>
            </div>

            {/* Submarine Sprite with Mass-Spring-Damper Physics */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
              style={{
                top: `${submarineTop}%`,
              }}
            >
              <div className="relative">
                {/* Propeller Bubbles if moving */}
                {isDiving && (
                  <div className="absolute -left-6 top-4 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400/40 animate-ping delay-150" />
                  </div>
                )}

                {/* Submarine Body (SVG) */}
                <svg width="190" height="60" viewBox="0 0 190 60" className="drop-shadow-2xl">
                  {/* Conning tower */}
                  <rect x="75" y="5" width="35" height="22" rx="4" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
                  <line x1="88" y1="5" x2="88" y2="0" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="88" cy="0" r="2" fill="#5eead4" />

                  {/* Main Hull */}
                  <ellipse cx="95" cy="36" rx="80" ry="18" fill="#115e59" stroke="#14b8a6" strokeWidth="2" />

                  {/* Ballast Tank Indicator inside hull */}
                  <rect x="55" y="28" width="80" height="15" rx="3" fill="#042f2e" stroke="#2dd4bf" strokeDasharray="2 2" strokeWidth="1" />
                  {/* Water fill level */}
                  <rect
                    x="56"
                    y="29"
                    width={Math.min(78, (ballastWaterVolume / 800) * 78)}
                    height="13"
                    rx="2"
                    fill="#06b6d4"
                    fillOpacity="0.75"
                  />

                  {/* Observation Windows */}
                  <circle cx="145" cy="35" r="4" fill="#67e8f9" />
                  <circle cx="155" cy="35" r="3" fill="#67e8f9" />

                  {/* Propeller Tail */}
                  <polygon points="12,28 5,36 12,44" fill="#0f766e" stroke="#2dd4bf" />
                </svg>

                {/* Depth & Balance Readout Tag */}
                <div className="mt-1 text-center font-mono text-[10px] bg-slate-950/90 border border-teal-500/40 px-2 py-0.5 rounded shadow">
                  Kedalaman: <strong className="text-teal-300">{calculatedDepth.toFixed(0)} m</strong> · {isNeutral ? '🎯 Netral' : isTooHeavy ? '⚠️ Berat (Tenggelam)' : '⬆️ Ringan (Mengapung)'}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Submarine Telemetry Console */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Berat Kering Lambung:</span>
              <span className="text-slate-200 font-bold">{dryHullWeight} kN</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Beban Air Ballast:</span>
              <span className="text-cyan-400 font-bold">+{ballastWeight.toFixed(0)} kN</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Berat Total Sistem:</span>
              <span className={`font-bold ${isNeutral ? 'text-teal-300' : 'text-amber-400'}`}>
                {currentTotalWeight.toFixed(0)} / 2,400 kN
              </span>
            </div>
          </div>
        </div>

        {/* Cockpit Ballast Pump & Algebric Formula Control */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-teal-400" />
                <span>Panel Pompa Tangki Ballast</span>
              </span>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                ρ Laut = 1.5 kN/m³
              </span>
            </h4>

            {/* The Disguised Algebraic Equation */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Persamaan Kesetaraan Gaya:</div>
              <div className="text-teal-200 font-bold text-sm">
                Berat_Lambung + (ρ · Volume_Ballast) = Target_Gaya_Apung
              </div>
              <div className="text-indigo-300 text-xs">
                1500 + 1.5 · <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800">x</span> = 2400
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                Berapa volume air <code className="text-cyan-300">x</code> yang harus dipompa masuk agar total beban mencapai 2400 kN?
              </p>
            </div>

            {/* Ballast Volume Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Volume Air Ballast (x):</span>
                <span className="text-cyan-300 font-bold text-sm">{ballastWaterVolume} m³</span>
              </div>
              <input
                id="ballast-slider"
                type="range"
                min="200"
                max="800"
                step="25"
                value={ballastWaterVolume}
                onChange={(e) => {
                  playTick();
                  setBallastWaterVolume(parseInt(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>200 m³ (Terlalu Ringan)</span>
                <span>600 m³ (Kalkulasi Tepat)</span>
                <span>800 m³ (Terlalu Berat)</span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  playTick();
                  setBallastWaterVolume(450);
                }}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition"
              >
                450 m³
              </button>
              <button
                onClick={() => {
                  playTick();
                  setBallastWaterVolume(600);
                }}
                className="py-1.5 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 rounded text-teal-200 font-bold transition"
              >
                600 m³ (Pilihan Solusi)
              </button>
              <button
                onClick={() => {
                  playTick();
                  setBallastWaterVolume(750);
                }}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition"
              >
                750 m³
              </button>
            </div>

            {/* Test Dive Button */}
            <button
              id="test-dive-btn"
              onClick={handleTestDive}
              disabled={isDiving}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isDiving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengisi Tangki & Menyelam...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Uji Keseimbangan Menyelam 100m</span>
                </>
              )}
            </button>
          </div>

          {/* Stealth Remediation Result Banner */}
          {diveCompleted && (
            <div className="p-4 bg-gradient-to-br from-teal-950/90 to-slate-900 border border-teal-400/50 rounded-xl space-y-2 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Stealth Insertion / Passive Remediation Berhasil!</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                🎉 Kapal selam melayang sempurna di kedalaman 100 meter! Tanpa sadar, kamu baru saja menyelesaikan persamaan aljabar linier:
                <br />
                <code className="text-teal-300 font-mono text-[11px] block mt-1 bg-slate-950/80 p-1.5 rounded border border-teal-900">
                  1.5x = 2400 - 1500 = 900 ➔ x = 900 / 1.5 = 600 m³
                </code>
              </p>
              <div className="pt-2 border-t border-teal-900/60 flex items-center justify-between text-[11px] text-teal-300/90">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Decay Aljabar 15% pulih menjadi 0% (Tanpa Remedial Memalukan)</span>
                </span>
              </div>
            </div>
          )}

          {/* Architecture Concept Callout */}
          <div className="bg-[#121626] border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
              <Activity className="w-4 h-4" />
              <span>Bagaimana Self-Healing Engine Bekerja?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Dokumen Fondasi 7.3: <em>"Remedial tidak menjadi ruangan terpisah, melainkan fungsi tersembunyi dalam perjalanan belajar. Fondasi pulih sebagai efek samping penemuan, tanpa rasa malu."</em> Anak tidak "diturunkan kelasnya", melainkan terus bergerak maju sambil fondasinya diperbaiki secara alami!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
