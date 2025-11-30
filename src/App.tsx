import { useState, useRef, useEffect } from 'react';
import { Shield, FileText, Activity, AlertTriangle, BookOpen } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import QuickActionButton from './components/QuickActionButton';
import MessageInput from './components/MessageInput';
import Footer from './components/Footer';

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  attachments?: Attachment[];
}

// 🔗 CHANGE THIS TO YOUR TUNNEL URL
const OLLAMA_API_URL = 'https://wd5cjm61-11434.inc1.devtunnels.ms/api/chat';

// 🔁 MODEL NAME
const OLLAMA_MODEL_NAME = 'phi3';

// 📝 Questions for File Report form flow
const FILE_REPORT_QUESTIONS = [
  'What is your name?',
  'What is your age?',
  'What is your email?'
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Cyber AI Assistant, your 24/7 cybersecurity support system.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ]);

  const [inputValue, setInputValue] = useState('');

  // 🌟 FILE REPORT FLOW STATE
  const [isFileReportActive, setIsFileReportActive] = useState(false);
  const [fileReportData, setFileReportData] = useState({
    name: '',
    age: '',
    email: ''
  });
  const [fileReportStep, setFileReportStep] = useState(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 📎 Handle image/file sending (no AI call, just show in UI)
  const handleSendFiles = (files: FileList) => {
    if (!files || files.length === 0) return;

    const newMessages: Message[] = [];

    Array.from(files).forEach(file => {
      const objectUrl = URL.createObjectURL(file);

      const attachment: Attachment = {
        id: `${Date.now()}-${file.name}`,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        url: objectUrl,
        size: file.size,
        mimeType: file.type
      };

      const msg: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text: attachment.type === 'image' ? '📷 Image' : `📎 File: ${attachment.name}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        attachments: [attachment]
      };

      newMessages.push(msg);
    });

    setMessages(prev => [...prev, ...newMessages]);

    // If you want AI to react to uploads, later we can
    // also send a small text message to the model here.
  };

  // ⭐ USER SEND MESSAGE (handles normal chat + File Report flow)
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userText = inputValue;
    setInputValue('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, userMessage]);

    // 🌟 FILE REPORT MODE: ask questions one by one, NO API CALL
    if (isFileReportActive) {
      const updated = { ...fileReportData };

      if (fileReportStep === 0) updated.name = userText;
      if (fileReportStep === 1) updated.age = userText;
      if (fileReportStep === 2) updated.email = userText;

      setFileReportData(updated);

      // More questions left → ask next
      if (fileReportStep < FILE_REPORT_QUESTIONS.length - 1) {
        const nextStep = fileReportStep + 1;
        setFileReportStep(nextStep);

        const aiQuestion: Message = {
          id: (Date.now() + 1).toString(),
          text: FILE_REPORT_QUESTIONS[nextStep],
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setMessages(prev => [...prev, aiQuestion]);
        return;
      }

      // ✅ All questions done → show final JSON only
      setIsFileReportActive(false);
      setFileReportStep(0);

      const finalJsonObject = {
        name: updated.name,
        age: isNaN(Number(updated.age)) ? updated.age : Number(updated.age),
        email: updated.email
      };

      const finalJson = JSON.stringify(finalJsonObject, null, 2);

      const aiFinal: Message = {
        id: (Date.now() + 2).toString(),
        text: finalJson,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, aiFinal]);
      return;
    }

    // 🌍 NORMAL CHAT → call Ollama API
    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL_NAME,
          messages: apiMessages,
          stream: false
        })
      });

      const data = await res.json();
      const aiText =
        data?.message?.content ?? 'Sorry, I could not generate a response.';

      const aiMessage: Message = {
        id: (Date.now() + 3).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage: Message = {
        id: (Date.now() + 4).toString(),
        text: 'Failed to reach the AI server.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  // ⭐ QUICK ACTIONS
  const handleQuickAction = (action: string) => {
    if (action === 'File Report') {
      // Start local Q&A form flow, no API
      setIsFileReportActive(true);
      setFileReportData({ name: '', age: '', email: '' });
      setFileReportStep(0);

      const userMessage: Message = {
        id: Date.now().toString(),
        text: 'File Report initiated',
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const aiQuestion: Message = {
        id: (Date.now() + 1).toString(),
        text: FILE_REPORT_QUESTIONS[0], // first question: name
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, userMessage, aiQuestion]);
      return;
    }

    // Placeholder for other actions
    const aiMessage: Message = {
      id: (Date.now() + 5).toString(),
      text: `${action} action is not implemented yet.`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F3] via-[#EEEEEE] to-[#E8E8E8] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#002B5C] via-[#003366] to-[#1B3A5F] border-b-4 border-[#0066CC] py-6 px-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0078D4]/10 to-transparent animate-pulse"></div>
        <div className="max-w-7xl mx-auto flex items-center gap-4 relative z-10">
          <div className="bg-gradient-to-br from-[#0078D4] to-[#00BCD4] p-3 rounded-lg shadow-lg hover:scale-110 transition-transform duration-300">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide font-['Roboto']">
              Cyber AI Assistant
            </h1>
            <p className="text-[#7D9CB7] text-sm mt-1 font-['Lato']">
              24/7 intelligent support for incident response and threat analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main Chat Box */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-6">
        <div
          className="bg-white rounded-lg shadow-2xl border border-[#7D9CB7]/30 overflow-hidden flex flex-col"
          style={{ height: '82vh' }}
        >
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#4A7BA7] scrollbar-track-[#F2F2F3] bg-gradient-to-b from-[#FAFAFA] to-[#F2F2F3]"
          >
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE] border-t-2 border-[#0066CC]/20">
            <h3 className="text-[#2C3E50] text-sm font-bold mb-3 uppercase tracking-wider font-['Roboto']">
              Quick Actions:
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <QuickActionButton
                icon={<FileText className="w-5 h-5" />}
                label="File Report"
                onClick={() => handleQuickAction('File Report')}
              />
              <QuickActionButton
                icon={<Activity className="w-5 h-5" />}
                label="Check Status"
                onClick={() => handleQuickAction('Check Status')}
              />
              <QuickActionButton
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Escalate"
                onClick={() => handleQuickAction('Escalate')}
              />
              <QuickActionButton
                icon={<BookOpen className="w-5 h-5" />}
                label="Playbooks"
                onClick={() => handleQuickAction('Playbooks')}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE]">
            <div className="bg-gradient-to-r from-[#FFC107]/20 to-[#FFD966]/20 border-2 border-[#FFC107] rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200">
              <AlertTriangle className="w-5 h-5 text-[#F26419] animate-pulse" />
              <span className="text-[#333333] font-semibold text-sm font-['Roboto']">
                AI suggestion – verify before applying
              </span>
            </div>
          </div>

          {/* Input Box */}
          <MessageInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onSendFiles={handleSendFiles}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
