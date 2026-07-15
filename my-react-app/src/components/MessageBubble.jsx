import React from 'react';

function MessageBubble({ message }) {
    const isUser = message.sender === 'user';
    
    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        alert('Copied to clipboard!');
    };

    return (
        <div className={`message-bubble-container ${isUser ? 'user-container' : 'assistant-container'}`}>
            <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                <div className="message-text">{message.text}</div>
                <div className="message-meta">
                    <span className="timestamp">{message.timestamp}</span>
                    {!isUser && (
                        <button className="copy-btn" onClick={handleCopy} title="Copy message">
                            📋
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                .message-bubble-container {
                    display: flex;
                    width: 100%;
                    margin-bottom: 12px;
                }
                .user-container {
                    justify-content: flex-end;
                }
                .assistant-container {
                    justify-content: flex-start;
                }
                .message-bubble {
                    max-width: 75%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                .user-bubble {
                    background-color: #ffd600; /* Theme yellow */
                    color: #000;
                    border-bottom-right-radius: 4px;
                }
                .assistant-bubble {
                    background-color: #f1f1f1;
                    color: #333;
                    border-bottom-left-radius: 4px;
                }
                .dark-mode .assistant-bubble {
                    background-color: #333;
                    color: #f1f1f1;
                }
                .message-text {
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .message-meta {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                    margin-top: 6px;
                    font-size: 0.75rem;
                    opacity: 0.6;
                }
                .copy-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    font-size: 0.8rem;
                    transition: transform 0.2s;
                }
                .copy-btn:hover {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    );
}

export default MessageBubble;
