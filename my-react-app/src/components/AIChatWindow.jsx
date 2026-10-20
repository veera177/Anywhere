import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import TypingAnimation from './TypingAnimation';
import { AI_BASE, API_BASE } from '../services/apiConfig';
import { apiFetchJson } from '../services/apiClient';

const HISTORY_KEY = 'ai_chat_history';
const STARTERS = [
    { title: 'Find food', prompt: 'Show biryani near me', icon: '🍽' },
    { title: 'Order groceries', prompt: 'Help me find grocery items', icon: '🛒' },
    { title: 'Need medicine', prompt: 'Find a nearby pharmacy', icon: '✚' },
    { title: 'Send a courier', prompt: 'Help me book a courier', icon: '↗' },
];
const EXAMPLES = ['How many restaurants in Salem?', 'Track my order', 'Cheapest food near me'];
const QUICK_DEFAULTS = ['Find food nearby', 'Track my order', 'Book a courier'];

function readHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        return Array.isArray(saved) ? saved.filter((message) => message && message.id && message.sender && message.id !== 'welcome') : [];
    } catch { return []; }
}

function timestampNow() { return new Date().toISOString(); }
function asDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? new Date() : date; }
function dateLabel(value) {
    const date = asDate(value); const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}
function timeLabel(value) { return asDate(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function readableReply(data) {
    let reply = typeof data?.reply === 'string' ? data.reply : typeof data?.message === 'string' ? data.message : '';
    const trimmed = reply.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            reply = typeof parsed === 'string' ? parsed : parsed?.reply ?? parsed?.message ?? parsed?.content ?? parsed?.text ?? '';
        } catch { reply = ''; }
    }
    return String(reply || '').replaceAll('â‚¹', '₹').replaceAll('â˜…', '★').replaceAll('â­', '★').replaceAll('�', '');
}

function AIChatWindow({ onClose, onMinimize, onAction }) {
    const [messages, setMessages] = useState(readHistory);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [thinkingLong, setThinkingLong] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState('reconnecting');
    const [confirmClear, setConfirmClear] = useState(false);
    const [showJump, setShowJump] = useState(false);
    const [inputRows, setInputRows] = useState(1);
    const messagesRef = useRef(null);
    const inputRef = useRef(null);
    const dialogRef = useRef(null);
    const recognitionRef = useRef(null);
    const wasNearBottomRef = useRef(true);
    const sequenceRef = useRef(0);

    const userName = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return String(user?.name || user?.fullName || '').trim().split(/\s+/)[0];
        } catch { return ''; }
    }, []);
    const lastAssistant = [...messages].reverse().find((message) => message.sender === 'assistant' && !message.errorKind)?.text || '';
    const quickReplies = useMemo(() => {
        const text = lastAssistant.toLowerCase();
        if (!text) return QUICK_DEFAULTS;
        if (text.includes('restaurant') || text.includes('found') || text.includes('biryani') || text.includes('item')) return ['Show cheaper', 'Open menu', 'Find another item'];
        if (text.includes('order')) return ['Track order', 'View my orders', 'Contact support'];
        if (text.includes('courier') || text.includes('pickup')) return ['Book courier', 'Check courier rate', 'Change pickup'];
        return QUICK_DEFAULTS;
    }, [lastAssistant]);

    useEffect(() => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-100)));
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
        const check = async () => {
            setStatus((current) => current === 'offline' ? 'reconnecting' : current);
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 3500);
            try {
                const response = await fetch(`${API_BASE}/platform-settings`, { signal: controller.signal, headers: { Accept: 'application/json' } });
                setStatus(response.ok ? 'online' : response.status >= 500 ? 'offline' : 'online');
            } catch { setStatus('offline'); }
            finally { window.clearTimeout(timeout); }
        };
        check();
        const interval = window.setInterval(check, 30000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const list = messagesRef.current;
        if (!list) return;
        const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
        const nearBottom = distance < 90 || wasNearBottomRef.current;
        if (nearBottom) {
            list.scrollTo({ top: list.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            setShowJump(false);
        } else setShowJump(true);
    }, [messages, isTyping, thinkingLong]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;
        const handleKeys = (event) => {
            if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
            if (event.key !== 'Tab') return;
            const focusables = [...dialog.querySelectorAll('button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')].filter((node) => !node.hidden);
            if (!focusables.length) return;
            const first = focusables[0]; const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', handleKeys);
        return () => document.removeEventListener('keydown', handleKeys);
    }, [onClose]);

    const speakText = (text) => {
        if (!ttsEnabled || !window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
        utterance.lang = 'en-IN'; window.speechSynthesis.speak(utterance);
    };

    const addMessage = useCallback((message) => setMessages((previous) => [...previous, message]), []);

    const handleSend = async (requestedText = inputValue) => {
        const messageText = String(requestedText || '').trim().slice(0, 500);
        if (!messageText || isTyping) return;
        if (requestedText === inputValue) setInputValue('');
        setInputRows(1);
        const sentAt = timestampNow();
        addMessage({ id: `user-${Date.now()}-${sequenceRef.current++}`, sender: 'user', text: messageText, timestamp: sentAt });
        setIsTyping(true); setThinkingLong(false);
        const longTimer = window.setTimeout(() => setThinkingLong(true), 8000);
        let district = '';
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            district = user?.district || localStorage.getItem('selectedDistrictId') || '';
        } catch { /* Keep optional UI context empty. */ }
        try {
            const data = await apiFetchJson(`${AI_BASE}/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                // The backend takes identity exclusively from the JWT. District is
                // optional UI context, not an authorization input.
                body: JSON.stringify({ message: messageText, district }),
            }, { retries: 0 });
            const reply = readableReply(data);
            const noData = /\bno (?:matching )?(?:items?|results?|products?|restaurants?|stores?|pharmacies)\b.*\b(?:found|available)\b|\bnothing (?:was )?found\b|\bno data found\b/i.test(reply);
            addMessage({ id: `assistant-${Date.now()}-${sequenceRef.current++}`, sender: 'assistant', text: reply || 'I couldn’t find a response. Please try again.', timestamp: timestampNow(), ...(noData ? { errorKind: 'no-data' } : {}) });
            speakText(reply);
            if (data?.action && data.action !== 'NONE') window.setTimeout(() => onAction?.(data.action, data.actionData), 900);
        } catch (error) {
            const kind = error?.kind || (error?.statusCode === 401 ? 'unauthorized' : error?.statusCode >= 500 ? 'server' : 'connection');
            const text = kind === 'warming' ? 'The assistant is warming up. Give it a moment, then try again.'
                : kind === 'unauthorized' ? 'Your session has expired. Please sign in again.'
                : kind === 'server' ? 'The assistant server returned an error. Please retry in a moment.'
                    : 'I can’t reach the assistant server right now. Check the connection and try again.';
            addMessage({ id: `error-${Date.now()}-${sequenceRef.current++}`, sender: 'assistant', text, timestamp: timestampNow(), errorKind: kind, retryText: messageText });
        } finally { window.clearTimeout(longTimer); setThinkingLong(false); setIsTyping(false); }
    };

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { addMessage({ id: `voice-${Date.now()}`, sender: 'assistant', text: 'Voice input is not supported in this browser. You can type your request instead.', timestamp: timestampNow() }); return; }
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
        const recognition = new SpeechRecognition(); recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => setInputValue(event.results?.[0]?.[0]?.transcript || '');
        recognition.onerror = () => setIsListening(false); recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition; recognition.start();
    };

    const handleClear = () => {
        setMessages([]); setConfirmClear(false); localStorage.removeItem(HISTORY_KEY);
    };

    const handleScroll = () => {
        const list = messagesRef.current; if (!list) return;
        const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
        wasNearBottomRef.current = nearBottom; if (nearBottom) setShowJump(false);
    };

    const rendered = messages.map((message, index) => {
        const previous = messages[index - 1]; const next = messages[index + 1];
        const sameGroupBefore = previous?.sender === message.sender && dateLabel(previous.timestamp) === dateLabel(message.timestamp);
        const sameGroupAfter = next?.sender === message.sender && dateLabel(next.timestamp) === dateLabel(message.timestamp);
        const newDay = !previous || dateLabel(previous.timestamp) !== dateLabel(message.timestamp);
        return { message, showAvatar: message.sender === 'assistant' && !sameGroupBefore, showTime: !sameGroupAfter, newDay };
    });

    return (
        <div className="ai-chat-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && window.innerWidth <= 480) onClose(); }}>
            <section ref={dialogRef} className="ai-chat-window-card" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title" aria-describedby="ai-chat-status">
                <div className="ai-chat-drag-handle" aria-hidden="true"><span /></div>
                <header className="chat-header">
                    <div className="ai-header-identity">
                        <span className="ai-header-avatar" aria-hidden="true">A</span>
                        <span className="ai-header-copy"><strong id="ai-chat-title">Anywhere AI</strong><small id="ai-chat-status" className={`ai-status ai-status-${status}`}><i />{status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Reconnecting...'}</small></span>
                    </div>
                    <div className="header-actions">
                        <button type="button" className={`action-btn ${ttsEnabled ? 'active' : ''}`} onClick={() => setTtsEnabled((enabled) => !enabled)} aria-label={ttsEnabled ? 'Turn sound off' : 'Turn sound on'} title={ttsEnabled ? 'Sound on' : 'Sound off'}>{ttsEnabled ? '◖' : '♪'}</button>
                        <button type="button" className="action-btn" onClick={() => setConfirmClear((value) => !value)} aria-label="Clear chat" title="Clear chat">⌫</button>
                        <button type="button" className="action-btn" onClick={onMinimize} aria-label="Minimize chat" title="Minimize">−</button>
                        <button type="button" className="action-btn" onClick={onClose} aria-label="Close chat" title="Close">×</button>
                    </div>
                </header>
                {confirmClear && <div className="ai-clear-confirm" role="group" aria-label="Confirm clear chat"><span>Clear this conversation?</span><button type="button" onClick={handleClear}>Clear</button><button type="button" onClick={() => setConfirmClear(false)}>Cancel</button></div>}

                <main className="chat-body" ref={messagesRef} onScroll={handleScroll} aria-live="polite" aria-relevant="additions text">
                    {messages.length === 0 && <section className="ai-welcome-state">
                        <div className="ai-welcome-mark" aria-hidden="true">✦</div>
                        <h2>{userName ? `Hi ${userName}, what can I get you?` : 'Hi there, what can I get you?'}</h2>
                        <p>Your local services, one friendly assistant.</p>
                        <div className="ai-starter-grid">{STARTERS.map((starter) => <button type="button" className="ai-starter-card" key={starter.title} onClick={() => handleSend(starter.prompt)}><span aria-hidden="true">{starter.icon}</span><strong>{starter.title}</strong><small>{starter.prompt}</small></button>)}</div>
                        <div className="ai-example-questions"><span>Try asking</span>{EXAMPLES.map((example) => <button type="button" key={example} onClick={() => handleSend(example)}>{example}</button>)}</div>
                    </section>}
                    {rendered.map(({ message, showAvatar, showTime, newDay }, index) => <div className="ai-message-sequence" key={message.id} style={{ animationDelay: `${Math.min(index, 5) * 24}ms` }}>
                        {newDay && <div className="ai-date-separator"><span>{dateLabel(message.timestamp)}</span></div>}
                        <MessageBubble message={message} showAvatar={showAvatar} showTime={showTime} timeLabel={timeLabel(message.timestamp)} onRetry={() => handleSend(message.retryText)} onAddItem={(name) => handleSend(`Add ${name} to my cart`)} />
                    </div>)}
                    {isTyping && <div className="typing-container"><TypingAnimation label={thinkingLong ? 'Still thinking...' : 'Anywhere AI is thinking'} slow={thinkingLong} /></div>}
                    <div className="ai-chat-end-anchor" />
                </main>
                {showJump && <button type="button" className="ai-jump-latest" onClick={() => { wasNearBottomRef.current = true; messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); setShowJump(false); }}>↓ Jump to latest</button>}

                {messages.length > 0 && <div className="chat-suggestions" aria-label="Suggested follow-up questions">{quickReplies.map((reply) => <button type="button" className="suggestion-chip" key={reply} onClick={() => handleSend(reply)}>{reply}</button>)}</div>}
                <footer className="chat-footer">
                    <div className="ai-input-shell">
                        <textarea ref={inputRef} rows={inputRows} className="message-input" placeholder="Ask me anything…" aria-label="Message Anywhere AI" maxLength={500} value={inputValue} onChange={(event) => { const value = event.target.value.slice(0, 500); setInputValue(value); setInputRows(Math.min(4, Math.max(value.split('\n').length, Math.ceil(event.target.scrollHeight / 18)))); }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} />
                        <div className="ai-input-meta"><span>Enter to send · Shift+Enter for a new line</span><span>{inputValue.length}/500</span></div>
                    </div>
                    <button type="button" className={`voice-input-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} aria-label={isListening ? 'Stop voice input' : 'Start voice input'} title="Voice input">♩</button>
                    <button type="button" className="send-msg-btn" onClick={() => handleSend()} disabled={!inputValue.trim() || isTyping} aria-label="Send message" title="Send">↑</button>
                </footer>
            </section>
        </div>
    );
}

export default AIChatWindow;
