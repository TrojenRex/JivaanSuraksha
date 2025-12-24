import DietPlanner from '@/components/diet-planner';
import Header from '@/components/layout/header';

export default function DietPlannerPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20 md:pt-28">
        <DietPlanner />
      </main>
    </div>
  );
}
