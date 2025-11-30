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
  showRoleDropdown?: boolean;
  showDatePicker?: boolean;
  showTimePicker?: boolean;
  onQuickAnswer?: (answer: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showRoleDropdown,
  showDatePicker,
  showTimePicker,
  onQuickAnswer
}) => {
  const isUser = message.sender === 'user';

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val || !onQuickAnswer) return;
    onQuickAnswer(val);
    e.target.value = '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val || !onQuickAnswer) return;
    onQuickAnswer(val);
    e.target.value = '';
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // HH:MM
    if (!val || !onQuickAnswer) return;
    onQuickAnswer(val);
    e.target.value = '';
  };

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

        {/* Inline Controls: Role / Date / Time */}
        {!isUser && (
          <div className="mt-2 space-y-2">
            {showRoleDropdown && (
              <select
                defaultValue=""
                onChange={handleRoleChange}
                className="w-full px-3 py-2 rounded-full border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="defence personnel">Defence personnel</option>
                <option value="ex veteran/retired officer">Ex veteran / retired officer</option>
                <option value="family member / dependent">Family member / dependent</option>
                <option value="MoD authority">MoD authority</option>
              </select>
            )}

            {showDatePicker && (
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-gray-600">Tap to choose date:</span>
                <input
                  type="date"
                  onChange={handleDateChange}
                  className="px-3 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
            )}

            {showTimePicker && (
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-gray-600">Tap to choose time:</span>
                <input
                  type="time"
                  onChange={handleTimeChange}
                  className="px-3 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
            )}

            {(showRoleDropdown || showDatePicker || showTimePicker) && (
              <span className="text-[10px] text-gray-500">
                You can also answer via the text box below if needed.
              </span>
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
