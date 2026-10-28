# Task83 — entrega offline para revisão independente

Estado: implementação documental concluída; revisão Task84 pendente. Nenhum aceite ou gold validado pelo autor.

## Entregáveis

- [corpus-ampliado.json](../docs/benchmarks/v03/corpus-ampliado.json): seis novos casos reais, contrato 0.1, revision 1, development, illustrative_only=false, review/gold pending, referências de revisão/aceite/permissão null.
- [casos-ampliados.md](../docs/benchmarks/v03/casos-ampliados.md): matriz, consultas fixas propostas, pools completos com distratores reais, catálogo canônico, limites e protocolo operacional separados dos campos JSON estritos.
- Links editoriais acrescentados ao fim de [casos.md](../docs/benchmarks/v03/casos.md) e [metodologia.md](../docs/benchmarks/v03/metodologia.md), preservando o JSON original e o histórico.

Os caminhos absolutos são `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/corpus-ampliado.json`, `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos-ampliados.md` e `/mnt/d/Projects/MimirNL/tasks/83-v03-expanded-corpus-result.md`.

## Conteúdo e proveniência

Três sínteses: orçamento schema/serviço/otimizador; aprovação/promoção/elegibilidade de busca; fronteira de projeto/registro/ingestão/path. Duas abstenções: p95 observado em produção na janela fixada e configuração/tarifa efetivas da instalação Alfa não descrita. Um contraste aparente Core v0.1 versus versão do pacote 0.2.0, sem inferir contradição real, stale ou publicação.

São seis casos novos e nove no conjunto combinado, todos development. Treze unidades/trechos canônicos distintos em nove arquivos, tanto no novo conjunto quanto na combinação: três trechos dos casos originais são reutilizados. Todas as fontes pertencem exclusivamente ao objeto Git `166e3cf047b2078952e43dc8e9171e053e99e2ce`; nenhum working tree é autoridade de conteúdo.

Cada positivo demanda ao menos duas unidades reais complementares; R inclui todas as necessárias. Nos dois negativos, R=[] porque nenhum trecho do pool contém a informação pedida, não porque falta gabarito proposto. Os pools negativos contêm termos próximos e podem produzir falsos positivos legítimos; não houve busca para escolher ou ajustar consultas. Rubricas binárias têm primeiro item peso 2 e demais peso 1; sucesso exige todos satisfeitos, score=1, inclusive abstenção útil. Precisão usa denominador k fixo, recall com R vazio é N_A; retorno/resposta vazios não constituem sucesso automático.

## Checks focados realizados

Runtime: Node v24.22.1 já instalado em `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. Nenhuma dependência instalada.

- JSON.parse e validateCases: seis casos structurally_valid; extração em memória do array original e combinação de nove também structurally_valid.
- planCases(batch, 3): rejeitou seis e nove casos por revisão/gold pending. Nenhum estado foi adulterado e nenhum plano executável criado.
- Conferência separada da validação estrutural: git show por fonte/commit, range inclusivo, excerpt exato e SHA-256 UTF-8; 27 ocorrências verificadas nos nove casos, 13 intervalos únicos, todos correspondentes. Preservadas quebras finais e CRLF sem normalização.
- Coerência adicional: pin único, referências permitidas iguais aos pools declarados, permissões null, pesos positivos; inspeção autoral de critérios, citações necessárias, distratores e insuficiência dos dois pools negativos.
- Prettier focado nos três novos arquivos e git diff --check; verificação local dos destinos de links relativos nos novos artefatos. Os links editoriais acrescentados aos dois documentos existentes usam destinos locais existentes; sem reformatação ampla do histórico.

A validação não equivale a revisão independente ou aceite. A conferência de gold e relevância acima é autoral, aguardando Task84.

## Limites e passagem para Task84

Não foram executados modelos, hosts, benchmark, retrieval, DB ou ingestão; sem fontes externas, configuração privada, código core/aplicação/CI/deps ou subagentes. Alterações preexistentes preservadas; sem commit/push/merge.

Não há holdout, garantia de ganho ou evidência nova de runtime. Gold é material local do avaliador, fora de prompt/seed/histórico; fronteira privada não significa ACL/sigilo. Nenhuma exportação preparada para modelo. Permissões e orçamento real continuam pendentes.

Task84 deve conferir fontes/bytes e avaliar independentemente perguntas, completude de R, abstenções, escopos do conflito aparente, consultas/pools e rubricas. Teste de stale real permanece pendente; outro commit exigiria extensão separada do schema, nunca adulteração do pin. Os runners atuais de uma pergunta/seis posições não se tornam multicaso por esta entrega; execução requer tarefa e revisão separadas. Aguardar parecer sem autoaprovação.

## Fechamento — Task84

A revisão independente foi concluída com **APPROVE**, sem correções obrigatórias, em [84-v03-expanded-corpus-review-findings.md](84-v03-expanded-corpus-review-findings.md). O revisor conferiu fontes/bytes/hashes no Git fixado, pools e distratores, completude de relevância, abstenções, conflito aparente, rubricas, JSON/preflight e links/formatação.

A entrega é uma proposta documental revisada, não aceite humano automático nem execução. O JSON conserva `review.decision=pending`, `gold_status=pending` e referências humanas/permissões nulas. São seis casos novos e nove combinados: três sínteses multifonte, dois casos de informação ausente e um contraste aparente de escopo, além dos três originais.

Próxima entrega técnica: adaptar o executor para vários casos, exportar somente contexto permitido sem gold, registrar protocolo/pools/consultas por caso e validar tudo offline antes de novas chamadas. Não alterar ranking ou declarar fallback implementado com base apenas nesta preparação. Nenhuma execução de benchmark, DB, retrieval, commit, push ou merge foi feita nesta etapa. O operador de implementação já foi liberado; supervisor confere o encerramento do revisor antes da entrega final.
