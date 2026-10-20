import { useState } from 'react';

const RESULT_LINE = /^\s*(?:[-*•]\s*)?(.*?)\s*[–—-]\s*(?:₹|Rs\.?\s*)\s*([\d,]+(?:\.\d{1,2})?)(?:\s*\[(Veg|Non[- ]?Veg)\])?(?:\s*@\s*(.+))?\s*$/i;

function formatInline(text, keyPrefix) {
    return String(text).split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**')
        ? <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>
        : part);
}

function ResultRow({ row, onAdd }) {
    const isVeg = row.kind?.toLowerCase().startsWith('veg');
    return <div className="ai-result-row">
        <span className={`ai-food-dot ${row.kind ? (isVeg ? 'veg' : 'nonveg') : 'unknown'}`} aria-label={row.kind || 'Item'} />
        <span className="ai-result-name"><strong>{row.name}</strong><small>{row.shop || 'Local partner'}</small></span>
        <span className="ai-price-chip">₹{Number(row.price).toLocaleString('en-IN')}</span>
        <button type="button" className="ai-add-button" onClick={() => onAdd?.(row.name)} aria-label={`Add ${row.name} to cart`}>Add</button>
    </div>;
}

function parseResult(text) {
    const rows = []; const other = [];
    String(text || '').split('\n').forEach((line) => {
        const match = line.match(RESULT_LINE);
        if (!match || !match[1].trim()) { if (line.trim()) other.push(line); return; }
        rows.push({ name: match[1].replace(/^\d+[.)]\s*/, '').replaceAll('**', '').trim(), price: match[2].replaceAll(',', ''), kind: match[3] || '', shop: match[4]?.trim() || '' });
    });
    return { rows, other };
}

function MessageBubble({ message, showAvatar = true, showTime = true, timeLabel, onRetry, onAddItem }) {
    const isUser = message.sender === 'user';
    const parsed = !isUser && !message.errorKind ? parseResult(message.text) : { rows: [], other: String(message.text || '').split('\n') };
    const [showAll, setShowAll] = useState(false);
    const [feedback, setFeedback] = useState(() => {
        try { return JSON.parse(localStorage.getItem('anywhere_ai_feedback') || '{}')[message.id] || ''; } catch { return ''; }
    });
    const [copied, setCopied] = useState(false);
    const saveFeedback = (vote) => {
        setFeedback(vote);
        try { const all = JSON.parse(localStorage.getItem('anywhere_ai_feedback') || '{}'); localStorage.setItem('anywhere_ai_feedback', JSON.stringify({ ...all, [message.id]: vote })); } catch { /* feedback is optional */ }
    };
    const copyMessage = async () => {
        try { await navigator.clipboard.writeText(message.text); setCopied(true); window.setTimeout(() => setCopied(false), 1200); } catch { /* Clipboard may be unavailable in insecure contexts. */ }
    };
    const rows = showAll ? parsed.rows : parsed.rows.slice(0, 5);

    return <div className={`message-bubble-container ${isUser ? 'user-container' : 'assistant-container'} ${message.errorKind ? 'has-error' : ''}`}>
        {!isUser && <span className={`ai-message-avatar ${showAvatar ? '' : 'avatar-spacer'}`} aria-hidden={!showAvatar}>{showAvatar ? 'A' : ''}</span>}
        <div className={`message-column ${isUser ? 'user-column' : ''}`}>
            <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${message.errorKind ? 'error-bubble' : ''} ${message.errorKind === 'no-data' ? 'no-data-bubble' : ''}`}>
                {message.errorKind && <span className="ai-error-icon" aria-hidden="true">{message.errorKind === 'no-data' ? 'i' : '!'}</span>}
                <div className="message-text">
                    {parsed.other.map((line, index) => line.trim().startsWith('- ') || line.trim().startsWith('• ')
                        ? <div className="ai-formatted-bullet" key={index}><span aria-hidden="true">•</span>{formatInline(line.trim().slice(2), `line-${index}`)}</div>
                        : <div className="ai-formatted-line" key={index}>{formatInline(line, `line-${index}`)}</div>)}
                </div>
                {rows.length > 0 && <div className="ai-result-list">{rows.map((row, index) => <ResultRow key={`${row.name}-${index}`} row={row} onAdd={onAddItem} />)}{parsed.rows.length > 5 && <button type="button" className="ai-show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show fewer' : `Show ${parsed.rows.length - 5} more`}</button>}</div>}
                {message.errorKind && message.errorKind !== 'no-data' && <button type="button" className="ai-retry-button" onClick={onRetry}>↻ Retry</button>}
                {showTime && <div className="message-meta"><span className="timestamp">{timeLabel || message.timestamp}</span></div>}
            </div>
            {!isUser && !message.errorKind && <div className="ai-message-actions" aria-label="Message feedback actions">
                <button type="button" onClick={copyMessage} aria-label="Copy answer" title="Copy">{copied ? '✓' : '▢'}</button>
                <button type="button" className={feedback === 'up' ? 'selected' : ''} onClick={() => saveFeedback(feedback === 'up' ? '' : 'up')} aria-label="Helpful answer" aria-pressed={feedback === 'up'} title="Helpful">👍</button>
                <button type="button" className={feedback === 'down' ? 'selected' : ''} onClick={() => saveFeedback(feedback === 'down' ? '' : 'down')} aria-label="Not helpful" aria-pressed={feedback === 'down'} title="Not helpful">👎</button>
            </div>}
        </div>
    </div>;
}

export default MessageBubble;
