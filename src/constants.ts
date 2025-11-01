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

export const EXTERIOR_STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'tropical',
    name: 'Tropical',
    prompt: 'Transforme a área externa em um exuberante jardim tropical. Utilize plantas de folhagem grande e vibrante, como palmeiras, bananeiras ornamentais e helicônias. Incorpore elementos de água, como pequenas fontes ou espelhos d\'água. Use materiais naturais como madeira rústica, bambu e pedras. Crie caminhos sinuosos e áreas de estar sombreadas para uma sensação de paraíso.'
  },
  {
    id: 'zen',
    name: 'Zen (Japonês)',
    prompt: 'Crie um paisagismo zen japonês, focado na tranquilidade e meditação. Utilize pedras, areia ou cascalho rastelado para simular água, e plantas cuidadosamente podadas como bonsais, bambus e azaleias. Incorpore lanternas de pedra e pontes de madeira. A paleta de cores deve ser neutra e natural, com foco em texturas e formas orgânicas. Mantenha o design minimalista e harmonioso.'
  },
  {
    id: 'contemporary',
    name: 'Contemporâneo',
    prompt: 'Desenvolva um design exterior contemporâneo com linhas limpas e formas geométricas. Utilize uma paleta de cores neutras com toques de cor em plantas ou mobiliário. Incorpore materiais modernos como concreto aparente, metal, vidro e decks de madeira. A iluminação deve ser estratégica para realçar a arquitetura e o paisagismo. Crie áreas de estar e jantar ao ar livre com mobiliário de design.'
  },
  {
    id: 'mediterranean',
    name: 'Mediterrâneo',
    prompt: 'Crie um paisagismo mediterrâneo, inspirado nas costas da Grécia e Itália. Utilize plantas resistentes à seca, como oliveiras, lavandas, alecrim e buganvílias. Incorpore elementos de pedra natural, terracota e azulejos. Crie pátios sombreados com pérgolas e trepadeiras. A paleta de cores deve ser quente, com tons de terra, azul e branco.'
  },
  {
    id: 'rustic',
    name: 'Rústico/Campestre',
    prompt: 'Transforme a área externa em um paisagismo rústico e campestre. Utilize plantas nativas e de baixa manutenção, como gramíneas ornamentais, flores silvestres e arbustos floridos. Incorpore elementos de madeira de demolição, pedras brutas e cercas de madeira. Crie caminhos de cascalho e áreas de estar com mobiliário de ferro forjado ou vime. O objetivo é uma sensação natural e acolhedora.'
  },
  {
    id: 'vertical-garden',
    name: 'Jardim Vertical',
    prompt: 'Projete um jardim vertical exuberante em uma das paredes externas, maximizando o espaço verde. Utilize uma variedade de plantas de diferentes texturas e tons de verde, como samambaias, heras e suculentas. Incorpore um sistema de irrigação discreto. O restante do paisagismo deve complementar o jardim vertical, com poucas plantas no chão para não competir com o destaque da parede verde.'
  },
  {
    id: 'xeriscape',
    name: 'Desértico/Xeriscape',
    prompt: 'Crie um paisagismo desértico ou xeriscape, focado na economia de água e beleza natural. Utilize plantas suculentas, cactos, agaves e gramíneas resistentes à seca. Incorpore pedras, cascalho e areia para criar texturas e padrões. A paleta de cores deve ser terrosa, com tons de verde, cinza e marrom. O design deve ser de baixa manutenção e sustentável.'
  },
  {
    id: 'formal',
    name: 'Formal',
    prompt: 'Desenvolva um paisagismo formal com simetria, linhas retas e plantas bem definidas. Utilize sebes aparadas, canteiros geométricos e árvores em vasos. Incorpore elementos clássicos como estátuas, fontes e bancos de pedra. A paleta de cores deve ser sóbria, com predominância de verdes e flores em tons específicos. O design deve transmitir elegância e ordem.'
  },
  {
    id: 'eclectic',
    name: 'Eclético',
    prompt: 'Crie um paisagismo eclético, misturando diferentes estilos e elementos de forma harmoniosa. Combine plantas de diversas origens, mobiliário de diferentes épocas e objetos decorativos variados. O objetivo é criar um espaço único e personalizado, que reflita a personalidade do usuário. A liberdade criativa é a chave, mas com um senso de equilíbrio visual.'
  },
  {
    id: 'minimalist-exterior',
    name: 'Minimalista Exterior',
    prompt: 'Aplique um design minimalista ao exterior, focando em poucos elementos, mas de alto impacto. Utilize uma paleta de cores neutras e materiais como concreto, metal e madeira clara. As plantas devem ser poucas, mas estrategicamente posicionadas, com formas esculturais. O espaço deve ser limpo, organizado e funcional, com ênfase na arquitetura e na simplicidade.'
  }
];