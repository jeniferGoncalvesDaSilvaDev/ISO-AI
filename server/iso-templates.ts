type Company = { name: string; sector: string; size: string };

type DocTemplate = {
  section: string;
  type: string;
  content: (c: Company, isos: string[], date: string) => string;
};

const iso9001Docs: DocTemplate[] = [
  {
    section: "1. Estrutura do SGQ",
    type: "SGQ-01 – Escopo do Sistema de Gestão da Qualidade",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: SGQ-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROPÓSITO
Este documento define o escopo do Sistema de Gestão da Qualidade (SGQ) da ${c.name}, estabelecendo os limites e a aplicabilidade da norma ABNT NBR ISO 9001:2015.

2. DADOS DA ORGANIZAÇÃO
• Razão Social: ${c.name}
• Setor de Atuação: ${c.sector}
• Porte: ${c.size} colaboradores
• Normas aplicáveis: ${isos.join(', ')}

3. ESCOPO DECLARADO
O SGQ da ${c.name} abrange todos os processos, produtos e serviços relacionados às atividades do setor de ${c.sector}, incluindo planejamento, execução, controle e melhoria contínua das operações, desde o contato com o cliente até a entrega final e o suporte pós-venda.

4. LIMITES DO SGQ
• Físico: Todas as instalações e ambientes de operação da ${c.name}
• Organizacional: Todos os departamentos e funções que impactam a qualidade
• Produto/Serviço: Toda a linha de produtos e serviços oferecidos ao mercado

5. PARTES INTERESSADAS RELEVANTES
• Clientes e consumidores finais
• Fornecedores e parceiros estratégicos
• Colaboradores e liderança
• Órgãos regulatórios do setor de ${c.sector}
• Acionistas e investidores

6. EXCLUSÕES
Não se aplicam exclusões dos requisitos da ISO 9001:2015, dado o escopo completo das operações da ${c.name}.

7. APROVAÇÃO
Documento aprovado pela Alta Direção da ${c.name} em ${d}.
Representante da Direção: ________________________ Assinatura: _____________`,
  },
  {
    section: "1. Estrutura do SGQ",
    type: "SGQ-02 – Política da Qualidade",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: SGQ-02 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POLÍTICA DA QUALIDADE — ${c.name.toUpperCase()}

A ${c.name}, empresa atuante no setor de ${c.sector} com ${c.size} colaboradores, comprometida com a excelência e a satisfação de seus clientes, declara formalmente a seguinte Política da Qualidade:

NOSSOS COMPROMISSOS:

✅ FOCO NO CLIENTE
Compreender e superar as expectativas e necessidades de nossos clientes, entregando produtos e serviços que agreguem valor real ao seu negócio.

✅ LIDERANÇA E COMPROMETIMENTO
A Alta Direção lidera pelo exemplo, garantindo que os objetivos da qualidade sejam comunicados, compreendidos e alcançados em todos os níveis da organização.

✅ MELHORIA CONTÍNUA
Revisar e aprimorar continuamente nossos processos, produtos e serviços por meio do ciclo PDCA (Planejar, Executar, Verificar, Agir).

✅ CONFORMIDADE LEGAL E NORMATIVA
Cumprir todos os requisitos legais aplicáveis ao setor de ${c.sector}, bem como os requisitos da norma ${isos.includes('ISO 9001') ? 'ISO 9001:2015' : isos[0]}.

✅ DESENVOLVIMENTO DE PESSOAS
Investir na capacitação e desenvolvimento de nossos colaboradores, reconhecendo que pessoas competentes e motivadas são a base da qualidade.

✅ DECISÕES BASEADAS EM EVIDÊNCIAS
Utilizar dados e informações confiáveis para embasar todas as decisões estratégicas e operacionais da organização.

Esta política é comunicada, entendida e praticada por todos os colaboradores da ${c.name}, revisada anualmente pela Alta Direção e disponível a todas as partes interessadas.

Emitida em: ${d}
Assinatura da Alta Direção: ________________________________
Cargo: Diretor(a) Geral / CEO`,
  },
  {
    section: "1. Estrutura do SGQ",
    type: "SGQ-03 – Objetivos da Qualidade",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: SGQ-03 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJETIVOS DA QUALIDADE — ${c.name.toUpperCase()}

Período de vigência: ${new Date().getFullYear()} – ${new Date().getFullYear() + 1}
Setor: ${c.sector} | Norma: ${isos.join(', ')}

━━━━ OBJETIVOS ESTRATÉGICOS ━━━━

OBJ-01 | SATISFAÇÃO DO CLIENTE
• Meta: Índice de satisfação ≥ 90% nas pesquisas de clientes
• Indicador: Pesquisa de satisfação trimestral (NPS ou escala 1-5)
• Responsável: Gerência Comercial / Atendimento
• Prazo: Mensuração trimestral

OBJ-02 | CONFORMIDADE DE PRODUTOS E SERVIÇOS
• Meta: Taxa de não conformidade < 2% do total entregue
• Indicador: Relatórios de inspeção e reclamações de clientes
• Responsável: Equipe de Qualidade
• Prazo: Mensuração mensal

OBJ-03 | EFICIÊNCIA OPERACIONAL
• Meta: Reduzir retrabalho em 30% em relação ao período anterior
• Indicador: Horas de retrabalho / total de horas produtivas
• Responsável: Supervisão Operacional
• Prazo: Mensuração trimestral

OBJ-04 | DESENVOLVIMENTO DE FORNECEDORES
• Meta: 80% dos fornecedores críticos qualificados e avaliados
• Indicador: Planilha de qualificação de fornecedores
• Responsável: Compras / Suprimentos
• Prazo: Avaliação semestral

OBJ-05 | COMPETÊNCIA E TREINAMENTO
• Meta: 100% dos colaboradores com treinamento no SGQ concluído
• Indicador: Matriz de treinamento atualizada
• Responsável: RH / Gestão de Pessoas
• Prazo: Anual

OBJ-06 | AUDITORIA INTERNA
• Meta: Realizar 2 auditorias internas por ano sem não conformidades críticas
• Indicador: Relatórios de auditoria e planos de ação
• Responsável: Auditor Interno
• Prazo: Semestral

━━━━ ACOMPANHAMENTO ━━━━
Os objetivos são revisados trimestralmente nas Reuniões de Análise Crítica pela Direção e reportados ao time de liderança.

Aprovado em: ${d} | Alta Direção: _____________________________`,
  },
  {
    section: "1. Estrutura do SGQ",
    type: "SGQ-04 – Mapa de Processos",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: SGQ-04 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPA DE PROCESSOS — ${c.name.toUpperCase()}
Setor: ${c.sector}

━━━━ PROCESSOS DE GESTÃO (Estratégicos) ━━━━

P01 | PLANEJAMENTO ESTRATÉGICO
Entradas: Análise de contexto, partes interessadas, oportunidades de mercado
Saídas: Plano estratégico, objetivos da qualidade, planos de ação
Responsável: Alta Direção
Indicadores: Cumprimento de metas estratégicas

P02 | ANÁLISE CRÍTICA PELA DIREÇÃO
Entradas: Resultados de auditorias, desempenho de processos, feedback de clientes
Saídas: Decisões de melhoria, recursos alocados, ações corretivas aprovadas
Responsável: Alta Direção
Frequência: Semestral

━━━━ PROCESSOS PRINCIPAIS (Operacionais) ━━━━

P03 | RELACIONAMENTO COM O CLIENTE
Entradas: Necessidades e expectativas dos clientes
Saídas: Pedidos confirmados, contratos, especificações validadas
Responsável: Área Comercial / Atendimento

P04 | PLANEJAMENTO E EXECUÇÃO
Entradas: Pedidos confirmados, especificações técnicas
Saídas: Produtos/Serviços entregues, registros de produção/execução
Responsável: Operações / Produção

P05 | CONTROLE E INSPEÇÃO DA QUALIDADE
Entradas: Produtos/Serviços em processo ou concluídos
Saídas: Produtos aprovados, registros de inspeção, não conformidades identificadas
Responsável: Qualidade

━━━━ PROCESSOS DE APOIO (Suporte) ━━━━

P06 | GESTÃO DE PESSOAS E COMPETÊNCIAS
Responsável: RH | Saídas: Colaboradores treinados, matriz de competências

P07 | GESTÃO DE FORNECEDORES
Responsável: Compras | Saídas: Fornecedores qualificados, materiais/serviços no prazo

P08 | GESTÃO DE INFRAESTRUTURA
Responsável: Manutenção | Saídas: Equipamentos calibrados, instalações adequadas

P09 | CONTROLE DE DOCUMENTOS E REGISTROS
Responsável: SGQ | Saídas: Documentos controlados, registros arquivados

P10 | AUDITORIA INTERNA E MELHORIA CONTÍNUA
Responsável: Auditor Interno | Saídas: Relatórios, planos de ação corretiva

━━━━ INTERAÇÕES ENTRE PROCESSOS ━━━━
P01 → P02 → Todos os processos → P05 → Retorno para P01 (ciclo de melhoria)

Emitido em: ${d} | Aprovado por: ___________________________`,
  },
  {
    section: "2. Procedimentos",
    type: "PQ-01 – Controle de Documentos e Registros",
    content: (c, isos, d) => `PROCEDIMENTO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: PQ-01 | TÍTULO: Controle de Documentos e Registros
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. OBJETIVO
Estabelecer as diretrizes para elaboração, identificação, aprovação, distribuição, atualização e controle de todos os documentos e registros do SGQ da ${c.name}.

2. CAMPO DE APLICAÇÃO
Aplica-se a todos os documentos do SGQ: políticas, procedimentos, instruções de trabalho, formulários e registros da qualidade.

3. RESPONSABILIDADES
• Responsável pelo SGQ: Elaborar, revisar e distribuir documentos
• Gestores de área: Revisar e aprovar documentos de sua área
• Alta Direção: Aprovar documentos estratégicos
• Colaboradores: Utilizar apenas documentos na última versão

4. CLASSIFICAÇÃO DE DOCUMENTOS
NÍVEL 1 — Documentos Estratégicos (SGQ-XX): Política, Escopo, Objetivos, Mapa de Processos
NÍVEL 2 — Procedimentos (PQ-XX): Procedimentos operacionais do SGQ
NÍVEL 3 — Instruções de Trabalho (IT-XX): Instruções detalhadas de execução
NÍVEL 4 — Formulários/Registros (FQ-XX): Formulários e evidências de conformidade

5. FLUXO DE CRIAÇÃO E APROVAÇÃO
5.1 Elaboração → 5.2 Revisão técnica → 5.3 Aprovação pelo responsável → 5.4 Codificação e numeração → 5.5 Distribuição controlada → 5.6 Arquivamento

6. IDENTIFICAÇÃO DOS DOCUMENTOS
Formato do código: [TIPO]-[NÚMERO] – [TÍTULO]
Exemplos: SGQ-01, PQ-01, FQ-02

7. CONTROLE DE REVISÕES
• Toda alteração gera nova revisão (00, 01, 02...)
• Documentos obsoletos são identificados com carimbo "OBSOLETO"
• O documento mais atual está sempre na Lista Mestra (FQ-01)

8. ARMAZENAMENTO E PRESERVAÇÃO
• Documentos digitais: Sistema de gestão da ${c.name} (acesso controlado)
• Documentos físicos: Arquivos identificados por setor
• Tempo de retenção de registros: mínimo 5 anos, ou conforme exigência legal

9. PRAZO DE REVISÃO PERIÓDICA
Todos os documentos do SGQ são revisados no mínimo a cada 2 anos ou quando houver mudanças significativas nos processos.

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "2. Procedimentos",
    type: "PQ-02 – Controle de Não Conformidade e Ação Corretiva",
    content: (c, isos, d) => `PROCEDIMENTO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: PQ-02 | TÍTULO: Controle de Não Conformidade e Ação Corretiva
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. OBJETIVO
Definir a metodologia para identificação, registro, análise de causa raiz, tratamento e verificação de eficácia de não conformidades reais e potenciais no SGQ da ${c.name}.

2. CONCEITOS IMPORTANTES
• Não Conformidade (NC): Não atendimento a um requisito do SGQ, do cliente ou legal
• Ação Corretiva (AC): Ação para eliminar a causa de uma NC e prevenir recorrência
• Ação Preventiva (AP): Ação para eliminar causa de NC potencial antes que ocorra
• Ação Imediata (AI): Contenção para minimizar o impacto da NC detectada

3. FONTES DE IDENTIFICAÇÃO DE NÃO CONFORMIDADES
• Auditorias internas e externas
• Reclamações de clientes
• Inspeção de produtos/serviços
• Análise de indicadores fora da meta
• Observações de colaboradores

4. FLUXO DO TRATAMENTO DE NC
PASSO 1 — IDENTIFICAÇÃO: Qualquer colaborador identifica e registra no formulário FQ-02
PASSO 2 — CONTENÇÃO IMEDIATA: Responsável da área isola/corrige o problema
PASSO 3 — ANÁLISE DE CAUSA RAIZ: Utilizar metodologia (5 Por Quês, Ishikawa ou outros)
PASSO 4 — PLANO DE AÇÃO CORRETIVA: Definir ações, responsáveis e prazos
PASSO 5 — IMPLEMENTAÇÃO: Executar as ações planejadas
PASSO 6 — VERIFICAÇÃO DE EFICÁCIA: Após prazo, verificar se a NC foi eliminada
PASSO 7 — FECHAMENTO: Documentar resultado e arquivar no sistema

5. CLASSIFICAÇÃO DAS NÃO CONFORMIDADES
• CRÍTICA: Impacto direto na segurança, cliente ou conformidade legal — prazo: 24h
• MAIOR: Impacto significativo no processo ou produto — prazo: 7 dias
• MENOR: Impacto limitado, sem risco imediato — prazo: 30 dias

6. ANÁLISE DE CAUSA RAIZ — MÉTODO DOS 5 POR QUÊS
Exemplo para ${c.sector}: "Por que o problema ocorreu?" → responder 5 vezes até encontrar a causa raiz

7. REGISTROS EXIGIDOS
• FQ-02 – Registro de Não Conformidade e Ação Corretiva (preenchido para cada NC)
• Evidências das ações implementadas
• Verificação de eficácia assinada pelo responsável

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "2. Procedimentos",
    type: "PQ-03 – Auditoria Interna",
    content: (c, isos, d) => `PROCEDIMENTO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: PQ-03 | TÍTULO: Auditoria Interna
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. OBJETIVO
Definir as diretrizes para planejamento, execução, relatório e acompanhamento das auditorias internas do SGQ da ${c.name}, verificando conformidade com a ISO 9001:2015 e com os requisitos internos.

2. PROGRAMA DE AUDITORIA
• Frequência mínima: 2 auditorias internas por ano (uma por semestre)
• Escopo: Todos os processos do SGQ
• Critérios: ISO 9001:2015, procedimentos internos, requisitos legais aplicáveis

3. REQUISITOS PARA AUDITORES INTERNOS
• Treinamento em ISO 9001:2015 (mínimo 16 horas)
• Curso de Auditor Interno (recomendado)
• Independência: Auditores não auditam sua própria área de trabalho
• Imparcialidade: Sem conflito de interesses com a área auditada

4. PLANEJAMENTO DA AUDITORIA
4.1 Elaborar Plano de Auditoria com: data, escopo, processos, auditores e auditados
4.2 Comunicar formalmente os auditados com antecedência mínima de 5 dias úteis
4.3 Revisar documentação relevante antes da auditoria (procedimentos, resultados anteriores)

5. EXECUÇÃO DA AUDITORIA
5.1 REUNIÃO DE ABERTURA: Apresentar objetivo, escopo e metodologia
5.2 COLETA DE EVIDÊNCIAS: Entrevistas, observação direta, análise de registros
5.3 CLASSIFICAÇÃO DE ACHADOS:
    • Conformidade (C): Requisito atendido com evidência
    • Observação (OBS): Oportunidade de melhoria sem NC
    • Não Conformidade Menor: NC de baixo impacto
    • Não Conformidade Maior: NC de alto impacto
5.4 REUNIÃO DE ENCERRAMENTO: Apresentar achados e próximos passos

6. RELATÓRIO DE AUDITORIA (FQ-03)
Emitir relatório em até 5 dias úteis após a auditoria, contendo:
• Escopo e objetivos; Auditores e auditados; Achados; NCs identificadas; Conclusão

7. ACOMPANHAMENTO DAS AÇÕES
• NCs da auditoria geram Ações Corretivas via PQ-02
• Verificação de eficácia no prazo acordado
• Resultados reportados na próxima Análise Crítica pela Direção (PQ-04)

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "2. Procedimentos",
    type: "PQ-04 – Análise Crítica pela Direção",
    content: (c, isos, d) => `PROCEDIMENTO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: PQ-04 | TÍTULO: Análise Crítica pela Direção
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. OBJETIVO
Garantir a adequação, suficiência e eficácia contínua do SGQ da ${c.name}, por meio de revisão periódica pela Alta Direção com base em dados e informações relevantes.

2. FREQUÊNCIA E PARTICIPANTES
• Frequência: Semestral (mínimo), podendo ser realizada anualmente
• Participantes obrigatórios: Alta Direção, gestores de área, responsável pelo SGQ
• Participantes opcionais: Consultores externos, clientes-chave (quando aplicável)

3. ENTRADAS DA ANÁLISE CRÍTICA
A Alta Direção deve analisar obrigatoriamente:
□ Status das ações de análises críticas anteriores
□ Mudanças internas e externas relevantes para o SGQ
□ Desempenho e eficácia do SGQ (indicadores de qualidade)
□ Satisfação de clientes e feedback das partes interessadas
□ Grau de atendimento dos objetivos da qualidade (SGQ-03)
□ Desempenho de processos e conformidade de produtos/serviços
□ Resultados de auditorias internas e externas
□ Desempenho de fornecedores
□ Adequação de recursos humanos, tecnológicos e de infraestrutura
□ Eficácia das ações para riscos e oportunidades
□ Oportunidades de melhoria identificadas

4. SAÍDAS DA ANÁLISE CRÍTICA
A reunião deve resultar em decisões e ações documentadas para:
□ Oportunidades de melhoria do SGQ e dos processos
□ Necessidades de mudança no SGQ (atualização de documentos)
□ Necessidades de recursos (pessoas, tecnologia, infraestrutura)
□ Metas e objetivos revisados para o próximo período

5. REGISTRO
• Ata de Análise Crítica: registrar todos os pontos analisados e decisões tomadas
• Prazo de arquivamento: mínimo 5 anos
• Distribuição: Todos os participantes e envolvidos nos planos de ação

6. ACOMPANHAMENTO
Ações decididas na Análise Crítica são formalizadas com responsável, prazo e acompanhamento na reunião seguinte.

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "3. Formulários e Registros",
    type: "FQ-01 – Lista Mestra de Documentos do SGQ",
    content: (c, isos, d) => `FORMULÁRIO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: FQ-01 | TÍTULO: Lista Mestra de Documentos
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

LISTA MESTRA DE DOCUMENTOS DO SGQ

┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO   │ TÍTULO                                        │ REV │ DATA    │
├─────────────────────────────────────────────────────────────────────────┤
│ SGQ-01   │ Escopo do Sistema de Gestão da Qualidade      │ 00  │ ${d} │
│ SGQ-02   │ Política da Qualidade                         │ 00  │ ${d} │
│ SGQ-03   │ Objetivos da Qualidade                        │ 00  │ ${d} │
│ SGQ-04   │ Mapa de Processos                             │ 00  │ ${d} │
│ PQ-01    │ Controle de Documentos e Registros            │ 00  │ ${d} │
│ PQ-02    │ Controle de NC e Ação Corretiva               │ 00  │ ${d} │
│ PQ-03    │ Auditoria Interna                             │ 00  │ ${d} │
│ PQ-04    │ Análise Crítica pela Direção                  │ 00  │ ${d} │
│ FQ-01    │ Lista Mestra de Documentos                    │ 00  │ ${d} │
│ FQ-02    │ Registro de Não Conformidade                  │ 00  │ ${d} │
│ FQ-03    │ Relatório de Auditoria Interna                │ 00  │ ${d} │
│ FQ-04    │ Ata de Análise Crítica pela Direção           │ 00  │ ${d} │
│ PA-01    │ Plano de Implementação ISO 9001               │ 00  │ ${d} │
└─────────────────────────────────────────────────────────────────────────┘

NOTAS:
• REV 00 = Documento emitido pela primeira vez
• Este documento é atualizado a cada nova emissão ou revisão
• Documentos obsoletos são identificados com "OBS" no campo REV e arquivados separadamente

Responsável pelo controle: ____________________________
Data de atualização: ${d}`,
  },
  {
    section: "3. Formulários e Registros",
    type: "FQ-02 – Registro de Não Conformidade e Ação Corretiva",
    content: (c, isos, d) => `FORMULÁRIO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: FQ-02 | TÍTULO: Registro de Não Conformidade e Ação Corretiva
REVISÃO: 00 | DATA: ${d} | STATUS: MODELO EM BRANCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | Nº da NC: NC-${new Date().getFullYear()}-_____

━━━━ SEÇÃO 1 — IDENTIFICAÇÃO DA NÃO CONFORMIDADE ━━━━
Data de abertura: ________________
Detectado por: ________________ | Área/Processo: ________________
Fonte de detecção: □ Auditoria  □ Reclamação de cliente  □ Inspeção  □ Observação interna
Classificação: □ NC Crítica  □ NC Maior  □ NC Menor

Descrição detalhada da não conformidade:
______________________________________________________________
______________________________________________________________

Requisito não atendido (cláusula ISO 9001:2015 ou procedimento interno):
______________________________________________________________

━━━━ SEÇÃO 2 — AÇÃO IMEDIATA (CONTENÇÃO) ━━━━
Ação imediata realizada para conter o problema:
______________________________________________________________
Responsável: ________________ | Data: ________________

━━━━ SEÇÃO 3 — ANÁLISE DE CAUSA RAIZ ━━━━
Método utilizado: □ 5 Por Quês  □ Diagrama de Ishikawa  □ Brainstorming

Por quê 1: ____________________________________________________________
Por quê 2: ____________________________________________________________
Por quê 3: ____________________________________________________________
Por quê 4: ____________________________________________________________
Por quê 5: ____________________________________________________________

CAUSA RAIZ IDENTIFICADA: ______________________________________________

━━━━ SEÇÃO 4 — PLANO DE AÇÃO CORRETIVA ━━━━
┌───────────────────────────────────────────────────────────────────┐
│ AÇÃO │ RESPONSÁVEL │ PRAZO │ RECURSOS NECESSÁRIOS                 │
├───────────────────────────────────────────────────────────────────┤
│ 1.   │             │       │                                      │
│ 2.   │             │       │                                      │
│ 3.   │             │       │                                      │
└───────────────────────────────────────────────────────────────────┘

━━━━ SEÇÃO 5 — VERIFICAÇÃO DE EFICÁCIA ━━━━
Data de verificação: ________________
Responsável: ________________
A não conformidade foi eliminada?  □ SIM  □ NÃO
Evidências: ______________________________________________________________

Status: □ ABERTA  □ EM ANDAMENTO  □ FECHADA
Assinatura responsável: ____________________________ Data: ________________`,
  },
  {
    section: "3. Formulários e Registros",
    type: "FQ-03 – Relatório de Auditoria Interna",
    content: (c, isos, d) => `FORMULÁRIO DA QUALIDADE — ABNT NBR ISO 9001:2015
DOCUMENTO: FQ-03 | TÍTULO: Relatório de Auditoria Interna
REVISÃO: 00 | DATA: ${d} | STATUS: MODELO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | Nº Auditoria: AI-${new Date().getFullYear()}-_____

━━━━ DADOS DA AUDITORIA ━━━━
Data de realização: ________________ | Hora início: ______ | Hora fim: ______
Auditor(es) responsável(is): ___________________________________________________
Área(s) / processo(s) auditado(s): _____________________________________________
Critérios da auditoria: □ ISO 9001:2015  □ Procedimentos internos  □ Requisitos legais

━━━━ PARTICIPANTES ━━━━
Nome | Cargo | Função (Auditado/Auditor)
____________________ | ________________ | _______________
____________________ | ________________ | _______________

━━━━ RESUMO DOS ACHADOS ━━━━
Total de conformidades identificadas: _____
Total de observações/oportunidades de melhoria: _____
Total de não conformidades menores: _____
Total de não conformidades maiores: _____

━━━━ NÃO CONFORMIDADES IDENTIFICADAS ━━━━
NC Nº 1:
Descrição: _________________________________________________________________
Requisito: ________________________________________________________________
Evidência: ________________________________________________________________

NC Nº 2:
Descrição: _________________________________________________________________
Requisito: ________________________________________________________________
Evidência: ________________________________________________________________

━━━━ OPORTUNIDADES DE MELHORIA ━━━━
OBS 1: ____________________________________________________________________
OBS 2: ____________________________________________________________________

━━━━ CONCLUSÃO ━━━━
□ O processo está CONFORME com os critérios de auditoria
□ O processo está PARCIALMENTE CONFORME (NCs menores identificadas)
□ O processo está NÃO CONFORME (NCs maiores identificadas)

Comentários adicionais: _____________________________________________________

━━━━ ASSINATURAS ━━━━
Auditor Líder: __________________________ Data: ______________
Responsável pelo Processo: ______________ Data: ______________`,
  },
  {
    section: "4. Plano de Implementação",
    type: "PA-01 – Plano de Ação para Certificação ISO 9001",
    content: (c, isos, d) => `PLANO DE AÇÃO — ABNT NBR ISO 9001:2015
DOCUMENTO: PA-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector} | PORTE: ${c.size} colaboradores
NORMAS-ALVO: ${isos.join(', ')}

━━━━ FASE 1 — DIAGNÓSTICO E PLANEJAMENTO (Meses 1-2) ━━━━

□ 1.1 Realizar Gap Analysis (análise de lacunas) frente aos requisitos da ${isos.join('/')}
    Responsável: Consultor/SGQ | Prazo: Mês 1

□ 1.2 Mapear todos os processos da ${c.name} (P01 a P10 conforme SGQ-04)
    Responsável: Líderes de área + SGQ | Prazo: Mês 1

□ 1.3 Identificar partes interessadas e suas expectativas
    Responsável: Alta Direção | Prazo: Mês 1

□ 1.4 Nomear Representante da Direção para o SGQ
    Responsável: Alta Direção | Prazo: Mês 1

□ 1.5 Definir e aprovar Escopo do SGQ (SGQ-01)
    Responsável: Alta Direção + SGQ | Prazo: Mês 2

□ 1.6 Elaborar e aprovar Política da Qualidade (SGQ-02)
    Responsável: Alta Direção | Prazo: Mês 2

━━━━ FASE 2 — DOCUMENTAÇÃO (Meses 2-4) ━━━━

□ 2.1 Elaborar Objetivos da Qualidade mensuráveis (SGQ-03)
    Responsável: SGQ + Gestores | Prazo: Mês 2

□ 2.2 Criar e aprovar todos os Procedimentos (PQ-01 a PQ-04)
    Responsável: SGQ + Áreas | Prazo: Meses 2-3

□ 2.3 Desenvolver Formulários e Registros (FQ-01 a FQ-04)
    Responsável: SGQ | Prazo: Mês 3

□ 2.4 Implementar sistema de Controle de Documentos (PQ-01)
    Responsável: SGQ | Prazo: Mês 3

□ 2.5 Qualificar e avaliar fornecedores críticos
    Responsável: Compras | Prazo: Mês 4

━━━━ FASE 3 — IMPLEMENTAÇÃO E TREINAMENTO (Meses 4-6) ━━━━

□ 3.1 Treinar 100% dos colaboradores na Política e objetivos da Qualidade
    Responsável: RH + SGQ | Prazo: Mês 4

□ 3.2 Treinar líderes nos procedimentos do SGQ
    Responsável: SGQ | Prazo: Mês 4

□ 3.3 Iniciar coleta sistemática de indicadores de desempenho
    Responsável: Gestores + SGQ | Prazo: Mês 5

□ 3.4 Executar plano de comunicação interna sobre o SGQ
    Responsável: RH + SGQ | Prazo: Mês 5

━━━━ FASE 4 — AUDITORIA E CERTIFICAÇÃO (Meses 6-8) ━━━━

□ 4.1 Realizar 1ª Auditoria Interna Completa (todos os processos)
    Responsável: Auditor Interno | Prazo: Mês 6

□ 4.2 Tratar todas as NCs identificadas na auditoria (PQ-02)
    Responsável: Gestores + SGQ | Prazo: Mês 6-7

□ 4.3 Conduzir 1ª Análise Crítica pela Direção (PQ-04)
    Responsável: Alta Direção | Prazo: Mês 7

□ 4.4 Realizar Auditoria de Pré-certificação (Stage 1) com organismo
    Responsável: SGQ | Prazo: Mês 7

□ 4.5 Realizar Auditoria de Certificação (Stage 2) com organismo acreditado
    Responsável: SGQ + Alta Direção | Prazo: Mês 8

━━━━ MANUTENÇÃO PÓS-CERTIFICAÇÃO ━━━━
• Auditorias internas: 2x/ano | Análise Crítica: 2x/ano | Renovação: a cada 3 anos

Aprovado pela Alta Direção em: ${d}
Assinatura: ________________________________`,
  },
];

const iso27001Docs: DocTemplate[] = [
  {
    section: "1. Estrutura do SGSI",
    type: "SGSI-01 – Escopo e Declaração de Aplicabilidade",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DE SEGURANÇA DA INFORMAÇÃO — ISO/IEC 27001:2022
DOCUMENTO: SGSI-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector} | PORTE: ${c.size} colaboradores

1. ESCOPO DO SGSI
O SGSI da ${c.name} abrange todos os ativos de informação, sistemas, processos e pessoas relacionados às operações do setor de ${c.sector}, incluindo:
• Dados de clientes e parceiros comerciais
• Sistemas de informação e infraestrutura tecnológica
• Processos de desenvolvimento, operação e suporte
• Informações confidenciais e estratégicas da organização

2. LIMITES DO SGSI
• Geográfico: Todas as instalações da ${c.name}
• Tecnológico: Todos os sistemas, redes e dispositivos utilizados
• Humano: Todos os colaboradores, terceiros e parceiros com acesso a informações

3. DECLARAÇÃO DE APLICABILIDADE (RESUMO)
Controles do Anexo A da ISO 27001:2022 aplicáveis à ${c.name}:
A.5 – Controles Organizacionais: APLICÁVEL
A.6 – Controles de Pessoas: APLICÁVEL
A.7 – Controles Físicos: APLICÁVEL
A.8 – Controles Tecnológicos: APLICÁVEL

4. ATIVOS DE INFORMAÇÃO CRÍTICOS
• Dados cadastrais de clientes (LGPD aplicável)
• Informações financeiras e contratos
• Código-fonte e propriedade intelectual (se aplicável ao setor de ${c.sector})
• Credenciais de acesso a sistemas

Aprovado pela Alta Direção em: ${d}`,
  },
  {
    section: "1. Estrutura do SGSI",
    type: "SGSI-02 – Política de Segurança da Informação",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DE SEGURANÇA DA INFORMAÇÃO — ISO/IEC 27001:2022
DOCUMENTO: SGSI-02 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POLÍTICA DE SEGURANÇA DA INFORMAÇÃO — ${c.name.toUpperCase()}

A ${c.name}, consciente da importância estratégica das informações para a continuidade de seus negócios no setor de ${c.sector}, declara formalmente os seguintes princípios de segurança:

PRINCÍPIOS FUNDAMENTAIS — TRÍADE CIA:

🔒 CONFIDENCIALIDADE
As informações da ${c.name} e de seus clientes são acessíveis somente a pessoas devidamente autorizadas. Nenhuma informação confidencial deve ser compartilhada sem autorização formal.

🔒 INTEGRIDADE
As informações devem ser precisas, completas e protegidas contra modificação não autorizada. Toda alteração em sistemas críticos requer rastreabilidade e aprovação.

🔒 DISPONIBILIDADE
As informações e sistemas devem estar disponíveis para os usuários autorizados sempre que necessário, com planos de continuidade para situações de falha.

DIRETRIZES OBRIGATÓRIAS:
• Todo colaborador é responsável pela segurança das informações que acessa
• O uso de senhas fortes e autenticação multifator é mandatório para sistemas críticos
• É proibido o uso de dispositivos pessoais sem aprovação da área de TI
• Incidentes de segurança devem ser reportados imediatamente
• Dados de clientes são tratados em conformidade com a LGPD (Lei 13.709/2018)
• Acesso remoto é permitido somente via VPN corporativa aprovada
• Mídias removíveis (pen drives, HDs externos) requerem autorização prévia

Esta política é revisada anualmente e comunicada a todos os colaboradores, terceiros e parceiros com acesso aos sistemas da ${c.name}.

Emitida em: ${d} | Aprovada por: ________________________________`,
  },
  {
    section: "2. Gestão de Riscos",
    type: "SGSI-03 – Avaliação e Tratamento de Riscos de Segurança",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DE SEGURANÇA DA INFORMAÇÃO — ISO/IEC 27001:2022
DOCUMENTO: SGSI-03 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVALIAÇÃO E TRATAMENTO DE RISCOS — ${c.name}

METODOLOGIA: Escala de Probabilidade (1-5) × Impacto (1-5) = Nível de Risco
Risco ≤ 6: BAIXO | 7-12: MÉDIO | 13-19: ALTO | 20-25: CRÍTICO

━━━━ INVENTÁRIO DE RISCOS IDENTIFICADOS ━━━━

RISCO 1 — Acesso não autorizado a dados de clientes
• Probabilidade: 3 | Impacto: 5 | Nível: ALTO (15)
• Tratamento: Controle de acesso por perfil, autenticação MFA, revisão periódica
• Responsável: TI | Prazo: Imediato

RISCO 2 — Ataque de ransomware / malware
• Probabilidade: 3 | Impacto: 5 | Nível: ALTO (15)
• Tratamento: Antivírus atualizado, backup diário offline, treinamento de usuários
• Responsável: TI | Prazo: 30 dias

RISCO 3 — Perda ou vazamento de dados por colaborador interno
• Probabilidade: 2 | Impacto: 4 | Nível: MÉDIO (8)
• Tratamento: Política de mesa limpa, criptografia, monitoramento de acessos
• Responsável: TI + RH | Prazo: 60 dias

RISCO 4 — Falha de fornecedor crítico de TI
• Probabilidade: 2 | Impacto: 4 | Nível: MÉDIO (8)
• Tratamento: Contrato com SLA, plano B documentado, backup de dados
• Responsável: Compras + TI | Prazo: 45 dias

RISCO 5 — Descumprimento da LGPD (Lei 13.709/2018)
• Probabilidade: 2 | Impacto: 5 | Nível: ALTO (10)
• Tratamento: Mapeamento de dados, DPO designado, privacidade by design
• Responsável: Jurídico + DPO | Prazo: 90 dias

━━━━ OPÇÕES DE TRATAMENTO ━━━━
• MITIGAR: Implementar controles para reduzir probabilidade/impacto
• ACEITAR: Risco dentro do apetite declarado pela organização
• TRANSFERIR: Contratar seguro cibernético ou terceirizar
• EVITAR: Eliminar a atividade que gera o risco

Próxima revisão do inventário: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('pt-BR')}
Aprovado em: ${d}`,
  },
  {
    section: "2. Gestão de Riscos",
    type: "PSI-01 – Controle de Acesso e Gestão de Identidades",
    content: (c, isos, d) => `PROCEDIMENTO DE SEGURANÇA DA INFORMAÇÃO — ISO/IEC 27001:2022
DOCUMENTO: PSI-01 | TÍTULO: Controle de Acesso e Gestão de Identidades
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. OBJETIVO
Definir as regras para concessão, revisão, modificação e revogação de acessos a sistemas, redes e informações da ${c.name}.

2. PRINCÍPIO DO MENOR PRIVILÉGIO
Cada colaborador tem acesso somente às informações e sistemas necessários para desempenhar sua função. Acessos privilegiados (administradores) são concedidos apenas quando estritamente necessário.

3. GESTÃO DO CICLO DE VIDA DO ACESSO
ADMISSÃO: Gestor solicita acesso via formulário → TI concede perfil mínimo necessário
ALTERAÇÃO DE FUNÇÃO: Gestor notifica RH e TI → Perfil ajustado em até 24h
DESLIGAMENTO: RH notifica TI → Todos os acessos revogados no mesmo dia

4. REQUISITOS DE SENHA
• Comprimento mínimo: 12 caracteres
• Composição: letras maiúsculas, minúsculas, números e símbolos
• Validade máxima: 90 dias
• Histórico: as 10 últimas senhas não podem ser reutilizadas
• Bloqueio: após 5 tentativas incorretas consecutivas

5. AUTENTICAÇÃO MULTIFATOR (MFA)
Obrigatória para:
• Acesso remoto (VPN, home office)
• Sistemas com dados de clientes
• E-mail corporativo
• Sistemas financeiros e ERP

6. REVISÃO PERIÓDICA DE ACESSOS
Frequência: Trimestral
Responsável: TI em conjunto com cada gestor de área
Ação: Revogar acessos desnecessários ou de colaboradores transferidos

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "3. Procedimentos de Resposta",
    type: "PSI-02 – Gestão de Incidentes de Segurança da Informação",
    content: (c, isos, d) => `PROCEDIMENTO DE SEGURANÇA DA INFORMAÇÃO — ISO/IEC 27001:2022
DOCUMENTO: PSI-02 | TÍTULO: Gestão de Incidentes de Segurança
REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

1. O QUE É UM INCIDENTE DE SEGURANÇA
Qualquer evento que comprometa ou ameace comprometer a Confidencialidade, Integridade ou Disponibilidade das informações da ${c.name}. Exemplos:
• Acesso não autorizado detectado
• Vírus, ransomware ou malware identificado
• Perda ou roubo de dispositivos com dados
• Vazamento de informações confidenciais
• Falha de sistema crítico por ataque ou sabotagem

2. COMO REPORTAR UM INCIDENTE
Qualquer colaborador que suspeitar ou detectar um incidente deve:
1. NÃO tentar resolver sozinho
2. NÃO desligar o equipamento afetado (pode destruir evidências)
3. NOTIFICAR imediatamente o responsável de TI
4. Registrar o incidente no formulário FSI-01

3. FLUXO DE RESPOSTA A INCIDENTES
PASSO 1 — DETECÇÃO E REPORTE: Incidente identificado e registrado (FSI-01)
PASSO 2 — CONTENÇÃO: Isolar sistemas afetados para limitar danos
PASSO 3 — ANÁLISE: Investigar causa, extensão e dados comprometidos
PASSO 4 — ERRADICAÇÃO: Eliminar a ameaça do ambiente
PASSO 5 — RECUPERAÇÃO: Restaurar sistemas a partir de backup seguro
PASSO 6 — LIÇÕES APRENDIDAS: Documentar e melhorar controles

4. COMUNICAÇÃO DE INCIDENTES CRÍTICOS
• Incidentes com vazamento de dados pessoais: Notificar ANPD em até 72h (LGPD)
• Clientes afetados: Comunicação conforme análise jurídica e impacto
• Alta Direção: Notificação imediata para incidentes de alto impacto

5. CLASSIFICAÇÃO DE SEVERIDADE
CRÍTICO: Impacto em toda a organização — resposta em até 1h
ALTO: Impacto em área/sistema crítico — resposta em até 4h
MÉDIO: Impacto limitado — resposta em até 24h
BAIXO: Impacto mínimo — resposta em até 5 dias úteis

Elaborado por: __________________ | Aprovado por: __________________
Data: ${d}`,
  },
  {
    section: "4. Plano de Implementação",
    type: "PA-01 – Plano de Implementação ISO 27001",
    content: (c, isos, d) => `PLANO DE AÇÃO — ISO/IEC 27001:2022
DOCUMENTO: PA-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector} | NORMA: ISO 27001:2022

━━━━ FASE 1 — CONTEXTO E ESCOPO (Meses 1-2) ━━━━
□ 1.1 Mapear ativos de informação críticos da ${c.name}
□ 1.2 Definir escopo e limites do SGSI (SGSI-01)
□ 1.3 Realizar avaliação inicial de riscos (SGSI-03)
□ 1.4 Nomear Responsável pela Segurança da Informação (CISO ou equivalente)
□ 1.5 Designar DPO (Encarregado de Dados) conforme LGPD

━━━━ FASE 2 — POLÍTICAS E CONTROLES (Meses 2-4) ━━━━
□ 2.1 Elaborar e aprovar Política de Segurança (SGSI-02)
□ 2.2 Implementar Controle de Acesso e MFA (PSI-01)
□ 2.3 Criar Procedimento de Gestão de Incidentes (PSI-02)
□ 2.4 Implementar backup automático com criptografia
□ 2.5 Configurar ferramentas de monitoramento e logs

━━━━ FASE 3 — TREINAMENTO E CULTURA (Meses 4-5) ━━━━
□ 3.1 Treinar 100% dos colaboradores em segurança da informação
□ 3.2 Realizar simulação de phishing para conscientização
□ 3.3 Implementar política de mesa limpa e tela bloqueada
□ 3.4 Comunicar Política de Segurança a fornecedores e parceiros

━━━━ FASE 4 — AUDITORIA E CERTIFICAÇÃO (Meses 5-8) ━━━━
□ 4.1 Realizar auditoria interna do SGSI
□ 4.2 Tratar todas as não conformidades identificadas
□ 4.3 Conduzir Análise Crítica pela Direção
□ 4.4 Contratar organismo de certificação acreditado pelo INMETRO
□ 4.5 Auditoria Stage 1 e Stage 2 para certificação

Aprovado em: ${d} | Alta Direção: ________________________________`,
  },
];

const iso14001Docs: DocTemplate[] = [
  {
    section: "1. Estrutura do SGA",
    type: "SGA-01 – Política Ambiental e Escopo",
    content: (c, isos, d) => `SISTEMA DE GESTÃO AMBIENTAL — ABNT NBR ISO 14001:2015
DOCUMENTO: SGA-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

POLÍTICA AMBIENTAL

A ${c.name} reconhece que suas atividades no setor de ${c.sector} geram impactos ambientais e assume o compromisso formal com a proteção do meio ambiente e o desenvolvimento sustentável:

🌿 PREVENÇÃO DA POLUIÇÃO
Priorizar práticas que previnam ou reduzam a geração de resíduos, emissões atmosféricas e efluentes líquidos em todas as operações.

🌿 USO EFICIENTE DE RECURSOS
Implementar programas de eficiência energética, uso racional de água e otimização de materiais em todos os processos produtivos.

🌿 CONFORMIDADE LEGAL
Atender a todos os requisitos legais ambientais aplicáveis ao setor de ${c.sector}, incluindo legislação federal, estadual e municipal.

🌿 MELHORIA CONTÍNUA
Definir objetivos e metas ambientais mensuráveis, revisando periodicamente o desempenho do SGA.

🌿 COMUNICAÇÃO E TRANSPARÊNCIA
Comunicar nossa política ambiental a todos os colaboradores, fornecedores, clientes e demais partes interessadas.

ESCOPO DO SGA:
O Sistema de Gestão Ambiental da ${c.name} abrange todas as atividades, produtos e serviços da organização que geram aspectos ambientais significativos.

Emitida em: ${d} | Aprovada por: ________________________________`,
  },
  {
    section: "2. Aspectos Ambientais",
    type: "SGA-02 – Identificação de Aspectos e Impactos Ambientais",
    content: (c, isos, d) => `SISTEMA DE GESTÃO AMBIENTAL — ABNT NBR ISO 14001:2015
DOCUMENTO: SGA-02 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

IDENTIFICAÇÃO DE ASPECTOS E IMPACTOS AMBIENTAIS

METODOLOGIA: Significância = Frequência × Severidade × Abrangência
Significativo (S): Score ≥ 12 | Não Significativo (NS): Score < 12

━━━━ LEVANTAMENTO DE ASPECTOS ━━━━

ASPECTO 1 — Consumo de energia elétrica
• Impacto: Esgotamento de recursos naturais, emissões de CO2 (indireto)
• Condição: Normal | Significativo: SIM
• Controle: Programa de eficiência energética, uso de equipamentos A+++

ASPECTO 2 — Geração de resíduos sólidos
• Impacto: Contaminação de solo e lençol freático
• Condição: Normal | Significativo: SIM
• Controle: Coleta seletiva, destinação adequada a empresas licenciadas

ASPECTO 3 — Consumo de água
• Impacto: Escassez hídrica
• Condição: Normal | Significativo: SIM
• Controle: Hidrômetros por setor, metas de redução de consumo

ASPECTO 4 — Geração de efluentes líquidos
• Impacto: Contaminação de recursos hídricos
• Condição: Normal | Significativo: Depende do processo
• Controle: Tratamento conforme legislação, laudos periódicos

ASPECTO 5 — Emissões atmosféricas (ar condicionado, veículos)
• Impacto: Poluição do ar, efeito estufa
• Condição: Normal | Significativo: SIM
• Controle: Manutenção preventiva, gases refrigerantes certificados

━━━━ PROGRAMA DE GESTÃO AMBIENTAL ━━━━
Meta 1: Reduzir consumo de energia em 15% em 12 meses
Meta 2: Aumentar taxa de reciclagem para 80% dos resíduos gerados
Meta 3: Reduzir consumo de água em 10% no próximo ano

Revisão semestral dos aspectos ambientais | Aprovado em: ${d}`,
  },
  {
    section: "3. Plano de Implementação",
    type: "PA-01 – Plano de Ação para Certificação ISO 14001",
    content: (c, isos, d) => `PLANO DE AÇÃO — ABNT NBR ISO 14001:2015
DOCUMENTO: PA-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector} | NORMA: ISO 14001:2015

━━━━ FASE 1 — DIAGNÓSTICO AMBIENTAL (Meses 1-2) ━━━━
□ 1.1 Identificar todos os aspectos e impactos ambientais (SGA-02)
□ 1.2 Levantar requisitos legais ambientais aplicáveis
□ 1.3 Definir escopo e Política Ambiental (SGA-01)
□ 1.4 Nomear Representante da Direção para o SGA

━━━━ FASE 2 — PLANEJAMENTO E DOCUMENTAÇÃO (Meses 2-4) ━━━━
□ 2.1 Definir objetivos e metas ambientais mensuráveis
□ 2.2 Elaborar Programa de Gestão Ambiental
□ 2.3 Criar procedimento de Preparação e Resposta a Emergências Ambientais
□ 2.4 Implementar controles operacionais para aspectos significativos
□ 2.5 Criar indicadores de desempenho ambiental (IDAs)

━━━━ FASE 3 — IMPLEMENTAÇÃO (Meses 4-6) ━━━━
□ 3.1 Treinar todos os colaboradores na Política e procedimentos ambientais
□ 3.2 Implementar coleta seletiva e destinação adequada de resíduos
□ 3.3 Iniciar medição de indicadores (energia, água, resíduos)
□ 3.4 Contratar empresas licenciadas para destinação de resíduos especiais

━━━━ FASE 4 — AUDITORIA E CERTIFICAÇÃO (Meses 6-9) ━━━━
□ 4.1 Realizar auditoria interna do SGA
□ 4.2 Análise Crítica pela Direção com foco ambiental
□ 4.3 Solicitar certificação com organismo acreditado

Aprovado em: ${d} | Alta Direção: ________________________________`,
  },
];

const iso45001Docs: DocTemplate[] = [
  {
    section: "1. Estrutura do SGSSO",
    type: "SGSSO-01 – Política de Saúde e Segurança Ocupacional",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DE SSO — ABNT NBR ISO 45001:2018
DOCUMENTO: SGSSO-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

POLÍTICA DE SAÚDE E SEGURANÇA OCUPACIONAL

A ${c.name}, comprometida com a proteção da saúde e integridade física de todos os seus colaboradores e partes interessadas, declara formalmente:

🦺 ELIMINAÇÃO DE PERIGOS E REDUÇÃO DE RISCOS
Identificar, avaliar e controlar sistematicamente todos os perigos e riscos ocupacionais presentes nas atividades do setor de ${c.sector}.

🦺 CONFORMIDADE LEGAL
Cumprir rigorosamente todas as Normas Regulamentadoras (NRs) aplicáveis, legislação trabalhista e requisitos de segurança do trabalho.

🦺 PARTICIPAÇÃO E CONSULTA DOS TRABALHADORES
Envolver ativamente os colaboradores na identificação de perigos, elaboração de procedimentos e tomada de decisões sobre SSO.

🦺 MELHORIA CONTÍNUA DO DESEMPENHO DE SSO
Estabelecer objetivos mensuráveis de SSO, monitorar indicadores de acidentes e doenças ocupacionais, e promover melhorias contínuas.

🦺 INVESTIGAÇÃO DE INCIDENTES
Investigar todos os acidentes, incidentes e quase-acidentes para identificar causas raiz e prevenir recorrências.

🦺 EQUIPAMENTOS DE PROTEÇÃO
Fornecer, fiscalizar o uso e manter adequadamente todos os EPIs e EPCs necessários para cada atividade.

Esta política é comunicada a todos os colaboradores, empreiteiros e visitantes das instalações da ${c.name}, revisada anualmente.

Emitida em: ${d} | Aprovada por: ________________________________`,
  },
  {
    section: "2. Gestão de Riscos Ocupacionais",
    type: "SGSSO-02 – Identificação de Perigos e Avaliação de Riscos",
    content: (c, isos, d) => `SISTEMA DE GESTÃO DE SSO — ABNT NBR ISO 45001:2018
DOCUMENTO: SGSSO-02 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector}

IDENTIFICAÇÃO DE PERIGOS E AVALIAÇÃO DE RISCOS OCUPACIONAIS

METODOLOGIA: Probabilidade (1-5) × Severidade (1-5) = Nível de Risco
Risco Baixo (1-6) | Médio (7-12) | Alto (13-19) | Crítico (20-25)

━━━━ INVENTÁRIO DE PERIGOS ━━━━

PERIGO 1 — Ergonômico: Postura inadequada / esforço repetitivo
• Probabilidade: 4 | Severidade: 3 | Risco: MÉDIO (12)
• Controle: Ginástica laboral, ajuste de postos de trabalho, pausas programadas
• NR aplicável: NR-17 (Ergonomia)

PERIGO 2 — Elétrico: Contato com partes energizadas
• Probabilidade: 2 | Severidade: 5 | Risco: ALTO (10)
• Controle: LOTO (bloqueio e etiquetagem), EPIs elétricos, PPRA atualizado
• NR aplicável: NR-10 (Instalações Elétricas)

PERIGO 3 — Incêndio: Materiais inflamáveis / sobrecarga elétrica
• Probabilidade: 2 | Severidade: 5 | Risco: ALTO (10)
• Controle: Extintores adequados, SPDA, brigada de incêndio treinada
• NR aplicável: NR-23 (Proteção Contra Incêndios)

PERIGO 4 — Psicossocial: Estresse, assédio moral/sexual
• Probabilidade: 3 | Severidade: 3 | Risco: MÉDIO (9)
• Controle: Programa de QVT, canal de denúncias, treinamentos de liderança
• NR aplicável: NR-1 (atualizada 2023)

PERIGO 5 — Queda em mesmo nível: Pisos molhados/irregulares
• Probabilidade: 3 | Severidade: 2 | Risco: MÉDIO (6)
• Controle: Piso antiderrapante, sinalização, limpeza periódica
• NR aplicável: NR-18/NR-8

━━━━ PLANO DE AÇÃO PARA RISCOS ALTOS E CRÍTICOS ━━━━
Todos os riscos classificados como ALTO ou CRÍTICO possuem plano de ação com responsável e prazo definido, revisados mensalmente.

Aprovado em: ${d} | SESMT / Responsável: ____________________________`,
  },
  {
    section: "3. Plano de Implementação",
    type: "PA-01 – Plano de Ação para Certificação ISO 45001",
    content: (c, isos, d) => `PLANO DE AÇÃO — ABNT NBR ISO 45001:2018
DOCUMENTO: PA-01 | REVISÃO: 00 | DATA: ${d} | STATUS: APROVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPRESA: ${c.name} | SETOR: ${c.sector} | NORMA: ISO 45001:2018

━━━━ FASE 1 — DIAGNÓSTICO DE SSO (Meses 1-2) ━━━━
□ 1.1 Realizar levantamento de todos os perigos e riscos (SGSSO-02)
□ 1.2 Levantar todos os requisitos legais de SSO aplicáveis (NRs)
□ 1.3 Verificar conformidade legal atual (check-list de NRs)
□ 1.4 Elaborar e aprovar Política de SSO (SGSSO-01)
□ 1.5 Formar CIPA (Comissão Interna de Prevenção de Acidentes) se aplicável

━━━━ FASE 2 — DOCUMENTAÇÃO E CONTROLES (Meses 2-4) ━━━━
□ 2.1 Definir objetivos e metas mensuráveis de SSO
□ 2.2 Elaborar PPRA ou PGR (Programa de Gerenciamento de Riscos — NR-1)
□ 2.3 Elaborar PCMSO (Programa de Controle Médico de Saúde Ocupacional)
□ 2.4 Criar procedimento de investigação de acidentes e incidentes
□ 2.5 Revisar e completar kits de EPI por função

━━━━ FASE 3 — IMPLEMENTAÇÃO E TREINAMENTO (Meses 4-6) ━━━━
□ 3.1 Treinar todos os colaboradores nos procedimentos de SSO
□ 3.2 Realizar treinamento de brigada de incêndio e primeiros socorros
□ 3.3 Realizar simulação de evacuação de emergência
□ 3.4 Implementar programa de ginástica laboral e saúde mental

━━━━ FASE 4 — AUDITORIA E CERTIFICAÇÃO (Meses 6-9) ━━━━
□ 4.1 Auditoria interna do SGSSO
□ 4.2 Análise Crítica pela Direção com foco em SSO
□ 4.3 Certificação com organismo acreditado pelo INMETRO

Aprovado em: ${d} | Alta Direção: ________________________________`,
  },
];

export function buildDocumentSet(
  company: Company,
  isoList: string[],
): { section: string; type: string; content: string }[] {
  const date = new Date().toLocaleDateString("pt-BR");
  const docs: { section: string; type: string; content: string }[] = [];
  const addedSections = new Set<string>();

  // Add documents for each selected ISO
  for (const iso of isoList) {
    let templates: DocTemplate[] = [];

    if (iso.includes("9001")) {
      templates = iso9001Docs;
    } else if (iso.includes("27001")) {
      templates = iso27001Docs;
    } else if (iso.includes("14001")) {
      templates = iso14001Docs;
    } else if (iso.includes("45001")) {
      templates = iso45001Docs;
    }

    for (const tpl of templates) {
      const key = `${iso}|${tpl.type}`;
      if (!addedSections.has(key)) {
        addedSections.add(key);
        docs.push({
          section: isoList.length > 1 ? `${iso} — ${tpl.section}` : tpl.section,
          type: tpl.type,
          content: tpl.content(company, isoList, date),
        });
      }
    }
  }

  // Generic docs for ISOs without specific templates
  for (const iso of isoList) {
    if (!["9001","27001","14001","45001"].some(n => iso.includes(n))) {
      const section = `${iso} — Documentação`;
      docs.push({
        section,
        type: `Política do Sistema de Gestão — ${iso}`,
        content: `POLÍTICA DO SISTEMA DE GESTÃO — ${iso}
EMPRESA: ${company.name} | DATA: ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A ${company.name}, empresa do setor de ${company.sector} com ${company.size} colaboradores, compromete-se com os requisitos da norma ${iso}, garantindo a implementação e manutenção de um sistema de gestão eficaz.

COMPROMISSOS:
✅ Atender a todos os requisitos da norma ${iso} e requisitos legais aplicáveis
✅ Definir objetivos mensuráveis e revisar periodicamente o desempenho
✅ Promover a melhoria contínua do sistema de gestão
✅ Treinar e capacitar todos os colaboradores nas exigências da norma

Emitida em: ${date} | Aprovada por: ________________________________`,
      });
      docs.push({
        section,
        type: `Plano de Implementação — ${iso}`,
        content: `PLANO DE IMPLEMENTAÇÃO — ${iso}
EMPRESA: ${company.name} | DATA: ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FASE 1 — DIAGNÓSTICO (Meses 1-2)
□ Análise de lacunas frente aos requisitos da ${iso}
□ Mapeamento de processos críticos
□ Definição de escopo e política

FASE 2 — DOCUMENTAÇÃO (Meses 2-4)
□ Elaboração de todos os procedimentos exigidos pela norma
□ Criação de formulários e registros
□ Treinamento da equipe

FASE 3 — IMPLEMENTAÇÃO (Meses 4-6)
□ Execução e monitoramento dos processos
□ Coleta de indicadores de desempenho

FASE 4 — CERTIFICAÇÃO (Meses 6-8)
□ Auditoria interna
□ Análise crítica pela direção
□ Auditoria externa com organismo certificador

Aprovado em: ${date}`,
      });
    }
  }

  return docs;
}
