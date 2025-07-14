import { useEffect, useRef, useState } from 'react';

const WaterWaves = () => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const waves = [];
    const waveCount = 10;

    for (let i = 0; i < waveCount; i++) {
      waves.push({
        y: (canvas.height / 2) - 100 + Math.random() * 200,
        length: 0.01 + Math.random() * 0.001,
        amplitude: 50 + Math.random() * 100,
        frequency: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }

    function animate() {
      if (!canvas) return;
      
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);
        for (let i = 0; i < canvas.width; i++) {
          const yOffset = Math.sin(i * wave.length + wave.phase) * wave.amplitude * Math.sin(wave.phase);
          ctx.lineTo(i, wave.y + yOffset);
        }
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.95)');
        gradient.addColorStop(0.5, 'rgba(186, 0, 255, 0.92)');
        gradient.addColorStop(1, 'rgba(255, 102, 255, 0.95)');
        ctx.strokeStyle = gradient;
        ctx.stroke();
        wave.phase += wave.frequency;
      });
    }

    animate();

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      waves.forEach((wave) => {
        wave.y = canvas.height / 2 - 100 + Math.random() * 200;
      });
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isMobile]);

  if (isMobile) {
    return (
      <div 
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/20 to-pink-500/20"
        style={{ 
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite'
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 0,
      }}
    />
  );
};

export default WaterWaves;