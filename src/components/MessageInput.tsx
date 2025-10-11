import { Send } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-6 py-4 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE] border-t-2 border-[#0066CC]/30">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about incident reporting, playbooks, status checks, or request analyst support..."
          className="flex-1 px-4 py-3 bg-white text-[#333333] rounded-md border-2 border-[#7D9CB7]/40 focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0078D4]/20 placeholder-[#4F4F4F]/60 text-sm font-['Lato'] shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <button
          onClick={onSend}
          className="px-6 py-3 bg-gradient-to-r from-[#0078D4] to-[#00BCD4] hover:from-[#00BCD4] hover:to-[#17A2B8] text-white rounded-md font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 font-['Roboto'] border-2 border-[#0078D4] hover:border-[#00BCD4]"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
