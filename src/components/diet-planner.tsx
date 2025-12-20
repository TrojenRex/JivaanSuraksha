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

const formSchema = z.object({
  age: z.coerce.number().min(1, 'Age must be a positive number.').max(120),
  weight: z.coerce.number().min(1, 'Weight must be a positive number.'),
  height: z.coerce.number().min(1, 'Height must be a positive number.'),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance']),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian']),
});

export default function DietPlanner() {
  const { t } = useLanguage();
  const [dietPlan, setDietPlan] = useState<AIDietPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'male',
      activityLevel: 'light',
      goal: 'maintenance',
      dietaryPreference: 'none',
    },
  });

  const { watch } = form;
  const weight = watch('weight');
  const height = watch('height');

  const bmi = useMemo(() => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  }, [bmi]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDietPlan(null);

    const input = {
      ...values,
      weight: `${values.weight}kg`,
      height: `${values.height}cm`,
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
    form.reset();
    setDietPlan(null);
  }

  if (dietPlan) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader className="items-center text-center">
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">Your Personalized Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="font-bold text-lg">One-Day Sample Meal Plan</h3>
                    <p>{dietPlan.plan}</p>
                    <h3 className="font-bold text-lg mt-4">Helpful Tips</h3>
                    <p>{dietPlan.tips}</p>
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
        <Utensils className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">{t('dietPlanner')}</CardTitle>
        <CardDescription>Tell us about yourself to get a personalized meal plan from our AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
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
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {bmi && (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4 text-center">
                        <p className="font-bold">Your BMI is: <span className="text-primary">{bmi}</span> ({bmiCategory})</p>
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
