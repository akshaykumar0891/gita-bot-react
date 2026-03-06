import { useState, useEffect, useRef } from 'react';
import { hfService } from './HFService';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { HeroSection } from './components/HeroSection';
import { PranayamaGuide } from './components/PranayamaGuide';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('gita_bot_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showHero, setShowHero] = useState(() => {
    const saved = localStorage.getItem('gita_bot_messages');
    return saved && JSON.parse(saved).length > 0 ? false : true;
  });
  const [showBreathing, setShowBreathing] = useState(false);
  const [theme, setTheme] = useState('light');

  // Rate limiter reference
  const lastRequestTime = useRef(0);

  // Save messages to browser local storage for infinite memory
  useEffect(() => {
    localStorage.setItem('gita_bot_messages', JSON.stringify(messages));
    if (messages.length > 0) setShowHero(false);
  }, [messages]);

  // Set theme based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const defaultTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
    setTheme(defaultTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // EFFICIENCY / THROTTLING CHECK
    const now = Date.now();
    if (now - lastRequestTime.current < 5000) {
      alert("Please wait a few seconds before asking another question to preserve API limits.");
      return;
    }
    lastRequestTime.current = now;

    if (showHero) setShowHero(false);

    const newUserMsg = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Pass history to hfService
      const responseText = await hfService.sendMessage(text, messages);

      const newAssistantMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newAssistantMsg]);
    } catch (error) {
      console.error(error);

      let errorMessage = "I apologize, dear seeker. I'm experiencing some difficulty connecting to the divine wisdom. Please check your Hugging Face API Token configuration and try again.";

      if (error.message === "RATE_LIMIT" || (error.message && error.message.includes("429"))) {
        errorMessage = "The Gita is busy right now, please try again in a minute!";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {showBreathing && <PranayamaGuide onClose={() => setShowBreathing(false)} />}

      {/* Minimal Header */}
      <header className="header" style={{
        position: 'fixed', top: 0, width: '100%', boxSizing: 'border-box',
        zIndex: 100,
        padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 24px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <div>
          {!showHero && (
            <button
              onClick={() => {
                setMessages([]);
                setShowHero(true);
                localStorage.removeItem('gita_bot_messages');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                color: 'hsl(var(--text-secondary))',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'}
              onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--text-secondary))'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span style={{ display: 'var(--back-text-display, inline)' }}>Back</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 16px)', alignItems: 'center' }}>
          <button
            onClick={() => setShowBreathing(true)}
            style={{
              background: 'transparent',
              border: '1px solid hsl(var(--primary))',
              color: 'hsl(var(--primary))',
              borderRadius: '20px',
              padding: 'clamp(4px, 1.5vw, 6px) clamp(10px, 3vw, 16px)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🪷 <span style={{ display: 'var(--center-text-display, inline)' }}>Find Center</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'hsl(var(--text-primary))'
            }}
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {showHero && <HeroSection />}

      <ChatWindow messages={messages} isLoading={isLoading} />

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} showSuggestions={showHero} />
    </div>
  );
}

export default App;
