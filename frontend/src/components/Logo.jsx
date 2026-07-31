import { Activity } from 'lucide-react';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#18D6C3] to-[#0FA3A7] flex items-center justify-center shadow-lg shadow-[#18D6C3]/30">
          <Activity size={20} className="sm:size-22 text-white" strokeWidth={2.5} />
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#18D6C3]/20 to-[#0FA3A7]/20 blur-xl -z-10" />
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline">
        <span className="text-xl sm:text-2xl font-bold text-white">Medi</span>
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#18D6C3] to-[#0FA3A7] bg-clip-text text-transparent">
          Vault
        </span>
      </div>
    </div>
  );
}
