
/* ============================================================
   2. DADOS DO JOGO (regras — só leitura)
   ============================================================ */
const AT = [
  ["carne", "Carne"],
  ["forca", "Força"],
  ["fuga", "Fuga"],
  ["mente", "Mente"],
  ["det", "Determinação"],
];
// cor de cada atributo (fixos e mutáveis) na lista "Atributos e Aspectos"
const ATTR_COLOR = {
  carne: "#e5484d",
  forca: "#f08a1e",
  fuga: "#4c8dff",
  mente: "#2dd4bf",
  det: "#f0c63a",
  fol: "#f4a261",
  dano: "#e879a8",
  cor: "#5fd38d",
  prot: "#b388ff",
  vel: "#5aa9ff",
};

const KN = [
  "Bandidagem",
  "Duelo",
  "Emocional",
  "Esforço",
  "Místico",
  "Mundo",
  "Rastro",
  "Reflexos",
  "Saber",
  "Social",
];

/* Descrições dos Conhecimentos (livro, cap. "Os seus Conhecimentos").
   r = para que serve · ex = exemplos de uso do livro · nt = observação de regra */
const KN_INFO = {
  Bandidagem: {
    r: "Cometer delitos, ou fazer o seu melhor para não ser pego enquanto os comete.",
    ex: [
      "Roubar algo de outra pessoa",
      "Esgueirar-se de guardas",
      "Invadir um local",
    ],
    nt: "Teste baseado em Fuga (a mazela Lentidão o dificulta).",
  },
  Duelo: {
    r: "Conhecimento marcial: põe a sua estratégia à prova, identificando brechas e vantagens num combate.",
    ex: [
      "Analisar a formação dos inimigos",
      "Buscar brechas na defesa de um alvo",
      "Procurar um ponto vantajoso para atacar",
    ],
  },
  Emocional: {
    r: "Testa o seu autocontrole e o quão bem você lida com as próprias emoções.",
    ex: [
      "Conter a raiva",
      "Deixar as lágrimas rolarem",
      "Manter a calma diante de algo assustador",
    ],
  },
  Esforço: {
    r: "Testa o seu físico: ações desgastantes e resistência do corpo.",
    ex: [
      "Realizar ações cansativas (manter o fôlego, empurrar algo pesado)",
      "Resistir a algo nocivo, como venenos",
      "Levar o corpo ao limite máximo",
    ],
  },
  Místico: {
    r: "Temas não mundanos: artes ritualísticas, religiosas e místicas.",
    ex: [
      "Analisar um fenômeno misterioso",
      "Estudar runas arcanas",
      "Interagir com seres de outra realidade",
    ],
  },
  Mundo: {
    r: "O mundo natural, a terra, o que habita nela e como sobreviver.",
    ex: [
      "Domar animais selvagens",
      "Localizar os pontos cardeais",
      "Discernir plantas venenosas",
    ],
  },
  Rastro: {
    r: "Testa os seus sentidos e a capacidade de perceber detalhes ocultos no ambiente.",
    ex: [
      "Encontrar um livro na biblioteca",
      "Ler os lábios de pessoas",
      "Farejar a cozinha de uma casa",
    ],
  },
  Reflexos: {
    r: "Testa a sua agilidade, seja se esquivando ou acertando alguma coisa.",
    ex: [
      "Esquivar-se de algo que venha na sua direção",
      "Acertar um alvo em movimento",
      "Manter o equilíbrio",
    ],
    nt: "Teste baseado em Fuga (a mazela Lentidão o dificulta).",
  },
  Saber: {
    r: "Conhecimentos adquiridos por estudo, educação ou conversas; testa a sua memória.",
    ex: [
      "Lembrar de algo que aprendeu nos estudos",
      "Praticar o seu hobby favorito",
      "Conversar numa mesa de bar",
    ],
  },
  Social: {
    r: "Influenciar emoções alheias e alterar a percepção que as outras pessoas têm de você.",
    ex: [
      "Convencer pessoas de algo",
      "Mentir para alguém",
      "Acalmar as emoções dos outros",
    ],
  },
};

const RG = [
  ["torso", "Torso"],
  ["be", "Braço Esq."],
  ["bd", "Braço Dir."],
  ["pe", "Perna Esq."],
  ["pd", "Perna Dir."],
];

/* Papéis.  n = nome · e = Estresse base · tag = lema do livro · sp = conhecimentos do papel
   m = habilidade principal [nome, tipo, descrição] · u = habilidades únicas [[nome, tipo, descrição], ...] */
const ROLES = {
  age: {
    n: "Quem Age",
    e: 15,
    tag: "Enfrentar as ameaças de frente e ser a principal arma do grupo.",
    sp: ["Esforço", "Mundo", "Rastro", "Bandidagem", "Reflexos", "Duelo"],
    m: [
      "Voracidade",
      "Passivo",
      "1º ataque que causar Estresse: seu Dano é dobrado.",
    ],
    u: [
      [
        "Ataque em Dupla",
        "Completa",
        "Ataque conjunto com Persona adjacente; ambos causam dano se acertarem.",
      ],
      [
        "Estocada",
        "Regular+Mov.",
        "Avança ≥1 espaço e ataca; dano extra = espaços. Se errar, alvo testa Reflexos (No Chão).",
      ],
      [
        "Sede de Sangue",
        "Passivo",
        "Ao eliminar um alvo, recupera Estresse = dano do ataque final.",
      ],
    ],
  },
  cuida: {
    n: "Quem Cuida",
    e: 10,
    tag: "Ajudar os necessitados e manter o seu grupo de pé.",
    sp: ["Esforço", "Saber", "Místico", "Rastro", "Social", "Emocional"],
    m: [
      "Ajudar os Necessitados",
      "Extra",
      "Até 2 adjacentes recuperam ½ Mente em Estresse (início da rodada ou 1×/descanso).",
    ],
    u: [
      [
        "Abrir Feridas",
        "Regular",
        "Converte ½ da cura dada na cena em dano extra num ataque.",
      ],
      [
        "Bálsamo",
        "Regular",
        "Cura 1 mazela; 1×/partida recupera região perdida.",
      ],
      [
        "Última Esperança",
        "Regular",
        "1×/cena, 3 rodadas: cura ½ Mente em todo o grupo.",
      ],
    ],
  },
  protege: {
    n: "Quem Protege",
    e: 20,
    tag: "Ser o escudo do grupo e impedir que os aliados sejam colocados em perigo.",
    sp: ["Esforço", "Saber", "Mundo", "Rastro", "Reflexos", "Duelo"],
    m: [
      "Escudo Humano",
      "Passivo",
      "À frente dos aliados, todos ganham Proteção = ½ Carne.",
    ],
    u: [
      [
        "Armadura de Espinhos",
        "Passivo",
        "Quem te acerta testa Fuga; falhando, sofre ½ Carne (mín. 1) de Estresse.",
      ],
      ["Peso Pesado", "Passivo", "Soma ½ Carne ao dano corpo a corpo."],
      [
        "Repartir a Dor",
        "Passivo",
        "Divide com você o Estresse de quem está atrás do seu Escudo Humano.",
      ],
    ],
  },
  resolve: {
    n: "Quem Resolve",
    e: 15,
    tag: "Cobrir as falhas do grupo e dar a cada Persona a chance de agir.",
    sp: ["Esforço", "Saber", "Social", "Emocional", "Reflexos", "Duelo"],
    m: [
      "Dar uma Mãozinha",
      "Extra",
      "Falha de qualquer Persona: 1d6; 4–6 vira sucesso; 1–3 falha e você sofre Estresse = grau.",
    ],
    u: [
      [
        "Animar os Ânimos",
        "Extra",
        "1×/cena evita que adjacente fique Fora de Ação (cura ½ Determinação).",
      ],
      [
        "Cópia Barata",
        "Extra",
        "Usa Habilidade Única de outra Persona até o fim da cena.",
      ],
      [
        "Instrução Decisiva",
        "Regular",
        "Uma Persona faz uma ação (não Completa) fora do turno.",
      ],
    ],
  },
  sabe: {
    n: "Quem Sabe",
    e: 10,
    tag: "Dominar todos os conhecimentos e auxiliar nas mais diversas situações.",
    sp: ["Saber", "Místico", "Mundo", "Rastro", "Emocional", "Duelo"],
    m: [
      "Repertório de Conhecimento",
      "Extra",
      "1×/rodada soma ½ Mente a um Teste de Conhecimento ou Combate.",
    ],
    u: [
      [
        "Feedback Defensivo",
        "Regular",
        "1×/cena +Proteção (½ Mente) a uma Persona até o fim da cena.",
      ],
      [
        "Plano de Contingência",
        "Extra",
        "1×/cena reduz a dificuldade de um Teste de Conhecimento.",
      ],
      [
        "Ponto Fraco",
        "Regular",
        "Disputa de Saber; vence e escolhe: +dano, mazela aleatória ou −1 Proteção do alvo.",
      ],
    ],
  },
};

// Habilidades gerais [nome, descrição]
const GER = [
  ["Aprender com a Prática", "Obtém habilidade de Persona da última missão."],
  ["Aumento de Atributo", "+3 pontos nos atributos (repetível)."],
  ["Cão Velho", "Imunidade a 1 mazela (repetível)."],
  ["Saber é Poder", "+1 Conhecimento Especializado (repetível)."],
  ["Todos por Um", "Ataque conjunto do grupo (Completa)."],
];

// Mazelas (livro, cap. "As Mazelas").
// q = frase do livro · g = gatilho (quando surge) · e = efeito · f = como encerrar
const MZ_INFO = {
  "Botando para Fora": {
    q: "O enjoo é forte demais para ser contido.",
    e: "A Carne deixa de somar à Proteção e a Persona sofre 1 de Estresse ao final de cada um dos seus turnos.",
    f: "Sucesso em teste de Esforço (Ação Regular), uso de Kit de Primeiros Socorros ou da habilidade Bálsamo.",
  },
  "Carne Fraca": {
    q: "Não tão rápido assim.",
    g: "Recuperar 10 ou mais pontos de Estresse de uma só vez, numa Cena de Jogo ou dentro de uma rodada.",
    e: "Os músculos relaxam: o próximo Estresse sofrido é dobrado.",
    f: "Encerra ao sofrer esse Estresse dobrado.",
  },
  Confusão: {
    q: "Cuidado por onde anda.",
    e: "Antes de agir sem ajuda de outra Persona que não sofra da mazela, rola 1D6: de 1 a 3 a ação falha de maneira contrária (andar na direção oposta, atacar um aliado); de 4 a 6 dá certo.",
    f: "Sucesso em teste de Esforço ou Rastro, à escolha.",
  },
  "Coragem Cega": {
    q: "Os corajosos são os que mais se machucam.",
    g: "Recuperar 3 ou mais pontos de Coragem de uma só vez, numa Cena de Jogo ou dentro de uma rodada.",
    e: "A Persona acredita ser invencível: a Proteção é reduzida em valor igual à Coragem recebida.",
    f: "Até o próximo ataque que lhe causar dano.",
  },
  Ferida: {
    q: "Isso vai deixar uma marca.",
    g: "Sofrer, de uma só vez, Estresse igual ou superior à metade do limite máximo, ou ser alvo de habilidade de ameaça que cause Ferida.",
    e: "Ao final de cada rodada, volta a receber o mesmo Estresse que causou a Ferida. Se um inimigo tiver ao menos 1 Sucesso Extremo num Teste de Combate contra a Persona, a Ferida aumenta 1 ponto (cumulativo).",
    f: "Gastar um uso do Kit de Primeiros Socorros para tratar a Ferida.",
  },
  Fome: {
    q: "Saco vazio não para em pé.",
    g: "Não se alimentar de uma Ração até realizar uma Cena de Descanso.",
    e: "O Estresse recuperado com habilidades ou equipamentos que não sejam uma Ração é reduzido pela metade. A Persona também adquire Carne Fraca.",
  },
  "Jura de Morte": {
    q: "Não vão descansar até ver a sua cabeça em um espeto.",
    e: "A Persona é o alvo de todos os ataques inimigos, e todos os ataques contra ela têm Dificuldade Reduzida.",
    f: "Sucesso em uma destas opções: Escapar (Esforço ou similar), Esconder (Bandidagem ou similar) ou Estripar (derrotar o responsável pela habilidade).",
  },
  Lentidão: {
    q: "O mundo parece se mover mais devagar.",
    e: "Fuga reduzida pela metade (ou 1, o que for maior); testes baseados em Fuga, como Bandidagem e Reflexos, passam a ter Dificuldade Aumentada.",
    f: "Tratamento por habilidades como Bálsamo, ou após uma Cena de Descanso.",
  },
  "No Chão": {
    q: "É melhor se levantar logo.",
    e: "Levantar custa uma Ação Extra e de Movimento. Seus Testes de Combate são rolados de novo, valendo o pior resultado; os Testes de Combate contra você também são rolados de novo, valendo o melhor.",
    f: "Levantar-se (Ação Extra e de Movimento).",
  },
  "No Escuro": {
    q: "A luz se apagou.",
    e: "A Persona também sofre de Pavor e, a cada Teste de Combate, rola os dados mais uma vez e usa o pior resultado.",
  },
  Pavor: {
    q: "O medo é demais para você aguentar.",
    g: "Ser alvo de habilidade ou efeito que cause Pavor, ou perder pontos de Coragem quando já não tiver nenhum.",
    e: "Todos os bônus são subtraídos em vez de somados e a Persona gasta todas as ações para Escapar em busca de um lugar seguro. Ao final de cada rodada perde 1 de Coragem (ou de Determinação, se não tiver Coragem). Sem nenhum dos dois, faz um teste de Esforço a cada rodada e fica Fora de Ação se falhar.",
    f: "Após Escapar com sucesso, ela (ou outra Persona sem Pavor) faz um teste de Emocional; com sucesso, a mazela termina e a Persona recupera 1 de Coragem.",
  },
  "Pegando Fogo": {
    q: "Quem brinca com fogo pode se queimar.",
    e: "Recebe metade do dano original ao final de cada rodada (ou minuto fora de combate), e o dano cai 1 ponto a cada vez. Se sofrer mais de 5 de Estresse dessa forma, também recebe uma Ferida.",
    f: "Gastar uma Ação Regular e de Movimento para apagar o fogo, ou o dano chegar a zero.",
  },
  "Sem Fôlego": {
    q: "Está difícil de respirar.",
    e: "Ações Regulares passam a ser Completas; Extras passam a ser Regulares; Movimento tem a Velocidade reduzida pela metade; Ações Completas demoram 2 turnos (ou 2 minutos fora de combate). Dura até Fôlego turnos (mín. 1); depois disso a Persona fica Fora de Ação.",
    f: "Ao final de cada turno, teste de Esforço como Ação Completa; com sucesso, a Persona se recupera.",
  },
  "Sem Reação": {
    q: "Algo tira o seu foco.",
    e: "Dura no máximo 2 turnos. A Proteção cai para 1 e perde os bônus de tudo que não seja armadura. A Persona falha automaticamente em todos os testes, exceto o de Rastro.",
    f: "Ao final do primeiro turno, teste de Rastro para se recuperar.",
  },
};

// Fardos (rolados em 1d6 ao ficar Fora de Ação)
const FARDO = [
  ["Guilhotina", "Perde um braço/perna."],
  ["Deterioração", "Um Atributo Fixo reduzido (máx. 9 nele)."],
  ["Covardia", "Perde o dobro de Coragem ao falhar."],
  ["Mal das Pernas", "Limite de Estresse −1."],
  ["Fragilidade", "Ataques que acertam causam +1 dado de dano."],
  ["Ataque Cardíaco", "Teste de Esforço; se falhar, a Persona morre!"],
];

/* Catálogo de equipamento. Formato: "nome|espaços|dano|bônus Prot.|requisito|usos"
   Requisito: F5 = Força ≥ 5, C5 = Carne ≥ 5. Linhas começando com "—" são cabeçalhos. */
const CAT = [
  "— Armas —",
  "Arremessável|1|1d4",
  "Disparo Médio|1|1d6",
  "Lâmina Curta|1|1d2",
  "Lâmina de Guerra|1|2d4",
  "Taco|1|1d4",
  "Corda|2|1d6|0|F5",
  "Disparo Longo|2|1d8|0|F5",
  "Lâmina Longa|2|2d6|0|F5",
  "Disparo Absoluto|3|1d10|0|F5C5",
  "Haste Grande|3|1d10|0|F5C5",
  "— Proteções —",
  "Escudo Leve|1||1",
  "Vestimenta Leve|1||2",
  "Escudo Médio|2||2|C5",
  "Vestimenta Média|2||3|C5",
  "Escudo Pesado|3||3|F5C5",
  "Vestimenta Pesada|3||4|F5C5",
  "— Consumíveis —",
  "Bomba Atordoante|1|1d2|0||1",
  "Bomba de Estalo|1|1d6|0||1",
  "Bomba de Fumaça|1||||1",
  "Bomba Incendiária|1|1d4|0||1",
  "Combustível|1||0||1",
  "Fogueira|3||0||1",
  "Fonte de Luz|1",
  "Kit de Primeiros Socorros|2||0||5",
  "Kit de Reparos|2||0||5",
  "Estimulante|1||0||1",
  "Utensílio|2||0||5",
  "Ração|2||0||1",
  "Recurso|1",
  "Munição|1||0||5",
  "— Durável —",
  "Prótese|3",
];
export { AT, ATTR_COLOR, KN, KN_INFO, RG, ROLES, GER, MZ_INFO, FARDO, CAT };
