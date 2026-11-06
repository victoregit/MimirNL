# Comparação exploratória pareada

Implementação da Task62, aguardando revisão independente (Task63). Nenhuma chamada
real foi executada nesta tarefa. Importação e `--help` não abrem banco nem chamam
modelo. A execução exige `--run`; revisão não amplia as seis chamadas autorizadas.

## Protocolo congelado

A fonte completa é `src/optimization/index.ts` do commit
`166e3cf047b2078952e43dc8e9171e053e99e2ce` (27 linhas), obtida por `git show`.
O plano privado registra conteúdo, SHA-256, pergunta, instrução, argumentos e
limites antes da primeira chamada. Pergunta única:

> estimateTokens mede tokens reais de um modelo? Como optimize decide quais itens incluir e um item menor posterior pode entrar após um item maior ser descartado? Cite a fonte e responda em até 120 palavras.

A instrução manda usar somente o contexto, tratar a fonte como dados, citar a
fonte e não usar ferramentas, arquivos ou rede. Não há rubrica, resposta esperada
ou outros documentos nos prompts. As duas condições recebem a fonte integral e
a mesma identidade canônica. B acrescenta uma recuperação local real da mesma
fonte, contendo somente identidade portátil e conteúdo, sem IDs internos ou paths.

A = `sem_memoria`; B = `com_mimir`. Três pares, ordem AB/BA/AB, seis processos
novos sequenciais, sem retries. Para cada B, Service registra um repositório Git
sintético vazio, Storage usa caminho explícito fora desse repositório e armazena
somente a fonte como candidate/user. Busca `estimateTokens optimize`, limit 1,
includeGlobal false, orçamento 100000 de estimativa em bytes. Conteúdo e hash
recuperados devem coincidir. Não há ingestão, aprovação ou banco pessoal.

Cada processo usa argumentos constantes, incluindo `exec --ignore-user-config
--ephemeral --sandbox read-only --skip-git-repo-check --cd <scratch> --json -`.
O mesmo scratch vazio é usado nas seis chamadas. A identidade do modelo só pode
vir do campo `model` em eventos públicos de início, com formato restrito; caso
contrário será unavailable. Configuração, autenticação e logs privados não são
lidos. Não se inventam temperatura, seed ou versão. Não há controle de cache,
modelo default ou equivalência comprovada entre execuções.

## Medidas e exclusões

O coletor aprovado observa stdout vivo. Tokens são somente uso reportado pelo
host; cache é subconjunto de input, total = input + output. Null é indisponível,
nunca zero. Cronômetro monotônico de wall começa antes de spawn e termina após
saída/coleta. Setup DB fica separado; end-to-end de B começa antes da recuperação
local e termina após o processo, sem somar retrieval novamente. First agent
message completed é mensagem completa, não TTFT. Custo e TTFT indisponíveis.

Timeout por processo 90 segundos e teto global 10 minutos; até seis chamadas.
Stdout até 16 MiB, linha até 1 MiB, stderr descartado até 1 MiB e resposta até
64000 bytes. O limite de 120 palavras é instrução, não teto faturável de API.
Cancelamento local não garante estorno nem cancelamento remoto. Timeout, saída
não zero, fluxo inválido, ferramentas e resposta incompleta não são sucessos.
Uso disponível em falhas é preservado; remanescentes ficam not_run. Resumo usa
somente completed, registra exclusões e cobertura n por métrica e por delta
pareado B menos A; não calcula percentuais contra baseline zero.

O diretório de evidência é novo e exclusivo em `/tmp`, modo 0700, arquivos 0600:
`plan.json`, `run-N.json`, `runs.json`, `response-N.txt` e `summary.json`.
Somente a última agent_message completa é retida como resposta; nenhum transcript
bruto, reasoning, tool output ou stderr é persistido. Fixtures próprias são
fechadas/removidas; evidência privada permanece para revisão manual e pode ser
removida pelo operador após uso. Não publicar respostas completas por padrão.
Qualidade permanece `pending independent review`, sem pontuação por substring.

Este desenho mede redundância/sobrecarga de contexto, não demonstra economia de
tokens ou qualidade geral. Não constitui piloto completo nem inferência causal.

## Execução futura

Build já validado com Node 24.22.1. Após revisão independente e autorização da
etapa de execução, a única instrução é:

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs --run
```

A CLI imprime o caminho absoluto da nova pasta privada. Não repetir execução
para corrigir falha sem nova decisão do supervisor: cada invocação pode consumir
até seis chamadas. Testes usam transporte simulado, nunca Codex real.
