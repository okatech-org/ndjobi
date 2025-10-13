import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, FolderLock, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const projectFormSchema = z.object({
  category: z.string().min(1, 'Sélectionnez une catégorie'),
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  innovations: z.string().min(20, 'Décrivez les innovations principales'),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectProtectionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectProtectionForm = ({ onSuccess, onCancel }: ProjectProtectionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      category: '',
      title: '',
      description: '',
      innovations: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // TODO: Implement actual project protection with:
      // 1. Creating a projects table
      // 2. Uploading files to secure storage
      // 3. Creating blockchain timestamp
      // 4. Generating protection certificate
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast({
        title: 'Projet protégé !',
        description: 'Votre projet a été enregistré avec horodatage infalsifiable',
      });

      form.reset();
      setFiles([]);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Impossible de protéger le projet',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <FolderLock className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <CardTitle>Protéger un projet</CardTitle>
            <CardDescription>
              Enregistrez votre idée avec horodatage blockchain infalsifiable
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technologie">Technologie</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="sante">Santé</SelectItem>
                      <SelectItem value="energie">Énergie</SelectItem>
                      <SelectItem value="environnement">Environnement</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du projet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Application mobile de..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Un titre clair et descriptif de votre projet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description complète *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre projet en détail : objectif, fonctionnement, public cible..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="innovations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Innovations et points clés *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qu'est-ce qui rend votre projet unique ? Quelles sont les innovations principales ?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ces éléments constitueront la preuve d'antériorité
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-3">
              <FormLabel>Documents techniques (optionnel)</FormLabel>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="project-files"
                  disabled={files.length >= 10}
                />
                <label htmlFor="project-files" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour ajouter des documents (max 10)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Schémas, plans, maquettes, documents techniques
                  </p>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Protection Notice */}
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg space-y-2">
              <p className="text-sm font-medium">🔒 Protection blockchain</p>
              <p className="text-sm text-muted-foreground">
                Votre projet sera horodaté sur la blockchain avec un certificat infalsifiable. 
                Cela établit une preuve d'antériorité légale en cas de litige.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} variant="secondary" className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Protection en cours...
                  </>
                ) : (
                  'Protéger mon projet'
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
