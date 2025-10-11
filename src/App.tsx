import { useState, useRef, useEffect } from 'react';
import { Bot, FileText, Activity, AlertTriangle, BookOpen, Send, Shield } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import QuickActionButton from './components/QuickActionButton';
import MessageInput from './components/MessageInput';
import Footer from './components/Footer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Cyber AI Assistant, your 24/7 cybersecurity support system.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Your inquiry has been logged. I can provide immediate guidance on defensive measures. What specific aspect would you like to explore?',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      text: action,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, actionMessage]);

    setTimeout(() => {
      let responseText = '';
      switch(action) {
        case 'File Report':
          responseText = 'I can help you file an incident report. Please provide details about the security incident you want to report.';
          break;
        case 'Check Status':
          responseText = 'Checking current incident status... All systems are operational. No active critical incidents at this time.';
          break;
        case 'Escalate':
          responseText = 'Initiating escalation protocol. A senior analyst will be notified immediately. Can you provide the incident ID or describe the critical issue?';
          break;
        case 'Playbooks':
          responseText = 'Available security playbooks: 1) Malware Response 2) Phishing Investigation 3) Data Breach Protocol 4) DDoS Mitigation 5) Insider Threat Response. Which would you like to review?';
          break;
        default:
          responseText = 'How can I assist you further?';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
            <h1 className="text-3xl font-bold text-white tracking-wide font-['Roboto']" style={{ letterSpacing: '0.5px' }}>Cyber AI Assistant</h1>
            <p className="text-[#7D9CB7] text-sm mt-1 font-['Lato']">24/7 intelligent support for incident response and threat analysis</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-6">
        <div className="bg-white rounded-lg shadow-2xl border border-[#7D9CB7]/30 overflow-hidden flex flex-col" style={{ height: '82vh' }}>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#4A7BA7] scrollbar-track-[#F2F2F3] bg-gradient-to-b from-[#FAFAFA] to-[#F2F2F3]">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions Section */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE] border-t-2 border-[#0066CC]/20">
            <h3 className="text-[#2C3E50] text-sm font-bold mb-3 uppercase tracking-wider font-['Roboto']">Quick Actions:</h3>
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

          {/* AI Warning Banner */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#F2F2F3] to-[#EEEEEE]">
            <div className="bg-gradient-to-r from-[#FFC107]/20 to-[#FFD966]/20 border-2 border-[#FFC107] rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200">
              <AlertTriangle className="w-5 h-5 text-[#F26419] animate-pulse" />
              <span className="text-[#333333] font-semibold text-sm font-['Roboto']">AI suggestion – verify before applying</span>
            </div>
          </div>

          {/* Message Input */}
          <MessageInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
