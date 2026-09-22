import React, { useState } from 'react';
import {
  Brain,
  GitBranch,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Network,
  CheckCircle,
  Cpu,
} from 'lucide-react';
import {
  PERTURBATION_LAYERS,
  THREE_STATUS_LAYERS,
  WARRANT_COMPONENTS,
} from '../data/foundationDocData';

export const FoundationSection65: React.FC = () => {
  const [subSection, setSubSection] = useState<'all' | 'perturbation' | 'layers' | 'pipeline'>('all');

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Header and Quick Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>6.5 Perturbation Testing, Epistemic State & Universal Warrant Pipeline</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ekstensi Feynman Sensor: pengujian pemahaman struktural & pemodelan warrant
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
          <button
            onClick={() => setSubSection('all')}
            className={`px-2 py-1 rounded transition ${subSection === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setSubSection('perturbation')}
            className={`px-2 py-1 rounded transition ${subSection === 'perturbation' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            6.5.1-6.5.5 Uji
          </button>
          <button
            onClick={() => setSubSection('layers')}
            className={`px-2 py-1 rounded transition ${subSection === 'layers' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            6.5.6 Tiga Status
          </button>
          <button
            onClick={() => setSubSection('pipeline')}
            className={`px-2 py-1 rounded transition ${subSection === 'pipeline' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            6.5.7 Warrant
          </button>
        </div>
      </div>

      {/* Motivasi Awal */}
      <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-2">
        <div className="font-semibold text-purple-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Motivasi: Ilusi Kompetensi (Anak vs AI)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Skor jawaban benar/salah tidak membuktikan <em>structural understanding</em> — baik pada anak maupun pada AI tutor itu sendiri. Keduanya memiliki kesamaan pola kegagalan:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-sans">Gejala:</span>
            <span className="text-amber-300">Tampak kompeten tanpa struktur</span>
            <div className="mt-1 text-slate-400">Anak: Hafal rumus<br />AI: Hafal pola</div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-sans">Gejala:</span>
            <span className="text-cyan-300">Jawaban benar</span>
            <div className="mt-1 text-slate-400">Anak: Retrieval definisi<br />AI: Output benar</div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-sans">Gejala:</span>
            <span className="text-rose-300">Runtuh saat digeser</span>
            <div className="mt-1 text-slate-400">Anak: Bingung soal baru<br />AI: Semantic hallucination</div>
          </div>
        </div>
        <p className="text-[11px] text-purple-300 font-medium italic pt-1">
          Prinsip intinya: "Jangan tanya apakah dia tahu jawabannya, tanya kalau karpetnya dicabut, apakah strukturnya masih berdiri."
        </p>
      </div>

      {/* 6.5.1 Enam Layer Perturbation */}
      {(subSection === 'all' || subSection === 'perturbation') && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <strong className="text-white text-xs block">6.5.1 Enam Layer Perturbation Testing</strong>
            <span className="text-[10px] font-mono text-indigo-400">Learn ➔ Perturb ➔ Transfer ➔ Contradict ➔ Reconstruct ➔ Verify</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-2.5">Layer</th>
                  <th className="py-2 px-2.5">Yang Diuji</th>
                  <th className="py-2 px-2.5">Contoh Kasus (Division by Zero)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {PERTURBATION_LAYERS.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2.5 font-semibold text-indigo-300 whitespace-nowrap">{l.layer}</td>
                    <td className="py-2 px-2.5 text-slate-300">{l.test}</td>
                    <td className="py-2 px-2.5 text-emerald-300 font-mono text-[10px]">{l.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-[11px] text-slate-300">
            <strong className="text-indigo-200">Catatan Penting:</strong> <em>Verify</em> diletakkan terakhir karena narasi rekonstruksi bisa terdengar fasih tanpa struktur yang benar-benar stabil. Verify menutup celah dengan menguji instance baru yang belum pernah muncul.
          </div>
        </div>
      )}

      {/* 6.5.2 Epistemic State Primitive & 6.5.3 World-Omega */}
      {(subSection === 'all' || subSection === 'perturbation') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 6.5.2 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-white text-xs block">6.5.2 Epistemic State Primitive</strong>
            <div className="p-2 bg-slate-900 rounded font-mono text-center text-cyan-300 text-[11px] border border-slate-800">
              Known ≠ Believed ≠ Hypothesized ≠ Unknown
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Target akhir bukan membuat anak "selalu punya jawaban", melainkan mampu membedakan derajat keyakinan epistemiknya sendiri secara jujur.
            </p>
            <div className="p-2 bg-amber-950/30 border border-amber-500/30 rounded text-[10px] text-amber-200">
              <strong>Syarat Validitas:</strong> Label harus <em>terkalibrasi</em> secara empiris, bukan sekadar hedging linguistik sopan. Yang ditandai "hypothesized" harus secara statistik lebih sering salah dibanding "known".
            </div>
          </div>

          {/* 6.5.3 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-white text-xs block">6.5.3 World-Ω & Batas Metodologis Anchor</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Menguji dunia aksioma fiktif menguji <em>rule-following & belief revision</em>, bukan abduction murni tanpa anchor.
            </p>
            <div className="text-[10px] font-mono text-indigo-300 p-2 bg-slate-900 rounded border border-slate-800">
              Fixed Anchor ➔ Local ➔ Abstract ➔ Portable ➔ Constructed ➔ Revisable ➔ Calibrated Anchor
            </div>
            <div className="p-2 bg-indigo-950/30 border border-indigo-500/30 rounded text-[10px] text-indigo-200">
              <strong>Definisi Kerja:</strong> <em>Intelligence ≈ kemampuan membangun, memilih, mentransfer, merevisi, dan mengkalibrasi anchor</em> — bukan ketiadaan anchor.
            </div>
          </div>
        </div>
      )}

      {/* 6.5.4 Dua Jalur Pengujian & 6.5.5 Kalibrasi Skala Satu Anak */}
      {(subSection === 'all' || subSection === 'perturbation') && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <strong className="text-white text-xs">6.5.4 Dua Jalur: Knowledge vs Discovery & 6.5.5 Kalibrasi</strong>
            <span className="text-[10px] text-slate-400">Open-World Abduction Test</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Jalur Knowledge (Deduksi):</span>
              <div className="font-mono text-[10px] text-slate-300">
                Learn ➔ Perturb ➔ Transfer ➔ Contradict ➔ Reconstruct ➔ Verify
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Menguji pemahaman struktur yang <em>sudah tersedia</em> dari premis yang diberikan.
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Jalur Discovery (Abduksi):</span>
              <div className="font-mono text-[10px] text-slate-300">
                Observe ➔ Hypothesize ➔ Predict ➔ Encounter ➔ Revise ➔ Re-predict
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Menguji kemampuan <em>membangun struktur</em> dari fenomena mentah tanpa premis awal.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <strong className="text-slate-300 block">6 Kriteria Evaluasi Hipotesis (Meta-Anchor):</strong>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">1. Constraint Preservation</span>
                <p className="text-slate-400 mt-0.5">Menjelaskan seluruh observasi tanpa kontradiksi.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">2. Minimality</span>
                <p className="text-slate-400 mt-0.5">Occam's Razor: tidak menambah asumsi tak perlu.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">3. Predictive Discrimination</span>
                <p className="text-slate-400 mt-0.5">Prediksi unik vs hipotesis alternatif.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">4. Counterfactual Robustness</span>
                <p className="text-slate-400 mt-0.5">Tetap koheren saat kondisi pengujian diubah.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">5. Falsifiability</span>
                <p className="text-slate-400 mt-0.5">Dapat menyatakan observasi apa yang menggugurkannya.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">6. Revision Cost</span>
                <p className="text-slate-400 mt-0.5">Memperbaiki cacat tanpa merusak bagian yang valid.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6.5.6 Tiga Layer Status: Modal, Epistemik, Belief */}
      {(subSection === 'all' || subSection === 'layers') && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>6.5.6 Tiga Layer Status: Modal, Epistemik, Belief</span>
            </h4>
            <span className="text-[10px] text-amber-300/80 font-mono">Pencegahan Premature Collapse</span>
          </div>

          <div className="space-y-2">
            {THREE_STATUS_LAYERS.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-300 text-xs">{st.layer}</strong>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Sumber: {st.source}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300"><strong>Pertanyaan:</strong> {st.question}</div>
                <div className="text-[11px] text-cyan-300 font-mono"><strong>Contoh Nilai:</strong> {st.example}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg space-y-1">
              <strong className="text-emerald-300 text-xs block">Epistemic Preservation:</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ketika dua hipotesis (H₁ & H₂) sama-sama kompatibel dengan observasi yang ada, sistem tidak dipaksa memilih pemenang secara prematur. Sistem menyatakan keduanya <em>jawāz</em>, mencatat data belum mendiskriminasi, dan mempertahankan status majemuk.
              </p>
            </div>
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg space-y-1">
              <strong className="text-indigo-300 text-xs block">Deklarasi Anchor Filosofis:</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Memilih kerangka <em>wujūb–istiḥālah–jawāz</em> dari kalām rasionalis dideklarasikan secara sadar sebagai anchor filosofis Layer 1 yang eksplisit — bukan diklaim sebagai satu-satunya kerangka modal yang netral.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6.5.7 Universal Warrant Pipeline */}
      {(subSection === 'all' || subSection === 'pipeline') && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>6.5.7 Universal Warrant Pipeline (Graph Representasi)</span>
            </h4>
            <span className="text-[10px] text-cyan-300 font-mono">Graph dengan Feedback Edges</span>
          </div>

          {/* Diagram ASCII/Graph */}
          <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 font-mono text-[10.5px] text-slate-300 overflow-x-auto leading-tight">
            <div className="text-center font-bold text-indigo-300 pb-1">PROPOSITION P</div>
            <div className="text-center text-slate-500">│</div>
            <div className="grid grid-cols-2 text-center">
              <div>
                <span className="text-cyan-400 font-semibold">DALĪL ʿAQLĪ (a priori)</span>
                <div className="text-slate-500">↓</div>
                <span className="text-slate-300">Modal Coherence Gate</span>
                <div className="text-amber-300 font-bold">Wujūb / Istiḥālah / Jawāz</div>
              </div>
              <div>
                <span className="text-purple-400 font-semibold">DALĪL NAQLĪ (evidential)</span>
                <div className="text-slate-500">↓</div>
                <span className="text-slate-300">THUBŪT (Validitas Sumber)</span>
                <div className="text-slate-500">↓</div>
                <span className="text-slate-300">DALĀLAH (Interpretasi Makna)</span>
              </div>
            </div>
            <div className="text-center text-slate-500 pt-2">└───┬───┘</div>
            <div className="text-center font-semibold text-emerald-400">ENTAILMENT (Defeasible / Non-monoton)</div>
            <div className="text-center text-slate-500">↓</div>
            <div className="text-center font-semibold text-amber-400">SCOPE (Konteks Validitas Penerapan)</div>
            <div className="text-center text-slate-500">↓</div>
            <div className="text-center font-semibold text-indigo-300">EPISTEMIC STATUS ➔ BELIEF / ACTION ➔ REVISION</div>
          </div>

          {/* 4 Komponen Inti */}
          <div className="space-y-2">
            <strong className="text-slate-200 text-xs block">4 Jenis Komponen Arsitektur:</strong>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {WARRANT_COMPONENTS.map((c, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <strong className="text-indigo-300 block text-xs">{c.component}</strong>
                  <div className="text-[10px] text-slate-400 mt-1"><strong>Peran:</strong> {c.role}</div>
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5 bg-slate-950 p-1.5 rounded border border-slate-800/60">
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Koreksi Krusial */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-500/30 space-y-2">
            <strong className="text-cyan-300 text-xs block">3 Koreksi Arsitektur Krusial:</strong>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-cyan-900/60 text-cyan-300 rounded font-mono text-[10px] shrink-0">1</span>
                <div>
                  <strong>Graph bukan Rantai Searah:</strong> <em>Dalālah</em> sering bergantung balik pada <em>Scope</em>, dan <em>Entailment</em> bersifat defeasible. Graph mendukung revisi di sembarang simpul tanpa harus mulai dari atas.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-cyan-900/60 text-cyan-300 rounded font-mono text-[10px] shrink-0">2</span>
                <div>
                  <strong>Default Entitlement:</strong> Klaim remeh sehari-hari mendapat status provisional dari keandalan sumber. Audit warrant penuh hanya diwajibkan saat proposisi dikontes, naik ke status taruhan tinggi, atau menemui anomali.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-cyan-900/60 text-cyan-300 rounded font-mono text-[10px] shrink-0">3</span>
                <div>
                  <strong>Rantai (Naqlī) vs Konvergensi (Sains):</strong> Rantai melemah jika satu mata rantai putus; sebaliknya sains menguat dari konvergensi replikasi banyak lab independen. Keduanya dimodelkan berbeda dalam skema data.
                </div>
              </div>
            </div>
          </div>

          {/* Scope Expansion Warning */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Scope Expansion Error:</strong> Memperluas proposisi yang valid pada kondisi tertentu [P(C)] menjadi klaim universal [P(universal)] tanpa warrant tambahan adalah cacat fatal yang identik dengan halusinasi AI pada pembatasan konteks.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
