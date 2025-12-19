'use client';

import { useRef, type MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Stethoscope, MapPin, Newspaper } from 'lucide-react';

const InteractiveCard = ({
  href,
  icon: Icon,
  title,
  description,
  buttonText,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    const rotateX = (-y / height) * 10; // Tilt intensity
    const rotateY = (x / width) * 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    cardRef.current.style.transition = 'transform 0.1s ease-out';
  };

  const onMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      cardRef.current.style.transition = 'transform 0.3s ease-in-out';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="transition-transform duration-300"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-2 flex flex-col h-full">
        <CardHeader className="items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center text-center">
          <p className="text-muted-foreground mb-6">{description}</p>
          <Link href={href} className="btn-uiverse mt-auto">
            {buttonText}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default function InteractiveCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
      <InteractiveCard
        href="/symptom-checker"
        icon={Stethoscope}
        title="AI Symptom Checker"
        description="Describe your symptoms and get instant AI-powered insights into possible conditions related to water contamination."
        buttonText="Start Checking"
      />
      <InteractiveCard
        href="/nearby-clinics"
        icon={MapPin}
        title="Find Nearby Clinics"
        description="Use your location to find the nearest clinics and hospitals for professional medical assistance."
        buttonText="Find Clinics"
      />
      <InteractiveCard
        href="/news"
        icon={Newspaper}
        title="Medical News"
        description="Stay informed with the latest articles and updates on water-borne diseases and public health."
        buttonText="Read News"
      />
    </div>
  );
}
