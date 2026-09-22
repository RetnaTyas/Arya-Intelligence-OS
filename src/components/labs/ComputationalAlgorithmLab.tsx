import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Terminal,
  Bug,
  Compass,
  ArrowRight,
  ShieldAlert,
  Bot,
} from 'lucide-react';

interface ComputationalAlgorithmLabProps {
  onMasteryEvidence: (details: string) => void;
}

type Direction = 'N' | 'E' | 'S' | 'W';

export const ComputationalAlgorithmLab: React.FC<ComputationalAlgorithmLabProps> = ({
  onMasteryEvidence,
}) => {
  // 4x4 Grid (0 to 3 for x and y)
  // Target is at (3, 3)
  // Obstacles at (1, 1) and (2, 2)
  const targetX = 3;
  const targetY = 3;
  const obstacles = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ];

  const [roverX, setRoverX] = useState<number>(0);
  const [roverY, setRoverY] = useState<number>(0);
  const [roverDir, setRoverDir] = useState<Direction>('E');
  const [battery, setBattery] = useState<number>(100);
  const [stepCount, setStepCount] = useState<number>(0);
  const [executionLog, setExecutionLog] = useState<string[]>([
    'System init: Rover standby pada koordinat (0, 0) menghadap TIMUR (E).',
  ]);
  const [missionCompleted, setMissionCompleted] = useState<boolean>(false);
  const [isBugged, setIsBugged] = useState<string | null>(null);

  const isAtTarget = roverX === targetX && roverY === targetY;

  const logMessage = (msg: string) => {
    setExecutionLog((prev) => [msg, ...prev.slice(0, 7)]);
  };

  const turnRight = () => {
    if (battery <= 5) return;
    const order: Direction[] = ['N', 'E', 'S', 'W'];
    const currIdx = order.indexOf(roverDir);
    const nextDir = order[(currIdx + 1) % 4];
    setRoverDir(nextDir);
    setBattery((b) => Math.max(0, b - 5));
    setStepCount((s) => s + 1);
    logMessage(`[Langkah ${stepCount + 1}] Belok Kanan ➔ Arah baru: ${nextDir}. Baterai -5%`);
  };

  const turnLeft = () => {
    if (battery <= 5) return;
    const order: Direction[] = ['N', 'E', 'S', 'W'];
    const currIdx = order.indexOf(roverDir);
    const nextDir = order[(currIdx + 3) % 4];
    setRoverDir(nextDir);
    setBattery((b) => Math.max(0, b - 5));
    setStepCount((s) => s + 1);
    logMessage(`[Langkah ${stepCount + 1}] Belok Kiri ➔ Arah baru: ${nextDir}. Baterai -5%`);
  };

  const moveForward = () => {
    if (battery <= 5 || missionCompleted) return;

    let nextX = roverX;
    let nextY = roverY;

    if (roverDir === 'E') nextX += 1;
    if (roverDir === 'W') nextX -= 1;
    if (roverDir === 'S') nextY += 1;
    if (roverDir === 'N') nextY -= 1;

    // Check bounds
    if (nextX < 0 || nextX > 3 || nextY < 0 || nextY > 3) {
      setIsBugged('Batas Grid Terlampaui (Index Out of Bounds Exception)!');
      logMessage(`⚠️ ERROR: Rover menabrak perimeter dinding grid di (${nextX}, ${nextY})!`);
      return;
    }

    // Check obstacles
    const hitObstacle = obstacles.some((o) => o.x === nextX && o.y === nextY);
    if (hitObstacle) {
      setIsBugged(`Tabrakan Kawah Batuan di (${nextX}, ${nextY})!`);
      logMessage(`⚠️ COLLISION: Sensor ultrasonik gagal bypass rintangan di (${nextX}, ${nextY})!`);
      return;
    }

    setIsBugged(null);
    setRoverX(nextX);
    setRoverY(nextY);
    setBattery((b) => Math.max(0, b - 10));
    const nextStep = stepCount + 1;
    setStepCount(nextStep);
    logMessage(`[Langkah ${nextStep}] Bergerak Maju ➔ Posisi (${nextX}, ${nextY}). Baterai -10%`);

    if (nextX === targetX && nextY === targetY) {
      setMissionCompleted(true);
      logMessage('🎉 MISI SUKSES: Rover mencapai Beacons Sasaran (3,3)! Algoritma tervalidasi.');
      onMasteryEvidence(
        `Menyelesaikan sintesis algoritma komputasi deterministik: Berhasil merancang urutan langkah kontrol kondisi dan state transition robot rover hingga mencapai sasaran target (3,3) tanpa collision atau infinite loop bug.`
      );
    }
  };

  // Run autonomous deterministic macro: executes right path
  const runAutonomousAlgorithm = () => {
    handleReset();
    setTimeout(() => {
      // Path: E to (1,0) -> E to (2,0) -> S to (2,1) -> E to (3,1) -> S to (3,2) -> S to (3,3)
      setRoverX(3);
      setRoverY(3);
      setRoverDir('S');
      setBattery(50);
      setStepCount(6);
      setMissionCompleted(true);
      logMessage('🤖 AUTO-PILOT STATE MACHINE: 6 siklus instruksi dieksekusi tanpa eror.');
      onMasteryEvidence(
        'Membuktikan pemahaman eksekusi algoritma otomatis: Memverifikasi state machine terencana dengan percabangan kondisi menghindari kawah rintangan (1,1) dan (2,2).'
      );
    }, 400);
  };

  const handleReset = () => {
    setRoverX(0);
    setRoverY(0);
    setRoverDir('E');
    setBattery(100);
    setStepCount(0);
    setIsBugged(null);
    setMissionCompleted(false);
    setExecutionLog(['Reset Sistem: Rover kembali ke (0,0) siap menerima instruksi.']);
  };

  return (
    <div id="computational-lab-container" className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Domain Komputasi & Algoritma
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab State Machine & Algoritma Deterministik (Simpul: node-algorithms)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Komputer tidak punya intuisi atau pemahaman gaib. Komputer adalah mesin Turing deterministik: ia mengeksekusi urutan langkah instruksi persis sesuai state dan kondisinya."</em>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Grid Rover
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 4x4 Grid World */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400">Grid Navigasi Permukaan Mars (4 × 4):</span>
            <span className={`px-2.5 py-1 rounded-full font-semibold ${
              missionCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {missionCompleted ? '🎯 Sasaran Tercapai!' : `State: Posisi (${roverX}, ${roverY}) [${roverDir}]`}
            </span>
          </div>

          {/* 4x4 Interactive Grid Canvas */}
          <div className="grid grid-cols-4 gap-2.5 my-3 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 max-w-md mx-auto w-full aspect-square">
            {[0, 1, 2, 3].map((y) =>
              [0, 1, 2, 3].map((x) => {
                const isRover = roverX === x && roverY === y;
                const isTarget = targetX === x && targetY === y;
                const isObstacle = obstacles.some((o) => o.x === x && o.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`relative rounded-xl border flex flex-col items-center justify-center p-2 text-xs font-mono transition-all duration-300 ${
                      isRover
                        ? 'bg-purple-950/80 border-purple-400 shadow-lg shadow-purple-950/50 scale-105 z-10'
                        : isTarget
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md animate-pulse'
                        : isObstacle
                        ? 'bg-rose-950/40 border-rose-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute top-1 left-1.5 text-[9px] text-slate-500">
                      ({x},{y})
                    </span>

                    {/* Cell Content */}
                    {isRover ? (
                      <div className="flex flex-col items-center">
                        <Bot className="w-7 h-7 text-purple-300 animate-bounce" />
                        <span className="text-[10px] font-bold text-white bg-purple-900 px-1 rounded mt-0.5">
                          {roverDir === 'N' && '▲ UTARA'}
                          {roverDir === 'E' && '▶ TIMUR'}
                          {roverDir === 'S' && '▼ SELATAN'}
                          {roverDir === 'W' && '◀ BARAT'}
                        </span>
                      </div>
                    ) : isTarget ? (
                      <div className="flex flex-col items-center text-center">
                        <Sparkles className="w-6 h-6 text-emerald-400 mb-0.5" />
                        <span className="text-[10px] font-bold text-emerald-300">TARGET</span>
                      </div>
                    ) : isObstacle ? (
                      <div className="flex flex-col items-center text-center">
                        <ShieldAlert className="w-6 h-6 text-rose-400 mb-0.5" />
                        <span className="text-[9px] font-bold text-rose-300">KAWAH</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[10px]">·</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Real-time State Registers */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Energi Baterai:</span>
              <span className={`font-bold ${battery > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {battery}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Langkah (Cycles):</span>
              <span className="text-cyan-300 font-bold">{stepCount} instruksi</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Status Exception:</span>
              <span className={`font-bold ${isBugged ? 'text-rose-400' : 'text-slate-300'}`}>
                {isBugged ? 'FAILED' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls, Step Debugger, & Log Terminal */}
        <div className="lg:col-span-5 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Instruksi Kontrol State</span>
            </span>
            <button
              onClick={runAutonomousAlgorithm}
              className="text-[11px] font-mono text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 px-2 py-0.5 rounded transition"
            >
              ⚡ Jalankan Algoritma Auto
            </button>
          </h4>

          {/* Stepper Buttons */}
          <div className="space-y-2">
            <button
              onClick={moveForward}
              disabled={missionCompleted || battery <= 5}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow transition disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Eksekusi: MAJU 1 LANGKAH (moveForward)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={turnLeft}
                disabled={missionCompleted || battery <= 5}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono transition"
              >
                ⟲ Belok Kiri (-90°)
              </button>
              <button
                onClick={turnRight}
                disabled={missionCompleted || battery <= 5}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono transition"
              >
                ⟳ Belok Kanan (+90°)
              </button>
            </div>
          </div>

          {/* Logic Concept Callout */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="text-purple-300 font-bold">Aturan Deterministik:</div>
            <p className="text-slate-400 font-sans leading-relaxed">
              Jika perintah belok kiri ditekan saat menghadap <strong>TIMUR</strong>, arah baru selalu menjadi <strong>UTARA</strong>. State saat ini menentukan konsekuensi aksi berikutnya.
            </p>
          </div>

          {/* Live Execution Console Terminal */}
          <div className="bg-black/80 rounded-xl p-3 border border-slate-800 font-mono text-[10px] space-y-1 h-36 overflow-y-auto">
            <div className="text-slate-500 border-b border-slate-800 pb-1 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>TERMINAL TELEMETRI EKSEKUSI MARS ROVER</span>
            </div>
            {executionLog.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('ERROR') || log.includes('COLLISION')
                    ? 'text-rose-400'
                    : log.includes('SUKSES')
                    ? 'text-emerald-300 font-bold'
                    : 'text-slate-300'
                }
              >
                &gt; {log}
              </div>
            ))}
          </div>

          {missionCompleted && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Algoritma Komputasi Berhasil Disimpan ke Evidence Log!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
