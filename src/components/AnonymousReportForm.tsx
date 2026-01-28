import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Send, Shield, MapPin, FileText, CheckCircle2, Upload, X, Image, File, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface UploadedFile {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

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
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot anti-spam
  const [formStartTime] = useState(Date.now()); // Track form load time
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check max files limit
      if (files.length + newFiles.length >= MAX_FILES) {
        toast({
          title: "Limite atteinte",
          description: `Maximum ${MAX_FILES} fichiers autorisés`,
          variant: "destructive",
        });
        break;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 10MB`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: `${file.name} n'est pas un format autorisé`,
          variant: "destructive",
        });
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      if (fileData.uploaded && fileData.url) {
        uploadedUrls.push(fileData.url);
        continue;
      }

      // Mark as uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, uploading: true } : f
      ));

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = fileData.file.name.split('.').pop();
        const filename = `anonymous/${timestamp}-${randomStr}.${extension}`;

        const { data, error } = await supabase.storage
          .from('anonymous-reports')
          .upload(filename, fileData.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('anonymous-reports')
          .getPublicUrl(data.path);

        const url = urlData.publicUrl;
        uploadedUrls.push(url);

        // Mark as uploaded
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, uploading: false, uploaded: true, url } : f
        ));

      } catch (error) {
        console.error('Error uploading file:', error);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, uploading: false, error: 'Échec de l\'upload' } : f
        ));
      }
    }

    setIsUploading(false);
    return uploadedUrls;
  };

  const onSubmit = async (formData: ReportFormData) => {
    // Anti-spam checks
    // 1. Honeypot check - bots fill hidden fields
    if (honeypot) {
      console.warn('Honeypot triggered - likely spam');
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    // 2. Time-based check - humans take at least 5 seconds to fill form
    const timeElapsed = Date.now() - formStartTime;
    if (timeElapsed < 5000) {
      console.warn('Form submitted too quickly - likely spam');
      toast({
        title: "Trop rapide",
        description: "Veuillez prendre le temps de remplir le formulaire correctement.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload files first
      const attachmentUrls = files.length > 0 ? await uploadFiles() : [];

      const { data: insertedData, error } = await supabase
        .from('signalements')
        .insert({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          location: formData.location || null,
          status: 'pending',
          priority: 'normal',
          user_id: null, // Signalement anonyme
          attachments: attachmentUrls.map(url => ({
            url,
            uploaded_at: new Date().toISOString(),
          })),
          metadata: {
            is_anonymous: true,
            submission_method: 'homepage_form',
            submitted_at: new Date().toISOString(),
            files_count: attachmentUrls.length,
          }
        })
        .select('reference_number')
        .single();

      if (error) throw error;

      // Store reference number for display
      if (insertedData?.reference_number) {
        setReferenceNumber(insertedData.reference_number);
      }

      setIsSuccess(true);
      form.reset();
      
      // Clean up file previews
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      
      toast({
        title: "Signalement envoyé",
        description: "Votre signalement anonyme a été enregistré avec succès.",
      });

      // Don't auto-reset success state - let user copy reference
      
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (referenceNumber) {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "Numéro de référence copié dans le presse-papier",
      });
    }
  };

  const handleNewReport = () => {
    setIsSuccess(false);
    setReferenceNumber(null);
    setCopied(false);
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
            
            {/* Reference Number Display */}
            {referenceNumber && (
              <div className="my-6 p-4 bg-background rounded-lg border-2 border-dashed border-green-500/40 w-full max-w-sm">
                <p className="text-sm text-muted-foreground mb-2">Votre numéro de référence</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-bold text-foreground tracking-wider">
                    {referenceNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyReference}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Conservez ce numéro pour suivre votre signalement
                </p>
              </div>
            )}

            <p className="text-muted-foreground max-w-md text-sm">
              Votre signalement sera traité par nos équipes dans les plus brefs délais. 
              Utilisez le numéro de référence ci-dessus pour suivre l'avancement.
            </p>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={handleNewReport}
              >
                Nouveau signalement
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  const tracker = document.getElementById('suivi-signalement');
                  if (tracker) tracker.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Suivre mon signalement
              </Button>
            </div>
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
                {/* Honeypot field - hidden from humans, bots will fill it */}
                <div 
                  className="absolute left-[-9999px] opacity-0 h-0 w-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="website_url">Website</label>
                  <input
                    type="text"
                    id="website_url"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

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

                {/* File Upload */}
                <div className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Pièces jointes (optionnel)
                  </FormLabel>
                  
                  {/* Upload area */}
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPTED_FILE_TYPES.join(',')}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter des fichiers
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Photos, PDF, documents Word • Max 10MB par fichier • {MAX_FILES} fichiers max
                    </p>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((fileData, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          {/* Preview or icon */}
                          {fileData.preview ? (
                            <img 
                              src={fileData.preview} 
                              alt="" 
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                              {getFileIcon(fileData.file)}
                            </div>
                          )}
                          
                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {fileData.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(fileData.file.size)}
                              {fileData.uploaded && (
                                <span className="text-green-600 ml-2">✓ Prêt</span>
                              )}
                              {fileData.error && (
                                <span className="text-destructive ml-2">{fileData.error}</span>
                              )}
                            </p>
                          </div>

                          {/* Status/Remove */}
                          {fileData.uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security notice */}
                <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Votre anonymat est garanti</p>
                    <p>Nous ne collectons aucune donnée personnelle. Aucun compte, aucune adresse IP, aucune trace. Les métadonnées des fichiers sont supprimées.</p>
                  </div>
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting || isUploading}
                  className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground shadow-lg"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Upload en cours..." : "Envoi en cours..."}
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
