import Header from '@/components/layout/header';
import SymptomChecker from '@/components/symptom-checker';

export default function SymptomCheckerPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20 md:pt-28">
        <SymptomChecker />
      </main>
    </div>
  );
}
