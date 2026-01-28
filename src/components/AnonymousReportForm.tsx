import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Send, Shield, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reportSchema = z.object({
  title: z.string()
    .trim()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
  type: z.string()
    .min(1, "Veuillez sélectionner un type"),
  description: z.string()
    .trim()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(5000, "La description ne doit pas dépasser 5000 caractères"),
  location: z.string()
    .trim()
    .max(200, "La localisation ne doit pas dépasser 200 caractères")
    .optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const reportTypes = [
  { value: "corruption", label: "Corruption" },
  { value: "detournement", label: "Détournement de fonds" },
  { value: "extorsion", label: "Extorsion" },
  { value: "abus_pouvoir", label: "Abus de pouvoir" },
  { value: "favoritisme", label: "Favoritisme" },
  { value: "fraude", label: "Fraude" },
  { value: "autre", label: "Autre" },
];

const AnonymousReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      location: "",
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('signalements')
        .insert({
          title: data.title,
          type: data.type,
          description: data.description,
          location: data.location || null,
          status: 'pending',
          priority: 'normal',
          user_id: null, // Signalement anonyme
          metadata: {
            is_anonymous: true,
            submission_method: 'homepage_form',
            submitted_at: new Date().toISOString(),
          }
        });

      if (error) throw error;

      setIsSuccess(true);
      form.reset();
      
      toast({
        title: "Signalement envoyé",
        description: "Votre signalement anonyme a été enregistré avec succès.",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="signalement-anonyme" className="container py-12 md:py-16">
        <Card className="max-w-2xl mx-auto border-2 border-green-500/50 bg-green-500/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Signalement envoyé !
            </h3>
            <p className="text-muted-foreground max-w-md">
              Votre signalement anonyme a été enregistré et sera traité par nos équipes dans les plus brefs délais. 
              Aucune information personnelle n'a été collectée.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setIsSuccess(false)}
            >
              Faire un autre signalement
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="signalement-anonyme" className="container py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <Badge variant="destructive" className="mb-2">
            <Shield className="h-3 w-3 mr-1" />
            100% Anonyme
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Signalement rapide et anonyme
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Aucune inscription requise. Votre identité reste totalement protégée.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 hover:border-primary/40 transition-colors bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-destructive/90 to-destructive/70 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Taper le Ndjobi</CardTitle>
                <CardDescription>Décrivez les faits en toute confidentialité</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Type de signalement */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Type de signalement *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border shadow-lg z-50">
                          {reportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Titre */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du signalement *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Extorsion par agent de police" 
                          className="bg-background"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description des faits *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les faits en détail : qui, quoi, quand, comment..."
                          className="min-h-[140px] resize-none bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Localisation */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Localisation (optionnel)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Libreville, Ministère des Finances" 
                          className="bg-background"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Security notice */}
                <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Votre anonymat est garanti</p>
                    <p>Nous ne collectons aucune donnée personnelle. Aucun compte, aucune adresse IP, aucune trace.</p>
                  </div>
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le signalement
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AnonymousReportForm;
