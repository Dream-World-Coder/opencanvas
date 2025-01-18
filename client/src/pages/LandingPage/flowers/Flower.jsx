import { useState, useCallback } from "react";
import { debounce } from "lodash";

const InteractiveFlower = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Debounce the mouse move handler to reduce number of updates
    const handleMouseMove = useCallback(
        debounce((e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            setMousePosition({ x, y });
        }, 16), // ~60fps
        [],
    );

    return (
        <svg
            className="absolute right-0 top-20 w-1/3 h-auto cursor-pointer"
            viewBox="0 0 400 600"
            xmlns="http://www.w3.org/2000/svg"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
        >
            {/* Petals with CSS transform classes */}
            <g
                className={`transform-gpu transition-transform duration-300 ease-out`}
                style={{
                    transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
                }}
            >
                <path d="M200,300 Q180,200 300,250 T200,300" fill="#FFB5B5">
                    <animate
                        attributeName="d"
                        dur="3s"
                        repeatCount="indefinite"
                        values="M200,300 Q180,200 300,250 T200,300;
                               M200,300 Q185,195 305,245 T200,300;
                               M200,300 Q180,200 300,250 T200,300"
                    />
                </path>
            </g>
            <g
                className="transform-gpu transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * -0.15}px, ${mousePosition.y * 0.15}px)`,
                }}
            >
                <path d="M200,300 Q220,200 100,250 T200,300" fill="#FFD1DC">
                    <animate
                        attributeName="d"
                        dur="3.5s"
                        repeatCount="indefinite"
                        values="M200,300 Q220,200 100,250 T200,300;
                               M200,300 Q225,195 105,245 T200,300;
                               M200,300 Q220,200 100,250 T200,300"
                    />
                </path>
            </g>
            <g
                className="transform-gpu transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * -0.1}px)`,
                }}
            >
                <path d="M200,300 Q300,280 250,400 T200,300" fill="#FFC8B4" />
            </g>
            <g
                className="transform-gpu transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * -0.1}px, ${mousePosition.y * -0.15}px)`,
                }}
            >
                <path d="M200,300 Q100,280 150,400 T200,300" fill="#FFE5B4" />
            </g>
            <g
                className="transform-gpu transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
                }}
            >
                <path d="M200,300 Q180,400 300,350 T200,300" fill="#FFF0DB" />
            </g>
            <g
                className="transform-gpu transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * -0.05}px, ${mousePosition.y * 0.1}px)`,
                }}
            >
                <path d="M200,300 Q220,400 100,350 T200,300" fill="#FFB5B5" />
            </g>

            {/* Center and stem - these don't need transforms */}
            <circle cx="200" cy="300" r="20" fill="#FFE4B5" />
            <path
                d="M195,500 Q200,400 205,500"
                stroke="#90B77D"
                strokeWidth="3"
                fill="none"
            />
            <path
                d="M195,500 L200,420 Q210,410 220,430"
                stroke="#90B77D"
                strokeWidth="2"
                fill="none"
            />
            <path
                d="M205,460 Q215,450 225,470"
                stroke="#90B77D"
                strokeWidth="2"
                fill="none"
            />
        </svg>
    );
};

export default InteractiveFlower;
