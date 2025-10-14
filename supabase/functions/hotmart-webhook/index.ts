import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento dos IDs de produto da Hotmart para a quantidade de créditos
// IMPORTANTE: Substitua os IDs de exemplo abaixo pelos IDs REAIS dos seus produtos na Hotmart.
// Você pode encontrar esses IDs no painel da Hotmart ou nos logs do webhook.
const creditProductMapping: { [hotmartProductId: string]: number } = {
  "SEU_ID_PRODUTO_PACOTE_BASICO": 20,  // Exemplo: Pacote Básico (ID do produto Hotmart -> Créditos)
  "SEU_ID_PRODUTO_PACOTE_PADRAO": 50,  // Exemplo: Pacote Padrão
  "SEU_ID_PRODUTO_PACOTE_PROFISSIONAL": 150, // Exemplo: Pacote Profissional
  // Adicione mais mapeamentos conforme seus produtos na Hotmart
};

serve(async (req) => {
  // Lida com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Webhook Hotmart recebido:', JSON.stringify(requestBody, null, 2));

    // ATENÇÃO: Implemente a verificação da assinatura do webhook da Hotmart aqui
    // para garantir que a requisição é legítima e veio da Hotmart.
    // A Hotmart fornece um token de segurança ou hash para isso.
    // Exemplo (pseudocódigo):
    // const hotmartSignature = req.headers.get('X-Hotmart-Signature');
    // if (!verifyHotmartSignature(requestBody, hotmartSignature, Deno.env.get('HOTMART_WEBHOOK_SECRET'))) {
    //   return new Response('Unauthorized: Invalid signature', { status: 401, headers: corsHeaders });
    // }

    const eventType = requestBody.event;
    const purchaseStatus = requestBody.data?.purchase?.status;
    const buyerEmail = requestBody.data?.buyer?.email;
    const hotmartProductCode = requestBody.data?.product?.id;

    if (eventType !== 'PURCHASE_APPROVED' || purchaseStatus !== 'APPROVED') {
      console.log('Evento não é de compra aprovada ou status não é APPROVED. Ignorando.');
      return new Response('Ignored: Not an approved purchase event', { status: 200, headers: corsHeaders });
    }

    if (!buyerEmail || !hotmartProductCode) {
      console.error('Dados essenciais (email do comprador ou código do produto) ausentes no webhook.');
      return new Response('Bad Request: Missing essential data', { status: 400, headers: corsHeaders });
    }

    const creditsToAdd = creditProductMapping[hotmartProductCode];

    if (creditsToAdd === undefined) {
      console.warn(`Produto Hotmart com código ${hotmartProductCode} não encontrado no mapeamento. Nenhuns créditos adicionados.`);
      return new Response('Product not mapped', { status: 200, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, credits')
      .eq('email', buyerEmail)
      .single();

    if (fetchError || !profile) {
      console.error(`Erro ao buscar perfil do usuário ${buyerEmail}:`, fetchError?.message || 'Perfil não encontrado.');
      return new Response(`Error: User profile not found for ${buyerEmail}`, { status: 404, headers: corsHeaders });
    }

    const newCredits = profile.credits + creditsToAdd;
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`Erro ao atualizar créditos para o usuário ${profile.id}:`, updateError.message);
      return new Response('Error updating user credits', { status: 500, headers: corsHeaders });
    }

    console.log(`Créditos atualizados para o usuário ${buyerEmail}: ${profile.credits} -> ${newCredits}`);
    return new Response('Credits updated successfully', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Erro no processamento do webhook Hotmart:', error.message);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});