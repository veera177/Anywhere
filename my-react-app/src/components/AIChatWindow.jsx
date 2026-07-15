import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingAnimation from './TypingAnimation';

function AIChatWindow({ onClose, onAction }) {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return [
            {
                id: 'welcome',
                sender: 'assistant',
                text: "Hello! I'm your Anywhere AI Assistant. 🌾🥗💊\nHow can I help you today? You can ask me to:\n- Order food, groceries, or medicines\n- Track or clear your cart & orders\n- Book local plumbers or electricians\n- Find agricultural seeds and farming tools\n- Look up nearest government hospitals",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];
    });
    
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Suggested Questions
    const suggestions = [
        "Show cheap food",
        "Book a plumber",
        "Track my order",
        "Clear my cart",
        "Farming seeds and tools",
        "Nearest government hospital"
    ];

    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Text to Speech
    const speakText = (text) => {
        if (!ttsEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const cleanedText = text.replace(/[-*#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-IN'; // Indian English accents fit well
        window.speechSynthesis.speak(utterance);
    };

    // Speech to Text (Voice Input)
    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN';

        rec.onstart = () => {
            setIsListening(true);
        };

        rec.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };

        rec.onerror = (e) => {
            console.error("Speech Recognition Error", e);
            setIsListening(false);
        };

        rec.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
    };

    const handleSend = async (textToSend) => {
        const messageText = textToSend || inputValue;
        if (!messageText.trim()) return;

        if (!textToSend) setInputValue('');

        const userMsg = {
            id: 'msg_' + Date.now(),
            sender: 'user',
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Fetch User and Location Context from Local Storage
        let userId = null;
        let district = 'salem';
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                userId = userObj.id;
                district = userObj.district || 'salem';
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }

        try {
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    userId: userId,
                    district: district
                })
            });

            const data = await response.json();
            
            const assistantMsg = {
                id: 'msg_' + (Date.now() + 1),
                sender: 'assistant',
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsTyping(false);
            setMessages(prev => [...prev, assistantMsg]);
            
            // Speak the response if TTS enabled
            speakText(data.reply);

            // Handle Trigger Actions (e.g. Navigations)
            if (data.action && data.action !== 'NONE') {
                setTimeout(() => {
                    if (onAction) {
                        onAction(data.action, data.actionData);
                    }
                }, 1500); // Small delay to let user read the message
            }

        } catch (error) {
            console.error('AI chat error:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: 'err_' + Date.now(),
                sender: 'assistant',
                text: "Sorry, I'm having trouble connecting to the server. Please check if the backend is running locally.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            setMessages([
                {
                    id: 'welcome',
                    sender: 'assistant',
                    text: "Hello! History cleared. How can I help you today?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    };

    return (
        <div className="ai-chat-window-card">
            {/* Header */}
            <div className="chat-header">
                <div className="ai-logo">
                    <span className="logo-spark">✨</span>
                    <span className="logo-text">Anywhere Assistant</span>
                </div>
                <div className="header-actions">
                    <button 
                        className={`action-btn ${ttsEnabled ? 'active' : ''}`} 
                        onClick={() => setTtsEnabled(!ttsEnabled)} 
                        title={ttsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                    >
                        {ttsEnabled ? '🔊' : '🔇'}
                    </button>
                    <button className="action-btn" onClick={handleClearChat} title="Clear chat history">
                        🗑️
                    </button>
                    <button className="action-btn close-btn" onClick={onClose} title="Close AI window">
                        ❌
                    </button>
                </div>
            </div>

            {/* Message Body */}
            <div className="chat-body">
                <div className="messages-list">
                    {messages.map(m => (
                        <MessageBubble key={m.id} message={m} />
                    ))}
                    {isTyping && (
                        <div className="typing-container">
                            <TypingAnimation />
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Suggestions */}
            <div className="chat-suggestions">
                {suggestions.map((s, idx) => (
                    <button key={idx} className="suggestion-chip" onClick={() => handleSend(s)}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Footer Input Area */}
            <div className="chat-footer">
                <button 
                    className={`voice-input-btn ${isListening ? 'listening' : ''}`} 
                    onClick={toggleListening}
                    title="Speak message"
                >
                    🎤
                </button>
                <input 
                    type="text" 
                    className="message-input" 
                    placeholder="Type or speak a message..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-msg-btn" onClick={() => handleSend()}>
                    ➔
                </button>
            </div>

            <style>{`
                .ai-chat-window-card {
                    display: flex;
                    flex-direction: column;
                    width: 380px;
                    height: 520px;
                    background-color: white;
                    border-radius: 16px;
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
                    border: 1px solid #eef0f3;
                    overflow: hidden;
                    position: fixed;
                    bottom: 90px;
                    right: 30px;
                    z-index: 1000;
                    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    font-family: 'Poppins', sans-serif;
                }
                .dark-mode .ai-chat-window-card {
                    background-color: #1e1e1e;
                    border-color: #2e2e2e;
                }
                @keyframes slideIn {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 18px;
                    background-color: #ffd600; /* Yellow */
                    color: black;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }
                .ai-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .logo-spark {
                    font-size: 1.2rem;
                }
                .logo-text {
                    font-size: 0.95rem;
                }
                .header-actions {
                    display: flex;
                    gap: 8px;
                }
                .action-btn {
                    background: rgba(255, 255, 255, 0.3);
                    border: none;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 50%;
                    font-size: 0.9rem;
                    transition: background 0.2s, transform 0.2s;
                }
                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(1.05);
                }
                .action-btn.active {
                    background: #fff;
                    border: 1px solid #ffd600;
                }
                .chat-body {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    background-color: #fcfcfc;
                }
                .dark-mode .chat-body {
                    background-color: #121212;
                }
                .messages-list {
                    display: flex;
                    flex-direction: column;
                }
                .typing-container {
                    margin-bottom: 12px;
                }
                .chat-suggestions {
                    display: flex;
                    gap: 6px;
                    padding: 8px 16px;
                    overflow-x: auto;
                    white-space: nowrap;
                    background-color: #fdfdfd;
                    border-top: 1px solid #eee;
                    scrollbar-width: none; /* Firefox */
                }
                .dark-mode .chat-suggestions {
                    background-color: #1a1a1a;
                    border-color: #2a2a2a;
                }
                .chat-suggestions::-webkit-scrollbar {
                    display: none; /* Chrome/Safari */
                }
                .suggestion-chip {
                    display: inline-block;
                    background-color: #f1f3f4;
                    color: #5f6368;
                    border: none;
                    border-radius: 20px;
                    padding: 6px 12px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    font-family: inherit;
                    transition: background-color 0.2s, color 0.2s;
                }
                .suggestion-chip:hover {
                    background-color: #ffd600;
                    color: black;
                }
                .dark-mode .suggestion-chip {
                    background-color: #2d2d2d;
                    color: #ccc;
                }
                .dark-mode .suggestion-chip:hover {
                    background-color: #ffd600;
                    color: black;
                }
                .chat-footer {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    background-color: white;
                    border-top: 1px solid #f1f1f1;
                    gap: 8px;
                }
                .dark-mode .chat-footer {
                    background-color: #1e1e1e;
                    border-color: #2e2e2e;
                }
                .message-input {
                    flex: 1;
                    border: 1px solid #dadce0;
                    border-radius: 24px;
                    padding: 10px 16px;
                    font-size: 0.9rem;
                    outline: none;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                .dark-mode .message-input {
                    background-color: #2a2a2a;
                    border-color: #3a3a3a;
                    color: white;
                }
                .message-input:focus {
                    border-color: #ffd600;
                }
                .voice-input-btn {
                    background-color: #f1f3f4;
                    border: none;
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                }
                .dark-mode .voice-input-btn {
                    background-color: #2a2a2a;
                    color: white;
                }
                .voice-input-btn.listening {
                    background-color: #ea4335;
                    color: white;
                    animation: pulseMicrophone 1.5s infinite;
                }
                @keyframes pulseMicrophone {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(234, 67, 53, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
                }
                .send-msg-btn {
                    background-color: #ffd600;
                    color: black;
                    border: none;
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.1rem;
                    transition: transform 0.2s, background-color 0.2s;
                }
                .send-msg-btn:hover {
                    transform: scale(1.05);
                    background-color: #e5c100;
                }
                
                /* Responsive Layout rules */
                @media (max-width: 480px) {
                    .ai-chat-window-card {
                        width: 100%;
                        height: 100%;
                        bottom: 0;
                        right: 0;
                        border-radius: 0;
                    }
                }
            `}</style>
        </div>
    );
}

export default AIChatWindow;
