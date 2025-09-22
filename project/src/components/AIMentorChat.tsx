import React, { useRef, useState, useEffect } from 'react';
import { Send, Mic, Paperclip, Bot, Award, ExternalLink, Star, Clock, CheckCircle } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

type MentorMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | { type: 'list' | 'text' | 'table' | 'structured'; data: any };
  createdAt: number;
  confidence?: number;
  sources?: Array<{ docId: string; snippet: string }>;
  actions?: Array<{ type: string; skill?: string; why?: string; learn_link?: string }>;
  badges?: string[];
};

type MentorResponse = {
  success: boolean;
  reply_text: string;
  bullets: string[];
  confidence: number;
  sources: Array<{ docId: string; snippet: string }>;
  actions: Array<{ type: string; skill?: string; why?: string; learn_link?: string }>;
  badges: string[];
  intent?: string;
  processingTime?: number;
};

const QuickChips = ({ onClick }: { onClick: (text: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {[
      'Analyze my resume', 
      'What skills should I learn?', 
      'Run a coding challenge', 
      'Interview preparation tips',
      'Career path guidance',
      'Job market insights'
    ].map((q) => (
      <button
        key={q}
        onClick={() => onClick(q)}
        className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
      >
        {q}
      </button>
    ))}
  </div>
);

const BadgeModal: React.FC<{ open: boolean; onClose: () => void; name: string }>=({ open, onClose, name })=>{
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-2xl text-center">
        <div className="mx-auto mb-6 w-28 h-28 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 shadow-lg flex items-center justify-center">
          <Award className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked</h3>
        <p className="text-gray-700 mb-6">You earned the <span className="font-semibold">{name}</span> badge!</p>
        <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg transition">
          Great!
        </button>
      </div>
    </div>
  );
};

const AIMentorChat: React.FC = () => {
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'm0',
      role: 'assistant',
      content: "Hi! 👋 I'm your AI Career Mentor. I can help you with resume analysis, skill recommendations, coding challenges, interview prep, and career guidance. What would you like to explore?",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
  const [resumeText, setResumeText] = useState<string>('');
  const [fileAnalysis, setFileAnalysis] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [mongoConnected, setMongoConnected] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState('unknown');
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('New Chat');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  // Test server and MongoDB connections on mount
  useEffect(() => {
    testServerConnection();
    testMongoConnection();
    // Load conversation history on mount
    loadConversationHistory();
  }, []);

  // Function to start a new chat
  const startNewChat = () => {
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Reset messages to initial state
    setMessages([
      {
        id: 'm0',
        role: 'assistant',
        content: "Hi! 👋 I'm your AI Career Mentor. I can help you with resume analysis, skill recommendations, coding challenges, interview prep, and career guidance. What would you like to explore?",
        createdAt: Date.now(),
      },
    ]);
    
    // Reset other states
    setResumeText('');
    setFileAnalysis(null);
    setCurrentSessionTitle('New Chat');
    
    // Refresh conversation history to show the new session
    loadConversationHistory();
    
    console.log('Started new chat with session ID:', newSessionId);
  };

  // Function to load a specific conversation
  const loadConversation = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/conversation-history/${userId}?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.conversations.length > 0) {
          const conversation = data.conversations[0];
          setSessionId(sessionId);
          
          // Convert conversation messages to MentorMessage format
          const loadedMessages = conversation.messages.map((msg: any, index: number): MentorMessage => ({
            id: `loaded_${index}`,
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.timestamp).getTime(),
            confidence: msg.metadata?.confidence,
            sources: msg.metadata?.sources || [],
            actions: msg.metadata?.actions || [],
            badges: msg.metadata?.badges || []
          }));
          
          setMessages(loadedMessages);
          
          // Set session title based on first user message
          const firstUserMessage = loadedMessages.find((msg: MentorMessage) => msg.role === 'user');
          if (firstUserMessage && typeof firstUserMessage.content === 'string') {
            const title = firstUserMessage.content.length > 30 
              ? firstUserMessage.content.substring(0, 30) + '...' 
              : firstUserMessage.content;
            setCurrentSessionTitle(title);
          } else {
            setCurrentSessionTitle(`Session ${conversation.sessionId}`);
          }
          
          // Hide history panel
          setShowHistory(false);
          
          console.log('Loaded conversation:', sessionId);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const callMentorAPI = async (message: string): Promise<MentorResponse> => {
    try {
      const response = await fetch(`${API_BASE}/mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          message,
          resumeText: resumeText || undefined,
          fileAnalysis: fileAnalysis || undefined,
          userProfile: {
            name: 'Alex',
            role: 'student',
            preferences: { ephemeral: false }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mentor API call failed:', error);
      throw error;
    }
  };

  // Load conversation history
  const loadConversationHistory = async () => {
    try {
      setLoadingHistory(true);
      console.log('Loading conversation history for user:', userId);
      const response = await fetch(`${API_BASE}/conversation-history/${userId}`);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        // If no conversations exist yet, show empty state
        setConversationHistory([]);
        return;
      }
      
      const data = await response.json();
      console.log('Conversation history response:', data);
      
      if (data.success) {
        setConversationHistory(data.conversations || []);
      } else {
        console.error('API returned error:', data.error);
        setConversationHistory([]);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      // Show empty state on error
      setConversationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-conversation-history`);
      const data = await response.json();
      console.log('Server test response:', data);
      const connected = data.success;
      setServerConnected(connected);
      return connected;
    } catch (error) {
      console.error('Server connection test failed:', error);
      setServerConnected(false);
      return false;
    }
  };

  // Test MongoDB connection
  const testMongoConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/mongo-status`);
      const data = await response.json();
      console.log('MongoDB status response:', data);
      setMongoConnected(data.mongoConnected);
      setPersistenceMode(data.persistenceMode);
      return data.mongoConnected;
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      setMongoConnected(false);
      setPersistenceMode('error');
      return false;
    }
  };

  // Search conversations
  const searchConversations = async (query: string) => {
    try {
      const response = await fetch(`${API_BASE}/search-conversations/${userId}?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setConversationHistory(data.results);
      }
    } catch (error) {
      console.error('Failed to search conversations:', error);
    }
  };

  // Enhanced file analysis
  const analyzeFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysisType', 'comprehensive');

      const response = await fetch(`${API_BASE}/analyze-file`, {
        method: 'POST',
        headers: {
          'x-user-id': userId
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setFileAnalysis(data.analysis);
        return data.analysis;
      }
    } catch (error) {
      console.error('File analysis failed:', error);
    }
    return null;
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    
    const userMsg: MentorMessage = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content, 
      createdAt: Date.now() 
    };
    setMessages((m) => [...m, userMsg]);
    
    // Update session title if this is the first user message
    if (messages.length === 1) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      setCurrentSessionTitle(title);
    }
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await callMentorAPI(content);
      
      const assistantMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: {
          type: 'structured',
          data: {
            reply_text: response.reply_text,
            bullets: response.bullets,
            confidence: response.confidence,
            sources: response.sources,
            actions: response.actions,
            badges: response.badges,
            intent: response.intent,
            processingTime: response.processingTime
          }
        },
        createdAt: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        actions: response.actions,
        badges: response.badges
      };
      
      setMessages((m) => [...m, assistantMsg]);
      
      // Show badge if earned
      if (response.badges && response.badges.length > 0) {
        setTimeout(() => {
          setShowBadge({ open: true, name: response.badges[0] });
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to get mentor response:', error);
      const errorMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again or check your connection.",
        createdAt: Date.now(),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (msg: MentorMessage) => {
    if (typeof msg.content === 'string') return <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>;
    
    if (msg.content.type === 'structured') {
      const { reply_text, bullets, confidence, sources, actions, badges, intent, processingTime } = msg.content.data;
      
      return (
        <div className="space-y-4">
          {/* Main response */}
          <div className="whitespace-pre-wrap leading-relaxed">{reply_text}</div>
          
          {/* Bullets */}
          {bullets && bullets.length > 0 && (
            <div>
              <ul className="list-disc ml-5 space-y-1">
                {bullets.map((bullet: string, i: number) => (
                  <li key={i} className="text-sm">{bullet}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-sm text-gray-700">Suggested Actions:</div>
              {actions.map((action: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.skill || action.type}</div>
                    {action.why && <div className="text-xs text-gray-600">{action.why}</div>}
                  </div>
                  {action.learn_link && (
                    <a 
                      href={action.learn_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-sm text-gray-700">Sources:</div>
              {sources.map((source: any, i: number) => (
                <div key={i} className="p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="font-medium">{source.docId}</div>
                  <div className="text-gray-600 mt-1">{source.snippet}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge: string, i: number) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  <Award className="w-3 h-3" />
                  {badge}
                </div>
              ))}
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            {confidence && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Confidence: {confidence}%
              </div>
            )}
            {processingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {processingTime}ms
              </div>
            )}
            {intent && (
              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {intent.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (msg.content.type === 'list') {
      const { title, items } = msg.content.data;
      return (
        <div>
          {title && <div className="font-semibold mb-2">{title}</div>}
          <ul className="list-disc ml-5 space-y-1">
            {items.map((it: string, i: number) => (<li key={i}>{it}</li>))}
          </ul>
        </div>
      );
    }
    if (msg.content.type === 'table') {
      const { headers, rows } = msg.content.data;
      return (
        <div className="overflow-x-auto">
          <table className="min-w-[300px] text-sm">
            <thead>
              <tr>
                {headers.map((h: string) => (
                  <th key={h} className="text-left px-3 py-2 bg-gray-100 border border-gray-200 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: string[], i: number) => (
                <tr key={i}>
                  {r.map((c: string, j: number) => (
                    <td key={j} className="px-3 py-2 border border-gray-200">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File) => {
    const uploadMsg: MentorMessage = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: `Uploaded file: ${file.name}`, 
      createdAt: Date.now() 
    };
    setMessages((m) => [...m, uploadMsg]);
    
    // Show loading message
    const loadingMsg: MentorMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Analyzing ${file.name}... This may take a moment for deeper insights.`,
      createdAt: Date.now()
    };
    setMessages((m) => [...m, loadingMsg]);
    
    try {
      // Perform enhanced file analysis
      const analysis = await analyzeFile(file);
      
      if (analysis) {
        // Create analysis summary message
        const analysisMsg: MentorMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: {
            type: 'structured',
            data: {
              reply_text: `I've completed a comprehensive analysis of your ${file.name}. Here are the key insights:`,
              bullets: [
                `Document Type: ${analysis.document_type || analysis.file_purpose || 'Professional Document'}`,
                `Key Skills Found: ${(analysis.key_skills || analysis.skills_demonstrated || []).join(', ') || 'Various professional skills'}`,
                `Experience Level: ${analysis.experience_level || 'Professional'}`,
                `Confidence Score: ${analysis.confidence_score || 85}%`
              ],
              confidence: analysis.confidence_score || 85,
              sources: [],
              actions: [
                {
                  type: 'suggest_skill',
                  skill: 'File Analysis Complete',
                  why: 'Your document has been thoroughly analyzed',
                  learn_link: '#'
                }
              ],
              badges: analysis.enhanced ? ['Deep Analysis'] : [],
              intent: 'file_analysis',
              processingTime: 2000
            }
          },
          createdAt: Date.now(),
          confidence: analysis.confidence_score || 85,
          sources: [],
          actions: [],
          badges: analysis.enhanced ? ['Deep Analysis'] : []
        };
        
        // Replace loading message with analysis
        setMessages((m) => m.slice(0, -1).concat(analysisMsg));
        
        // If it's a resume, also set resume text for future context
        if (file.name.toLowerCase().includes('resume') || analysis.document_type === 'resume') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setResumeText(text);
          };
          reader.readAsText(file);
        }
      } else {
        // Fallback for failed analysis
        const errorMsg: MentorMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I had trouble analyzing that file. Please try uploading a PDF, Word document, or text file for better results.",
          createdAt: Date.now()
        };
        setMessages((m) => m.slice(0, -1).concat(errorMsg));
      }
    } catch (error) {
      console.error('File analysis failed:', error);
      const errorMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Sorry, I encountered an error analyzing your file. Please try again with a different file format.",
        createdAt: Date.now()
      };
      setMessages((m) => m.slice(0, -1).concat(errorMsg));
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">AI Mentor</div>
            <div className="text-xs text-gray-500">{currentSessionTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center gap-1"
            title="Start a new chat (current chat will be saved)"
          >
            <span className="text-xs">+</span> New Chat
          </button>
          <button
            onClick={async () => {
              setShowHistory(!showHistory);
              if (!showHistory) {
                // Test server connection first
                const serverOk = await testServerConnection();
                if (serverOk) {
                  loadConversationHistory();
                } else {
                  console.error('Server connection failed');
                  setConversationHistory([]);
                }
              }
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
          <button
            onClick={testMongoConnection}
            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            title="Test MongoDB Connection"
          >
            Test DB
          </button>
          <div className="flex flex-col text-xs">
            <div className={`${serverConnected ? 'text-green-500' : 'text-red-500'}`}>
              Server: {serverConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className={`${mongoConnected ? 'text-green-500' : 'text-orange-500'}`}>
              DB: {mongoConnected ? 'MongoDB' : persistenceMode}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation History Panel */}
      {showHistory && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={() => searchQuery ? searchConversations(searchQuery) : loadConversationHistory()}
              disabled={loadingHistory}
              className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loadingHistory ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                searchQuery ? 'Search' : 'Refresh'
              )}
            </button>
          </div>
          
          <div className="space-y-2">
            {loadingHistory ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                <div className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading conversation history...
              </div>
            ) : conversationHistory.length > 0 ? (
              conversationHistory.map((conv, index) => {
                // Get the first user message as the conversation title
                const firstUserMessage = conv.messages?.find((msg: any) => msg.role === 'user');
                const conversationTitle = firstUserMessage?.content 
                  ? (firstUserMessage.content.length > 40 
                      ? firstUserMessage.content.substring(0, 40) + '...' 
                      : firstUserMessage.content)
                  : `Session ${index + 1}`;
                
                return (
                  <div 
                    key={conv.sessionId || index} 
                    onClick={() => loadConversation(conv.sessionId)}
                    className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                        {conversationTitle}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(conv.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {conv.totalMessages || conv.matchingMessages?.length || 0} messages
                    </div>
                    {conv.matchingMessages && conv.matchingMessages.length > 0 && (
                      <div className="text-xs text-purple-600">
                        Found {conv.matchingMessages.length} matching messages
                      </div>
                    )}
                    {/* Show a preview of the conversation */}
                    {conv.messages && conv.messages.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {conv.messages[0]?.content?.substring(0, 60)}
                        {conv.messages[0]?.content?.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                {searchQuery ? 'No conversations found matching your search.' : 'No conversation history available. Start chatting to create your first conversation!'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 border ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200'}`}>
              {renderContent(msg)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 space-y-3">
        <QuickChips onClick={(t) => handleSend(t)} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg border border-gray-300 hover:border-purple-400 text-gray-600"
            title="Upload resume"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt,.rtf"
            onChange={(e)=>{ const f = e.target.files?.[0]; if (f) handleUpload(f); }} 
          />
          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={()=>handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
          <button className="p-2 rounded-lg border border-gray-300 text-gray-600" title="Voice (coming soon)">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BadgeModal open={showBadge.open} onClose={()=>setShowBadge({ open:false, name:'' })} name={showBadge.name} />
    </div>
  );
};

export default AIMentorChat;


