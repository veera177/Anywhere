function AiAssistant({ user }) {
    const [messages, setMessages] = React.useState([
        { role: 'assistant', text: 'Hi! Ask me about orders, nearby items, delivery, or Anywhere policies.' }
    ]);
    const [draft, setDraft] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const endRef = React.useRef(null);

    React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    const sendMessage = async (event) => {
        event?.preventDefault();
        const text = draft.trim();
        if (!text || loading) return;
        if (!window.authApi?.isSignedIn?.()) {
            setError('Please sign in to use the AI Assistant.');
            return;
        }

        setDraft('');
        setError('');
        setMessages(current => [...current, { role: 'user', text }]);
        setLoading(true);
        try {
            const response = await window.authApi.fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, district: user?.district || null })
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(body?.error || body?.message || 'The AI Assistant could not process that request.');
            }
            if (!body || typeof body.reply !== 'string' || !body.reply.trim()) {
                throw new Error('The AI Assistant returned an empty response. Please try again.');
            }
            setMessages(current => [...current, { role: 'assistant', text: body.reply }]);
        } catch (requestError) {
            setError(requestError.message || 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return <section className="ai-assistant courier-card" aria-label="Anywhere AI Assistant">
        <div className="ai-assistant__header"><div><h2>Anywhere AI Assistant</h2><p>Answers use live app data where available and help articles for policies.</p></div></div>
        <div className="ai-assistant__messages" aria-live="polite">
            {messages.map((message, index) => <div key={index} className={`ai-assistant__message ai-assistant__message--${message.role}`}>
                {message.text}
            </div>)}
            {loading && <div className="ai-assistant__message ai-assistant__message--assistant">Thinking…</div>}
            <div ref={endRef} />
        </div>
        {error && <p className="location-status-msg error" role="alert">{error}</p>}
        <form className="ai-assistant__form" onSubmit={sendMessage}>
            <input className="form-control" value={draft} maxLength="1000" disabled={loading}
                onChange={event => setDraft(event.target.value)} placeholder="Ask about your order, a product, or a policy…" aria-label="Message" />
            <button className="btn btn-primary" type="submit" disabled={loading || !draft.trim()}>{loading ? 'Sending…' : 'Send'}</button>
        </form>
    </section>;
}
