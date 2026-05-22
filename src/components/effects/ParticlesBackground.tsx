"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkle: number;
  hue: string;
};

const colors = ["56, 189, 248", "124, 58, 237", "251, 191, 36", "248, 250, 252"];

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const particleCanvas = canvas;
    const context = particleCanvas.getContext("2d");
    if (!context) {
      return;
    }
    const particleContext = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      particleCanvas.width = width * ratio;
      particleCanvas.height = height * ratio;
      particleCanvas.style.width = `${width}px`;
      particleCanvas.style.height = `${height}px`;
      particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);

      const amount = width < 768 ? 70 : 130;
      particles = Array.from({ length: amount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        radius: Math.random() * 1.6 + 0.25,
        alpha: Math.random() * 0.55 + 0.12,
        twinkle: Math.random() * Math.PI * 2,
        hue: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    function draw() {
      particleContext.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.twinkle += 0.014;
        }

        if (particle.x < -4) particle.x = width + 4;
        if (particle.x > width + 4) particle.x = -4;
        if (particle.y < -4) particle.y = height + 4;
        if (particle.y > height + 4) particle.y = -4;

        const shimmer = particle.alpha + Math.sin(particle.twinkle) * 0.16;
        particleContext.beginPath();
        particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        particleContext.fillStyle = `rgba(${particle.hue}, ${Math.max(0.04, shimmer)})`;
        particleContext.shadowBlur = particle.radius * 8;
        particleContext.shadowColor = `rgba(${particle.hue}, 0.8)`;
        particleContext.fill();
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" aria-hidden />;
}
