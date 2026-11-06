# Diagnóstico offline EF-01/02 — Task127

2026-10-28. Entrega para revisão128; nenhuma otimização implementada. Zero chamadas de benchmark/modelo, sem executar host, launcher, Service, ingestão ou DB. Foram preservadas as alterações preexistentes. Escopo: três DEV públicos do manifesto103, posições B 1, 3 e 8, dentro dos primeiros nove trios development (0–26). Não foram abertos evaluation, gold ou coordenador. A classificação e ordenação são documentadas no relatório103 e na validação dos trios em abc-public.mjs. Dados do bundle são fontes públicas, não respostas esperadas.

## Mapa e fronteiras

`src/core/service.ts:356–416`: memory_search → FtsRetriever → view/full ou compact → optimize → grava contadores/telemetria persistida → resposta `{ok,data}` (wrapper em :124–135). Não foi chamado neste diagnóstico. `src/retrieval/index.ts:23–75` tokeniza até40 palavras, FTS OR, aplica escopo/filtros, ordena BM25, preferência de projeto e recência opcional. Dedupe por hash é entre resultados recuperados, antes do limite; agrega duplicateProvenance. Não recebe fontes-base nem histórico do prompt. O Map é temporário por busca, não cache reutilizado.

`src/core/service.ts:361–394`: compact-v1 mantém conteúdo/hash/source/version/trust e proveniência; omite campos operacionais. Formato não é política de relevância. Defaults explicitados pelo schema e confirmados no código: legacy, recency off, full, telemetry false; balanced-v1, verified-ties-v1 e compact-v1 são opt-in. ABC escolhe esses três explicitamente, limit3 e budget32000 (`abc-public.mjs:26–35`). Balanced exige cobertura de ao menos ceil(termos distintos/4); isso é evidência lexical, não resposta correta.

`src/optimization/index.ts:16–38`: orçamento usa bytes de JSON UTF-8 do envelope `{ok:true,data:...}`, incluindo metadados e estimativa conservadora. Cada candidato é testado com os já aceitos; pode pular um grande e aceitar um posterior. Não é tokenizer nem limite de todo o prompt/host.

`abc-runtime.mjs:180–199` verifica project/id/hash/conteúdo e converte memórias em chaves de fonte pública. `contract-v02.mjs:310–329` clona fontes do bundle, mantém `sources: select(base)` em :327 e acrescenta `retrieved: select(retrieved)` em :328. Depois runtime adiciona instrução de não usar ferramentas e serializa. Aqui ocorre adição, sem dedupe entre os dois campos. Budget de prompt é outro gate, 32000 bytes. O core não controla essa duplicação de montagem.

`abc-transport.mjs:21–102` passa o prompt por stdin a processo Codex isolado. Controlamos o JSON enviado e argumentos solicitados, não instruções internas/tokenização/cache/backend do host. Não subtrair piso inferido nem atribuir subset cached a trechos específicos. Telemetria local, campos do envelope e usage do host são fronteiras diferentes.

A substituição anterior é explícita em `live-flow-probe.mjs:208–219`: `units=corpus` passa a seleção quando há fixture; somente units monta contexto/prompt. Igualmente `multicase-runner.mjs:229–237` troca sources por validateSelection antes de promptFor. `stable-prompt.mjs:6–18` reorganiza instruction/history/sources/question; não remove a repetição ABC. Fontes e hashes completos estão no diagnosis.json.

## Checkout versus histórico

Os três fontes core examinados coincidem com os hashes core108 no manifesto103: service dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94; retrieval f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30; optimization 4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc.

Montagem corrente diverge em bytes do manifesto histórico; isso não é uma execução104. Snapshot público lido apenas como dois membros regulares em memória, sem extração: contract histórico ec81fb371e187700196ddb183c34bf4f13fe2f847187fdb42d364df93c8fe6ea tem runtimeEnvelope :305 e adição :322–323; runtime histórico 2e91a8992ad06084431b8811d9ace721d5904d4a1a72440bcc6704dfd9fc8f57 chama envelope :196 e serializa :199. O arquivo JSON registra hashes correntes, históricos, tar e comparações. Reconstruções abaixo coincidem em bytes e SHA256 com três posições do replay **sintético103**, não comprovam os envelopes executados104.

## Composição medida

Cada valor já inclui aspas/escaping JSON; framing exterior inclui keys, dois-pontos, vírgulas e chaves. history é string vazia (conteúdo0, valor serializado2). Arrays vazios custam2. Metadados e framing internos das fontes estão decompostos separadamente no JSON, sem dupla contagem no total abaixo.

| DEV posição B               | Instrução | Pergunta/task | Base | Recuperação | History | Framing exterior | Total UTF-8 |
| --------------------------- | --------: | ------------: | ---: | ----------: | ------: | ---------------: | ----------: |
| 1, alegações README/package |       177 |           203 | 2046 |        1578 |       2 |               59 |        4065 |
| 3, schema/budget/serviço    |       177 |           178 | 4258 |        3519 |       2 |               59 |        8193 |
| 8, busca sem seleção        |       177 |           197 | 4695 |           2 |       2 |               59 |        5132 |

As parcelas de cada linha somam exatamente o total. Conteúdo excerpt serializado da base/recuperação: 1308/1098, 3255/2767, 3693/0 bytes. Metadados serializados: 464/297, 638/478, 637/0. Framing interno: 274/183, 365/274, 365/2. SHA de cada excerpt validado contra o bundle.

Sobreposição exata: 2/2, 3/3, 0/0 recuperadas. No último, razão é null/N_A, não zero estatístico. Matching exige identidade source/unit, path, commit, faixa, hash e excerpt; todos os objetos recuperados dos dois positivos já constam integralmente na base. Faixas/revisões/hashes estão no JSON sanitizado. Não há conflito de revisão/origem observado nessas seleções; README e package fazem alegações de fontes distintas e não são fundidos. Teste sintético verifica que conteúdo igual com commit ou path diferente NÃO autoriza dedupe. Não é corpus novo nem avaliação de qualidade.

Contrafactual analítico mantém a base e deixa retrieved vazio: 2489, 4676, 5132 bytes; evitáveis 1576/4065, 3517/8193 e 0/5132, respectivamente. Não removeu nada do contexto real. Preserva todos os objetos/proveniência porque a unidade integral idêntica permanece na base; não generaliza para fontes com revisão desconhecida ou metadados distintos. Não mede seleção substitutiva.

Compact-v1 existente, separadamente: delta do prompt ABC é0 para seleção fixa, pois o adaptador descarta o objeto memory e reconstitui a mesma fonte pelo ID. Delta da resposta core full/compact é unknown/null: não reconstruímos registros/counters operacionais nem chamamos Service. Não somar esse delta aos bytes de dedupe. Bytes não são tokens, economia financeira ou qualidade validada.

## Cache, custo e lacunas

Nos caminhos examinados não há cache de resultados reutilizado entre buscas; hash/dedupe/Map não são prova de cache. Não se conclui ausência global: storage, outros adaptadores/processos e caches do host não foram auditados. Host cache permanece ambiente não controlado. Não foi medida repetição real, RAM, cold/warm, custo de invalidação ou latência por etapa nesta tarefa.

Hotspots estáticos candidatos: iteração de todos os matches FTS sem LIMIT mesmo após preencher grupos (necessária para proveniência), tokenização por candidato no balanced e serialização acumulada em optimize (potencial custo quadrático em candidatos aceitos/bytes). Clonagem/buscas lineares do bundle e dupla serialização também merecem relógios se custo real justificar. Nenhum é gargalo demonstrado; não há evidência de escala nem motivo para cache antecipado.

Histórico agregado, apenas conforme plano aprovado:104 input A261437/B269101 em18 posições por braço, +7664/+2,93%; busca média21,58ms já incluída; cached216576 por braço é subset do input. Não foram usados contadores por caso nem respostas para atribuir causalidade. C history0 não comprova H. Tokens dos três envelopes, TTFT, custo/modelo efetivo e qualidade futura permanecem unknown.

## Única intervenção futura recomendada

Propor **EF-03: dedupe exato opt-in na montagem aditiva**, fora do core retrieval e sem mudar policy. Aceite offline: mesma origem/revisão/faixa/hash/conteúdo e todos os metadados de citação preservados na base; revisão/escopo desconhecidos ou conflitantes mantêm ambas unidades; zero overlap fica idêntico; orçamento e reconciliação continuam válidos. Comparar dedupe isolado, sem misturar compact ou gating. Preservar formato padrão até especificação/revisão e aceitar somente redução de bytes no alvo mais cobertura/proveniência intactas. Qualidade/usage requerem futuro plano autorizado, não estão provados aqui.

Rollback: desligar opção/restaurar envelope anterior e descartar candidato se perder fato/citação, mudar versão ou não reduzir bytes. Menor complexidade que cache: não cria estado entre consultas/invalidação nem depende de repetição. EF-04 não é a primeira escolha neste recorte: existe redundância verificável e o caso de retorno vazio já evita adição. Não implementar agora.

## Reprodução e revisão

Runtime disponível: Python3 (versão completa no JSON). Node não está no PATH (`node --version` exit127); não foi instalado nem necessário. Na raiz, executar `python3 /mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py --test` (5 testes, exit0). Para gerar artefato em destino ainda inexistente: `python3 /mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py` (exit0). O helper recusa clobber: em checkout com diagnosis.json existente, testes recalculam tudo em memória sem sobrescrevê-lo. Fontes explícitas/read-only, sem imports runtime, rede ou dependências; tar não é extraído. Todo código novo e este diagnóstico aguardam reviewer128; não há autoaprovação.
