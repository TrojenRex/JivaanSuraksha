
'use client';

import { useRef, type MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, MapPin, Pill, Scan, Utensils, LifeBuoy, Newspaper, Siren, Sparkle } from 'lucide-react';
import { useLanguage } from './language-provider';
import TransitionLink from './transition-link';

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
          <p className="text-muted-foreground mb-6 flex-1">{description}</p>
          <TransitionLink href={href} className="btn-uiverse mt-auto">
            {buttonText}
          </TransitionLink>
        </CardContent>
      </Card>
    </div>
  );
};

export default function InteractiveCards() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
      <InteractiveCard
        href="/symptom-checker"
        icon={Stethoscope}
        title={t('symptomChecker')}
        description={t('symptomCheckerDescription')}
        buttonText={t('startChecking')}
      />
       <InteractiveCard
        href="/medicine-checker"
        icon={Pill}
        title={t('medicineChecker')}
        description={t('medicineCheckerDescription')}
        buttonText={t('getInfo')}
      />
      <InteractiveCard
        href="/nearby-clinics"
        icon={MapPin}
        title={t('nearbyClinics')}
        description={t('nearbyClinicsDescription')}
        buttonText={t('findClinics')}
      />
      <InteractiveCard
        href="/skin-analyzer"
        icon={Scan}
        title={t('skinAnalyzer')}
        description={t('skinAnalyzerDescription')}
        buttonText={t('analyzeSkin')}
      />
      <InteractiveCard
        href="/diet-planner"
        icon={Utensils}
        title={t('dietPlanner')}
        description={t('dietPlannerDescription')}
        buttonText={t('createPlan')}
      />
      <InteractiveCard
        href="/first-aid"
        icon={LifeBuoy}
        title={t('firstAidGuide')}
        description={t('firstAidGuideDescription')}
        buttonText={t('getHelp')}
      />
    </div>
  );
}
