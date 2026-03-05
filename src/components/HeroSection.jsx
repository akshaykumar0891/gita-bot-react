import { useState, useEffect } from 'react';
import './HeroSection.css';

const DAILY_VERSES = [
    { sanskrit: "karmany evadhikaras te ma phalesu kadacana", english: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action." },
    { sanskrit: "yuddhyasva vigata-jvarah", english: "Fight, devoid of mental fever." },
    { sanskrit: "sraddhavan labhate jnanam", english: "The man of faith, who is devoted and who has mastered his senses, attains this knowledge." },
    { sanskrit: "uddhared atmanatmanam", english: "One must elevate, not degrade, oneself by one's own mind." }
];

export function HeroSection() {
    const [verse, setVerse] = useState(null);

    useEffect(() => {
        // Pick a random verse on mount
        const randomVerse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
        setVerse(randomVerse);
    }, []);

    return (
        <div className="hero-section">
            <svg className="hero-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 70 L80 30" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
                <circle cx="35" cy="56" r="2" fill="hsl(var(--secondary))" />
                <circle cx="45" cy="49" r="2" fill="hsl(var(--secondary))" />
                <circle cx="55" cy="42" r="2" fill="hsl(var(--secondary))" />
                <circle cx="65" cy="35" r="2" fill="hsl(var(--secondary))" />
                <path d="M40 80 C20 60 10 30 30 10 C50 30 80 40 60 70 C50 85 45 85 40 80 Z" fill="url(#featherGradient)" opacity="0.8" />
                <circle cx="40" cy="40" r="12" fill="hsl(var(--accent))" opacity="0.9" />
                <circle cx="40" cy="40" r="8" fill="hsl(var(--primary))" />
                <circle cx="40" cy="40" r="4" fill="hsl(var(--secondary))" />
                <defs>
                    <linearGradient id="featherGradient" x1="20" y1="20" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
                    </linearGradient>
                </defs>
            </svg>
            <h1 className="hero-greeting">Seek Guidance from Krishna</h1>

            {verse && (
                <div className="daily-verse-container fade-in-up">
                    <p className="verse-sanskrit">{verse.sanskrit}</p>
                    <p className="verse-english">"{verse.english}"</p>
                </div>
            )}
        </div>
    );
}
