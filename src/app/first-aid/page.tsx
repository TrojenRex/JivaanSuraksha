import Header from '@/components/layout/header';
import FirstAidGuide from '@/components/first-aid-guide';

export default function FirstAidPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <FirstAidGuide />
      </main>
    </div>
  );
}
