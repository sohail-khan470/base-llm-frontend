// import { useEffect, useState, useRef } from "react";

// const BackgroundEffects = ({ isTyping, isIdle }) => {
//   const [stars, setStars] = useState([]);
//   const animationRef = useRef();

//   // Generate stars
//   useEffect(() => {
//     const generateStars = () => {
//       const newStars = [];
//       for (let i = 0; i < 200; i++) {
//         newStars.push({
//           id: i,
//           x: Math.random() * 100,
//           y: Math.random() * 100,
//           size: Math.random() * 2 + 0.5,
//           speedX: (Math.random() - 0.5) * 0.02, // Reduced speed for smoother motion
//           speedY: (Math.random() - 0.5) * 0.02,
//         });
//       }
//       setStars(newStars);
//     };

//     generateStars();
//   }, []);

//   // Smooth continuous animation using requestAnimationFrame
//   useEffect(() => {
//     const animateStars = () => {
//       setStars((prevStars) =>
//         prevStars.map((star) => {
//           let newX = star.x + star.speedX;
//           let newY = star.y + star.speedY;

//           // Wrap around edges
//           if (newX > 100) newX = -2;
//           if (newX < -2) newX = 100;
//           if (newY > 100) newY = -2;
//           if (newY < -2) newY = 100;

//           return { ...star, x: newX, y: newY };
//         })
//       );

//       animationRef.current = requestAnimationFrame(animateStars);
//     };

//     animationRef.current = requestAnimationFrame(animateStars);

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 -z-50 bg-black overflow-hidden">
//       {/* Deep space gradient */}
//       <div className="absolute inset-0 bg-gradient-radial from-gray-900/5 via-black to-black"></div>

//       {/* Falling star 1 - diagonal descent from top-left to bottom-right */}
//       <div
//         className="absolute w-3 h-3 bg-white rounded-full opacity-95"
//         style={{
//           left: `${-10 + ((Date.now() / 80) % 120)}%`,
//           top: `${10 + ((Date.now() / 80) % 120) * 0.4}%`,
//           boxShadow:
//             "0 0 15px rgba(255, 255, 255, 1), -20px -12px 25px rgba(255, 255, 255, 0.8), -40px -24px 35px rgba(255, 255, 255, 0.6), -60px -36px 45px rgba(255, 255, 255, 0.4), -80px -48px 55px rgba(255, 255, 255, 0.25), -100px -60px 65px rgba(255, 255, 255, 0.15), -120px -72px 75px rgba(255, 255, 255, 0.08), -140px -84px 85px rgba(255, 255, 255, 0.04)",
//         }}
//       ></div>

//       {/* Falling star 2 - diagonal descent from top-right to bottom-left */}
//       <div
//         className="absolute w-2.5 h-2.5 bg-yellow-100 rounded-full opacity-90"
//         style={{
//           left: `${110 - ((Date.now() / 120) % 120)}%`,
//           top: `${5 + ((Date.now() / 120) % 120) * 0.6}%`,
//           boxShadow:
//             "0 0 12px rgba(254, 243, 199, 0.9), 18px -15px 22px rgba(254, 243, 199, 0.7), 36px -30px 32px rgba(254, 243, 199, 0.5), 54px -45px 42px rgba(254, 243, 199, 0.35), 72px -60px 52px rgba(254, 243, 199, 0.22), 90px -75px 62px rgba(254, 243, 199, 0.12), 108px -90px 72px rgba(254, 243, 199, 0.06), 126px -105px 82px rgba(254, 243, 199, 0.03)",
//         }}
//       ></div>

//       {/* Stars */}
//       {stars.map((star) => (
//         <div
//           key={`star-${star.id}`}
//           className="absolute rounded-full bg-white"
//           style={{
//             left: `${star.x}%`,
//             top: `${star.y}%`,
//             width: `${star.size}px`,
//             height: `${star.size}px`,
//             opacity: 0.8, // Fixed opacity - no blinking
//           }}
//         ></div>
//       ))}

//       <style jsx>{`
//         .bg-gradient-radial {
//           background: radial-gradient(circle, var(--tw-gradient-stops));
//         }
//       `}</style>
//     </div>
//   );
// };

// export default BackgroundEffects;

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-black">
      {/* Subtle solid color similar to ChatGPT */}
      <div className="absolute inset-0 bg-[#111827]" />
    </div>
  );
};

export default BackgroundEffects;
