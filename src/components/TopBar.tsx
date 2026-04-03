import { Minus, Square, X } from 'lucide-react';

export default function TopBar() {
  const isElectron = !!window.electronAPI;

  if (!isElectron) {
    // In web preview, just show a mock top bar or nothing. Let's show a mock one.
    return (
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-50 flex items-center px-4 justify-between pointer-events-none">
        <div className="text-white/50 text-xs font-semibold tracking-widest">ENESTIFY (WEB PREVIEW)</div>
      </div>
    );
  }

  return (
    <div 
      className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="pl-4 text-white/70 text-xs font-semibold tracking-widest pointer-events-none">
        ENESTIFY
      </div>
      
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button 
          onClick={() => window.electronAPI?.windowMinimize()}
          className="h-full px-4 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={() => window.electronAPI?.windowMaximize()}
          className="h-full px-4 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Square size={14} />
        </button>
        <button 
          onClick={() => window.electronAPI?.windowClose()}
          className="h-full px-4 text-white/50 hover:text-white hover:bg-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
