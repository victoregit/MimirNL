# Evidência pública sanitizada — Task104

`executed-results.tar` contém exatamente `results.json` e `position-00.json` a `position-53.json` originais, byte a byte, sem autorização, coordenador, gold, rubricas, reasoning, transcripts ou stderr. `SHA256.json` inventaria os **membros históricos do tar**; `executed-results.sha256` identifica o próprio arquivo. Os JSONs soltos são visões correntes formatadas pelo Prettier, com equivalência canônica verificada e inventário separado `formatted-SHA256.json`. Não atribuir os hashes históricos aos bytes formatados.

As respostas e campos de observação são públicos conforme contrato104. Avaliações110 permanecem privadas. Não estão incluídos novos casos evaluation, gabaritos ou dados para reconstruir o julgamento privado. Consulte os resumos e limitações em [fechamento-0.3](../../fechamento-0.3.md).

## Replay exclusivamente offline

Extraia `../task103-executed-snapshot.tar` numa pasta isolada vazia e confira cada membro com `../task103-executed-snapshot.sha256` antes de executar. Use Node Linux24.22.1 persistente e as dependências existentes compatíveis com o package/lock arquivado, copiadas para `node_modules` da pasta isolada, sem instalar dependências ou copiar configurações pessoais. O runtime público do replay usa o bundle já exportado: não precisa abrir holdout, gold, coordenador ou executar o launcher. A fixture de testes que consulta Git exige adicionalmente o pin público `166e3cf047b2078952e43dc8e9171e053e99e2ce` em um Git mínimo local, sem remotes/config/hooks pessoais; esse Git não faz parte do replay abaixo.

Dentro da pasta extraída, forneça paths absolutos e um diretório de saída novo sob um pai existente, sem symlinks:

```sh
NODE=/caminho/persistente/node-v24.22.1-linux-x64/bin/node
SNAPSHOT=/caminho/isolado/snapshot
OUTPUT=/caminho/isolado/replay-novo
"$NODE" "$SNAPSHOT/scripts/benchmarks/abc-cli.mjs" offline "$SNAPSHOT/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json" "$OUTPUT"
```

Resultado esperado: `actual_model_calls: 0`, `retrieval_calls: 18`, `synthetic_transport_calls: 54`, `stopped: false`. A avaliação sintética não constitui execução LLM nem prova de qualidade. Tempos e hashes físicos SQLite podem variar; não exigir igualdade byte a byte com resultados do replay anterior. Não executar o launcher live arquivado nem substituir o manifesto histórico por code hashes do checkout corrente. A reprodução de métricas privadas exige acesso autorizado separado aos dados110, não fornecidos neste pacote.
