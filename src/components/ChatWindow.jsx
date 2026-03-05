import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWindow.css';

export function ChatWindow({ messages, isLoading }) {
    const messagesEndRef = useRef(null);
    const [speakingId, setSpeakingId] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const speakText = (text, messageId) => {
        if ('speechSynthesis' in window) {
            if (speakingId === messageId) {
                window.speechSynthesis.cancel();
                setSpeakingId(null);
                return;
            }

            window.speechSynthesis.cancel();
            setSpeakingId(messageId);

            const utterance = new SpeechSynthesisUtterance(text);
            // Try to find a good authoritative/calm English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-IN') || (v.lang.includes('en') && v.name.includes('Male')));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 0.9; // Slightly slower for calmness
            utterance.pitch = 0.9;

            utterance.onend = () => setSpeakingId(null);
            utterance.onerror = () => setSpeakingId(null);

            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <main className="chat-container">
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className={`message-avatar ${msg.sender}`}>
                            {msg.sender === 'user' ? '👤' : '🕉️'}
                        </div>
                        <div className="message-content">
                            <div className="message-bubble">
                                <div className="message-text">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                    {msg.sender === 'assistant' && (
                                        <button
                                            onClick={() => speakText(msg.text, msg.id)}
                                            className={`tts-button ${speakingId === msg.id ? 'active' : ''}`}
                                            title="Listen to Krishna"
                                        >
                                            {speakingId === msg.id ? '🔇 Stop' : '🔊 Listen'}
                                        </button>
                                    )}
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant typing">
                        <div className="message-avatar assistant">🕉️</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                                <span>Krishna is typing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </main>
    );
}
