import { useEffect, useState } from "react";

const BackgroundEffects = ({ isTyping, isIdle }) => {
  const [stars, setStars] = useState([]);

  // Generate stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 200; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1,
          twinkle: Math.random() > 0.8,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  // Animate stars continuously
  useEffect(() => {
    const animateStars = () => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          let newX = star.x + star.speedX;
          let newY = star.y + star.speedY;

          // Wrap around edges
          if (newX > 100) newX = -2;
          if (newX < -2) newX = 100;
          if (newY > 100) newY = -2;
          if (newY < -2) newY = 100;

          return { ...star, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(animateStars, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 bg-black overflow-hidden">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-gray-900/5 via-black to-black"></div>

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`
            absolute rounded-full bg-white transition-all duration-100 ease-linear
            ${star.twinkle ? "animate-pulse" : ""}
          `}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        ></div>
      ))}

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default BackgroundEffects;
