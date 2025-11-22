export default function AlternativaLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="relative w-40 h-40">

        {/* Sartén / Círculo */}
        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin-slow"></div>

        {/* Ingredientes orbitando */}
        <span className="absolute w-3 h-3 bg-white rounded-full top-0 left-1/2 -translate-x-1/2 animate-orbit"></span>
        <span className="absolute w-3 h-3 bg-red-500 rounded-full bottom-0 left-1/2 -translate-x-1/2 animate-orbit-rev"></span>
        <span className="absolute w-3 h-3 bg-yellow-400 rounded-full left-0 top-1/2 -translate-y-1/2 animate-orbit"></span>
        <span className="absolute w-3 h-3 bg-green-400 rounded-full right-0 top-1/2 -translate-y-1/2 animate-orbit-rev"></span>

        {/* Texto */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-sm font-semibold tracking-wide text-center">
            Alternativa<br/>2.0
          </p>
        </div>
      </div>
    </div>
  );
}
