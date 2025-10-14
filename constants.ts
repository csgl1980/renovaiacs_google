import type { StyleOption } from './types';

export const STYLE_OPTIONS: StyleOption[] = [
  { 
    id: 'modern', 
    name: 'Moderno', 
    prompt: 'Transforme este espaço em um interior moderno e sofisticado. Priorize linhas retas e limpas, superfícies lisas e uma ausência de desordem. Utilize uma paleta de cores neutras (brancos, cinzas, beges) com um ponto de cor forte e estratégico. Incorpore materiais como metal (aço cromado, níquel escovado), vidro e concreto aparente. O mobiliário deve ser de perfil baixo e com design simples e funcional.' 
  },
  { 
    id: 'minimalist', 
    name: 'Minimalista', 
    prompt: 'Aplique um design minimalista a este espaço, focando no conceito de "menos é mais". Use uma paleta de cores estritamente monocromática ou neutra. O ambiente deve ser extremamente limpo e organizado, com cada item tendo um propósito claro. Use iluminação natural abundante e mobiliário de design ultra-simplificado, sem ornamentos.' 
  },
  { 
    id: 'industrial', 
    name: 'Industrial', 
    prompt: 'Converta este espaço para um estilo industrial, inspirado em lofts e galpões. Exponha elementos estruturais como tijolos, tubulações e vigas de metal. Use materiais brutos como concreto, aço e madeira de demolição. A paleta de cores deve ser sóbria, com tons de cinza, preto e marrom. O mobiliário deve ser robusto e funcional, com peças de metal e couro.' 
  },
  { 
    id: 'bohemian', 
    name: 'Boêmio', 
    prompt: 'Crie uma atmosfera boêmia, livre e eclética. Misture padrões, texturas e cores vibrantes. Use materiais naturais como vime, linho e algodão. Adicione muitas plantas de diferentes tamanhos para trazer vida ao ambiente. O mobiliário deve ser confortável e convidativo, com uma coleção de peças vintage e artesanais. Inclua tapetes com padrões étnicos e muitas almofadas.' 
  },
  { 
    id: 'scandinavian', 
    name: 'Escandinavo', 
    prompt: 'Adote o estilo escandinavo (Hygge), focando em simplicidade, funcionalidade e aconchego. Use uma paleta de cores claras e neutras, com predominância do branco, cinza claro e tons pastel. Utilize madeira clara nos pisos e no mobiliário. Incorpore texturas aconchegantes como lã, pele sintética e linho. A iluminação deve ser suave e abundante, maximizando a luz natural.' 
  },
  { 
    id: 'farmhouse', 
    name: 'Rústico', 
    prompt: 'Transforme o interior para um estilo rústico moderno (Modern Farmhouse). Combine o charme do campo com linhas limpas. Use madeira natural, pedra e elementos vintage. A paleta de cores deve ser neutra e quente, com brancos, beges e cinzas. O mobiliário deve ser confortável e robusto. Adicione elementos como vigas de madeira no teto, portas de celeiro e tecidos naturais como linho e algodão xadrez.' 
  },
  {
    id: 'japandi',
    name: 'Japandi',
    prompt: 'Aplique o estilo Japandi, uma fusão entre o minimalismo japonês e a funcionalidade escandinava. Utilize uma paleta de cores calmas e neutras, com tons terrosos e toques de preto para contraste. Incorpore materiais naturais como madeira clara (carvalho, pinho), bambu e cerâmica artesanal. O mobiliário deve ser de linhas simples, baixo e funcional. Priorize a organização e a ausência de excessos, criando um santuário de paz e simplicidade.'
  },
  {
    id: 'mid-century',
    name: 'Mid-Century',
    prompt: 'Redecore com o estilo Mid-Century Modern. Use mobiliário icônico com linhas orgânicas e pernas palito. Incorpore materiais como madeira de nogueira e teca. A paleta de cores deve misturar tons neutros e terrosos com cores ousadas como laranja queimado, verde abacate ou azul-petróleo. Adicione padrões geométricos em tapetes ou almofadas e luminárias de design escultural em latão ou metal.'
  },
  {
    id: 'coastal',
    name: 'Coastal',
    prompt: 'Crie um ambiente de estilo Coastal, inspirado em casas de praia. Use uma paleta de cores claras e arejadas, com muito branco, azul-marinho, areia e tons de verde-água. Maximize a luz natural. Utilize materiais como linho, algodão, sisal e madeira lavada. O mobiliário deve ser confortável e casual. Adicione elementos náuticos sutis e decoração com texturas naturais.'
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    prompt: 'Introduza o glamour do estilo Art Deco. Use formas geométricas fortes, padrões simétricos (zig-zag, leques) e cores ricas como preto, dourado, azul profundo e verde-esmeralda. Incorpore materiais luxuosos como veludo, laca, latão polido e mármore. O mobiliário deve ser elegante e escultural. Adicione espelhos ornamentados e iluminação dramática para completar o visual sofisticado.'
  },
  {
    id: 'transitional',
    name: 'Transicional',
    prompt: 'Crie um design Transicional, que une o melhor do tradicional e do moderno. Use uma paleta de cores neutra e relaxante, como cinzas, beges e brancos. O mobiliário deve ter linhas clássicas, mas com uma silhueta mais simplificada. Combine texturas, como um sofá de linho com uma mesa de centro de metal escuro. O resultado deve ser um espaço elegante, atemporal e confortável, sem ser excessivamente ornamentado ou austero.'
  },
  {
    id: 'hollywood-regency',
    name: 'Hollywood Regency',
    prompt: 'Implemente o estilo Hollywood Regency para um visual dramático e luxuoso. Use uma paleta de cores ousada com alto contraste, como preto e branco, com toques vibrantes de rosa, turquesa ou roxo. O mobiliário deve ser suntuoso, com acabamentos laqueados, espelhados e tufados. Incorpore tecidos de luxo como veludo, seda e pele sintética. Adicione detalhes metálicos em dourado ou latão e peças de iluminação espetaculares para um toque final de glamour.'
  },
  {
    id: 'biophilic',
    name: 'Biofílico',
    prompt: 'Crie um design biofílico que maximize a conexão com a natureza. Use uma abundância de plantas de interior, luz natural e ventilação. A paleta de cores deve ser inspirada na natureza, com verdes, azuis e tons terrosos. Incorpore materiais naturais como madeira, pedra, bambu e tecidos orgânicos. O objetivo é criar um ambiente que seja restaurador, saudável e que melhore o bem-estar.'
  },
  {
    id: 'maximalist',
    name: 'Maximalista',
    prompt: 'Adote um estilo maximalista, celebrando a opulência e a expressão pessoal. Use cores ricas e ousadas, misture múltiplos padrões (florais, geométricos, animais) e combine diversas texturas como veludo, seda e brocado. O espaço deve ser preenchido com uma coleção curada de arte, objetos decorativos e mobiliário de diferentes épocas e estilos. "Mais é mais" é o lema, mas de forma intencional e coesa.'
  },
  {
    id: 'organic-modern',
    name: 'Orgânico Moderno',
    prompt: 'Aplique um estilo orgânico moderno, que suaviza as linhas limpas do modernismo com formas naturais e texturas orgânicas. Use uma paleta de cores neutra e quente. Incorpore mobiliário com silhuetas curvas e suaves, feitas de materiais naturais como madeira clara, vime, lã e pedra. O foco é criar um espaço sereno, minimalista mas acolhedor, com uma sensação de simplicidade e conexão com a natureza.'
  }
];