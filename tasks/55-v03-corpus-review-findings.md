# Relatório de Revisão Independente — Task55: Corpus e Metodologia v0.3

**Veredito**: **APPROVE**  
**Revisor**: Code Reviewer Agent (Gemini 3.8 Flash High)  
**Data**: 2026-10-27  
**Branch de trabalho**: `docs/v03-corpus-methodology`  
**Commit base verificado**: `166e3cf047b2078952e43dc8e9171e053e99e2ce` (`feat(benchmark): add offline metrics and paired comparisons`)  
**Alvo da revisão**: Proposta da [Task54](file:///mnt/d/Projects/MimirNL/tasks/54-v03-corpus-methodology.md) documentada em [tasks/54-v03-corpus-methodology-result.md](file:///mnt/d/Projects/MimirNL/tasks/54-v03-corpus-methodology-result.md)  
**Artefatos analisados**:

- [docs/benchmarks/v03/casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md)
- [docs/benchmarks/v03/metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md)
- [docs/v03-divisao-de-tarefas.md](file:///mnt/d/Projects/MimirNL/docs/v03-divisao-de-tarefas.md)
- [ROADMAP_MIMIR_NL.md](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md)
- [tasks/54-v03-corpus-methodology.md](file:///mnt/d/Projects/MimirNL/tasks/54-v03-corpus-methodology.md)
- [tasks/54-v03-corpus-methodology-result.md](file:///mnt/d/Projects/MimirNL/tasks/54-v03-corpus-methodology-result.md)
- [tasks/55-v03-corpus-independent-review.md](file:///mnt/d/Projects/MimirNL/tasks/55-v03-corpus-independent-review.md)

---

## 1. Resumo Executivo

A entrega da Task54 foi submetida a rigorosa auditoria e verificação técnica independente por este revisor, abrangendo as fontes versionadas, a extração e hashing de trechos, a coerência das perguntas/respostas/rubricas, os aspectos metodológicos dos três cenários de benchmark, a conformidade estrutural com o validador de preflight e a governança documental:

1. **Conferência Independente das Fontes e Hashes (100% de correspondência)**:
   - Os três casos propostos baseiam-se exclusivamente no commit fixado `166e3cf047b2078952e43dc8e9171e053e99e2ce` do próprio repositório `MimirNL`.
   - A extração independente dos bytes exatos de cada intervalo inclusivo via `git show <commit>:<path>` reproduziu identicamente os SHA-256 e os trechos de código declarados em [casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md):
     - `pilot-approval` ([src/learning/index.ts:1-16](file:///mnt/d/Projects/MimirNL/src/learning/index.ts#L1-L16)): SHA-256 `8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b`.
     - `pilot-budget` ([src/optimization/index.ts:1-27](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts#L1-L27)): SHA-256 `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473`.
     - `pilot-failure` ([src/security/index.ts:68-96](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96)): SHA-256 `41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa`.
2. **Fidelidade e Rigor das Tarefas, Respostas e Rubricas**:
   - As perguntas formuladas testam com precisão as propriedades comportamentais e semânticas dos trechos (controle de exceção em `nextStatus`, estimativa por bytes UTF-8 e ausência de `break` em `optimize`, e sanitização de exceções locais/mapeamento de `causeCode`/`sqliteCode` em `failure`).
   - As respostas esperadas e os critérios de sucesso e rubricas refletem com exatidão o comportamento do código, estabelecendo critérios objetivos e binários com pesos consistentes (soma = 3; score máximo 1.0 requer satisfação de ambos os itens).
3. **Validação Estrutural e Bloqueio de Planejamento**:
   - A execução de `validateCases(cases)` de [scripts/benchmarks/preflight.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs) no runtime oficial Linux (`node v24.22.1`) confirmou que o bloco JSON é estruturalmente válido (`status: "structurally_valid"`, `case_count: 3`).
   - A chamada `planCases(cases, 3)` foi rejeitada de forma determinística com a exceção esperada: `"Planning requires nonillustrative accepted cases with validated gold and complete references (caller provenance only)."`. Isso comprova que os casos permanecem adequadamente bloqueados enquanto `review.decision` e `gold_status` figuram como `"pending"`, com `permissions_ref: null`.
4. **Isolamento, Comparabilidade e Ausência de Holdout**:
   - Os três cenários (`sem_memoria`, `com_mimir`, `historico_completo`) utilizam contextos de tarefa equivalentes sob allowlist estrita, rotação determinística (ABC/BCA/CAB), cache frio e processos isolados.
   - A proposta define com transparência técnica que o histórico vazio UTF-8 de zero bytes serve de controle pareado para `sem_memoria`, não constituindo teste de histórico longo.
   - Foi explicitamente documentado que todos os três casos são do split `development`, não há conjunto `evaluation`/holdout, e $k=3$ impõe teto matemático de $1/3$ para Precision@3 quando apenas uma unidade relevante é recuperada.
5. **Governança, Roadmap e Limites Operacionais**:
   - [docs/v03-divisao-de-tarefas.md](file:///mnt/d/Projects/MimirNL/docs/v03-divisao-de-tarefas.md) e [ROADMAP_MIMIR_NL.md](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md) foram atualizados com precisão cirúrgica, documentando que a equipe principal assume a proposição documental sob Task54 sem eliminar a exigência de conferência independente e aceite humano, preservando integralmente o histórico de releases e o arquivo `AGENTS.md`.
   - Nenhuma chamada de rede, modelo externo, execução de host/bot, ingestão ou escrita em banco de dados foi realizada.

Nenhum defeito bloqueante foi encontrado. O relatório emite veredito **APPROVE** para a proposta documental da Task54.

---

## 2. Análise Detalhada por Categoria

### 2.1 Verificação dos Três Casos contra o Git Fixado (`166e3cf`)

A conferência técnica foi realizada extraindo os objetos Git diretamente do commit `166e3cf047b2078952e43dc8e9171e053e99e2ce`:

#### Caso 1: `pilot-approval`

- **Arquivo e Linhas**: [src/learning/index.ts:1-16](file:///mnt/d/Projects/MimirNL/src/learning/index.ts#L1-L16) (total de 16 linhas no arquivo nesse commit).
- **Unidade Canônica**: `code-approval/behavior`.
- **SHA-256 Calculado**: `8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b` (idêntico ao declarado).
- **Trecho**:
  ```typescript
  import { AppError } from "../security/index.js";
  export function nextStatus(
    action: string,
    current: string,
    explicitApproval: boolean,
  ): string {
    if (action === "approve" && !explicitApproval)
      throw new AppError(
        "APPROVAL_REQUIRED",
        "Verification requires explicit user approval.",
      );
    if (action === "approve") return "verified";
    if (action === "reject") return "rejected";
    if (action === "deprecate" || action === "supersede") return "deprecated";
    return current;
  }
  ```
- **Avaliação da Pergunta e Resposta Esperada**:
  - A pergunta demanda saber como `nextStatus` lida com: (1) `approve` sem aprovação explícita, (2) `approve` autorizado, (3) `reject`, (4) `supersede` e (5) ação desconhecida, exigindo a citação da unidade.
  - A resposta esperada mapeia com fidelidade de 100%: (1) lança `AppError APPROVAL_REQUIRED`, (2) retorna `"verified"`, (3) retorna `"rejected"`, (4) retorna `"deprecated"`, (5) mantém `current`.
  - Critérios de sucesso e rubrica ponderam o comportamento (peso 2) e a citação precisa de `code-approval/behavior` (peso 1).

#### Caso 2: `pilot-budget`

- **Arquivo e Linhas**: [src/optimization/index.ts:1-27](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts#L1-L27) (total de 27 linhas no arquivo nesse commit).
- **Unidade Canônica**: `code-budget/behavior`.
- **SHA-256 Calculado**: `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473` (idêntico ao declarado).
- **Trecho**:
  ```typescript
  // UTF-8 bytes are a conservative upper bound, not a model tokenizer or savings metric.
  export const estimateTokens = (value: unknown): number =>
    Buffer.byteLength(JSON.stringify(value), "utf8");
  export function optimize<T>(
    items: T[],
    budget: number,
  ): { memories: T[]; estimatedTokens: number; estimator: string } {
    const result = {
      memories: [] as T[],
      estimatedTokens: 0,
      estimator: "conservative UTF-8 byte upper bound; not model tokens",
    };
    for (const item of items) {
      const next = {
        ...result,
        memories: [...result.memories, item],
        estimatedTokens: budget,
      };
      if (estimateTokens({ ok: true, data: next }) <= budget)
        result.memories.push(item);
    }
    result.estimatedTokens = estimateTokens({
      ok: true,
      data: { ...result, estimatedTokens: budget },
    });
    return result;
  }
  ```
- **Avaliação da Pergunta e Resposta Esperada**:
  - A pergunta questiona se o estimador mede tokens reais, como `optimize` seleciona os itens e se um item posterior pode caber após a omissão de um item anterior, exigindo a citação da unidade.
  - A resposta esperada esclarece explicitamente que `estimateTokens` mede bytes UTF-8 de JSON serializado (limite superior conservador documentado e não tokenizador real); que o laço percorre sequencialmente os itens sem interrupção (`break`), permitindo que um item menor caiba mesmo que um antecessor maior tenha sido descartado; e registra que isso não comprova economia real de tokens.
  - A rubrica e os critérios de sucesso vinculam o comportamento (peso 2) e a citação correta (peso 1).

#### Caso 3: `pilot-failure`

- **Arquivo e Linhas**: [src/security/index.ts:68-96](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96) (29 linhas inclusivas).
- **Unidade Canônica**: `code-failure/behavior`.
- **SHA-256 Calculado**: `41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa` (idêntico ao declarado).
- **Trecho**:
  ```typescript
  export function failure(e: unknown) {
    // Keep local exception text and paths private, but retain bounded machine
    // codes so CI and callers can distinguish I/O and SQLite failures.
    const local =
      e instanceof Error
        ? (e as NodeJS.ErrnoException & { errcode?: number })
        : undefined;
    const causeCode =
      !(e instanceof AppError) &&
      typeof local?.code === "string" &&
      /^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/.test(local.code)
        ? local.code
        : undefined;
    return {
      ok: false as const,
      error: {
        code: e instanceof AppError ? e.code : "INVALID_REQUEST",
        message:
          e instanceof AppError
            ? e.message
            : "Invalid request or local operation failed.",
        ...(causeCode ? { causeCode } : {}),
        ...(causeCode === "ERR_SQLITE_ERROR" &&
        Number.isSafeInteger(local?.errcode)
          ? { sqliteCode: local!.errcode }
          : {}),
      },
    };
  }
  ```
- **Avaliação da Pergunta e Resposta Esperada**:
  - A pergunta indaga sobre o tratamento de `Error` genérico, `causeCode` e `sqliteCode` sem vazamento de detalhes locais.
  - A resposta esperada detalha que `Error` comum recebe código genérico `"INVALID_REQUEST"` com mensagem fixa, omitindo mensagens e caminhos locais; `causeCode` só é propagado se o erro não for `AppError` e se seu código atender à regex `^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$`; e `sqliteCode` exige adicionalmente `causeCode === "ERR_SQLITE_ERROR"` e `errcode` inteiro seguro. Se for `AppError`, preserva seu próprio `code` e `message`.
  - A rubrica e os critérios pontuam de forma justa e rastreável.

---

### 2.2 Comparabilidade Metodológica dos Cenários

O desenho experimental descrito em [metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md) atende aos padrões de rigor científico exigidos:

1. **Três Cenários Alinhados**:
   - `sem_memoria`: baseline limpo; acesso direto apenas às fontes autorizadas na tarefa.
   - `com_mimir`: intervenção testada; recuperação contextual estruturada.
   - `historico_completo`: controle de histórico; para este piloto inicial com tarefas de leitura pontual, propõe-se explicitamente um artefato UTF-8 de zero bytes como controle transparente, registrando que isso não afere histórico longo.
2. **Rotação Determinística**:
   - Adoção da rotação do preflight (ABC / BCA / CAB por caso e repetição) para atenuar viés de ordenação sequencial sem introduzir não-determinismo aleatório.
3. **Isolamento de Ambiente e Limpeza de Estado**:
   - Cada execução requer processo novo, cache frio documentado, reset de estado de memória antes de cada repetição e diretórios de trabalho isolados.
   - Garantia explícita de que operações de reset em benchmark nunca atuam em bancos de dados reais.

---

### 2.3 Tratamento do Gold, Ausência de Holdout e Denominadores

1. **Separação Rígida do Gold**:
   - A fixture contida em [casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md) define uma fronteira estrita de avaliação local: nenhuma resposta esperada (`expected_answer`), critério de sucesso (`success_criteria`) ou rubrica (`rubric`) pode ser fornecida ao modelo em qualquer cenário.
   - O contexto do modelo (`model_context`) expõe exclusivamente a pergunta (`task`) e as fontes autorizadas (`allowed_source_ids`).
2. **Ausência de Holdout Declarada**:
   - Os três casos pertencem ao split `"development"`. Não há split `"evaluation"` mascarado como teste cego.
   - A documentação ressalta reiteradamente que o piloto development não comprova generalização, precisão ampla ou ganhos em produção, e que qualquer avaliação confirmatória futura exigirá um novo conjunto evaluation elaborado por outra pessoa.
3. **Denominadores de Precision@k e Recall@k**:
   - Fixação de $k=3$ no planejamento do preflight.
   - Como cada caso tem 1 unidade relevante (`code-approval/behavior`, `code-budget/behavior`, `code-failure/behavior`), o denominador $k=3$ limita a Precision@3 ao teto máximo de $1/3$ (33.3%). A documentação instrui explicitamente a não interpretar essa restrição matemática do denominador como falha ou mérito do sistema.

---

### 2.4 Validação Estrutural JSON e Bloqueio de Planejamento

A integridade do preflight foi testada com sucesso:

- **`validateCases(cases)`**: Executado diretamente sobre o bloco JSON de [casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md). Retornou:
  ```json
  {
    "status": "structurally_valid",
    "case_count": 3,
    "provenance": "caller_provided_not_verified"
  }
  ```
- **`planCases(cases, 3)`**: Executado com o array original, resultou em rejeição imediata com a mensagem:
  ```
  Planning requires nonillustrative accepted cases with validated gold and complete references (caller provenance only).
  ```
  Isso demonstra que o mecanismo de segurança do preflight funciona conforme projetado: nenhuma run planejada ou execução pode ser iniciada enquanto os campos `review.decision` e `evaluation_private.gold_status` estiverem como `"pending"`, com referências nulas.

---

### 2.5 Governança, Divisão de Tarefas e Roadmap

1. **[docs/v03-divisao-de-tarefas.md](file:///mnt/d/Projects/MimirNL/docs/v03-divisao-de-tarefas.md)**:
   - Registra formalmente que a equipe principal assumiu a elaboração da proposta de corpus e metodologia por autorização do usuário na Task54.
   - Preserva expressamente a obrigação de conferência independente das fontes e de aceite humano por terceiro, vedando expressamente a autoaprovação.
2. **[ROADMAP_MIMIR_NL.md](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md)**:
   - Alterações contidas estritamente na linha da tabela da v0.3.0 (`Offline tooling reviewed; corpus proposed`), na descrição do status da v0.3.0 e no item P0 dos próximos passos.
   - Preserva integralmente o histórico da v0.2.0, as evidências comprovadas e não antecipa declarações de publicação ou releases fictícios.

---

## 3. Registro de Verificações Independentes

| Verificação                  | Comando / Procedimento                                         | Resultado                                                                    |
| :--------------------------- | :------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Commit SHA fixado**        | `git rev-parse 166e3cf047b2078952e43dc8e9171e053e99e2ce`       | Confirmado: `166e3cf047b2078952e43dc8e9171e053e99e2ce`                       |
| **Caso 1: Hashes e Bytes**   | `git show 166e3cf...:src/learning/index.ts` (linhas 1–16)      | `8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b` (exato)   |
| **Caso 2: Hashes e Bytes**   | `git show 166e3cf...:src/optimization/index.ts` (linhas 1–27)  | `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473` (exato)   |
| **Caso 3: Hashes e Bytes**   | `git show 166e3cf...:src/security/index.ts` (linhas 68–96)     | `41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa` (exato)   |
| **Preflight validateCases**  | Validação do array JSON com `scripts/benchmarks/preflight.mjs` | `structurally_valid`, 3 casos, caller provenance                             |
| **Preflight planCases lock** | Execução de `planCases(cases, 3)` com casos em `pending`       | Bloqueado com exceção: `Planning requires nonillustrative accepted cases...` |
| **Resolução de Links**       | Auditoria de links relativos nos documentos alterados          | 100% dos links de arquivos e âncoras válidos e existentes                    |
| **Formatação de Código**     | Prettier check nos artefatos entregues                         | Em conformidade nos arquivos entregues da Task54                             |
| **Espaços e Quebras Git**    | `git diff --check`                                             | Saída limpa (código 0, sem erros de whitespace)                              |

---

## 4. Tabela de Achados

| ID         | Severidade  | Arquivo e Linha                                                                            | Descrição                                                                                                                                        | Resolução / Status                                                                                                                                                                                     |
| :--------- | :---------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F55-01** | Informativo | [casos.md:11-13](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md#L11-L13)      | Links apontam para caminhos no working tree (`../../../src/...`), enquanto a autoridade para reprodução do hash é o objeto Git fixado `166e3cf`. | Documentado explicitamente no próprio texto ("O link abre o arquivo corrente; commit e intervalo acima são a autoridade"). Sem ação necessária.                                                        |
| **F55-02** | Informativo | [casos.md:51,107,163](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md#L51)     | Unidade relevante única por caso impõe teto de 1/3 para Precision@3 no baseline e no teste com memória.                                          | Tratado tecnicamente em [metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md#L12) como característica invariante do denominador, sem prejuízo à comparabilidade pareada. |
| **F55-03** | Informativo | [metodologia.md:14](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md#L14) | Histórico de zero bytes proposto para o controle `historico_completo` torna o cenário equivalente a `sem_memoria`.                               | Documentado com transparência técnica; não afere histórico longo, servindo apenas como controle do fluxo de contexto.                                                                                  |

Nenhum achado de severidade Alta ou Média. Não há correções necessárias nos artefatos da Task54.

---

## 5. Conclusão e Veredito

A proposta documental de corpus piloto e metodologia v0.3 entregue pela Task54 satisfaz integralmente os critérios técnicos de precisão, reprodutibilidade, segurança e integridade estipulados para esta etapa.

- **Veredito**: **APPROVE**
- **Observações Importantes**:
  - A aprovação desta proposta refere-se estritamente à integridade e consistência documental dos artefatos propostos.
  - Não constitui aceite humano do contrato ou do corpus, nem autorização para execução real de benchmark, chamada de modelos, seleção de provedores, consumo de orçamento ou criação de branches/commits.
  - O planejamento e a execução continuam rigorosamente bloqueados até formalização dos acordos e aceite humano.
