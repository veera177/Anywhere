function TypingAnimation({ label = 'Anywhere AI is thinking', slow = false }) {
    return <div className={`typing-indicator ${slow ? 'typing-slow' : ''}`} role="status" aria-label={label}>
        <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="typing-label">{label}</span>
    </div>;
}

export default TypingAnimation;
