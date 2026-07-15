import React from 'react';

function TypingAnimation() {
    return (
        <div className="typing-indicator" aria-label="AI is typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <style>{`
                .typing-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 12px 16px;
                    background-color: #f1f1f1;
                    border-radius: 18px;
                    border-bottom-left-radius: 4px;
                    width: fit-content;
                }
                .typing-indicator .dot {
                    width: 8px;
                    height: 8px;
                    background-color: #888;
                    border-radius: 50%;
                    animation: pulse 1.4s infinite ease-in-out both;
                }
                .typing-indicator .dot:nth-child(1) {
                    animation-delay: -0.32s;
                }
                .typing-indicator .dot:nth-child(2) {
                    animation-delay: -0.16s;
                }
                @keyframes pulse {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.3;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

export default TypingAnimation;
