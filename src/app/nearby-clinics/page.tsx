import Header from '@/components/layout/header';
import NearbyClinics from '@/components/nearby-clinics';

export default function NearbyClinicsPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20 md:pt-28">
        <NearbyClinics />
      </main>
    </div>
  );
}
