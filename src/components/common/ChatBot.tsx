import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Send, Bot, Sparkles, LifeBuoy, BookOpen, CheckCircle, Clock, Star, Square,
  Mic, MicOff, Copy, Check, Minimize2, Maximize2, Volume2, VolumeX,
  ThumbsUp, ThumbsDown, WifiOff, Search, Download, ChevronDown, ChevronUp,
  Settings, Trash2, HelpCircle, Keyboard, Globe
} from 'lucide-react';
import { supabasePublic as supabase } from '@/db/publicSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { sendStreamRequest } from '@/lib/sse';
import { Streamdown } from 'streamdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  articles?: any[];
}

interface EscalationStatus {
  id: string;
  status: string;
  sla_status: string;
  priority: string;
  created_at: string;
  first_response_at: string | null;
}

// Generate or retrieve a persistent chat session UUID for this browser
function getChatSessionToken(): string {
  const key = 'vts_chat_session_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
};

const SLA_COLORS: Record<string, string> = {
  'Within SLA': 'text-green-600',
  'Approaching SLA': 'text-yellow-600',
  'SLA Breached': 'text-red-600',
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm **VedBot**, your AI IT Support Assistant for VedTech Services. 👋\n\nI can help you with:\n- 🛠️ Services & pricing\n- 📋 AMC plans\n- 🎫 Raising a support ticket\n- 📞 Contact & office details\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [suggestedArticles, setSuggestedArticles] = useState<any[]>([]);
  const [escalationStatus, setEscalationStatus] = useState<EscalationStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [resolvedEscalationId, setResolvedEscalationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [proactiveEnabled, setProactiveEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('vts_chat_sound') !== 'off');
    setProactiveEnabled(localStorage.getItem('vts_chat_proactive') !== 'off');
    setVoiceLang(localStorage.getItem('vts_chat_voice_lang') || 'en-IN');
  }, []);

  const logMetric = async (articleId: string, metric: 'suggested' | 'read' | 'resolved' | 'escalated') => {
    try {
      await (supabase.rpc as any)('increment_article_metric', {
        article_id: articleId,
        metric_name: metric
      });
    } catch (err) {
      console.error('Failed to log metric:', err);
    }
  };

  // Load persisted conversation from Supabase when chat opens
  const loadSession = useCallback(async () => {
    if (isHistoryLoaded) return;
    const token = getChatSessionToken();
    try {
      const response = await fetch(`/api/chat/session?token=${encodeURIComponent(token)}`);
      const data = response.ok ? await response.json() : null;
      if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        const restored: Message[] = (data.messages as any[]).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      }
    } catch (err) {
      console.error('Failed to load chat session:', err);
    } finally {
      setIsHistoryLoaded(true);
    }
  }, [isHistoryLoaded]);

  // Persist conversation to Supabase (debounced via useEffect)
  const saveSession = useCallback(async (msgs: Message[]) => {
    const token = getChatSessionToken();
    try {
      await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, messages: msgs }),
      });
    } catch (err) {
      console.error('Failed to save chat session:', err);
    }
  }, []);

  const submitRating = async (stars: number) => {
    setIsSubmittingRating(true);
    try {
      const sessionToken = getChatSessionToken();
      await (supabase.from('chatbot_ratings') as any).insert({
        session_token: sessionToken,
        escalation_id: resolvedEscalationId || null,
        rating: stars,
      });
      setRatingValue(stars);
      setRatingSubmitted(true);
    } catch (err) {
      console.error('Failed to submit rating:', err);
      // Still mark submitted so UI progresses
      setRatingSubmitted(true);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Auto-dismiss rating panel after 60s if not interacted with
  useEffect(() => {
    if (!showRating || ratingSubmitted) return;
    const timer = setTimeout(() => setShowRating(false), 60000);
    return () => clearTimeout(timer);
  }, [showRating, ratingSubmitted]);

  // Fetch escalation status using the secure RPC (no direct table access needed)
  const checkEscalationStatus = useCallback(async () => {
    const sessionToken = getChatSessionToken();
    setIsCheckingStatus(true);
    try {
      const { data, error } = await (supabase.rpc as any)('get_customer_escalation', {
        p_session_token: sessionToken
      });
      if (!error && data && data.length > 0) {
        setEscalationStatus(data[0]);
      }
    } catch (err) {
      console.error('Status check failed:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // Subscribe to Realtime updates for this session's escalation row
  useEffect(() => {
    const sessionToken = getChatSessionToken();

    // Only subscribe when the widget is open and a token exists
    if (!isOpen) return;

    // Initial fetch
    checkEscalationStatus();

    // Realtime channel — listen to all changes on this session's row
    const channel = supabase
      .channel(`customer-escalation-${sessionToken}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbot_escalations',
          filter: `session_token=eq.${sessionToken}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setEscalationStatus(null);
            return;
          }
          const row = payload.new as EscalationStatus;
          // Inject a celebratory bot message the moment status flips to resolved
          if (row.status === 'resolved') {
            setMessages(prev => [
              ...prev,
              {
                id: `resolved-${Date.now()}`,
                text: "✅ Great news! Your support request has been marked as **resolved** by our team. If the issue persists or you need further help, feel free to ask me or raise a new request. Have a great day! 😊",
                sender: 'bot',
                timestamp: new Date()
              }
            ]);
            // Store escalation id so rating can be linked, then show rating prompt
            setResolvedEscalationId(row.id);
            setShowRating(true);
            setRatingSubmitted(false);
            setRatingValue(0);
            // Clear the status panel — ticket is done
            setEscalationStatus(null);
            return;
          }
          setEscalationStatus(row);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, checkEscalationStatus]);

  const escalateToAdmin = async () => {
    setIsEscalating(true);
    try {
      if (suggestedArticles.length > 0) {
        await Promise.all(suggestedArticles.map(art => logMetric(art.id, 'escalated')));
      }

      const sessionToken = getChatSessionToken();
      const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')?.text || 'Requested Human Assistance';

      const { error } = await (supabase
        .from('chatbot_escalations') as any)
        .insert({
          customer_name: 'Website Guest',
          customer_identifier: localStorage.getItem('vts_customer_id') || 'guest-' + Date.now().toString().slice(-4),
          session_token: sessionToken,
          message: lastUserMessage,
          messages: messages
        });

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I've notified our support team. A human expert will respond shortly! Your request status will update automatically below. 👨‍💻",
        sender: 'bot',
        timestamp: new Date()
      }]);
      setSuggestedArticles([]);
    } catch (err) {
      console.error('Escalation failed:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  // Suggested Actions
  const suggestions = [
    "Our Services",
    "AMC Plans",
    "Raise a Ticket",
    "Contact Details",
    "Office Locations",
    "Get a Quote",
  ];

  // Play notification sound when bot responds
  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 587.33; // D5
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext not supported — silently fail
    }
  }, [soundEnabled]);

  // Offline detection
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Voice input via Web Speech API
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "🎤 Voice input is not supported in your browser. Please type your message instead.",
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.start();
  };

  // Copy message to clipboard
  const copyMessage = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  // Message feedback (thumbs up/down)
  const submitFeedback = async (msgId: string, type: 'up' | 'down') => {
    setMessageFeedback(prev => ({ ...prev, [msgId]: type }));
    try {
      await (supabase.from('chatbot_feedback') as any).insert({
        session_token: getChatSessionToken(),
        message_id: msgId,
        feedback: type,
      });
    } catch {
      // silently fail
    }
  };

  // Export chat as text file
  const exportChat = () => {
    const lines = messages.map(m => {
      const time = new Date(m.timestamp).toLocaleString('en-IN');
      const sender = m.sender === 'user' ? 'You' : 'VedBot';
      return `[${time}] ${sender}: ${m.text}`;
    }).join('\n\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vedbot-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear chat history
  const clearChat = async () => {
    setMessages([{
      id: '1',
      text: "Hello! I'm **VedBot**, your AI IT Support Assistant for VedTech Services. 👋\n\nI can help you with:\n- 🛠️ Services & pricing\n- 📋 AMC plans\n- 🎫 Raising a support ticket\n- 📞 Contact & office details\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setSuggestedArticles([]);
    setEscalationStatus(null);
    setShowRating(false);
    setMessageFeedback({});
    try {
      const token = getChatSessionToken();
      await fetch(`/api/chat/session?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
    } catch {
      // silently fail
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isMinimized) setIsMinimized(false);
        else setIsOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen && input.trim()) {
        e.preventDefault();
        handleSend();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isOpen) {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isMinimized, input]);

  // Auto-open with proactive message for first-time visitors
  useEffect(() => {
    if (!proactiveEnabled) return;
    const hasVisited = sessionStorage.getItem('vts_chat_seen');
    if (hasVisited) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      setMessages(prev => [
        ...prev,
        {
          id: `proactive-${Date.now()}`,
          text: "👋 Hi there! I see you're exploring VedTech Services. Have questions about our IT solutions, AMC plans, or need a quick quote? Ask me anything!",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      sessionStorage.setItem('vts_chat_seen', 'true');
    }, 12000);
    return () => clearTimeout(timer);
  }, [proactiveEnabled]);

  // Unread counter when chat is closed
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    } else {
      const lastBotMsg = [...messages].reverse().find(m => m.sender === 'bot');
      if (lastBotMsg && !isTyping && !isStreaming) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen]);

  // Play sound on new bot message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'bot' && !isTyping && !isStreaming && isOpen) {
      playSound();
    }
  }, [messages, isTyping, isStreaming, isOpen, playSound]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    document.addEventListener('open-chatbot', handleOpenChat);
    return () => document.removeEventListener('open-chatbot', handleOpenChat);
  }, []);

  // Load session history when chat widget opens for the first time
  useEffect(() => {
    if (isOpen && !isHistoryLoaded) {
      loadSession();
    }
  }, [isOpen, isHistoryLoaded, loadSession]);

  // Persist messages to Supabase whenever they change (skip default welcome-only state)
  useEffect(() => {
    if (!isHistoryLoaded) return;
    if (messages.length <= 1) return; // don't persist just the greeting
    const timer = setTimeout(() => saveSession(messages), 800);
    return () => clearTimeout(timer);
  }, [messages, isHistoryLoaded, saveSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // On open, check if this browser already has an escalation in progress
  // (Realtime subscription above handles live updates; this is the initial load fallback)

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  // Local keyword-based fallback — answers instantly without hitting AI gateway
  const getLocalResponse = (text: string): string | null => {
    const t = text.toLowerCase().trim();

    if (/^(hi|hello|hey|namaste|good\s*(morning|afternoon|evening)|howdy|greetings)/.test(t)) {
      return "Hello! 👋 Welcome to **VedTech Services**!\n\nI'm VedBot, your AI IT Support Assistant. I can help you with:\n- 🛠️ **Services** — hardware, software, networking, cloud\n- 📋 **AMC Plans** — annual maintenance contracts\n- 🎫 **Support Tickets** — raise & track issues\n- 📞 **Contact Details** — phone, email, office locations\n- 💰 **Get a Quote** — pricing & consultations\n\nHow can I help you today?";
    }

    if (/service|what do you (do|offer)|what can (vedtech|you)|solutions|capabilities/.test(t)) {
      return "## VedTech Services — What We Offer 🛠️\n\n1. **Hardware Repair & Maintenance** — Laptops, desktops, servers, printers\n2. **Custom Software Development** — Web apps, mobile apps, ERP, CRM\n3. **Networking Solutions** — LAN/WAN, Wi-Fi, firewall, VPN\n4. **AMC Plans** — Basic, Standard, Enterprise annual contracts\n5. **IT Support & Helpdesk** — Remote & on-site, 4-hour SLA\n6. **Cloud Services** — Migration, backup, DevOps\n7. **Cybersecurity** — Vulnerability assessment, endpoint security\n8. **CCTV & Surveillance** — IP camera installation\n9. **IT Consultancy** — Infrastructure audits, digital transformation\n\n👉 Visit [/services](/services) for full details or ask me about any specific service!";
    }

    if (/amc|annual maintenance|maintenance contract|maintenance plan/.test(t)) {
      return "## AMC Plans — Annual Maintenance Contracts 📋\n\n| Plan | Best For | Support | Response Time |\n|------|----------|---------|---------------|\n| **Basic** | Small businesses | Email | 48 hours |\n| **Standard** | Mid-size companies | Phone + Email + Quarterly visits | 24 hours |\n| **Enterprise** | Large organizations | 24/7 + Dedicated manager + Monthly on-site | **4 hours** |\n\n💡 All plans include proactive monitoring and priority issue resolution.\n\n👉 See full pricing at [/amc-plans](/amc-plans) or call **+91 7858971869** for a custom quote!";
    }

    if (/contact|email|phone|call|reach|whatsapp|address|location|office|where are you/.test(t)) {
      return "## Contact VedTech Services 📞\n\n| Channel | Details |\n|---------|----------|\n| 📧 **Email** | info@vedtechservices.in |\n| 📞 **Phone** | +91 7858971869 |\n| 💬 **WhatsApp** | +91 7858971869 |\n| 🌐 **Website** | vedtechservices.in |\n\n## Office Locations 📍\n- **Gurugram, Haryana** *(Head Office)*\n- **Samastipur, Bihar**\n- **Bhopal, Madhya Pradesh*\n- Pan-India remote support available\n\n🕐 **Hours**: Mon–Sat, 9:00 AM – 7:00 PM IST\n\n👉 [Open Contact Page](/contact)";
    }

    if (/office|location|where|city|branch|gurugram|samastipur|bhopal|headquarter/.test(t)) {
      return "## Our Office Locations 📍\n\n1. **Gurugram, Haryana** — Head Office\n2. **Samastipur, Bihar** — Branch Office\n3. **Bhopal, Madhya Pradesh** — Branch Office\n\n🌐 **Pan-India remote support** available across all cities\n\n📞 **+91 7858971869** | 📧 **info@vedtechservices.in**\n🕐 Mon–Sat, 9 AM – 7 PM IST\n\n👉 [View full contact details](/contact)";
    }

    if (/ticket|raise|issue|complaint|problem|support request|help request/.test(t)) {
      return "## Raise a Support Ticket 🎫\n\nYou can raise a support ticket in 3 ways:\n\n1. 👉 **Online**: Visit [/support](/support) and fill the form\n2. 📞 **Call**: +91 7858971869 (Mon–Sat, 9 AM – 7 PM)\n3. 💬 **Here**: Click **\"Talk to a Human\"** below to escalate directly to our team\n\nFor **Enterprise AMC** clients: 4-hour SLA guaranteed response.\n\nWhat issue are you experiencing? I can help troubleshoot first!";
    }

    if (/quote|pricing|price|cost|how much|rate|estimate|proposal/.test(t)) {
      return "## Get a Quote 💰\n\nWe offer customised pricing for all our services.\n\n**To get a quote:**\n- 📞 Call **+91 7858971869** (quickest)\n- 📧 Email **info@vedtechservices.in**\n- 💬 WhatsApp **+91 7858971869**\n\n**Popular services:**\n- Hardware repair & AMC plans → [/amc-plans](/amc-plans)\n- Custom software development → [/services](/services)\n- IT consultancy & networking → [/contact](/contact)\n\nTell me what you need and I'll point you in the right direction! 🎯";
    }

    if (/team|founder|ceo|who|staff|employee|leadership|chandan|arpit|aasita|muskan|prasun|sundaram/.test(t)) {
      return "## Our Leadership Team 👥\n\n| Name | Role | Email |\n|------|------|-------|\n| **Chandan Kumar Yajee** | Founder & MD | founder@vedtechservices.in |\n| **Arpit Singh Parihar** | Co-founder & CEO | ceo@vedtechservices.in |\n| **Aasita Sarathe** | IT Manager | it.manager@vedtechservices.in |\n| **Muskan Dubey** | HR Manager | hr@vedtechservices.in |\n| **Prasun Prakash** | Testing Engineer | prasun.prakash@vedtechservices.in |\n| **Sundaram Prince** | Software Developer | sundaram.prince@vedtechservices.in |\n\n👉 [Meet the team](/about)";
    }

    if (/about|company|vedtech|history|founded|when|story|background/.test(t)) {
      return "## About VedTech Services 🏢\n\n**VedTech Services** (part of VedArambh initiative) is a premier enterprise IT company in India.\n\n- 📅 **Founded**: 2020\n- 🎯 **Tagline**: *\"One Call – All IT Solutions\"*\n- 🏆 **100+ clients** served across India\n- 📍 **Offices**: Gurugram • Samastipur • Bhopal\n- 🌐 **Coverage**: Pan-India remote support\n\nWe deliver end-to-end IT solutions — from hardware repair to custom software, cloud services, and 24/7 enterprise support.\n\n👉 [Read our full story](/about)";
    }

    if (/hardware|laptop|desktop|printer|server|repair|fix|broken|not working/.test(t)) {
      return "## Hardware Repair & Maintenance 💻\n\nVedTech Services handles all hardware issues:\n\n- **Laptops & Desktops** — diagnosis, repair, upgrades\n- **Servers** — installation, maintenance, troubleshooting\n- **Printers & Peripherals** — repair and consumables\n- **Networking Hardware** — routers, switches, access points\n\n🔧 We offer both **on-site** and **remote** support.\n\nFor immediate help:\n- 📞 **+91 7858971869**\n- 🎫 [Raise a ticket](/support)\n\nTell me more about your hardware issue — I may be able to help right now!";
    }

    if (/software|app|web|mobile|development|custom|erp|crm|website|application/.test(t)) {
      return "## Custom Software Development 💻\n\nVedTech builds tailored software solutions:\n\n- 🌐 **Web Applications** — responsive, scalable, modern\n- 📱 **Mobile Apps** — Android & iOS\n- 🏭 **ERP & CRM** — business management systems\n- ☁️ **SaaS Platforms** — cloud-native applications\n- 🔗 **API Integration** — connect your existing systems\n\n**Our process**: Requirements → Design → Development → Testing → Deployment → Support\n\nReady to start your project?\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**\n- 👉 [Get a quote](/contact)";
    }

    if (/cloud|aws|azure|migration|backup|devops|hosting/.test(t)) {
      return "## Cloud Services ☁️\n\nVedTech helps businesses move to and thrive in the cloud:\n\n- **Cloud Migration** — seamless transition to AWS, Azure, or GCP\n- **Backup & Recovery** — automated, secure, tested\n- **DevOps** — CI/CD pipelines, infrastructure automation\n- **Cloud Hosting** — reliable, scalable, cost-optimised\n\nCall us for a **free cloud assessment**:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**";
    }

    if (/network|wifi|wi-fi|lan|wan|firewall|vpn|cabling|internet/.test(t)) {
      return "## Networking Solutions 🌐\n\nVedTech delivers complete networking infrastructure:\n\n- **LAN/WAN Setup** — office & enterprise networks\n- **Wi-Fi Solutions** — seamless wireless coverage\n- **Structured Cabling** — professional installation\n- **Firewall & VPN** — secure remote access\n- **Network Monitoring** — 24/7 health checks\n\nFor a **site survey or quote**:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**";
    }

    if (/security|cyber|cctv|camera|surveillance|vulnerability|endpoint/.test(t)) {
      return "## Cybersecurity & CCTV 🔒\n\nVedTech protects your business:\n\n**Cybersecurity:**\n- Vulnerability assessment & penetration testing\n- Firewall management & endpoint security\n- Security audits & compliance\n\n**CCTV & Surveillance:**\n- IP camera installation & configuration\n- Remote monitoring setup\n- NVR/DVR management\n\nContact us for a **security assessment**:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**";
    }

    if (/thank|thanks|great|awesome|perfect|helpful|good bot|nice/.test(t)) {
      return "You're very welcome! 😊 It's my pleasure to help.\n\nIf you need anything else — services, support, or pricing — just ask! Have a great day! 🌟\n\n*VedTech Services — One Call, All IT Solutions*";
    }

    if (/bye|goodbye|see you|take care|later/.test(t)) {
      return "Goodbye! 👋 Thank you for visiting VedTech Services.\n\nFeel free to come back anytime. For urgent help:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**\n\n*Have a wonderful day!* 😊";
    }

    return null; // No local match — proceed to AI gateway
  };

  const handleSend = async (overrideInput?: any) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Try local keyword fallback first (instant, no AI gateway)
    const localReply = getLocalResponse(textToSend);
    if (localReply) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: localReply,
          sender: 'bot',
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 400);
      return;
    }

    // Knowledge Base article search (runs in parallel)
    const keywords = textToSend.toLowerCase().split(' ').filter(k => k.length > 2);
    let articles: any[] = [];
    if (keywords.length > 0) {
      const { data } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('is_published', true)
        .or(keywords.map(k => `title.ilike.%${k}%,excerpt.ilike.%${k}%`).join(','));
      articles = data || [];
    }

    // Start streaming LLM response
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      articles: articles.slice(0, 3),
    }]);
    setIsTyping(false);
    setIsStreaming(true);
    setStreamingText('');

    if (articles.length > 0) {
      setSuggestedArticles(articles.slice(0, 3));
      await Promise.all(articles.slice(0, 3).map(art => logMetric(art.id, 'suggested')));
    }

    // Build conversation history for LLM context (last 10 messages, excluding current)
    const history = messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }));

    abortRef.current = new AbortController();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

    let accumulated = '';
    let errorDetected = false;

    await sendStreamRequest({
      functionUrl: `${supabaseUrl}/functions/v1/chat-ai`,
      requestBody: { message: textToSend, conversationHistory: history },
      supabasePublishableKey,
      signal: abortRef.current.signal,
      onData: (data) => {
        try {
          const parsed = JSON.parse(data);

          // Detect structured error responses from the edge function
          if (parsed?.error) {
            errorDetected = true;
            let friendlyMsg = '';
            if (parsed.error === 'rate_limit') {
              friendlyMsg = "⏳ VedBot is a little busy right now. Please wait a few seconds and try again!\n\nFor urgent help, reach us directly:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**";
            } else {
              friendlyMsg = `⚠️ I ran into a temporary issue. Please try again.\n\nIf the problem persists, contact us:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**`;
            }
            setMessages(prev => prev.map(m =>
              m.id === botMsgId ? { ...m, text: friendlyMsg } : m
            ));
            return;
          }

          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (chunk) {
            accumulated += chunk;
            setStreamingText(accumulated);
            setMessages(prev => prev.map(m =>
              m.id === botMsgId ? { ...m, text: accumulated } : m
            ));
          }
        } catch { /* incomplete SSE chunk — skip */ }
      },
      onComplete: () => {
        if (!errorDetected && !accumulated) {
          setMessages(prev => prev.map(m =>
            m.id === botMsgId
              ? { ...m, text: "I'm sorry, I couldn't generate a response. Please try again.\n\nNeed immediate help?\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**" }
              : m
          ));
        }
        setIsStreaming(false);
        setStreamingText('');
      },
      onError: (err) => {
        if (!abortRef.current?.signal.aborted) {
          setMessages(prev => prev.map(m =>
            m.id === botMsgId
              ? { ...m, text: "⚠️ Connection issue. Please check your internet and try again.\n\nFor direct help:\n- 📞 **+91 7858971869**\n- 📧 **info@vedtechservices.in**" }
              : m
          ));
        }
        setIsStreaming(false);
        setStreamingText('');
        console.error('Chat stream error:', err);
      },
    });
  };

  const cancelStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingText('');
  };

  const handleArticleClick = (article: any) => {
    logMetric(article.id, 'read');
    window.open(`/blog/${article.id}`, '_blank');
  };

  const handleArticleResolved = (article: any) => {
    logMetric(article.id, 'resolved');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: `Glad that "${article.title}" helped you! Is there anything else I can do?`,
      sender: 'bot',
      timestamp: new Date()
    }]);
    setSuggestedArticles([]);
  };

  // Relative time formatter
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className={cn(
          "shadow-2xl border-2 animate-in slide-in-from-bottom-5 duration-300 flex flex-col mb-4 transition-all",
          isMinimized ? "w-[280px] h-[56px] overflow-hidden" : "w-[350px] md:w-[400px] h-[500px]"
        )}>
          <CardHeader className="bg-primary text-white p-3 rounded-t-lg flex flex-row items-center justify-between space-y-0 shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span>VedBot AI</span>
                <span className="text-[10px] text-blue-100 font-normal">Active Support Agent</span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-7 w-7" onClick={() => { setShowSettings(!showSettings); setShowShortcuts(false); }} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-7 w-7" onClick={() => setSoundEnabled(v => { localStorage.setItem('vts_chat_sound', v ? 'off' : 'on'); return !v; })} title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-7 w-7" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? 'Expand' : 'Minimize'}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Offline banner */}
              {isOffline && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center gap-2 text-[10px] text-amber-700">
                  <WifiOff className="h-3 w-3 shrink-0" />
                  <span>You're offline. Messages will be sent when you reconnect.</span>
                </div>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <div className="bg-white border-b px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Settings className="h-3 w-3" /> Preferences
                    </h4>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Volume2 className="h-3 w-3 text-slate-400" /> Sound notifications
                      </span>
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={e => { const v = e.target.checked; localStorage.setItem('vts_chat_sound', v ? 'on' : 'off'); setSoundEnabled(v); }}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Bot className="h-3 w-3 text-slate-400" /> Proactive greeting
                      </span>
                      <input
                        type="checkbox"
                        checked={proactiveEnabled}
                        onChange={e => { const v = e.target.checked; localStorage.setItem('vts_chat_proactive', v ? 'on' : 'off'); setProactiveEnabled(v); }}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-slate-400" /> Voice language
                      </span>
                      <select
                        value={voiceLang}
                        onChange={e => { localStorage.setItem('vts_chat_voice_lang', e.target.value); setVoiceLang(e.target.value); }}
                        className="text-xs border rounded px-1.5 py-0.5 bg-white outline-none"
                      >
                        <option value="en-IN">English (India)</option>
                        <option value="en-US">English (US)</option>
                        <option value="hi-IN">Hindi</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t">
                    <button
                      onClick={() => setShowShortcuts(true)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] text-slate-500 hover:text-primary py-1 rounded hover:bg-slate-50 transition-colors"
                    >
                      <Keyboard className="h-3 w-3" /> Shortcuts
                    </button>
                    <button
                      onClick={clearChat}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] text-red-500 hover:text-red-600 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Clear Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts Help */}
              {showShortcuts && (
                <div className="bg-slate-50 border-b px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Keyboard className="h-3 w-3" /> Keyboard Shortcuts
                    </h4>
                    <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1 font-mono text-[9px]">Esc</kbd> Close / Minimize</span>
                    <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1 font-mono text-[9px]">Ctrl</kbd> + <kbd className="bg-white border rounded px-1 font-mono text-[9px]">Enter</kbd> Send</span>
                    <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1 font-mono text-[9px]">Ctrl</kbd> + <kbd className="bg-white border rounded px-1 font-mono text-[9px]">K</kbd> Search</span>
                    <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1 font-mono text-[9px]">Enter</kbd> Submit</span>
                  </div>
                </div>
              )}

              {/* Search bar */}
              {showSearch && (
                <div className="bg-white border-b px-3 py-2 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 text-xs outline-none bg-transparent"
                    autoFocus
                  />
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 flex flex-col">
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {filteredMessages.map((m) => (
                      <div key={m.id} className="space-y-1">
                        <div className={cn("flex w-max max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 text-sm relative group",
                          m.sender === 'user' ? "ml-auto bg-primary text-primary-foreground shadow-md" : "bg-white border text-slate-900 shadow-sm")}>
                          {m.sender === 'bot' ? (
                            <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0 prose-headings:my-1">
                              <Streamdown parseIncompleteMarkdown isAnimating={isStreaming && m.text === streamingText}>
                                {m.text || ' '}
                              </Streamdown>
                              {isStreaming && m.text === streamingText && (
                                <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />
                              )}
                            </div>
                          ) : (
                            m.text
                          )}
                          {/* Copy button for bot messages */}
                          {m.sender === 'bot' && m.text && !isStreaming && (
                            <button
                              onClick={() => copyMessage(m.text, m.id)}
                              className="absolute -right-7 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
                              title="Copy"
                            >
                              {copiedId === m.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                            </button>
                          )}
                        </div>
                        {/* Timestamp + feedback */}
                        <div className={cn("flex items-center gap-1.5 text-[10px] text-slate-400",
                          m.sender === 'user' ? "justify-end" : "justify-start")}>
                          <span>{formatTime(m.timestamp)}</span>
                          {m.sender === 'bot' && m.text && !isStreaming && m.id !== '1' && !m.id.startsWith('proactive') && (
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => submitFeedback(m.id, 'up')}
                                className={cn("p-0.5 rounded hover:bg-green-50 transition-colors",
                                  messageFeedback[m.id] === 'up' ? "text-green-600" : "text-slate-300")}
                                title="Helpful"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => submitFeedback(m.id, 'down')}
                                className={cn("p-0.5 rounded hover:bg-red-50 transition-colors",
                                  messageFeedback[m.id] === 'down' ? "text-red-500" : "text-slate-300")}
                                title="Not helpful"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        {m.articles && m.articles.length > 0 && (
                          <div className="flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-left-2">
                            <p className="text-[10px] text-slate-500 font-medium px-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-yellow-500" />
                              Helpful articles for you:
                            </p>
                            {m.articles.map((art) => (
                              <div key={art.id} className="bg-white border rounded-lg p-3 shadow-sm hover:border-primary transition-all group">
                                <h4 className="text-xs font-bold text-slate-900 mb-1">{art.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{art.excerpt}</p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[10px] gap-1 px-2"
                                    onClick={() => handleArticleClick(art)}
                                  >
                                    <BookOpen className="h-3 w-3" /> Read
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[10px] gap-1 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleArticleResolved(art)}
                                  >
                                    <CheckCircle className="h-3 w-3" /> Solved my issue
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex w-max max-w-[80%] items-center gap-2 rounded-lg bg-white border px-3 py-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                        </div>
                        <span className="text-xs">VedBot is thinking…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Escalation Status Panel — updated live via Realtime */}
                {escalationStatus && (
                  <div className="mx-3 mb-2 mt-1 rounded-lg border bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" />
                        Your Support Request
                      </p>
                      <span className="text-[9px] text-green-600 font-medium flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-2 py-0.5 capitalize', STATUS_COLORS[escalationStatus.status] || 'bg-slate-100 text-slate-700')}
                      >
                        {escalationStatus.status}
                      </Badge>
                      <span className={cn('text-[10px] font-medium', SLA_COLORS[escalationStatus.sla_status] || 'text-slate-600')}>
                        {escalationStatus.sla_status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Priority: {escalationStatus.priority}
                      </span>
                    </div>
                    {escalationStatus.first_response_at && (
                      <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Agent responded · {new Date(escalationStatus.first_response_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Satisfaction Rating Panel — shown after ticket is resolved */}
                {showRating && (
                  <div className="mx-3 mb-2 mt-1 rounded-lg border border-yellow-200 bg-yellow-50 p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {!ratingSubmitted ? (
                      <>
                        <p className="text-[11px] font-semibold text-slate-700 mb-2 text-center">
                          How satisfied are you with our support?
                        </p>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              disabled={isSubmittingRating}
                              onClick={() => submitRating(star)}
                              onMouseEnter={() => setRatingHover(star)}
                              onMouseLeave={() => setRatingHover(0)}
                              className="transition-transform hover:scale-125 focus:outline-none disabled:opacity-50"
                              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={cn(
                                  'h-6 w-6 transition-colors',
                                  (ratingHover || ratingValue) >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        {isSubmittingRating && (
                          <div className="flex justify-center">
                            <span className="h-4 w-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin inline-block" />
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 text-center">Tap a star to rate</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-5 w-5',
                                ratingValue >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] font-semibold text-green-700">
                          Thank you for your feedback! 🙏
                        </p>
                        <button
                          onClick={() => setShowRating(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline mt-0.5"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-2 bg-slate-50 border-t flex flex-wrap gap-1.5 items-center">
                  {!escalationStatus && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-600 hover:text-white cursor-pointer transition-colors px-2 py-0.5 text-[10px] flex items-center gap-1"
                      onClick={escalateToAdmin}
                    >
                      {isEscalating ? <span className="h-3 w-3 rounded-full border-2 border-orange-400 border-t-transparent animate-spin inline-block" /> : <LifeBuoy className="h-3 w-3" />}
                      Talk to a Human
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors px-2 py-0.5 text-[10px] flex items-center gap-1"
                    onClick={() => setShowContact(v => !v)}
                  >
                    <HelpCircle className="h-3 w-3" />
                    Contact Info
                  </Badge>
                  {suggestions.map((s, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-white hover:bg-primary hover:text-white cursor-pointer transition-colors px-2 py-0.5 text-[10px]"
                      onClick={() => handleSuggestion(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="ml-auto p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Search messages (Ctrl+K)"
                  >
                    <Search className="h-3 w-3" />
                  </button>
                  <button
                    onClick={exportChat}
                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Export chat"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                </div>

                {/* Quick Contact Panel */}
                {showContact && (
                  <div className="mx-3 mb-2 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        Contact VedTech Services
                      </p>
                      <button onClick={() => setShowContact(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <a href="mailto:info@vedtechservices.in" className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors group">
                        <span className="bg-white rounded p-1 shadow-sm group-hover:bg-primary/10">📧</span>
                        <span>info@vedtechservices.in</span>
                      </a>
                      <a href="tel:+917858971869" className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors group">
                        <span className="bg-white rounded p-1 shadow-sm group-hover:bg-primary/10">📞</span>
                        <span>+91 7858971869 (Primary)</span>
                      </a>

                      <a href="https://wa.me/917858971869" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-green-600 transition-colors group">
                        <span className="bg-white rounded p-1 shadow-sm group-hover:bg-green-50">💬</span>
                        <span>WhatsApp: +91 7858971869</span>
                      </a>
                      <div className="pt-1 border-t border-blue-100 space-y-0.5">
                        <p className="font-semibold text-slate-600">📍 Offices</p>
                        <p className="text-slate-500">Gurugram, Haryana (Head Office)</p>
                        <p className="text-slate-500">Samastipur, Bihar</p>
                        <p className="text-slate-500">Bhopal, Madhya Pradesh</p>
                      </div>
                      <p className="text-slate-400 pt-0.5">🕐 Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                    </div>
                    <a href="/contact" className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-primary hover:underline">
                      Open Contact Page →
                    </a>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 bg-white border-t">
                <div className="flex w-full gap-2 items-center">
                  <button
                    onClick={startVoiceInput}
                    className={cn("shrink-0 p-2 rounded-lg transition-colors", isListening ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                    title={isListening ? 'Listening...' : 'Voice input'}
                    disabled={isStreaming || isListening}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <Input
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isStreaming && handleSend()}
                    className="flex-1"
                    disabled={isStreaming || isListening}
                  />
                  {isStreaming ? (
                    <Button size="icon" variant="destructive" onClick={cancelStream} title="Stop generating">
                      <Square className="h-4 w-4 fill-current" />
                    </Button>
                  ) : (
                    <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping || isListening}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}

      <Button
        size="lg"
        className={cn("h-14 w-14 rounded-full shadow-2xl transition-all duration-300 relative",
          isOpen ? "rotate-90 bg-slate-900" : "bg-primary hover:scale-110")}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default ChatBot;
