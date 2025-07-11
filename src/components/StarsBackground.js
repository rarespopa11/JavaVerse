import React, { useEffect, useRef } from 'react';

function StarsBackground() {
  const starsContainerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Setăm dimensiunea canvas-ului la dimensiunea ferestrei
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Numărul de stele - adaptat la dimensiunea ecranului
    const starsCount = Math.floor((canvas.width * canvas.height) / 1000);
    
    // Creăm stelele
    const stars = [];
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.01,
        pulse: Math.random() * 0.1
      });
    }
    
    // Adăugăm și câteva stele mai mari și mai strălucitoare
    for (let i = 0; i < starsCount / 20; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2,
        opacity: Math.random() * 0.8 + 0.4,
        speed: Math.random() * 0.02 + 0.005,
        pulse: Math.random() * 0.2
      });
    }
    
    // Animația pentru stele
    let animationFrameId;
    let time = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenăm un gradient de fundal
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(20, 10, 40, 1)');
      gradient.addColorStop(1, 'rgba(40, 10, 80, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Desenăm ceață colorată
      for (let i = 0; i < 3; i++) {
        const cloudGradient = ctx.createRadialGradient(
          canvas.width * (0.3 + i * 0.3), 
          canvas.height * (0.4 + i * 0.2), 
          10, 
          canvas.width * (0.3 + i * 0.3), 
          canvas.height * (0.4 + i * 0.2), 
          canvas.width * 0.6
        );
        
        const colors = [
          ['rgba(138, 43, 226, 0.05)', 'rgba(138, 43, 226, 0)'],
          ['rgba(255, 0, 255, 0.03)', 'rgba(255, 0, 255, 0)'],
          ['rgba(0, 255, 204, 0.04)', 'rgba(0, 255, 204, 0)']
        ];
        
        cloudGradient.addColorStop(0, colors[i][0]);
        cloudGradient.addColorStop(1, colors[i][1]);
        
        ctx.fillStyle = cloudGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Desenăm stelele
      time += 0.01;
      
      stars.forEach(star => {
        // Facem stelele să pulseze
        const pulseFactor = 1 + Math.sin(time * star.pulse) * 0.3;
        
        // Desenăm stelele
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Adăugăm un halou în jurul stelelor mai mari
        if (star.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3 * pulseFactor, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(
            star.x, star.y, star.radius * pulseFactor,
            star.x, star.y, star.radius * 4 * pulseFactor
          );
          glow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.3})`);
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glow;
          ctx.fill();
        }
        
        // Mișcăm stelele foarte ușor
        star.y -= star.speed;
        
        // Dacă o stea iese din ecran, o readucem jos
        if (star.y < -star.radius * 2) {
          star.y = canvas.height + star.radius * 2;
          star.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="stars-background" ref={starsContainerRef}>
      <canvas ref={canvasRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}></canvas>
    </div>
  );
}

export default StarsBackground;