'use client';

import { useRef, type MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Stethoscope, MapPin } from 'lucide-react';

export default function InteractiveCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    const rotateX = (-y / height) * 20; // Tilt intensity
    const rotateY = (x / width) * 20;

    containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const onMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl transition-transform duration-300 ease-out"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-2 flex flex-col transition-transform duration-300 hover:translate-z-10">
        <CardHeader className="items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">AI Symptom Checker</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center text-center">
          <p className="text-muted-foreground mb-6">
            Describe your symptoms and get instant AI-powered insights into possible conditions related to water contamination.
          </p>
          <Link href="/symptom-checker" className="btn-uiverse mt-auto">
            Start Checking
          </Link>
        </CardContent>
      </Card>
      <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-2 flex flex-col transition-transform duration-300 hover:translate-z-10">
        <CardHeader className="items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Find Nearby Clinics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center text-center">
          <p className="text-muted-foreground mb-6">
            Use your location to find the nearest clinics and hospitals for professional medical assistance.
          </p>
          <Link href="/nearby-clinics" className="btn-uiverse mt-auto">
            Find Clinics
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
