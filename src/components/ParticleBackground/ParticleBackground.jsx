import React, { useRef, useEffect } from 'react';
import './ParticleBackground.css';

const ParticleBackground = ({ theme = 'neutral', density = 50, speed = 1, opacity = 0.3, visible = true }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  
  // Set theme-specific particle properties
  const getThemeProperties = (theme) => {
    switch (theme) {
      case 'data':
        return {
          colors: ['rgba(66, 165, 245, 0.8)', 'rgba(100, 181, 246, 0.6)', 'rgba(30, 136, 229, 0.7)'],
          size: { min: 1, max: 3 },
          connectDistance: 120,
          connectOpacity: 0.2
        };
      case 'marketing':
        return {
          colors: ['rgba(255, 132, 26, 0.8)', 'rgba(255, 152, 66, 0.6)', 'rgba(239, 108, 0, 0.7)'],
          size: { min: 1, max: 3 },
          connectDistance: 120,
          connectOpacity: 0.2
        };
      case 'admin':
        return {
          colors: ['rgba(139, 69, 255, 0.5)', 'rgba(99, 102, 241, 0.4)', 'rgba(59, 130, 246, 0.3)'],
          size: { min: 1, max: 2.5 },
          connectDistance: 100,
          connectOpacity: 0.15
        };
      default:
        return {
          colors: ['rgba(255, 255, 255, 0.5)', 'rgba(200, 200, 200, 0.4)', 'rgba(230, 230, 230, 0.3)'],
          size: { min: 1, max: 2 },
          connectDistance: 100,
          connectOpacity: 0.1
        };
    }
  };

  useEffect(() => {
    if (!visible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const themeProps = getThemeProperties(theme);
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reinitialize particles when canvas is resized
      initParticles();
    };
    
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(density, 150); // Limit max particles for performance
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (themeProps.size.max - themeProps.size.min) + themeProps.size.min,
          color: themeProps.colors[Math.floor(Math.random() * themeProps.colors.length)],
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          connectDistance: themeProps.connectDistance,
          connectOpacity: themeProps.connectOpacity
        });
      }
    };
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Update particle position with boundary check
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      // Draw connections between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < p1.connectDistance) {
            // Calculate opacity based on distance
            const opacity = (1 - distance / p1.connectDistance) * p1.connectOpacity;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Create gradient for line
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color.replace(/[^,]+(?=\))/, opacity));
            gradient.addColorStop(1, p2.color.replace(/[^,]+(?=\))/, opacity));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(drawParticles);
    };
    
    // Initialize and start animation
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawParticles();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, density, speed, opacity, visible]);
  
  if (!visible) return null;
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`particle-canvas ${theme === 'data' ? 'data-theme' : theme === 'marketing' ? 'marketing-theme' : theme === 'admin' ? 'admin-theme' : 'neutral-theme'}`}
    />
  );
};

export default ParticleBackground;