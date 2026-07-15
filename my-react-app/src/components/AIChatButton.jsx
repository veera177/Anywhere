import React, { useState } from 'react';
import AIChatWindow from './AIChatWindow';

function AIChatButton({ onAction }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {!isOpen && (
                <button 
                    className="ai-chat-floating-btn" 
                    onClick={() => setIsOpen(true)}
                    title="Open AI Assistant"
                >
                    <span className="sparkle-icon">✨</span>
                    <span className="pulse-ring"></span>
                </button>
            )}

            {isOpen && (
                <AIChatWindow 
                    onClose={() => setIsOpen(false)} 
                    onAction={onAction}
                />
            )}

            <style>{`
                .ai-chat-floating-btn {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background-color: #ffd600; /* Yellow */
                    color: black;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 999;
                    transition: transform 0.2s, background-color 0.2s;
                }
                .ai-chat-floating-btn:hover {
                    transform: scale(1.1);
                    background-color: #e5c100;
                }
                .sparkle-icon {
                    font-size: 1.5rem;
                }
                .pulse-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid #ffd600;
                    animation: pulseRing 2s infinite ease-out;
                    opacity: 0.8;
                    box-sizing: border-box;
                }
                @keyframes pulseRing {
                    0% {
                        transform: scale(0.95);
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1.4);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
}

export default AIChatButton;
