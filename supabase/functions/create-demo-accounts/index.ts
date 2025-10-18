import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoAccount {
  phone: string
  email: string
  password: string
  full_name: string
  organization?: string
  role: 'admin' | 'agent' | 'user'
  metadata: {
    role_type?: string
    department?: string
    ministry?: string
    phone: string
  }
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    phone: '+24177888001',
    email: '24177888001@ndjobi.com',
    password: '111111',
    full_name: 'Président / Administrateur',
    organization: 'Présidence de la République',
    role: 'admin',
    metadata: {
      role_type: 'president',
      phone: '+24177888001'
    }
  },
  {
    phone: '+24177888002',
    email: '24177888002@ndjobi.com',
    password: '222222',
    full_name: 'Sous-Admin DGSS',
    organization: 'Direction Générale de la Sécurité et de la Surveillance',
    role: 'admin',
    metadata: {
      role_type: 'sub_admin_dgss',
      department: 'DGSS',
      phone: '+24177888002'
    }
  },
  {
    phone: '+24177888003',
    email: '24177888003@ndjobi.com',
    password: '333333',
    full_name: 'Sous-Admin DGR',
    organization: 'Direction Générale des Renseignements',
    role: 'admin',
    metadata: {
      role_type: 'sub_admin_dgr',
      department: 'DGR',
      phone: '+24177888003'
    }
  },
  {
    phone: '+24177888004',
    email: '24177888004@ndjobi.com',
    password: '444444',
    full_name: 'Agent Ministère Défense',
    organization: 'Ministère de la Défense',
    role: 'agent',
    metadata: {
      ministry: 'Defense',
      phone: '+24177888004'
    }
  },
  {
    phone: '+24177888005',
    email: '24177888005@ndjobi.com',
    password: '555555',
    full_name: 'Agent Ministère Justice',
    organization: 'Ministère de la Justice',
    role: 'agent',
    metadata: {
      ministry: 'Justice',
      phone: '+24177888005'
    }
  },
  {
    phone: '+24177888006',
    email: '24177888006@ndjobi.com',
    password: '666666',
    full_name: 'Agent Lutte Anti-Corruption',
    organization: 'Commission de Lutte Anti-Corruption',
    role: 'agent',
    metadata: {
      ministry: 'Anti-Corruption',
      phone: '+24177888006'
    }
  },
  {
    phone: '+24177888007',
    email: '24177888007@ndjobi.com',
    password: '777777',
    full_name: 'Agent Ministère Intérieur',
    organization: 'Ministère de l\'Intérieur',
    role: 'agent',
    metadata: {
      ministry: 'Interior',
      phone: '+24177888007'
    }
  },
  {
    phone: '+24177888008',
    email: '24177888008@ndjobi.com',
    password: '888888',
    full_name: 'Citoyen Démo',
    role: 'user',
    metadata: {
      phone: '+24177888008'
    }
  },
  {
    phone: '+24177888009',
    email: '24177888009@ndjobi.com',
    password: '999999',
    full_name: 'Citoyen Anonyme',
    role: 'user',
    metadata: {
      phone: '+24177888009'
    }
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const results = []

    for (const account of DEMO_ACCOUNTS) {
      console.log(`Création du compte: ${account.full_name} (${account.phone})`)

      // Créer l'utilisateur avec le Service Role Key (permet de créer sans email confirmation)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        phone: account.phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: account.full_name
        }
      })

      if (authError) {
        console.error(`Erreur création auth: ${account.phone}`, authError)
        results.push({
          phone: account.phone,
          status: 'error',
          error: authError.message
        })
        continue
      }

      if (!authData.user) {
        results.push({
          phone: account.phone,
          status: 'error',
          error: 'No user returned'
        })
        continue
      }

      // Créer le profil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: account.email,
          full_name: account.full_name,
          organization: account.organization,
          metadata: account.metadata
        })

      if (profileError) {
        console.error(`Erreur création profile: ${account.phone}`, profileError)
        results.push({
          phone: account.phone,
          status: 'partial',
          error: `Profile error: ${profileError.message}`
        })
        continue
      }

      // Assigner le rôle
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: account.role
        })

      if (roleError) {
        console.error(`Erreur assignation rôle: ${account.phone}`, roleError)
        results.push({
          phone: account.phone,
          status: 'partial',
          error: `Role error: ${roleError.message}`
        })
        continue
      }

      results.push({
        phone: account.phone,
        full_name: account.full_name,
        role: account.role,
        status: 'success'
      })

      console.log(`✅ Compte créé avec succès: ${account.phone}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Création des comptes de démonstration terminée',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Erreur globale:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})