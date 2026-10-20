import { useRef, useState } from 'react';
import AIChatWindow from './AIChatWindow';
import './AIChatWindow.css';

function AIChatButton({ onAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const launcherRef = useRef(null);

    const open = () => {
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        window.requestAnimationFrame(() => launcherRef.current?.focus());
    };

    return (
        <>
            <div className="ai-launcher-wrap">
                <button ref={launcherRef} type="button" className="ai-chat-floating-btn" onClick={open} aria-label="Open Anywhere AI Assistant" aria-expanded={isOpen} aria-haspopup="dialog">
                    <span className="ai-launcher-mark" aria-hidden="true">✦</span>
                    <span className="ai-launcher-word">Ask Anywhere</span>
                    <span className="pulse-ring" aria-hidden="true" />
                </button>
            </div>
            {isOpen && <AIChatWindow onClose={close} onMinimize={close} onAction={onAction} />}
        </>
    );
}

export default AIChatButton;
