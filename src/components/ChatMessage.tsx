interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

const formatAssistantText = (raw: string) => {
  if (!raw) return raw;

  const normalized = raw.replace(/\r\n?/g, "\n");
  const withoutRules = normalized.replace(/\n?---\n?/g, "\n");
  const collapsed = withoutRules.replace(/\n{3,}/g, "\n\n");
  const boldFlattened = collapsed.replace(/\*\*(.*?)\*\*/g, (_, content) =>
    content.trim()
  );
  const italicFlattened = boldFlattened.replace(
    /(^|\s)\*(?!\s)([^*]+?)\*(?=\s|$)/g,
    "$1$2"
  );

  const formattedLines: string[] = [];

  italicFlattened.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      const lastLine = formattedLines[formattedLines.length - 1];
      if (lastLine !== "" && lastLine !== undefined) {
        formattedLines.push("");
      }
      return;
    }

    if (trimmed.startsWith("### ")) {
      const title = trimmed.slice(4).trim().toUpperCase();
      if (formattedLines.length) {
        const lastLine = formattedLines[formattedLines.length - 1];
        if (lastLine !== "" && lastLine !== undefined) {
          formattedLines.push("");
        }
      }
      formattedLines.push(title);
      formattedLines.push("");
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      formattedLines.push(`• ${trimmed.replace(/^[-*]\s+/, "")}`);
      return;
    }

    formattedLines.push(trimmed);
  });

  return formattedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const displayedText = isUser
    ? message.text
    : formatAssistantText(message.text);

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn`}
    >
      <div
        className={`max-w-2xl px-5 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-[#0066CC] to-[#0078D4] text-white border border-[#0066CC]/50"
            : "bg-white text-[#333333] border border-[#7D9CB7]/30"
        }`}
      >
        <p className="text-sm leading-relaxed font-['Lato'] whitespace-pre-wrap">
          {displayedText}
        </p>
        <p
          className={`text-xs mt-2 font-['Roboto'] ${
            isUser ? "text-[#7D9CB7]" : "text-[#4F4F4F]"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
