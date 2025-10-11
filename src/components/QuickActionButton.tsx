import { ReactNode } from 'react';

interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0066CC] to-[#0078D4] hover:from-[#0078D4] hover:to-[#00BCD4] text-white rounded-md border-2 border-[#0066CC] hover:border-[#00BCD4] transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 font-['Roboto'] font-semibold"
    >
      <span className="text-white">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default QuickActionButton;
