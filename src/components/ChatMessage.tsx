import { Paperclip } from 'lucide-react';
import type { Message } from '../App';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm
          ${isUser ? 'bg-[#0066CC] text-white rounded-br-sm' : 'bg-[#F2F4F7] text-gray-900 rounded-bl-sm'}
        `}
      >
        {/* Text */}
        {message.text && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map(att =>
              att.type === 'image' ? (
                <div key={att.id} className="overflow-hidden rounded-xl border border-gray-200 bg-black/5">
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-h-72 w-full object-contain"
                  />
                  <div className="px-2 py-1 text-xs">
                    {att.name} · {formatFileSize(att.size)}
                  </div>
                </div>
              ) : (
                <a
                  key={att.id}
                  href={att.url}
                  download={att.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-xs hover:bg-gray-50"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate">{att.name}</span>
                  <span className="text-gray-500 ml-2">
                    {formatFileSize(att.size)}
                  </span>
                </a>
              )
            )}
          </div>
        )}

        {/* Time */}
        <div
          className={`mt-1 text-[10px] ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          } text-right`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
