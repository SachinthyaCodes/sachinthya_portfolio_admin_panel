'use client';

import { useEffect, useRef } from 'react';

const MinimalParticles = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Enhanced Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5; // 0.5-2.5px particles
        this.speedX = (Math.random() - 0.5) * 0.3; // Slightly faster movement
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1; // 0.1-0.5 opacity (more subtle for admin)
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.002 + 0.0005;
        
        // Add color variation - Admin theme colors
        this.hue = Math.random() * 60 + 200; // Blue to purple range (200-260)
        this.brightness = Math.random() * 20 + 60; // 60-80% brightness (darker for admin theme)
        
        // Add some purple/indigo variations for admin theme
        if (Math.random() > 0.7) {
          this.hue = Math.random() * 40 + 250; // Purple range (250-290)
          this.brightness = Math.random() * 15 + 50; // Even subtler
        }
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges with smooth transition
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.y > canvas.height + 10) this.y = -10;
        if (this.y < -10) this.y = canvas.height + 10;

        // Smooth fade animation - admin theme ranges
        this.opacity += this.fadeDirection * this.fadeSpeed;
        if (this.opacity <= 0.05 || this.opacity >= 0.5) {
          this.fadeDirection *= -1;
        }

        // Subtle hue shift
        this.hue += 0.1;
        if (this.hue > 260) this.hue = 200;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, ${this.brightness}%, 1)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, ${this.brightness}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create floating orbs
    class FloatingOrb {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 80 + 40; // 40-120px
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.02 + 0.005; // Very subtle for admin theme
        this.hue = Math.random() * 60 + 200;
        
        // Add some admin-specific purple tones
        if (Math.random() > 0.6) {
          this.hue = Math.random() * 40 + 260; // Deep purple range
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 60%, 70%, 0.8)`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, 60%, 70%, 0.2)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 60%, 70%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles and orbs
    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 8000); // Increased density
      const orbCount = Math.floor((canvas.width * canvas.height) / 200000); // Subtle orbs
      
      particlesRef.current = [];
      
      // Add main particles
      for (let i = 0; i < Math.min(particleCount, 120); i++) {
        particlesRef.current.push(new Particle());
      }
      
      // Add floating orbs
      for (let i = 0; i < Math.min(orbCount, 8); i++) {
        particlesRef.current.push(new FloatingOrb());
      }
    };

    createParticles();

    // Animation loop with performance optimization
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      if (currentTime - lastTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particlesRef.current.forEach(particle => {
          particle.update();
          particle.draw();
        });
        
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Recreate particles on resize
    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6
      }}
    />
  );
};

export default MinimalParticles;