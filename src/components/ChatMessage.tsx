interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`max-w-2xl px-5 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
        isUser
          ? 'bg-gradient-to-br from-[#0066CC] to-[#0078D4] text-white border border-[#0066CC]/50'
          : 'bg-white text-[#333333] border border-[#7D9CB7]/30'
      }`}>
        <p className="text-sm leading-relaxed font-['Lato']">{message.text}</p>
        <p className={`text-xs mt-2 font-['Roboto'] ${
          isUser ? 'text-[#7D9CB7]' : 'text-[#4F4F4F]'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
