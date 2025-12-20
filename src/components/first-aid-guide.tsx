
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, AlertTriangle, ArrowLeft, Wind, HeartPulse, Flame } from 'lucide-react';

type EmergencyData = {
  title: string;
  steps: string;
  whenToSeeDoctor: string;
};

const firstAidData: Record<string, EmergencyData> = {
    'minor_burn': {
        title: 'Minor Burns (1st Degree)',
        steps: `A minor burn is typically red and painful but does not have large blisters.
1. **Cool the burn**: Hold the area under cool (not cold) running water for at least 10 to 20 minutes. If running water isn't available, use a cool, wet compress.
2. **Remove jewelry**: Gently remove rings or tight items from the burned area before it begins to swell.
3. **Protect the area**: Apply a thin layer of aloe vera gel or a moisturizing lotion. Do not use butter, oils, or toothpaste, as these trap heat and can cause infection.
4. **Bandage loosely**: Cover the burn with a sterile gauze bandage. Avoid fluffy cotton that might stick to the wound.
5. **Don't pop blisters**: If small blisters form, leave them alone to prevent infection.`,
        whenToSeeDoctor: 'See a doctor if the burn is larger than 3 inches, is on the face, hands, feet, or major joints, or shows signs of infection (like increased pain, redness, or oozing).'
    },
    'bee_sting': {
        title: 'Bee Stings',
        steps: `1. **Remove the stinger**: If the stinger is still in the skin, scrape it off using the edge of a credit card or a fingernail. Avoid using tweezers to "pull" it, as squeezing can release more venom.
2. **Wash the site**: Use soap and water to clean the area.
3. **Reduce swelling**: Apply an ice pack (wrapped in a cloth) for 10–15 minutes.
4. **Treat itching**: Use hydrocortisone cream or a baking soda paste (baking soda mixed with a little water) to soothe the area.`,
        whenToSeeDoctor: '**Warning**: If the person experiences difficulty breathing, swelling of the throat, or dizziness, call emergency services immediately—this could be anaphylaxis.'
    },
    'minor_cut': {
        title: 'Minor Cuts',
        steps: `1. **Stop the bleeding**: Apply firm, direct pressure with a clean cloth or gauze for a few minutes.
2. **Clean the wound**: Rinse the cut under clean, running water. Wash the area around the wound with soap, but try to keep soap out of the actual cut.
3. **Remove debris**: Use tweezers (cleaned with alcohol) to remove any visible dirt or glass.
4. **Apply ointment**: Use a thin layer of antibiotic ointment (like Neosporin) or petroleum jelly to keep the wound moist.
5. **Cover it**: Use a sterile bandage or adhesive strip to keep it clean.`,
        whenToSeeDoctor: 'See a doctor if the cut is deep, gaping, won\'t stop bleeding, or shows signs of infection (redness, swelling, pus).'
    },
    'choking': {
        title: 'Choking (Conscious Adult/Child)',
        steps: `If the person can cough or speak, encourage them to keep coughing hard to clear the object. If they cannot, perform the "5 and 5" Method:
1. **5 Back Blows**: Stand behind them, lean them forward, and deliver 5 sharp blows between the shoulder blades with the heel of your hand.
2. **5 Abdominal Thrusts (Heimlich)**: Wrap your arms around their waist. Make a fist, place it just above the navel, and pull sharply inward and upward.
3. **Repeat**: Cycle between 5 blows and 5 thrusts until the object is forced out.`,
        whenToSeeDoctor: 'Call emergency services immediately if the object is not dislodged or if the person becomes unconscious. Start CPR if they become unconscious.'
    },
    'nosebleed': {
        title: 'Nosebleeds',
        steps: `1. **Lean forward**: Sit upright and lean the head forward. Do not lean back, as this causes blood to run down the throat and can lead to choking or vomiting.
2. **Pinch the nose**: Use your thumb and index finger to pinch the soft part of the nose (just below the bony bridge) shut.
3. **Hold for 10 minutes**: Keep constant pressure for at least 10 full minutes without letting go to check it.
4. **Cold compress**: You can place an ice pack on the bridge of the nose to help constrict blood vessels.`,
        whenToSeeDoctor: 'Seek medical help if the bleeding doesn\'t stop after 20 minutes of pressure, or if the nosebleed was caused by a serious injury.'
    },
    'sprained_ankle': {
        title: 'Sprained Ankle',
        steps: `Follow the R.I.C.E. protocol for the first 48 hours:
- **Rest**: Avoid putting weight on the injured ankle.
- **Ice**: Apply a cold pack for 15–20 minutes every 2–3 hours. Never apply ice directly to the skin; wrap it in a towel.
- **Compression**: Wrap the ankle with an elastic medical bandage (like an ACE wrap) to reduce swelling. Ensure it is snug but not so tight that it cuts off circulation.
- **Elevation**: Keep the ankle raised above the level of the heart as much as possible to drain fluid away from the injury.`,
        whenToSeeDoctor: 'See a doctor if you cannot bear weight on the ankle, if you heard a "pop" at the time of injury, or if the swelling and pain are severe.'
    }
};

const emergencies = [
  { name: 'Minor Burn', icon: Flame, value: 'minor_burn' },
  { name: 'Sprained Ankle', icon: Wind, value: 'sprained_ankle' },
  { name: 'Bee Sting', icon: Wind, value: 'bee_sting' },
  { name: 'Nosebleed', icon: HeartPulse, value: 'nosebleed' },
  { name: 'Minor Cut', icon: HeartPulse, value: 'minor_cut' },
  { name: 'Choking', icon: Wind, value: 'choking' },
];

export default function FirstAidGuide() {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyData | null>(null);

  const handleSelectEmergency = (emergencyValue: string) => {
    setSelectedEmergency(firstAidData[emergencyValue] || null);
  };
  
  const handleReset = () => {
    setSelectedEmergency(null);
  }


  if (selectedEmergency) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader>
                 <Button variant="ghost" size="sm" onClick={handleReset} className="self-start gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Emergencies
                </Button>
                <CardTitle className="text-3xl font-bold text-center">{selectedEmergency.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Alert variant="default" className='mb-4'>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Disclaimer</AlertTitle>
                        <AlertDescription>
                            This is for informational purposes only. For severe injuries or emergencies, call your local emergency number immediately.
                        </AlertDescription>
                    </Alert>

                    <h3 className="font-bold text-lg">Immediate Steps:</h3>
                    <div className="whitespace-pre-wrap">{selectedEmergency.steps}</div>
                    
                    <h3 className="font-bold text-lg mt-4">When to See a Doctor:</h3>
                    <div className="whitespace-pre-wrap">{selectedEmergency.whenToSeeDoctor}</div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="items-center text-center">
        <LifeBuoy className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">First-Aid Guide</CardTitle>
        <CardDescription>Select a common emergency to get instant guidance.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {emergencies.map((emergency) => {
            const Icon = emergency.icon;
            return (
                <Button 
                    key={emergency.value} 
                    variant="outline"
                    className="h-24 flex-col gap-2 text-base"
                    onClick={() => handleSelectEmergency(emergency.value)}
                >
                    <Icon className="h-8 w-8 text-primary" />
                    <span>{emergency.name}</span>
                </Button>
            )
        })}
      </CardContent>
    </Card>
  );
}
