import { useState, useEffect } from 'react';
import './PranayamaGuide.css';

export function PranayamaGuide({ onClose }) {
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
    const [timeLeft, setTimeLeft] = useState(4);

    useEffect(() => {
        let timer;
        if (phase === 'inhale' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (phase === 'inhale' && timeLeft === 0) {
            setPhase('hold');
            setTimeLeft(4);
        } else if (phase === 'hold' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (phase === 'hold' && timeLeft === 0) {
            setPhase('exhale');
            setTimeLeft(6);
        } else if (phase === 'exhale' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (phase === 'exhale' && timeLeft === 0) {
            setPhase('inhale');
            setTimeLeft(4);
        }
        return () => clearTimeout(timer);
    }, [phase, timeLeft]);

    return (
        <div className="pranayama-overlay fadeIn">
            <button className="close-pranayama" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="pranayama-content">
                <h2 className="meditation-title">Find Your Center</h2>
                <p className="meditation-subtitle">Let the breath anchor you to the present moment.</p>

                <div className="breathing-circle-container">
                    <div className={`breathing-circle ${phase}`}>
                        <div className="breathing-text">
                            <span className="phase-text">
                                {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}
                            </span>
                            <span className="time-text">{timeLeft}s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
