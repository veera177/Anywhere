import React from 'react';
import AIChatWindow from '../../components/AIChatWindow';
import './Assistant.css';

function Assistant({ onBack, onAction }) {
    return (
        <div className="assistant-page-container">
            <header className="page-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Services
                </button>
                <h1>Anywhere Smart Assistant</h1>
            </header>
            <div className="assistant-chat-wrapper">
                <AIChatWindow onClose={onBack} onAction={onAction} />
            </div>
        </div>
    );
}

export default Assistant;
