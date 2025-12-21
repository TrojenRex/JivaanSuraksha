'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Utensils, Sparkles, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { getDietPlan } from '@/app/actions';
import type { AIDietPlannerOutput } from '@/ai/flows/ai-diet-planner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from './language-provider';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const formSchema = z.object({
  age: z.coerce.number().min(1, 'Age must be a positive number.').max(120),
  weight: z.coerce.number().min(1, 'Weight must be a positive number.'),
  weightUnit: z.enum(['kg', 'lb']),
  height: z.coerce.number().min(1, 'Height must be a positive number.').optional(),
  heightCm: z.coerce.number().optional(),
  heightUnit: z.enum(['cm', 'ft']),
  heightFt: z.coerce.number().min(1, 'Feet must be a positive number.').max(8).optional(),
  heightIn: z.coerce.number().min(0, 'Inches must be a positive number.').max(11).optional(),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance']),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian', 'non_vegetarian']),
}).refine(data => {
    if (data.heightUnit === 'cm') {
        return !!data.height;
    }
    return true;
}, {
    message: "Height is required",
    path: ["height"],
}).refine(data => {
    if (data.heightUnit === 'ft') {
        return !!data.heightFt;
    }
    return true;
}, {
    message: "Height (ft) is required",
    path: ["heightFt"],
});

export default function DietPlanner() {
  const { t } = useLanguage();
  const [dietPlan, setDietPlan] = useState<AIDietPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      heightFt: undefined,
      heightIn: undefined,
      gender: 'male',
      activityLevel: 'light',
      goal: 'maintenance',
      dietaryPreference: 'none',
      weightUnit: 'kg',
      heightUnit: 'cm',
    },
  });

  const { watch, setValue } = form;
  const weight = watch('weight');
  const height = watch('height');
  const heightFt = watch('heightFt');
  const heightIn = watch('heightIn');

  const bmi = useMemo(() => {
    const isMetric = unitSystem === 'metric';
    const weightVal = weight || 0;
    const heightVal = height || 0;
    const heightFtVal = heightFt || 0;
    const heightInVal = heightIn || 0;

    if (weightVal <= 0) return null;

    if (isMetric) {
      if (heightVal <= 0) return null;
      const heightInMeters = heightVal / 100;
      const bmiValue = weightVal / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    } else { // Imperial
      const totalInches = (heightFtVal * 12) + heightInVal;
      if (totalInches <= 0) return null;
      const bmiValue = (weightVal / (totalInches * totalInches)) * 703;
      return bmiValue.toFixed(1);
    }
  }, [unitSystem, weight, height, heightFt, heightIn]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  }, [bmi]);

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnitSystem(value);
    form.clearErrors();
    if (value === 'metric') {
      setValue('weightUnit', 'kg');
      setValue('heightUnit', 'cm');
    } else {
      setValue('weightUnit', 'lb');
      setValue('heightUnit', 'ft');
    }
    // Reset values to avoid confusion
    setValue('weight', undefined);
    setValue('height', undefined);
    setValue('heightFt', undefined);
    setValue('heightIn', undefined);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDietPlan(null);

    let weightInKg: number;
    let heightInCm: number;

    if (unitSystem === 'metric') {
        weightInKg = values.weight!;
        heightInCm = values.height!;
    } else {
        weightInKg = (values.weight || 0) * 0.453592;
        const totalInches = ((values.heightFt || 0) * 12) + (values.heightIn || 0);
        heightInCm = totalInches * 2.54;
    }

    const input = {
      age: values.age,
      gender: values.gender,
      activityLevel: values.activityLevel,
      goal: values.goal,
      dietaryPreference: values.dietaryPreference,
      weight: `${Math.round(weightInKg)}kg`,
      height: `${Math.round(heightInCm)}cm`,
    };

    const result = await getDietPlan(input);

    if (result.success && result.data) {
      setDietPlan(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to create plan',
        description: result.error || 'An unexpected error occurred.',
      });
    }
    setIsLoading(false);
  }

  const handleReset = () => {
    form.reset({
      age: undefined,
      weight: undefined,
      height: undefined,
      heightFt: undefined,
      heightIn: undefined,
    });
    setDietPlan(null);
  }

  if (dietPlan) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader className="items-center text-center">
                <Sparkles className="h-12 w-12 text-white text-outline mb-4" />
                <CardTitle className="text-3xl font-bold">Your Personalized Plan</CardTitle>
                <CardDescription>A one-day sample meal plan to get you started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                  <div>
                    <h4 className="font-bold text-base">Breakfast</h4>
                    <p className="text-muted-foreground">{dietPlan.plan.breakfast}</p>
                  </div>
                  <Separator />
                   <div>
                    <h4 className="font-bold text-base">Lunch</h4>
                    <p className="text-muted-foreground">{dietPlan.plan.lunch}</p>
                  </div>
                  <Separator />
                   <div>
                    <h4 className="font-bold text-base">Dinner</h4>
                    <p className="text-muted-foreground">{dietPlan.plan.dinner}</p>
                  </div>
                  <Separator />
                   <div>
                    <h4 className="font-bold text-base">Snacks</h4>
                    <p className="text-muted-foreground">{dietPlan.plan.snacks}</p>
                  </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Helpful Tips</h3>
                    <p className="text-sm text-muted-foreground">{dietPlan.tips}</p>
                </div>

                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>
                    This is an AI-generated sample plan. Please consult a registered dietitian or healthcare professional for a comprehensive personal plan.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="justify-center">
                 <Button onClick={handleReset} variant="outline">Create a New Plan</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="items-center text-center">
        <Utensils className="h-12 w-12 text-white text-outline mb-4" />
        <CardTitle className="text-3xl font-bold">{t('dietPlanner')}</CardTitle>
        <CardDescription>Tell us about yourself to get a personalized meal plan from our AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <FormLabel>Units</FormLabel>
                <RadioGroup
                    defaultValue="metric"
                    onValueChange={(value: 'metric' | 'imperial') => handleUnitChange(value)}
                    className="flex space-x-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="metric" id="metric" />
                        <Label htmlFor="metric">Metric (kg, cm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="imperial" id="imperial" />
                        <Label htmlFor="imperial">Imperial (lb, ft/in)</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({unitSystem === 'metric' ? 'kg' : 'lb'})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={unitSystem === 'metric' ? "e.g., 70" : "e.g., 154"} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div>
                <FormLabel>Height ({unitSystem === 'metric' ? 'cm' : 'ft/in'})</FormLabel>
                {unitSystem === 'metric' ? (
                     <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                        control={form.control}
                        name="heightFt"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input type="number" placeholder="ft" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="heightIn"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input type="number" placeholder="in" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                )}
              </div>
            </div>
            {bmi && (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4 text-center">
                        <p className="font-bold">Your approximate BMI is: <span className="text-white text-outline">{bmi}</span> ({bmiCategory})</p>
                    </CardContent>
                </Card>
            )}
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select your activity level" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                            <SelectItem value="light">Lightly Active (light exercise/sports 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Very Active (hard exercise/sports 6-7 days a week)</SelectItem>
                            <SelectItem value="very_active">Extra Active (very hard exercise/sports & physical job)</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Health Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select your main goal" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="maintenance">Maintain Weight</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dietaryPreference"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dietary Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Any dietary needs?" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="pescatarian">Pescatarian</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                'Generate My Diet Plan'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
