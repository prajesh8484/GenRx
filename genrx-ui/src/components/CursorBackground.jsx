import React, { useEffect, useRef } from 'react';

const CursorBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let dots = [];

    const spacing = 25; 
    const dotSize = 1.5;
    const hoverRadius = 100;
    const activeColor = 'rgba(13, 148, 136, 0.6)';
    const baseColorRaw = { r: 13, g: 148, b: 136, a: 0.15 };
    
    // Create dots grid
    const initDots = (width, height) => {
      dots = [];
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push({
            x,
            y,
            intensity: 0 // 0 to 1, where 1 is fully active
          });
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots(canvas.width, canvas.height);
    };

    // Initial Setup
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      dots.forEach(dot => {
        // Calculate distance to mouse
        const dx = dot.x - mouseRef.current.x;
        const dy = dot.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Target intensity based on distance
        let targetIntensity = 0;
        if (distance < hoverRadius) {
            targetIntensity = 1 - (distance / hoverRadius);
        }

        // Smooth decay/attack
        // Rise fast (0.3), decay slow (0.05) for trail effect
        const speed = targetIntensity > dot.intensity ? 0.3 : 0.05;
        dot.intensity += (targetIntensity - dot.intensity) * speed;

        // Visuals based on intensity
        const size = dotSize + (dot.intensity * 1.5); // Grow up to +1.5px
        
        // Interpolate opacity
        // Base: 0.15, Active: 0.6 -> range is 0.45
        const opacity = baseColorRaw.a + (dot.intensity * 0.45);
        ctx.fillStyle = `rgba(${baseColorRaw.r}, ${baseColorRaw.g}, ${baseColorRaw.b}, ${opacity})`;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Event Listeners
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1,
        pointerEvents: 'none',
        background: '#ffffff'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      {/* Corner Gradients Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 0% 0%, rgba(13, 148, 136, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(13, 148, 136, 0.1) 0%, transparent 40%)
          `
        }}
      />
    </div>
  );
};

export default CursorBackground;
