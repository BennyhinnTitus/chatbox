import { useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendFiles?: (files: FileList) => void;
}

function MessageInput({ value, onChange, onSend, onSendFiles }: MessageInputProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onSendFiles) {
      onSendFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onSendFiles) {
      onSendFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="px-6 py-4 bg-[#F5F5F5] border-t border-[#D0D7DE] flex items-center gap-3">
      {/* Hidden inputs */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image button */}
      <button
        type="button"
        onClick={handleImageClick}
        className="p-2 rounded-full hover:bg-gray-200 transition"
        title="Send image"
      >
        <ImageIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* File button */}
      <button
        type="button"
        onClick={handleFileClick}
        className="p-2 rounded-full hover:bg-gray-200 transition"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5 text-gray-600" />
      </button>

      {/* Text input */}
      <input
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
        placeholder="Type a message..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Send button */}
      <button
        type="button"
        onClick={onSend}
        className="ml-2 px-4 py-2 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white flex items-center gap-1 text-sm font-semibold shadow-sm"
      >
        <Send className="w-4 h-4" />
        Send
      </button>
    </div>
  );
}

export default MessageInput;
