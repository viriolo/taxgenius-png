
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface AnimatedBackgroundProps {
  isTyping: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isTyping }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [particles, setParticles] = useState<THREE.Points | null>(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x5f9ea0,
      transparent: true,
      opacity: 0.8,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 2;
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotation speed depends on isTyping
      const speed = isTyping ? 0.002 : 0.0005;
      particlesMesh.rotation.y += speed;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Set states
    setScene(scene);
    setParticles(particlesMesh);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);
  
  // Update animation when typing status changes
  useEffect(() => {
    if (!particles) return;
    
    // Change color based on typing status
    const material = particles.material as THREE.PointsMaterial;
    
    if (isTyping) {
      material.color.set(0x00acee); // Blue when typing
      material.size = 0.03;
    } else {
      material.color.set(0x5f9ea0); // Default teal color
      material.size = 0.02;
    }
  }, [isTyping, particles]);
  
  return (
    <div 
      className="absolute inset-0 -z-10 overflow-hidden" 
      ref={mountRef}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedBackground;
