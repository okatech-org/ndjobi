import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AccountResult {
  success: boolean;
  fullName: string;
  role: string;
  phone?: string;
  pin?: string;
  error?: string;
}

interface CreateAccountsResponse {
  success: boolean;
  message: string;
  results: AccountResult[];
  error?: string;
}

const CreateDemoAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<CreateAccountsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createDemoAccounts();
  }, []);

  const createDemoAccounts = async () => {
    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-demo-accounts');

      if (functionError) throw functionError;
      
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création des comptes");
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Création des Comptes Démo NDJOBI</CardTitle>
            <CardDescription>
              Initialisation automatique des comptes de démonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <AlertDescription>
                  Création des comptes en cours...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  ❌ Erreur: {error}
                </AlertDescription>
              </Alert>
            )}

            {response && response.success && (
              <>
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    ✅ {response.message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Comptes créés :</h3>
                  {response.results.map((result, index) => (
                    <Card 
                      key={index}
                      className={result.success ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-semibold">{result.fullName}</span>
                              <Badge variant="outline">{result.role}</Badge>
                            </div>
                            {result.success ? (
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>📱 Téléphone: {result.phone}</div>
                                <div>🔐 PIN: {result.pin}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-red-600">
                                ❌ Erreur: {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDemoAccounts;
