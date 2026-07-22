import { useEffect, useRef } from 'react';

export function useParticles(active = true) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const ptsRef    = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function init() {
      const w = canvas.width  = canvas.offsetWidth  || 640;
      const h = canvas.height = canvas.offsetHeight || 680;
      ptsRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.5 + 0.1,
      }));
    }

    function loop() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      const pts = ptsRef.current;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,197,24,${p.a * 0.4})`;
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,197,24,${(1 - d / 110) * 0.04})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(loop);
    }

    init();
    loop();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  return canvasRef;
}
