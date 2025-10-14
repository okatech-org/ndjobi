import { UseFormReturn } from 'react-hook-form';
import { Users, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFormData } from '../ProjectFormStepper';

interface ProjectStep3TeamProps {
  form: UseFormReturn<ProjectFormData>;
}

export const ProjectStep3Team = ({ form }: ProjectStep3TeamProps) => {
  const { register, watch, setValue } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Équipe du projet</h2>
        <p className="text-muted-foreground">
          Informations sur votre équipe (optionnel)
        </p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Informations optionnelles
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Si vous travaillez en équipe, vous pouvez mentionner vos collaborateurs. Ces
              informations renforceront votre projet mais ne sont pas obligatoires.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_size">Taille de l'équipe</Label>
        <Input
          id="team_size"
          type="number"
          min={0}
          max={100}
          value={watch('team_size') || ''}
          onChange={(e) => setValue('team_size', parseInt(e.target.value) || 0)}
          placeholder="Nombre de personnes"
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Indiquez le nombre total de personnes impliquées dans le projet (vous inclus)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_members">Membres de l'équipe</Label>
        <Textarea
          id="team_members"
          {...register('team_members')}
          placeholder="Listez les membres de votre équipe avec leurs rôles&#10;&#10;Exemple :&#10;- Jean Dupont, CEO et fondateur&#10;- Marie Martin, CTO&#10;- Pierre Durand, Développeur senior"
          rows={8}
          className="resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Mentionnez les noms et rôles des personnes clés de votre équipe
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-card">
        <div className="flex gap-3">
          <UserPlus className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Pourquoi mentionner votre équipe ?</p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-4 list-disc">
              <li>
                <strong>Crédibilité renforcée :</strong> Une équipe solide valorise votre projet
              </li>
              <li>
                <strong>Protection étendue :</strong> Tous les membres sont reconnus comme co-créateurs
              </li>
              <li>
                <strong>Transparence :</strong> Clarifie les contributions de chacun
              </li>
              <li>
                <strong>Facilite les partenariats :</strong> Les investisseurs apprécient la transparence
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Important
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Assurez-vous d'avoir l'accord de tous les membres avant de les mentionner. La
              protection blockchain inclura ces informations de manière permanente.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground text-center">
          Cette étape est entièrement optionnelle. Vous pouvez la passer si vous travaillez seul(e)
          <br />
          ou si vous préférez ne pas divulguer ces informations pour le moment.
        </p>
      </div>
    </div>
  );
};

