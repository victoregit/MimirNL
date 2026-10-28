# Task62 — Resultado da implementação

Implementado em `/mnt/d/Projects/MimirNL`. Pronto para revisão independente na
Task63. Não executar chamadas reais antes dessa revisão. Nenhum modelo foi
chamado nesta tarefa; nenhum subagente foi criado; sem commit/push/merge.

## Entregas

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs`: runner/CLI importável,
  com flag explícita, diretório privado exclusivo, fonte fixada, seis processos no
  máximo, AB/BA/AB, recuperação descartável real, transporte limitado e relatórios.
- `/mnt/d/Projects/MimirNL/test/benchmark-paired-probe.test.mjs`: sete testes offline,
  transporte simulado e recuperação real Service/Storage sem modelo.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/comparacao-exploratoria.md`: protocolo,
  interpretação, limites, privacidade, evidências e execução futura.

Preservados AGENTS.md e todo dirty preexistente. Não alterados core, fontes,
CI, package, dependências, coletor aprovado, fixtures casos.md ou permissões de
accepted/validated. `dist` foi buildado pelo comando existente antes dos testes.

## Verificação

Runtime `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` (24.22.1), com
seu diretório bin no PATH para comandos npm.

- `npm run build`: passou.
- `npm test`: uma execução; 63 testes, 62 passaram, 1 skip Windows, zero falhas.
  Log local: `/tmp/mimir-task62-tests.log`. Esse teste completo precedeu a adição
  de dois testes focados adicionais; o runner já estava na versão final.
- `node --test test/benchmark-paired-probe.test.mjs`: versão final com 7/7 passando.
- `node --check scripts/benchmarks/paired-probe.mjs`: passou.
- Prettier check dos três arquivos de implementação/documentação: passou.
- `git diff --check`: passou.

Cobertura focada: fonte igual nos prompts; recuperação real e hash; ausência de
paths/IDs privados; ordem e seis chamadas máximas; inclusão de retrieval sem dupla
soma; prazo global com not_run; uso preservado em timeout/exit não zero; ferramentas,
incompletude, limites de resposta/stderr, spawn failure; falhas locais sem vazamento;
permissões 0700/0600 e exclusividade; import/help sem efeitos; metadata pública de
modelo com allowlist. Testes nunca executam o binário Codex.

## Limitações e execução futura

Qualidade pending independent review. Fonte integral presente em ambas condições:
este teste mede redundância/sobrecarga, sem promessa de economia ou qualidade geral.
Sem controle de cache/default; modelo unavailable quando não identificado em campo
público permitido, equivalência não comprovada. TTFT/custo indisponíveis. Não há
limite faturável de output: 120 palavras é somente instrução. Cancelamento local
não garante cancelamento remoto/estorno. Uso ausente é null, não zero.

Após revisão independente e autorização da etapa de execução, uma única instrução:

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs --run
```

O caminho absoluto da pasta privada nova será impresso. Respostas completas ficam
somente ali; não publicar por padrão. Cada invocação pode realizar até seis
chamadas: não repetir automaticamente em caso de erro. Fixtures próprias são
removidas; evidências privadas ficam retidas para revisão independente.
