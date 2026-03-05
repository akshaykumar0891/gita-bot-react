import { useState } from 'react';
import './ChatInput.css';

const LIFE_SITUATIONS = [
    { icon: '💔', text: 'Heartbreak', query: 'I am going through a terrible heartbreak. How do I let go and find peace according to the Gita?' },
    { icon: '🧭', text: 'Career Confusion', query: 'I am completely lost in my career path. How do I find my Dharma and purpose?' },
    { icon: '⛈️', text: 'Fear of Future', query: 'I am extremely anxious about what will happen to me in the future. Please guide me.' },
    { icon: '⚖️', text: 'Guilt & Regret', query: 'I made a mistake in the past and the guilt is eating me alive. How can I forgive myself?' },
];

export function ChatInput({ onSendMessage, isLoading, showSuggestions }) {
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                onSendMessage(inputValue);
                setInputValue('');
            }
        }
    };

    const handleClick = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support the microphone feature.");
            return;
        }

        // We only start the recognition, there is no strict need to manually stop since continuous is false
        // and it turns off automatically when the user pauses.
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (e) => {
            const transcript = Array.from(e.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setInputValue(transcript);
        };

        recognition.onerror = (e) => {
            console.error("Speech recognition error:", e);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    return (
        <div className={`input-section ${!showSuggestions ? 'hero-hidden' : ''}`}>
            <div className="input-container">

                {/* Life Situations Carousel */}
                <div className="smart-suggestions carousel-container">
                    {LIFE_SITUATIONS.map((situation, i) => (
                        <button
                            key={i}
                            className="situation-card"
                            onClick={() => onSendMessage(situation.query)}
                        >
                            <span className="situation-icon">{situation.icon}</span>
                            <span className="situation-text">{situation.text}</span>
                        </button>
                    ))}
                </div>

                <div className="input-wrapper">
                    <button
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        disabled={isLoading}
                        title="Voice Input"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </button>
                    <textarea
                        id="messageInput"
                        placeholder="Ask your question to Krishna..."
                        rows="1"
                        maxLength="1000"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    ></textarea>
                    <button
                        className="send-button"
                        onClick={handleClick}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22,2 15,22 11,13 2,9 22,2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
