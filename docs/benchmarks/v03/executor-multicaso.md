# Executor multicaso offline — Task85

Implementação offline aprovada pela revisão independente [Task86](../../../tasks/86-v03-public-export-multicase-review-findings.md). Nove casos development continuam pending nos documentos originais. A exportação local não concede aceite, validação de gold nem autorização de modelo. Os braços experimentais `contexto_completo`/`selecao_mimir` não substituem os três cenários do contrato 0.1.

O protocolo [protocolo-ampliado.json](protocolo-ampliado.json) fixa as seis consultas do guia ampliado e as três consultas legadas declaradas na Task85. Cada pool mantém exatamente a ordem de `sources[]`/`allowed_source_ids`, incluindo distratores. k/limit são 4, tokenBudget/contexto são 32000 bytes e a instrução de saída pede até 120 palavras. Esses parâmetros são propostos, não um manifesto aprovado; palavras não são limite faturável de API. Nenhuma consulta foi ajustada com base nos retornos da simulação.

## Fronteira de processos

- `scripts/benchmarks/export-cases.mjs` e `export-cases-cli.mjs`: processo privado. Recebe explicitamente o JSON de seis casos, o Markdown legado de três casos, protocolo e raiz local. Exige exatamente um bloco JSON legado, valida contrato, pin, blob regular, intervalos e bytes UTF-8; também recusa divergência no arquivo de trabalho inteiro. Projeta cada campo público, sem passthrough de objetos privados.
- `scripts/benchmarks/public-bundle.mjs`: schema público puro, sem I/O. Rejeita chaves extras em todos os níveis, splits diferentes de development, identidades ambíguas, limites inválidos, pools inconsistentes e hashes divergentes. Hash SHA-256 deriva exclusivamente do JSON público canonicalizado por ordenação de chaves; arrays mantêm ordem.
- `scripts/benchmarks/multicase-runner.mjs`: processo independente, recebe somente pacote público explícito. Não depende dos loaders privados ou dos runners de hosts. Oferece apenas `--plan` e `--simulate`; não há modo live. A extensão de transporte aceita somente fake declarado por API, com marcador neutro; a CLI usa o fake interno.
- `scripts/benchmarks/offline-files.mjs`: entradas explícitas, caminhos absolutos sem componentes sensíveis/symlinks, leitura com `O_NOFOLLOW`; diretório novo 0700, arquivos wx/0600. Exportação publica JSON por rename dentro do diretório exclusivo; falhas limpam somente o diretório criado pela invocação. Evidências de simulação usam arquivos exclusivos; erros são diagnósticos fixos.

O pacote tem schema `public-cases-1`, bloqueio `executable=false`, proveniência `caller-unverified` e razões públicas fixas. Não inclui respostas, relevância, rubricas, categorias, referências humanas/permissões, autores, notas, contagens/pesos privados nem digest do corpus privado. Hashes verificam integridade, não assinatura, autenticidade ou autorização humana. Perguntas e trechos contêm fatos públicos necessários à tarefa. Dados privados precisam permanecer fora do processo público, incluindo sua configuração de lançamento futura.

## Planejamento e simulação

Selecionar IDs explícitos ou `all`, repetições 1–100, teto explícito de posições (até 1000) e orçamento de tempo explícito (1–3600000 ms). A matriz inteira deve caber no teto; não há corte silencioso. Casos são ordenados por ID/revisão, repetições crescentes e pares AB/BA alternados por índice de caso/repetição/offset. O plano conserva posições `not_run`, sem chamadas, com IDs locais qualificados por caso. O offset padrão é zero.

Simulação exige `--simulate`. Para cada B cria projeto Git e Storage/Service reais em fixture nova, grava somente trechos permitidos com origem user/status candidate e realiza uma busca real com a consulta congelada. Não faz ingestão nem aprovação. Cada retorno deve corresponder ao ID/hash/conteúdo do pool; deduplicação preserva primeira unidade e retorno vazio permanece vazio. Nenhum oracle de relevância, fallback, chunking ou ranking novo. Empates continuam sujeitos aos IDs sintéticos do motor atual; apenas a matriz planejada tem ordem determinística garantida.

A recebe todo o pool, B somente os retornos. A serialização canonicalizada do envelope completo (instrução, pergunta, fontes com proveniência, histórico vazio) é comparada ao teto comum de 32000 bytes. Excesso resulta em `infeasible`, sem truncamento, resumo ou aumento de teto. O contexto para fake/futuro bridge não recebe case_id, consulta retrieval, classe, aceite, gold, posição ou caminho local. Scratchs são `slot-N/repo`, sem nomes de casos. A interface fake recebe somente prompt/histórico vazio; não recebe cwd/argv. Esta entrega não implementa um bridge de host.

O timer contínuo de B começa antes da busca, inclui validação/serialização e fake uma única vez, terminando antes da escrita de evidências e close. Setup/close ficam fora. `simulated_end_to_end_ms` e `retrieval_ms` são diagnóstico de simulação, nunca latência de modelo. Orçamento é verificado entre fases; não é timeout preemptivo da operação SQLite/fake em andamento. Fakes de teste devem terminar; nenhum transporte externo está implementado.

Todos os slots permanecem no resultado com status/exclusão: `not_run`/`run_budget`, `local_error`, `infeasible`/`context_cap` ou `simulated`/`simulation_not_measurement`. Uso permanece null/unavailable; nenhum zero de tokens medidos, score, TTFT, custo ou savings é calculado. Falhas de close ficam em `cleanup_status`. Fixtures próprias são fechadas/removidas em finally; plano, contextos e resultado permanecem privados no destino explícito. Nunca abre Storage com caminho default.

## Reprodução offline

Node 24 já instalado e `dist` compilado são pré-requisitos. Comandos absolutos usados nesta entrega, sem modelos:

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases-cli.mjs --expanded /mnt/d/Projects/MimirNL/docs/benchmarks/v03/corpus-ampliado.json --legacy /mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md --protocol /mnt/d/Projects/MimirNL/docs/benchmarks/v03/protocolo-ampliado.json --root /mnt/d/Projects/MimirNL --out /tmp/mimir-task85-final-public
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs --plan --bundle /tmp/mimir-task85-final-public/bundle.json --out /tmp/mimir-task85-final-plan --cases all --repetitions 3 --max-runs 54 --run-budget-ms 60000
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs --simulate --bundle /tmp/mimir-task85-final-public/bundle.json --out /tmp/mimir-task85-final-simulation --cases all --repetitions 3 --max-runs 54 --run-budget-ms 60000
```

Os destinos são exclusivos: uma reprodução deve escolher nomes novos. API privada aceita arrays de seis ou nove casos; o CLI exige seis mais três. Runtime valida o pacote inteiro antes de criar artefatos ou importar Storage. Import/help não leem dados nem criam processos/fixtures.

## Próximo gate

Task86 aprovou esta implementação e as evidências offline, sem habilitar execução real. A preparação do transporte separado está em [transporte-codex-multicaso.md](transporte-codex-multicaso.md), ainda sujeita a revisão própria. Uma etapa posterior precisa de manifesto congelado, aceite/permissões/orçamento reais, identidade/configuração do host e bridge de execução com isolamento revisado. Nada nesta entrega altera pending para accepted/validated, aprova o próprio trabalho ou habilita chamadas. Não há resultado de qualidade ou economia dos nove casos.
