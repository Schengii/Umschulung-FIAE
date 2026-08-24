export const PERF_TOPICS = [
  {
    id: 'memory_leaks',
    title: '1. Memory Leaks (Arbeitsspeicher-Lecks)',
    desc: 'Unaufgeräumte Intervalle, Event-Listener oder abgetrennte (Detached) DOM-Knoten verhindern, dass der V8 Garbage Collector den Speicher freigibt.',
    badCode: `// ❌ Memory Leak: Interval wird nie gestoppt!
function startLeak() {
  const hugeData = new Array(1000000).fill("data");
  setInterval(() => {
    console.log(hugeData.length); // Hält Referenz auf ewig!
  }, 1000);
}`,
    goodCode: `// ✅ Saubere Lösung: Cleanup in useEffect
useEffect(() => {
  const timer = setInterval(() => { ... }, 1000);
  return () => clearInterval(timer); // Speicher wird freigegeben!
}, []);`
  },
  {
    id: 'garbage_collection',
    title: '2. V8 Garbage Collection (Mark-and-Sweep)',
    desc: 'Der V8 Engine nutzt Orinoco Garbage Collector mit Generational Hypothesis (Young Generation Scavenger vs. Old Generation Mark-Sweep-Compact).',
    badCode: `// Kurzlebiges Objekt in Young Generation (Scavenge) -> Bevorzugt!`,
    goodCode: `// Vermeide unnötige Objekt-Allokationen in Schleifen!`
  }
];
