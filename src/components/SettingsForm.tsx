
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSession } from 'next-auth/react';

const currencies = [
  { value: "USD", label: "US Dollar ($)", countries: ["US", "Default"] },
  { value: "EUR", label: "Euro (€)", countries: ["DE", "FR", "IT", "ES"] },
  { value: "GBP", label: "British Pound (£)", countries: ["GB"] },
  { value: "JPY", label: "Japanese Yen (¥)", countries: ["JP"] },
  { value: "CAD", label: "Canadian Dollar (C$)", countries: ["CA"] },
  { value: "AUD", label: "Australian Dollar (A$)", countries: ["AU"] },
  { value: "INR", label: "Indian Rupee (₹)", countries: ["IN"] },
  { value: "CNY", label: "Chinese Yuan (¥)", countries: ["CN"] },
  { value: "BRL", label: "Brazilian Real (R$)", countries: ["BR"] },
  { value: "ZAR", label: "South African Rand (R)", countries: ["ZA"] },
  { value: "SGD", label: "Singapore Dollar (S$)", countries: ["SG"] },
  { value: "NZD", label: "New Zealand Dollar (NZ$)", countries: ["NZ"] },
];

const formSchema = z.object({
  currency: z.string(),
  emailNotifications: z.boolean(),
  darkMode: z.boolean(),
  language: z.string(),
  weekStartsOn: z.string(),
});

const SettingsForm = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "INR",
      emailNotifications: true,
      darkMode: false,
      language: "en",
      weekStartsOn: "monday",
    },
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const loadSavedSettings = () => {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          form.reset(settings);
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      setIsInitialized(true);
    };
    
    loadSavedSettings();
  }, [form]);

  // Detect user's country and set default currency if no settings are saved
  useEffect(() => {
    const detectUserCurrency = async () => {
      if (!isInitialized) return;
      
      if (form.getValues('currency') !== 'INR') {
        // User already has a currency set
        return;
      }
      
      try {
        // Try to get user's country using IP geolocation API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.country) {
          const countryCode = data.country;
          
          // Find matching currency for country
          const matchingCurrency = currencies.find(currency => 
            currency.countries.includes(countryCode)
          );
          
          if (matchingCurrency) {
            form.setValue('currency', matchingCurrency.value);
            console.log(`Detected country: ${countryCode}, setting currency to ${matchingCurrency.value}`);
          }
        }
      } catch (error) {
        console.error('Error detecting user currency:', error);
      }
    };
    
    detectUserCurrency();
  }, [isInitialized, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      console.log(data);
      
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(data));
      
      // In a real app, this would also save to the user's profile in MongoDB
      if (session?.user?.id) {
        // Here we would call an API to save the settings to the user's profile
        // For now, we'll just simulate this
        localStorage.setItem(`settings_${session.user.id}`, JSON.stringify(data));
      }
      
      toast.success("Settings updated successfully!");
      
      // Force reload to apply new settings throughout the app
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the currency you want to use for transactions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose your preferred language.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekStartsOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week Starts On</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which day your week starts on.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Notifications</FormLabel>
                <FormDescription>
                  Receive email updates about your account activity.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default SettingsForm;
