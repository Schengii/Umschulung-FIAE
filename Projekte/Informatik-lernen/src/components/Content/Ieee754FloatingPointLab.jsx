import React, { useState } from 'react';
import { 
  Binary, Cpu, Award, Layers, Sliders 
} from 'lucide-react';
import { 
  float32ToBits, 
  bitsToFloat32, 
  intToTwosComplement, 
  solveKarnaughMap2Var 
} from '../../utils/ieee754';
import { useStore } from '../../store/useStore';

export default function Ieee754FloatingPointLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('ieee754');
  const [xpClaimed, setXpClaimed] = useState(false);

  // IEEE 754 State
  const [inputNumber, setInputNumber] = useState('3.14159');
  const [parsedBits, setParsedBits] = useState(() => float32ToBits(3.14159));

  const handleInputChange = (val) => {
    setInputNumber(val);
    const num = Number(val);
    if (!isNaN(num) || val.toLowerCase().includes('inf') || val.toLowerCase().includes('nan')) {
      const res = float32ToBits(num);
      setParsedBits(res);
    }
  };

  const handleToggleBit = (index) => {
    const bitArr = parsedBits.rawBits.split('');
    bitArr[index] = bitArr[index] === '0' ? '1' : '0';
    const newBitString = bitArr.join('');
    const res = bitsToFloat32(newBitString);
    setParsedBits(res);
    setInputNumber(res.decimalValue.toString());
  };

  const setPreset = (val) => {
    setInputNumber(val.toString());
    const res = float32ToBits(val);
    setParsedBits(res);
  };

  // Zweierkomplement State
  const [intVal, setIntVal] = useState('-42');
  const [intBitsSize, setIntBitsSize] = useState(8);
  const twosCompResult = intToTwosComplement(Number(intVal), intBitsSize);

  // KV-Map State (2 Variablen A, B: [f(0,0), f(0,1), f(1,0), f(1,1)])
  const [kvValues, setKvValues] = useState([0, 1, 1, 1]);
  const kvResult = solveKarnaughMap2Var(kvValues);

  const toggleKvCell = (idx) => {
    const updated = [...kvValues];
    updated[idx] = updated[idx] === 0 ? 1 : 0;
    setKvValues(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-teal-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                Technische Informatik & Rechnerarchitektur
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Cpu className="w-8 h-8 text-cyan-400" />
              IEEE-754 Gleitkomma & Zahlen-Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Interaktive 32-Bit Bit-Manipulation für Single Precision Floats, Zweierkomplement-Konvertierung und Karnaugh-Veitch Minimierung.
            </p>
          </div>
          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(30, 'ieee_architect'); } }}
            disabled={xpClaimed}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" />
            {xpClaimed ? 'XP gesichert!' : 'Hardware XP sichern'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('ieee754')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'ieee754'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Binary className="w-4 h-4" />
          IEEE-754 (32-Bit Single Precision)
        </button>
        <button
          onClick={() => setActiveTab('twoscomp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'twoscomp'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Zweierkomplement (Signed Integer)
        </button>
        <button
          onClick={() => setActiveTab('kvmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'kvmap'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Karnaugh-Veitch (KV) Minimierer
        </button>
      </div>

      {/* Tab 1: IEEE 754 */}
      {activeTab === 'ieee754' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Input & Presets */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-80">
                <label className="text-xs font-semibold text-slate-400 block mb-1">Dezimalwert eingeben</label>
                <input
                  type="text"
                  value={inputNumber}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
                  placeholder="z.B. 3.14159"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-400 w-full mb-1">Schnell-Presets:</span>
                {[
                  { label: '1.0', val: 1.0 },
                  { label: '0.0', val: 0 },
                  { label: '-0.0', val: -0 },
                  { label: '0.1', val: 0.1 },
                  { label: '3.14159', val: 3.14159 },
                  { label: '+Infinity', val: Infinity },
                  { label: 'NaN', val: NaN },
                  { label: 'Max Float', val: 3.4028235e+38 }
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPreset(p.val)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interaktive Bit-Leiste */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Klicke auf einzelne Bits, um sie umzuschalten:</span>
                <span>Bit 31 (MSB) ➔ Bit 0 (LSB)</span>
              </div>

              {/* Bit Buttons Bar */}
              <div className="flex flex-wrap gap-1 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto justify-center font-mono">
                {/* Vorzeichen (1 Bit) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-rose-400 font-bold mb-1">VZ</span>
                  <button
                    onClick={() => handleToggleBit(0)}
                    className={`w-7 h-9 rounded text-sm font-bold transition flex items-center justify-center ${
                      parsedBits.signBit === '1'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {parsedBits.signBit}
                  </button>
                  <span className="text-[9px] text-slate-500 mt-1">31</span>
                </div>

                <div className="w-1 border-r border-slate-800 mx-1" />

                {/* Exponent (8 Bits) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-amber-400 font-bold mb-1">Exponent (8 Bit)</span>
                  <div className="flex gap-0.5">
                    {parsedBits.exponentBits.split('').map((b, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <button
                          onClick={() => handleToggleBit(1 + idx)}
                          className={`w-7 h-9 rounded text-sm font-bold transition flex items-center justify-center ${
                            b === '1'
                              ? 'bg-amber-600 text-white shadow-lg'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {b}
                        </button>
                        <span className="text-[9px] text-slate-500 mt-1">{30 - idx}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-1 border-r border-slate-800 mx-1" />

                {/* Mantisse (23 Bits) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-cyan-400 font-bold mb-1">Mantisse / Fraction (23 Bit)</span>
                  <div className="flex gap-0.5">
                    {parsedBits.mantissaBits.split('').map((b, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <button
                          onClick={() => handleToggleBit(9 + idx)}
                          className={`w-6 h-9 rounded text-xs font-bold transition flex items-center justify-center ${
                            b === '1'
                              ? 'bg-cyan-600 text-white shadow-lg'
                              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {b}
                        </button>
                        <span className="text-[9px] text-slate-500 mt-1">{22 - idx}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dekodierte Werte */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-rose-900/50">
                <span className="text-xs text-rose-300 font-semibold block">1. Vorzeichen (Sign)</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {parsedBits.signBit === '1' ? 'Negativ (-)' : 'Positiv (+)'}
                </span>
                <span className="text-xs text-slate-400 block mt-1 font-mono">(-1)^{parsedBits.signBit} = {parsedBits.signBit === '1' ? '-1' : '+1'}</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-900/50">
                <span className="text-xs text-amber-300 font-semibold block">2. Exponent (mit Bias 127)</span>
                <span className="text-xl font-bold text-white mt-1 block font-mono">
                  {parsedBits.exponentInt} - 127 = {parsedBits.unbiasedExponent}
                </span>
                <span className="text-xs text-slate-400 block mt-1 font-mono">2^{parsedBits.unbiasedExponent}</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-900/50">
                <span className="text-xs text-cyan-300 font-semibold block">3. Hex & Klassifikation</span>
                <span className="text-xl font-bold text-cyan-400 mt-1 block font-mono">
                  {parsedBits.hexString}
                </span>
                <span className="text-xs text-emerald-300 block mt-1 font-semibold">
                  Status: {parsedBits.classification}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Zweierkomplement */}
      {activeTab === 'twoscomp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Signed Integer Konvertierung
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Dezimaler Ganzzahlwert</label>
                <input
                  type="number"
                  value={intVal}
                  onChange={(e) => setIntVal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Wortbreite (Bit)</label>
                <div className="flex gap-2">
                  {[8, 16, 32].map((bits) => (
                    <button
                      key={bits}
                      onClick={() => setIntBitsSize(bits)}
                      className={`flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition ${
                        intBitsSize === bits
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {bits}-Bit
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400">Wertebereich für {intBitsSize}-Bit:</div>
                <div className="font-mono text-cyan-300 font-bold">
                  [{twosCompResult.minVal} bis +{twosCompResult.maxVal}]
                </div>
                {twosCompResult.isOverflow && (
                  <div className="text-rose-400 font-bold mt-1">
                    ⚠️ Overflow: Zahl liegt außerhalb des darstellbaren Wertebereichs!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Binäre Darstellung</h2>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-center space-y-2">
              <span className="text-xs text-slate-400">Zweierkomplement Bit-Muster:</span>
              <div className="text-2xl md:text-3xl font-bold tracking-widest text-cyan-400">
                {twosCompResult.bitString}
              </div>
              <div className="text-sm text-slate-400">
                Hexadezimal: <span className="text-amber-400 font-bold">{twosCompResult.hex}</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-white block">So funktioniert das Zweierkomplement bei negativen Zahlen:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Betrag als positive Binärzahl darstellen (z.B. +42 = 00101010)</li>
                <li>Alle Bits invertieren (Einerkomplement: 11010101)</li>
                <li>+1 addieren ➔ 11010110 (=-42)</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: KV-Diagramm */}
      {activeTab === 'kvmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              2-Variablen KV-Diagramm (A, B)
            </h2>
            <p className="text-xs text-slate-400">
              Klicke auf die Zellen in der Matrix, um zwischen 0 und 1 umzuschalten. Die minimierte Formel wird in Echtzeit berechnet.
            </p>

            {/* KV Matrix */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center font-mono">
              <div className="grid grid-cols-3 gap-2 text-center text-sm items-center">
                <div className="text-slate-500 text-xs">A \ B</div>
                <div className="text-cyan-400 font-bold">B = 0</div>
                <div className="text-cyan-400 font-bold">B = 1</div>

                <div className="text-amber-400 font-bold">A = 0</div>
                <button
                  onClick={() => toggleKvCell(0)}
                  className={`w-14 h-14 rounded-lg font-bold text-lg transition ${
                    kvValues[0] === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {kvValues[0]}
                </button>
                <button
                  onClick={() => toggleKvCell(1)}
                  className={`w-14 h-14 rounded-lg font-bold text-lg transition ${
                    kvValues[1] === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {kvValues[1]}
                </button>

                <div className="text-amber-400 font-bold">A = 1</div>
                <button
                  onClick={() => toggleKvCell(2)}
                  className={`w-14 h-14 rounded-lg font-bold text-lg transition ${
                    kvValues[2] === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {kvValues[2]}
                </button>
                <button
                  onClick={() => toggleKvCell(3)}
                  className={`w-14 h-14 rounded-lg font-bold text-lg transition ${
                    kvValues[3] === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {kvValues[3]}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Minimierte Boolesche Funktion (DNF)</h2>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-center space-y-2">
              <span className="text-xs text-slate-400">Minimierte Gleichung f(A, B):</span>
              <div className="text-3xl font-bold text-emerald-400 py-2">
                f = {kvResult}
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-white block">Regeln für Karnaugh-Veitch Diagramme:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Blöcke aus 1ern müssen Zweierpotenzen sein (1, 2, 4, 8 Zellen).</li>
                <li>Je größer die Blöcke, desto weniger Variablen verbleiben im minimierten Term.</li>
                <li>Überlappende Blöcke sind erlaubt und helfen bei der weiteren Vereinfachung.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
