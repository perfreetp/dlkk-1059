import { useEffect, useRef } from 'react';

interface RainEffectProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

const RainEffect = ({ intensity = 'light' }: RainEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dropCount = intensity === 'light' ? 100 : intensity === 'medium' ? 200 : 350;
    const drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 10 + Math.random() * 10,
        length: 15 + Math.random() * 20,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x - 2, drop.y + drop.length);
        gradient.addColorStop(0, `rgba(0, 212, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(0, 212, 255, ${drop.opacity})`);
        gradient.addColorStop(1, `rgba(0, 212, 255, ${drop.opacity * 0.5})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 1;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
        if (drop.x < -10) {
          drop.x = canvas.width + 10;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default RainEffect;
