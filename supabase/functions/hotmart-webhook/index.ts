import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento dos IDs de produto da Hotmart para a quantidade de créditos
// ATENÇÃO: Você precisará substituir estes IDs de exemplo pelos IDs reais dos seus produtos na Hotmart.
const creditProductMapping: { [hotmartProductId: string]: number } = {
  "K101885102O": 20,  // Exemplo: Pacote Básico (ID do produto Hotmart -> Créditos)
  "F101885804K": 50,  // Exemplo: Pacote Padrão
  "D101885891B": 150, // Exemplo: Pacote Profissional
  // Adicione mais mapeamentos conforme seus produtos na Hotmart
};

serve(async (req) => {
  // Lida com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // A Hotmart geralmente envia o payload como application/x-www-form-urlencoded
    // ou application/json. Vamos tentar parsear como JSON primeiro.
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

    // Verifica se o evento é de compra aprovada
    // A estrutura do payload da Hotmart pode variar. Ajuste conforme necessário.
    const eventType = requestBody.event; // Ex: "PURCHASE_APPROVED"
    const purchaseStatus = requestBody.data?.purchase?.status; // Ex: "APPROVED"
    const buyerEmail = requestBody.data?.buyer?.email;
    const hotmartProductCode = requestBody.data?.product?.id; // Ou outro campo que identifique o produto

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

    // Inicializa o cliente Supabase com a chave de serviço para acesso privilegiado
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Busca o perfil do usuário pelo email
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, credits')
      .eq('email', buyerEmail)
      .single();

    if (fetchError || !profile) {
      console.error(`Erro ao buscar perfil do usuário ${buyerEmail}:`, fetchError?.message || 'Perfil não encontrado.');
      return new Response(`Error: User profile not found for ${buyerEmail}`, { status: 404, headers: corsHeaders });
    }

    // Atualiza os créditos do usuário
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