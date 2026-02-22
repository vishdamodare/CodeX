"use client";

import { useState, useEffect } from "react";

export default function TypewriterText({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Typing speeds
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!isDeleting && displayedText === text) {
            // Pause at the end before deleting
            timer = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && displayedText === "") {
            // Pause at the beginning before typing again
            timer = setTimeout(() => setIsDeleting(false), 500);
        } else {
            timer = setTimeout(() => {
                const nextText = isDeleting
                    ? text.substring(0, displayedText.length - 1)
                    : text.substring(0, displayedText.length + 1);
                setDisplayedText(nextText);
            }, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, text]);

    return (
        <span style={{ color: "var(--accent-green)", textShadow: "0 0 20px rgba(34, 197, 94, 0.4)" }}>
            {displayedText}
            <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
        </span>
    );
}
