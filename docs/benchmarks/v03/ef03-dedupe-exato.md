# EF03 — dedupe exato na montagem externa

Task129 entregue; **pending_review130**. Zero chamadas novas de benchmark/modelo.
Mimir continua memória/segundo cérebro: conteúdo, origem, revisão e citação são
preservados integralmente na base. Nenhuma mudança em armazenamento, core,
ranking, policy108 ou histórico.

A API `assembleOfflineContext` de `scripts/benchmarks/offline-context.mjs` monta
contexto a partir do bundle e das seleções já autorizadas pelo chamador:

```js
import { assembleOfflineContext } from "./scripts/benchmarks/offline-context.mjs";
const result = assembleOfflineContext(bundle, task, baseKeys, retrievedKeys, {
  base_overlap: "exact-v1",
});
// result.prompt é o JSON efetivamente montado; result.context_bytes mede UTF-8.
```

Sem o quinto argumento, `base_overlap: "preserve"` mantém byte a byte a montagem
`runtimeEnvelope` anterior para as mesmas entradas. Rollback: omitir a opção ou
usar `preserve`; nenhuma migração ou reescrita de memória.

A integração é uma API concreta de montagem **offline/futura da família ABC**,
sem transporte, launcher, execução planejada ou acesso MCP/host global. O runner
ABC congelado permanece na API anterior, inclusive seu sufixo de instrução.
Nenhum manifesto103/104 aceita automaticamente a variante. Uma execução futura
precisa congelar essa configuração, seu hash, o código e o prompt final em novo
plano com validação/revisão e autorização correspondentes; `executable: false`
não concede execução. Não há flag ambiental/global.

`configuration` identifica `offline-context-129-v1` e a opção; seu SHA256 e as
medidas ficam fora do prompt. O retorno contém envelope, prompt, bytes finais,
quantidade omitida e bytes evitados. Alterações posteriores no envelope exigem
nova serialização e contagem pelo chamador; o prompt retornado é uma string
estável. O sufixo atual do ABC não faz parte desta API.

A validação legada do bundle inteiro, das seleções e do orçamento de entrada
ocorre primeiro. Um envelope legado acima de 32000 bytes continua recusado,
mesmo se dedupe pudesse fazê-lo caber. O chamador continua responsável por
pool, seleção e gates específicos da execução. A API não amplia permissões.

A comparação usa o objeto-fonte completo canonicalizado, independente da ordem
das chaves, sem normalizar Unicode nem comparar apenas hash de conteúdo.
O schema fechado atual exige source_id/unit_id/path/commit/start_line/end_line/
sha256/excerpt e a revisão PIN conhecida. Campos públicos adicionais,
metadados desconhecidos, revisão divergente ou dados faltantes são recusados
pelo contrato antes de qualquer remoção. Evolução futura do schema requer
revisão dessa fronteira; não se projetam metadados para produzir igualdade.
Fontes válidas de outra identidade/origem/faixa permanecem. A base inteira e a
ordem relativa das recuperadas restantes são preservadas, sem mutar entradas.

Os testes recompõem somente DEV públicos 1/3/8 do replay sintético103 e aplicam
a API real. Com o sufixo do runner acrescentado em memória, reproduzem hashes
e bytes anteriores e obtêm **4065→2489, 8193→4676, 5132→5132 bytes**. Sem esse
sufixo, ambas as montagens são menores pelo mesmo número de bytes; o delta é
1576/3517/0. Nenhum artefato histórico é regravado. Isso não mede tokens reais,
qualidade, custo, latência ou a execução104; não demonstra eficácia ampla.
