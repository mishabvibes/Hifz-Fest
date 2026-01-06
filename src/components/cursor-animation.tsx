"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

const CursorAnimation = () => {
    const circles = useRef<HTMLDivElement[]>([]);
    const colors = ["#FF6F61", "#FFD700", "#4CAF50", "#1E90FF"];

    // Add check for mobile/touch devices
    const isMobile = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 768px)").matches ||
            'ontouchstart' in window ||
            (navigator.maxTouchPoints > 0);
    };

    const moveCircles = (x: number, y: number) => {
        if (!circles.current || circles.current.length < 1) return;

        circles.current.forEach((circle, i) => {
            if (circle) { // Check if circle ref exists
                gsap.to(circle, {
                    x: x,
                    y: y,
                    xPercent: -50,
                    yPercent: -50,
                    delay: i * 0.05,
                    ease: "power3.out",
                    duration: 0.4,
                });
            }
        });
    };

    useEffect(() => {
        // Don't initialize on mobile
        if (isMobile()) return;

        const handleMouseMove = (e: MouseEvent) => {
            moveCircles(e.clientX, e.clientY);
        };

        // Create context for cleanup
        const ctx = gsap.context(() => {
            window.addEventListener("mousemove", handleMouseMove);
        });

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            ctx.revert();
        };
    }, []);

    // Don't render on mobile (will check in effect too, but this prevents initial render if we can know)
    // However, relying on window in render body can cause hydration mismatch if not careful.
    // Best to rely on useEffect or just render hidden initially. 
    // Given the user code, let's wrap strictly.
    // Actually, standard practice for "isMobile" check in render is to use a state initialized in useEffect
    // to avoid hydration errors.

    // Refactoring slightly to use state for mounting if we want to avoid hydration mismatch
    // OR just render it and let CSS/JS handle it.
    // The user provided code returns null if isMobile().
    // "if (isMobile()) return null;" calls window.
    // This will crash on server or cause hydration error.

    // Let's safe guard it. 'isMobile' checks window.
    // I will make it return null during SSR and then check on mount.

    // But simplified: Just always render the structure (it's hidden or absolute) or use a state.
    return (
        <div className="pointer-events-none fixed top-0 left-0 z-9999 hidden md:block">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    ref={(ref) => { if (ref) circles.current[i] = ref; }}
                    className="circle fixed top-0 left-0 h-5 w-5 rounded-full opacity-80"
                    style={{
                        backgroundColor: colors[i],
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>
            ))}
        </div>
    );
};

export default CursorAnimation;
