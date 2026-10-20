/* =========================================================
   GS INFINITY TRAVEL / Galeria de modelos
   Categorias seguem a galeria do Trello; o conteúdo é da GS.
   Para criar um modelo novo, copie um bloco e ajuste.
   Cartão: C('título', { d: descrição, l: [etiquetas], ck: [checklist], due: dias, cover: cor })
   ========================================================= */
window.GS_MODELOS = (() => {
  const L = (title, ...cards) => ({ title, cards });
  const C = (t, o = {}) => ({ t, ...o });

  const categorias = {
    vendas: 'Vendas',
    marketing: 'Marketing',
    operacoes: 'Operações e RH',
    equipe: 'Gestão de equipe',
    projetos: 'Projetos',
    atendimento: 'Atendimento',
    negocios: 'Negócios',
    produtividade: 'Produtividade',
    pessoal: 'Pessoal'
  };

  const modelos = [
    /* ---------------- VENDAS ---------------- */
    {
      id: 'crm-leads', cat: 'vendas', bg: 'navy', name: 'Funil de vendas (leads)',
      blurb: 'Do primeiro contato ao fechamento, com temperatura do lead e motivo de perda.',
      labels: [['Quente', 'bordo'], ['Morno', 'gold'], ['Frio', 'serenity'], ['Indicação', 'mint'], ['Instagram', 'apricot']],
      lists: [
        L('Novos leads', C('Maria S. · pediu valores de Foz do Iguaçu', { l: ['Instagram', 'Morno'], d: 'Chegou pelo direct. Perguntar datas, número de pessoas e origem do voo.' })),
        L('Contato feito', C('Carlos e Ana · lua de mel', { l: ['Indicação', 'Quente'], due: 1 })),
        L('Cotação enviada', C('Família Lima · 4 pax', { l: ['Morno'], ck: ['Cotar aéreo', 'Cotar hotel', 'Enviar PDF da proposta'], due: 2 })),
        L('Negociação'),
        L('Fechado', C('Exemplo: cliente que fechou', { l: ['Quente'], cover: 'mint' })),
        L('Perdido', C('Exemplo: motivo da perda aqui', { l: ['Frio'], d: 'Registre o motivo (preço, data, desistiu) para melhorar as próximas propostas.' }))
      ]
    },
    {
      id: 'orcamentos', cat: 'vendas', bg: 'royal', name: 'Orçamentos e propostas',
      blurb: 'Acompanhe cada proposta enviada e saiba quando fazer o follow-up.',
      labels: [['Aéreo', 'royal'], ['Pacote', 'mint'], ['Hotel', 'teal'], ['Follow-up hoje', 'bordo']],
      lists: [
        L('Pedido de orçamento', C('Cliente · destino · datas', { l: ['Pacote'] })),
        L('Em cotação', C('Cotar com fornecedores', { ck: ['Aéreo', 'Hotel', 'Translado', 'Passeios'] })),
        L('Proposta enviada', C('Aguardando resposta', { l: ['Follow-up hoje'], due: 2 })),
        L('Aprovada'),
        L('Recusada')
      ]
    },

    /* ---------------- OPERAÇÕES ---------------- */
    {
      id: 'reserva-pacote', cat: 'operacoes', bg: 'cataratas', name: 'Reservas de pacote (passo a passo)',
      blurb: 'Cada cliente é um cartão com o checklist completo: aéreo, hotel, translado, seguro e vouchers.',
      labels: [['Foz do Iguaçu', 'mint'], ['Nacional', 'teal'], ['Internacional', 'royal'], ['Pagamento pendente', 'gold'], ['Urgente', 'bordo']],
      lists: [
        L('Fechado'),
        L('Emissão e reservas', C('Família Souza · Foz do Iguaçu', { l: ['Foz do Iguaçu'], ck: ['Aéreo emitido', 'Hotel com café confirmado', 'Translado', 'Passeios: Cataratas BR e AR', 'Seguro viagem', 'Vouchers enviados'], due: 5 })),
        L('Aguardando pagamento', C('Exemplo: parcela em aberto', { l: ['Pagamento pendente'], due: 1 })),
        L('Documentação', C('Conferir passaportes e vacinas', { l: ['Internacional'] })),
        L('Em viagem'),
        L('Pós-viagem', C('Pedir depoimento e foto', { l: ['Foz do Iguaçu'] }))
      ]
    },
    {
      id: 'excursao', cat: 'operacoes', bg: 'foz', name: 'Excursão em grupo',
      blurb: 'Organize um grupo do zero: fornecedores, inscrições, pagamentos e embarque.',
      labels: [['Fornecedor', 'teal'], ['Inscrição', 'mint'], ['Pagamento', 'gold'], ['Documentos', 'royal'], ['Urgente', 'bordo']],
      lists: [
        L('Planejamento', C('Definir destino, datas e preço por pessoa', { d: 'Fechar também o mínimo de pessoas para confirmar o grupo.', ck: ['Destino e datas', 'Custo por pessoa', 'Margem', 'Mínimo de passageiros'] })),
        L('Fornecedores', C('Bloquear aéreo / ônibus', { l: ['Fornecedor'] }), C('Bloquear hotel', { l: ['Fornecedor'] })),
        L('Inscrições abertas', C('Passageiro 1', { l: ['Inscrição'] })),
        L('Pagamentos', C('Controle de parcelas', { l: ['Pagamento'], due: 7 })),
        L('Documentação', C('Lista de passageiros (nome igual ao documento)', { l: ['Documentos'] })),
        L('Embarque e viagem'),
        L('Pós-viagem')
      ]
    },
    {
      id: 'fornecedores', cat: 'operacoes', bg: 'teal', name: 'Parceiros e fornecedores',
      blurb: 'Hotéis, receptivos, locadoras e companhias: quem está negociando, ativo ou pausado.',
      labels: [['Hotel', 'teal'], ['Receptivo', 'mint'], ['Aéreo', 'royal'], ['Transporte', 'gold']],
      lists: [
        L('Prospectar', C('Hotel em Foz com café incluso', { l: ['Hotel'] })),
        L('Negociando', C('Receptivo Cataratas BR + AR', { l: ['Receptivo'], ck: ['Pedir tarifa net', 'Comparar com 2 concorrentes', 'Pedir comissão'] })),
        L('Contrato assinado'),
        L('Ativos'),
        L('Pausados')
      ]
    },
    {
      id: 'onboarding-30-60-90', cat: 'operacoes', bg: 'apricot', name: 'Integração de novo membro (30-60-90)',
      blurb: 'Plano de 90 dias para quem acabou de entrar na equipe.',
      labels: [['Treinamento', 'teal'], ['Acesso', 'gold'], ['Meta', 'mint']],
      lists: [
        L('Antes do 1º dia', C('Liberar acessos', { l: ['Acesso'], ck: ['E-mail', 'WhatsApp da empresa', 'Sistema de reservas', 'Quadros'] })),
        L('Primeira semana', C('Conhecer produtos e roteiros da GS', { l: ['Treinamento'] })),
        L('Até 30 dias', C('Atender o 1º cliente acompanhada(o)', { l: ['Meta'] })),
        L('Até 60 dias', C('Fechar as 3 primeiras vendas', { l: ['Meta'] })),
        L('Até 90 dias', C('Conduzir uma viagem do início ao fim', { l: ['Meta'] })),
        L('Concluído')
      ]
    },

    /* ---------------- MARKETING ---------------- */
    {
      id: 'calendario-conteudo', cat: 'marketing', bg: 'mint', name: 'Calendário de conteúdo',
      blurb: 'Ideias, roteiro, produção, aprovação e publicação de Reels, carrosséis e stories.',
      labels: [['Reels', 'mint'], ['Carrossel', 'apricot'], ['Stories', 'gold'], ['Blog', 'teal'], ['Campanha', 'royal']],
      lists: [
        L('Ideias', C('5 motivos para conhecer as Cataratas', { l: ['Reels'] })),
        L('Roteirizar', C('O que está incluso no pacote Foz', { l: ['Carrossel'], due: 3 })),
        L('Produção', C('Gravar bastidores de uma viagem', { l: ['Stories'] })),
        L('Aprovação'),
        L('Agendado'),
        L('Publicado', C('Depoimento de cliente', { l: ['Carrossel'], cover: 'apricot' }))
      ]
    },
    {
      id: 'campanha', cat: 'marketing', bg: 'royal', name: 'Campanha de marketing',
      blurb: 'Do briefing aos resultados: criativos, tráfego pago, datas e métricas.',
      labels: [['Meta Ads', 'royal'], ['Google Ads', 'gold'], ['E-mail', 'teal'], ['Orgânico', 'mint']],
      lists: [
        L('Briefing', C('Objetivo, público, oferta e verba', { ck: ['Objetivo', 'Público', 'Oferta e preço', 'Verba', 'Prazo'] })),
        L('Criativos', C('Artes e vídeos', { l: ['Orgânico'], due: 4 })),
        L('Configurar anúncios', C('Subir campanha', { l: ['Meta Ads'] })),
        L('No ar'),
        L('Resultados', C('Relatório: leads, custo por lead, vendas', { d: 'Anotar o que funcionou para repetir na próxima campanha.' }))
      ]
    },

    /* ---------------- ATENDIMENTO ---------------- */
    {
      id: 'atendimento', cat: 'atendimento', bg: 'teal', name: 'Atendimento ao cliente',
      blurb: 'Dúvidas, remarcações e reclamações com o status de cada chamado.',
      labels: [['Dúvida', 'serenity'], ['Remarcação', 'gold'], ['Cancelamento', 'bordo'], ['Reclamação', 'bordo'], ['Elogio', 'mint']],
      lists: [
        L('Novos chamados', C('Cliente pede alteração de data', { l: ['Remarcação'], due: 1 })),
        L('Em atendimento'),
        L('Aguardando cliente'),
        L('Aguardando fornecedor'),
        L('Resolvido')
      ]
    },
    {
      id: 'pos-venda', cat: 'atendimento', bg: 'apricot', name: 'Pós-venda e depoimentos',
      blurb: 'Depois da viagem: pedir depoimento, publicar e reativar o cliente.',
      labels: [['Depoimento', 'mint'], ['Foto autorizada', 'apricot'], ['Reativar', 'royal']],
      lists: [
        L('Viagem finalizada', C('Família Rocha · voltou ontem', { due: 2 })),
        L('Pedir depoimento', C('Enviar mensagem com o link do formulário', { ck: ['Mensagem enviada', 'Lembrete em 3 dias'] })),
        L('Depoimento recebido', C('Texto + fotos', { l: ['Depoimento', 'Foto autorizada'] })),
        L('Publicado', C('Post no Instagram', { cover: 'mint' })),
        L('Reativar em 6 meses', C('Oferecer próximo destino', { l: ['Reativar'] }))
      ]
    },

    /* ---------------- GESTÃO DE EQUIPE ---------------- */
    {
      id: 'reuniao-1-1', cat: 'equipe', bg: 'navy', name: 'Reunião 1 a 1',
      blurb: 'Pauta compartilhada, metas e ações combinadas entre duas pessoas.',
      labels: [['Pauta', 'mint'], ['Ação', 'gold'], ['Meta', 'royal']],
      lists: [
        L('Informações', C('Como usar este quadro', { d: 'Use as etiquetas para marcar se o cartão é pauta, ação ou meta.', cover: 'mint' })),
        L('Pauta', C('Tema que quero conversar', { l: ['Pauta'] })),
        L('Metas', C('Meta do trimestre', { l: ['Meta'] })),
        L('Ações', C('Combinado: quem faz o quê até quando', { l: ['Ação'], due: 7 })),
        L('Concluído')
      ]
    },
    {
      id: 'retrospectiva', cat: 'equipe', bg: 'royal', name: 'Retrospectiva da equipe',
      blurb: 'O que foi bem, o que melhorar e o que vamos fazer diferente.',
      labels: [['Votar', 'gold']],
      lists: [
        L('Foi bem', C('Exemplo: resposta rápida aos leads')),
        L('Pode melhorar', C('Exemplo: follow-up das propostas')),
        L('Ideias', C('Exemplo: roteiro padrão de pós-venda')),
        L('Ações para o próximo ciclo', C('Quem, o quê, até quando', { due: 14 }))
      ]
    },

    /* ---------------- PROJETOS ---------------- */
    {
      id: 'kanban-projetos', cat: 'projetos', bg: 'navy', name: 'Kanban de projetos',
      blurb: 'O básico que funciona: backlog, a fazer, em andamento, revisão e concluído.',
      labels: [['Prioridade alta', 'bordo'], ['Em espera', 'gold'], ['Financeiro', 'serenity'], ['Comercial', 'mint'], ['Marketing', 'apricot']],
      lists: [
        L('Backlog', C('Ideia para depois')),
        L('A fazer', C('Primeira tarefa', { l: ['Prioridade alta'], due: 3 })),
        L('Em andamento'),
        L('Em revisão'),
        L('Concluído')
      ]
    },
    {
      id: 'lancamento-roteiro', cat: 'projetos', bg: 'cataratas', name: 'Lançamento de um novo roteiro',
      blurb: 'Tudo para colocar um destino novo à venda: fornecedores, preço, material e divulgação.',
      labels: [['Fornecedor', 'teal'], ['Preço', 'gold'], ['Material', 'apricot'], ['Divulgação', 'mint']],
      lists: [
        L('Pesquisa', C('Escolher destino e perfil do cliente', { ck: ['Concorrentes', 'Melhor época', 'Perfil do viajante'] })),
        L('Fornecedores', C('Hotéis, passeios e transporte', { l: ['Fornecedor'] })),
        L('Preço e margem', C('Montar tabela de preços', { l: ['Preço'] })),
        L('Material de venda', C('Fotos, roteiro dia a dia e PDF', { l: ['Material'] })),
        L('Divulgação', C('Post de lançamento e lista de transmissão', { l: ['Divulgação'], due: 10 })),
        L('No ar')
      ]
    },

    /* ---------------- NEGÓCIOS ---------------- */
    {
      id: 'financeiro', cat: 'negocios', bg: 'royal', name: 'Contas e comissões',
      blurb: 'Contas a pagar, comissões a receber e conciliação do mês.',
      labels: [['Fornecedor', 'teal'], ['Comissão', 'mint'], ['Imposto', 'bordo'], ['Fixo', 'serenity']],
      lists: [
        L('A pagar', C('Fornecedor · vencimento', { l: ['Fornecedor'], due: 5 })),
        L('Agendado'),
        L('Pago'),
        L('Comissões a receber', C('Hotel · reserva do cliente', { l: ['Comissão'] })),
        L('Conciliado no mês')
      ]
    },
    {
      id: 'metas-okr', cat: 'negocios', bg: 'teal', name: 'Metas do trimestre (OKR)',
      blurb: 'Objetivos, resultados-chave e o que está em andamento.',
      labels: [['Vendas', 'mint'], ['Marca', 'apricot'], ['Operação', 'royal']],
      lists: [
        L('Objetivos', C('Ser referência em Foz do Iguaçu', { l: ['Marca'] })),
        L('Resultados-chave', C('Fechar 20 pacotes no trimestre', { l: ['Vendas'], ck: ['Mês 1: 6', 'Mês 2: 7', 'Mês 3: 7'] })),
        L('Em andamento'),
        L('Atingido', C('Exemplo: meta cumprida', { cover: 'mint' }))
      ]
    },

    /* ---------------- PRODUTIVIDADE / PESSOAL ---------------- */
    {
      id: 'tarefas-pessoais', cat: 'produtividade', bg: 'mint', name: 'Minhas tarefas',
      blurb: 'Hoje, esta semana, depois e feito. Simples assim.',
      labels: [['Importante', 'bordo'], ['Rápido', 'mint']],
      lists: [
        L('Hoje', C('Responder os leads novos', { l: ['Importante'] })),
        L('Esta semana', C('Fechar propostas em aberto', { due: 4 })),
        L('Depois'),
        L('Feito')
      ]
    },
    {
      id: 'planejar-viagem', cat: 'pessoal', bg: 'foz', name: 'Planejar uma viagem',
      blurb: 'Destinos, pesquisas, reservas, roteiro e lista de mala num só quadro.',
      labels: [['Reservado', 'mint'], ['Pesquisar', 'gold'], ['Pagar', 'bordo']],
      lists: [
        L('Destinos em mente', C('Foz do Iguaçu', { cover: 'mint' })),
        L('Pesquisar', C('Melhor época e preços', { l: ['Pesquisar'] })),
        L('Reservado', C('Hotel e voo', { l: ['Reservado'] })),
        L('Roteiro dia a dia', C('Dia 1: chegada e Marco das Três Fronteiras')),
        L('Lista de mala', C('Documentos e itens essenciais', { ck: ['Documento com foto / passaporte', 'Carregador', 'Capa de chuva (Cataratas)', 'Protetor solar', 'Remédios'] })),
        L('Feito')
      ]
    }
  ];

  return { categorias, modelos };
})();
