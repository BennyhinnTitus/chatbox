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
  sender: "user" | "ai";
  timestamp: string;
  attachments?: Attachment[];
}

// 🔗 CHANGE THIS TO YOUR TUNNEL URL
const OLLAMA_API_URL = 'https://wd5cjm61-11434.inc1.devtunnels.ms/api/chat';

// 🔁 MODEL NAME
const OLLAMA_MODEL_NAME = 'phi3';

// 🤝 Small compliments between questions
const PRAISE_MESSAGES = ['Great, thank you!', 'Excellent.', 'Got it.', 'Perfect, thanks.', 'Nice.'];

// 🧾 All report fields (except evidence)
type FileReportFieldKey =
  | 'name'
  | 'role'
  | 'department'
  | 'location'
  | 'complaintType'
  | 'incidentDate'
  | 'incidentTime'
  | 'description'
  | 'suspectedSource';

interface FileReportField {
  key: FileReportFieldKey;
  question: string;
  min?: number;
  max?: number;
  required?: boolean;
}

const FILE_REPORT_FIELDS: FileReportField[] = [
  // 1. Personal details
  { key: 'name',          question: 'What is your full name?',              min: 3,  max: 50,  required: true },
  {
    key: 'role',
    question: 'Select your role:',
    min: 5,
    max: 40,
    required: true
  },
  { key: 'department',    question: 'Enter your Department / Unit:',         min: 2,  max: 50,  required: true },
  { key: 'location',      question: 'Enter your Location / Station:',        min: 2,  max: 50,  required: true },

  // 2. Incident details
  { key: 'complaintType', question: 'What is the complaint type?',           min: 3,  max: 50,  required: true },
  { key: 'incidentDate',  question: 'Select the incident date:',             min: 8,  max: 10,  required: true },
  { key: 'incidentTime',  question: 'Select the incident time:',             min: 4,  max: 5,   required: true },
  { key: 'description',   question: 'Describe the incident in detail:',      min: 20, max: 500, required: true },
  { key: 'suspectedSource', question: 'Who or what is the suspected source? (you can write "unknown")', min: 3, max: 100, required: true }
];

interface FileReportData {
  name: string;
  role: string;
  department: string;
  location: string;
  complaintType: string;
  incidentDate: string;
  incidentTime: string;
  description: string;
  suspectedSource: string;
  evidence: { name: string; size: number }[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
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
  const [fileReportStep, setFileReportStep] = useState(0);
  const [isEvidenceStep, setIsEvidenceStep] = useState(false);

  const [fileReportData, setFileReportData] = useState<FileReportData>({
    name: '',
    role: '',
    department: '',
    location: '',
    complaintType: '',
    incidentDate: '',
    incidentTime: '',
    description: '',
    suspectedSource: '',
    evidence: []
  });

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

  // 🔊 Helper: add an AI message
  const pushAiMessage = (text: string) => {
    const msg: Message = {
      id: (Date.now() + Math.random()).toString(),
      text,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages(prev => [...prev, msg]);
  };

  // 📎 Handle image/file sending
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
        text: attachment.type === 'image' ? '📷 Evidence image' : `📎 Evidence file: ${attachment.name}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        attachments: [attachment]
      };

      newMessages.push(msg);

      // If we are in evidence step, also store in report data
      if (isFileReportActive && isEvidenceStep) {
        setFileReportData(prev => ({
          ...prev,
          evidence: [...prev.evidence, { name: file.name, size: file.size }]
        }));
      }
    });

    setMessages(prev => [...prev, ...newMessages]);
  };

  // 🧩 Process one answer in File Report flow (used by text input + quick controls)
  const processFileReportAnswer = (userText: string) => {
    // 3️⃣ Evidence step
    if (isEvidenceStep) {
      if (userText.toLowerCase() !== 'done') {
        pushAiMessage('Please upload any evidence using the attachment button. When finished, type "done".');
        return;
      }

      // ✅ Finish report – output ALL info as a single FLAT JSON object
      setIsFileReportActive(false);
      setIsEvidenceStep(false);
      setFileReportStep(0);

      const finalPayload = {
        name: fileReportData.name,
        role: fileReportData.role,
        department: fileReportData.department,
        location: fileReportData.location,
        complaintType: fileReportData.complaintType,
        incidentDate: fileReportData.incidentDate,
        incidentTime: fileReportData.incidentTime,
        description: fileReportData.description,
        suspectedSource: fileReportData.suspectedSource,
        evidence: fileReportData.evidence // [{ name, size }]
      };

      const finalJson = JSON.stringify(finalPayload, null, 2);

      // ❗Only ONE final JSON message, no extra text
      pushAiMessage(finalJson);
      return;
    }

    // 1️⃣ + 2️⃣ Question/answer steps
    const field = FILE_REPORT_FIELDS[fileReportStep];
    if (!field) {
      // safety fallback: start evidence step
      setIsEvidenceStep(true);
      pushAiMessage(
        'Now please upload any evidence files (images/documents) using the attachment button. When finished, type "done".'
      );
      return;
    }

    const len = userText.length;
    if (field.min && len < field.min) {
      pushAiMessage(`That seems too short. Please provide at least ${field.min} characters.`);
      return;
    }
    if (field.max && len > field.max) {
      pushAiMessage(`That seems too long. Please keep it under ${field.max} characters.`);
      return;
    }

    // Specific validation for date/time (still useful if user types manually)
    if (field.key === 'incidentDate') {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(userText)) {
        pushAiMessage('Please use date format YYYY-MM-DD.');
        return;
      }
    }
    if (field.key === 'incidentTime') {
      const timePattern = /^\d{2}:\d{2}$/;
      if (!timePattern.test(userText)) {
        pushAiMessage('Please use time format HH:MM in 24-hour format.');
        return;
      }
    }

    // Save answer
    setFileReportData(prev => ({
      ...prev,
      [field.key]: userText
    }));

    // Praise message
    if (field.key === 'name') {
      pushAiMessage(`Nice to meet you, ${userText}.`);
    } else {
      const praise = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
      pushAiMessage(praise);
    }

    // Next step or move to evidence
    const nextIndex = fileReportStep + 1;
    if (nextIndex < FILE_REPORT_FIELDS.length) {
      setFileReportStep(nextIndex);
      const nextField = FILE_REPORT_FIELDS[nextIndex];
      pushAiMessage(nextField.question);
    } else {
      // Switch to evidence step
      setIsEvidenceStep(true);
      pushAiMessage(
        'Now please upload any evidence files (images/documents) using the attachment or image buttons. When you are done, type "done".'
      );
    }
  };

  // ⚡ Quick answers from dropdown / date / time controls inside chat
  const handleFileReportQuickAnswer = (answer: string) => {
    if (!isFileReportActive) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: answer,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, userMessage]);
    processFileReportAnswer(answer);
  };

  // ⭐ USER SEND MESSAGE (normal chat + File Report flow)
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userText = inputValue.trim();
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

    // 🧩 FILE REPORT FLOW
    if (isFileReportActive) {
      processFileReportAnswer(userText);
      return;
    }

    // 🌍 NORMAL CHAT → Ollama
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
      // Start file report flow
      setIsFileReportActive(true);
      setIsEvidenceStep(false);
      setFileReportStep(0);
      setFileReportData({
        name: '',
        role: '',
        department: '',
        location: '',
        complaintType: '',
        incidentDate: '',
        incidentTime: '',
        description: '',
        suspectedSource: '',
        evidence: []
      });

      const userMessage: Message = {
        id: Date.now().toString(),
        text: 'File Report initiated',
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, userMessage]);

      // First question
      const firstField = FILE_REPORT_FIELDS[0];
      pushAiMessage(firstField.question);
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

  const currentFieldKey: FileReportFieldKey | undefined =
    isFileReportActive && !isEvidenceStep
      ? FILE_REPORT_FIELDS[fileReportStep]?.key
      : undefined;

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
              <ChatMessage
                key={message.id}
                message={message}
                showRoleDropdown={
                  isFileReportActive &&
                  !isEvidenceStep &&
                  currentFieldKey === 'role' &&
                  message.sender === 'ai' &&
                  message.text.startsWith('Select your role')
                }
                showDatePicker={
                  isFileReportActive &&
                  !isEvidenceStep &&
                  currentFieldKey === 'incidentDate' &&
                  message.sender === 'ai'
                }
                showTimePicker={
                  isFileReportActive &&
                  !isEvidenceStep &&
                  currentFieldKey === 'incidentTime' &&
                  message.sender === 'ai'
                }
                onQuickAnswer={handleFileReportQuickAnswer}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE] border-t-2 border-[#0066CC]/20">
            <h3 className="text-[#2C3E50] text-sm font-bold mb-3 uppercase tracking-wider font-['Roboto']">
              Quick Actions:
            </h3>
            <h3 className="text-[#2C3E50] text-sm font-bold mb-3 uppercase tracking-wider font-['Roboto']">
              Quick Actions:
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <QuickActionButton
                icon={<FileText className="w-5 h-5" />}
                label="File Report"
                onClick={() => handleQuickAction("File Report")}
              />
              <QuickActionButton
                icon={<Activity className="w-5 h-5" />}
                label="Check Status"
                onClick={() => handleQuickAction("Check Status")}
              />
              <QuickActionButton
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Escalate"
                onClick={() => handleQuickAction("Escalate")}
              />
              <QuickActionButton
                icon={<BookOpen className="w-5 h-5" />}
                label="Playbooks"
                onClick={() => handleQuickAction("Playbooks")}
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
