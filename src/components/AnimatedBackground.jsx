import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawWave = (yOffset, amplitude, frequency, speed, color, lineWidth) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const width = canvas.width;
      const height = canvas.height;
      for (let x = 0; x <= width; x += 3) {
        const y = yOffset + Math.sin((x / width) * Math.PI * 2 * frequency + time * speed) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const drawCircle = (x, y, radius, color, alpha) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4c1d95');
      gradient.addColorStop(0.5, '#5b21b6');
      gradient.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawWave(canvas.height * 0.25, 40, 2, 0.6, 'rgba(255,255,255,0.12)', 1);
      drawWave(canvas.height * 0.55, 55, 1.5, 0.4, 'rgba(255,255,255,0.10)', 1);
      drawWave(canvas.height * 0.78, 35, 2.2, 0.7, 'rgba(255,255,255,0.09)', 1);

      const cx1 = (canvas.width * 0.15 + Math.sin(time * 0.3) * 40);
      const cy1 = canvas.height * 0.35 + Math.cos(time * 0.4) * 20;
      drawCircle(cx1, cy1, 24, 'rgba(255,255,255,0.35)', 0.35);
      drawCircle(cx1 + 12, cy1 - 8, 10, 'rgba(255,255,255,0.25)', 0.35);

      const cx2 = canvas.width * 0.82 + Math.cos(time * 0.35) * 30;
      const cy2 = canvas.height * 0.22 + Math.sin(time * 0.45) * 25;
      drawCircle(cx2, cy2, 18, 'rgba(255,255,255,0.30)', 0.35);
      drawCircle(cx2 - 10, cy2 + 14, 8, 'rgba(255,255,255,0.20)', 0.35);

      const cx3 = canvas.width * 0.6 + Math.sin(time * 0.25) * 35;
      const cy3 = canvas.height * 0.72 + Math.cos(time * 0.3) * 18;
      drawCircle(cx3, cy3, 14, 'rgba(255,255,255,0.28)', 0.35);

      const cx4 = canvas.width * 0.3 + Math.cos(time * 0.28) * 28;
      const cy4 = canvas.height * 0.85 + Math.sin(time * 0.33) * 15;
      drawCircle(cx4, cy4, 10, 'rgba(255,255,255,0.22)', 0.35);

      const plusX = canvas.width * 0.78 + Math.sin(time * 0.2) * 20;
      const plusY = canvas.height * 0.68;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(plusX - 8, plusY - 1.5, 16, 3);
      ctx.fillRect(plusX - 1.5, plusY - 8, 3, 16);

      const crossX = canvas.width * 0.12 + Math.cos(time * 0.22) * 18;
      const crossY = canvas.height * 0.78;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(crossX - 6, crossY - 1.5, 12, 3);
      ctx.fillRect(crossX - 1.5, crossY - 6, 3, 12);

      const triX = canvas.width * 0.28 + Math.sin(time * 0.18) * 15;
      const triY = canvas.height * 0.12;
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.moveTo(triX, triY - 6);
      ctx.lineTo(triX + 6, triY + 5);
      ctx.lineTo(triX - 6, triY + 5);
      ctx.closePath();
      ctx.fill();

      time += 0.01;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
