import React, { useState, useRef, useEffect, forwardRef } from 'react';

interface Ripple {
    id: number;
    x: number;
    y: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(({ children, className, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setRipples(prev => {
                if (prev.length === 0) return prev;
                // Remove old ripples (assuming 600ms animation)
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = nextId.current++;
        setRipples(prev => [...prev, { id, x, y }]);

        // Auto remove after 600ms
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);

        if (onClick) onClick(e);
    };

    return (
        <button ref={ref} className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
            {children}
            {ripples.map(r => (
                <span
                    key={r.id}
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                    style={{
                        left: r.x,
                        top: r.y,
                        width: 20,
                        height: 20,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </button>
    );
});

RippleButton.displayName = 'RippleButton';
