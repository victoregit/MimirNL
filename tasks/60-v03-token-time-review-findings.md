# Relatório de Revisão Independente — Task60: Coletor de Tokens e Tempo v0.3

**Veredito**: **APPROVE**  
**Revisor**: Code Reviewer Agent (Gemini 3.8 Flash High)  
**Data**: 2026-10-27  
**Branch de trabalho**: `docs/v03-corpus-methodology`  
**Commit base verificado**: `166e3cf047b2078952e43dc8e9171e053e99e2ce` (`feat(benchmark): add offline metrics and paired comparisons`)  
**Alvo da revisão**: Entrega da [Task59](file:///mnt/d/Projects/MimirNL/tasks/59-v03-token-time-collector.md) documentada em [tasks/59-v03-token-time-collector-result.md](file:///mnt/d/Projects/MimirNL/tasks/59-v03-token-time-collector-result.md)  
**Artefatos analisados**:

- [scripts/benchmarks/codex-usage.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs)
- [scripts/benchmarks/codex-usage-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs)
- [test/benchmark-codex-usage.test.mjs](file:///mnt/d/Projects/MimirNL/test/benchmark-codex-usage.test.mjs)
- [docs/benchmarks/v03/tokens-tempo.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md)
- [tasks/59-v03-token-time-collector.md](file:///mnt/d/Projects/MimirNL/tasks/59-v03-token-time-collector.md)
- [tasks/59-v03-token-time-collector-result.md](file:///mnt/d/Projects/MimirNL/tasks/59-v03-token-time-collector-result.md)
- [tasks/60-v03-token-time-review.md](file:///mnt/d/Projects/MimirNL/tasks/60-v03-token-time-review.md)

---

## 1. Resumo Executivo

A entrega da Task59 implementou a infraestrutura offline do coletor local de tokens e tempo para eventos JSONL do Codex CLI, atendendo às diretrizes de segurança, privacidade, precisão numérica, semântica temporal e contenção de escopo. Este parecer independente analisou o código-fonte, a CLI, os testes automatizados e a documentação técnica:

1. **Aritmética Segura, Contadores e Semântica de Tokens**:
   - `total_tokens` é computado estritamente como a soma de `input_tokens + output_tokens`. `cached_input_tokens` é validado como subconjunto de `input_tokens` (`cached <= input`) e **não é somado novamente**.
   - Todos os contadores e a soma são validados com `Number.isSafeInteger(n) && n >= 0`. Contadores fracionários, negativos, strings, `NaN` ou `Infinity` causam rejeição imediata.
   - A ausência de uso em caso de stream incompleto ou falha resulta em `usage: null` com `usage_status: "unavailable"`. O valor zero reportado legitimamente é preservado e não se confunde com ausência.
2. **Ciclo de Vida de Turn Único e Terminalidade Estrita**:
   - O normalizador `createUsageCollector` impõe o modelo estrito de turno único: rejeita múltiplos inícios de turno (`turn.started`), início repetido de thread (`thread.started`) e qualquer evento posterior à conclusão (`turn.completed` ou `turn.failed`).
   - Eventos irrelevantes ou desconhecidos antes da conclusão são ignorados com segurança se possuírem campo `type` textual válido, sem que seus conteúdos ou metadados sejam retidos.
3. **Semântica Temporal Monotônica e Honestidade Epistêmica**:
   - O tempo é capturado exclusivamente através do relógio monotônico do coletor (`performance.now()`), garantindo valores finitos, não negativos e não decrescentes.
   - O relatório documenta os tempos como observação local do stream (`elapsed-since-collector-start`), registrando que a medição engloba overheads de startup do processo produtor, buffering e pipeline do sistema operacional.
   - É explicitamente declarado que **TTFT (`first-token latency`) e custo financeiro são indisponíveis (`unavailable`)**, e que o replay de arquivos em stdin mede apenas a leitura do pipe local, não constituindo evidência de latência real.
4. **Segurança de Entrada, Parsing Streaming e Limites de Recursos**:
   - O processamento de stdin suporta divisão arbitrária de chunks, CRLF (`\r\n`), UTF-8 com decodificação fatal (`fatal: true`) e última linha sem newline final.
   - Limites rígidos de proteção contra ataques DoS/Memory Exhaustion são aplicados antes e durante o parsing: máximo de 16 MiB no stream total (`MAX_BYTES`) e 1 MiB por linha (`MAX_LINE_BYTES`).
5. **Privacidade Estrita e Diagnósticos Fixos**:
   - O coletor opera sob allowlist absoluta: prompts, respostas, mensagens de ferramentas, identificadores de sessão/chamada e caminhos de arquivos são descartados sem persistência.
   - Diagnósticos de erro no stderr e exceções utilizam mensagens estáticas predefinidas, impedindo vazamento de trechos de entrada, canários privados ou detalhes do ambiente em caso de falha.
   - A opção `--out` emprega criação exclusiva atômica (`flag: "wx"`, modo `0600`), recusando sobrescrita de arquivos existentes e resolução de links simbólicos.
6. **Integridade de Execução e Testes**:
   - A importação do módulo CLI não gera efeitos colaterais.
   - Sete testes focados em [test/benchmark-codex-usage.test.mjs](file:///mnt/d/Projects/MimirNL/test/benchmark-codex-usage.test.mjs) cobrem exaustivamente canários de privacidade, integridade numérica, chunks, CRLF, limites de buffer, modo `wx/0600`, ausência vs zero e rejeição pós-terminalidade.
   - A suíte completa do repositório (`npm test`) passou com 57 testes aprovados e 1 teste pulado (comportamento padrão Windows SKIP no ambiente Linux).

**Veredito**: **APPROVE** para a implementação do coletor offline da Task59. Fica expressamente consignado que a validação do schema nativo e a medição em chamada real com o Codex permanecem condicionadas à autorização e execução na tarefa subsequente.

---

## 2. Análise Técnica Detalhada por Categoria

### 2.1 Funcionalidade e Lógica de Negócio

- **Fórmulas e Contadores** ([scripts/benchmarks/codex-usage.mjs:55-78](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L55-L78)):
  - Linhas 58-62 extraem os contadores reportados pelo evento `turn.completed`.
  - Linhas 64-68 validam:
    ```javascript
    if (
      !values.every((n) => Number.isSafeInteger(n) && n >= 0) ||
      u.cached_input_tokens > u.input_tokens ||
      !Number.isSafeInteger(u.input_tokens + u.output_tokens)
    )
      invalid();
    ```
  - Linhas 69-74 montam o objeto allowlisted garantindo que `total_tokens = u.input_tokens + u.output_tokens`. O cache é verificado como subconjunto da entrada e não é somado duplamente ao total.
- **Diferenciação entre Ausência, Falha e Zero Válido** ([scripts/benchmarks/codex-usage.mjs:98-117](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L98-L117)):
  - Quando nenhum evento `turn.completed` é observado, `usage` permanece `null` e `usage_status` é marcado como `"unavailable"`. Se o stream terminar prematuramente, o status final é `"incomplete"` (ou `"failed"` se ocorreu `turn.failed`).
  - Quando o evento `turn.completed` reporta validamente zeros (`0` tokens), o objeto `usage` é construído com contadores `0` e `usage_status` como `"host-reported"`.
- **Terminalidade e Escopo de Turno Único** ([scripts/benchmarks/codex-usage.mjs:28,32-38](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L28-L38)):
  - Linha 28: `if (terminal) invalid();` rejeita categoricamente qualquer evento subsequente a um evento terminal (`turn.completed` ou `turn.failed`).
  - Linha 33: `thread.started` é permitido apenas uma vez, antes do turno começar e estritamente como primeiro evento (`count === 1`).
  - Linha 37: `turn.started` é rejeitado se já tiver sido iniciado (`if (started) invalid();`).

### 2.2 Streaming, Decodificação e Robustez do I/O

- **Tratamento de Chunks e Quebras de Linha** ([scripts/benchmarks/codex-usage-cli.mjs:28-40](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L28-L40)):
  - O buffer pendente (`pending`) concatena fatias binárias recebidas no stream (`Buffer.concat([pending, bytes])`).
  - O loop `while ((end = pending.indexOf(10)) !== -1)` extrai linhas delimitadas por `\n` (byte 10).
  - Linha 23: `.replace(/\r$/, "")` normaliza terminações CRLF (`\r\n`) de forma limpa.
  - Linha 40: `if (pending.length) line(pending);` assegura o processamento da última linha caso ela termine sem `\n`.
- **Decodificação UTF-8 Estrita** ([scripts/benchmarks/codex-usage-cli.mjs:18,23](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L18-L23)):
  - A instância `TextDecoder("utf-8", { fatal: true })` rejeita qualquer sequência de bytes malformada ou truncada, lançando exceção que é capturada e convertida em erro genérico.
- **Proteção de Recursos (Denial of Service Prevention)** ([scripts/benchmarks/codex-usage-cli.mjs:6-7,22,31,38](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L6-L38)):
  - `MAX_BYTES = 16 * 1024 * 1024` (16 MiB) impõe teto cumulativo de entrada.
  - `MAX_LINE_BYTES = 1024 * 1024` (1 MiB) limita o tamanho de uma linha individual, verificado tanto no buffer pendente quanto na linha extraída.

### 2.3 Semântica Temporal e Medição Epistêmica

- **Verificação Monotônica** ([scripts/benchmarks/codex-usage.mjs:19-22](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L19-L22)):
  - Função `time(ms)` assegura que cada carimbo recebido seja finito, não negativo e superior ou igual ao anterior (`!Number.isFinite(ms) || ms < last || ms < 0`).
- **Limites Epistêmicos Documentados** ([scripts/benchmarks/codex-usage.mjs:105-117](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L105-L117) e [docs/benchmarks/v03/tokens-tempo.md:13-18](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md#L13-L18)):
  - O método de cronometragem é identificado como `"elapsed-since-collector-start"`.
  - `ttft` é retornado com `{ status: "unavailable" }`. A conclusão da primeira mensagem de agente (`first_agent_message_completed_ms`) não é confundida com tempo até o primeiro token emitido pelo modelo.
  - `cost` é retornado com `{ status: "unavailable" }`, impedindo qualquer estimativa financeira não autorizada.
  - `execution_proof: false` atesta que a presença do JSON não constitui prova criptográfica de execução remota ou cobrança.

### 2.4 Segurança, Privacidade e Sistema de Arquivos

- **Sanitização e Ausência de Vazamento de Canários Privados**:
  - Somente campos escalares numéricos de uso e carimbos de tempo permitidos integram o relatório final. Prompts, respostas, argumentos de ferramentas e identificadores arbitrários são descartados.
  - Diagnósticos de erro no CLI ([scripts/benchmarks/codex-usage-cli.mjs:55,65](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L55-L65)) utilizam literais estáticos:
    - `"Invalid arguments. Use --help.\n"`
    - `"Unable to collect stream or create new report.\n"`
  - Em nenhuma hipótese trechos do payload rejeitado ou stack traces de bibliotecas são impressos no console.
- **Gravação Segura de Arquivo** ([scripts/benchmarks/codex-usage-cli.mjs:60-62](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L60-L62)):
  - `writeFileSync(args[1], report, { flag: "wx", mode: 0o600 });`
  - A flag `"wx"` assegura criação exclusiva (falha se o arquivo já existir ou se for um link simbólico pré-existente).
  - O modo `0o600` define permissões estritas de leitura/escrita exclusivas do usuário (`rw-------`).

### 2.5 Testabilidade e Cobertura

- O arquivo [test/benchmark-codex-usage.test.mjs](file:///mnt/d/Projects/MimirNL/test/benchmark-codex-usage.test.mjs) implementa 7 casos de teste com assertivas rigorosas:
  1. _Uso único, exclusão de cache no total e supressão de canários privados._
  2. _Diferenciação clara entre ausência, falha e zero válido._
  3. _Rejeição de números inválidos, overflows, estruturas malformadas, inícios duplicados e violação de terminalidade._
  4. _Suporte a streaming chunkado byte a byte com UTF-8, CRLF, linha final sem newline e relógio injetável._
  5. _Rejeição de JSON malformado, linhas em branco, UTF-8 inválido, buffers que excedem os limites máximos e erros no stream de entrada._
  6. _Execução offline da CLI, diagnósticos estáticos no stderr e criação exclusiva segura com permissões 0600 e rejeição de symlinks._
  7. _Verificação de ausência de efeitos colaterais na importação de módulo (`import`) e rejeição invariante a qualquer evento pós-terminal._

---

## 3. Registro de Verificações Independentes

As seguintes verificações técnicas foram executadas diretamente no ambiente de desenvolvimento:

| Verificação                               | Comando / Procedimento                                                                                                                                                                   | Resultado                                                 |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **Runtime Node.js**                       | `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --version`                                                                                                                     | Confirmado: `v24.22.1`                                    |
| **Verificação Sintática (`--check`)**     | `node --check scripts/benchmarks/codex-usage.mjs scripts/benchmarks/codex-usage-cli.mjs test/benchmark-codex-usage.test.mjs`                                                             | Sucesso (código 0, sem erros sintáticos)                  |
| **Testes Focados do Coletor**             | `node --test test/benchmark-codex-usage.test.mjs`                                                                                                                                        | **7/7 aprovados** (0 falhas, 0 skips, ~665 ms)            |
| **Conformidade de Formatação**            | `./node_modules/.bin/prettier --check scripts/benchmarks/codex-usage.mjs scripts/benchmarks/codex-usage-cli.mjs test/benchmark-codex-usage.test.mjs docs/benchmarks/v03/tokens-tempo.md` | Todos os 4 arquivos em conformidade com estilo Prettier   |
| **Verificação de Whitespace Git**         | `git diff --check`                                                                                                                                                                       | Limpo (código 0, sem erros de espaços em branco)          |
| **Suíte Completa de Testes (`npm test`)** | `PATH="/tmp/mimir-node-runtime/...:$PATH" npm test`                                                                                                                                      | **57 testes aprovados**, 1 skip (Windows alias), 0 falhas |
| **Proteção de Segredos e Credenciais**    | Auditoria estática de padrões sensíveis (`credentials`, `ssh`, `.env`, `.pem`)                                                                                                           | Nenhuma referência a caminhos ou credenciais privadas     |

---

## 4. Tabela de Achados

| ID         | Severidade  | Arquivo e Linha                                                                                                         | Descrição                                                                                                                                                                                                                        | Resolução / Status                                                                                                                                                                                                          |
| :--------- | :---------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F60-01** | Informativo | [docs/benchmarks/v03/tokens-tempo.md:21-27](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md#L21-L27) | O exemplo de pipeline futuro utiliza `codex exec ... \| node scripts/benchmarks/codex-usage-cli.mjs`. O coletor lê stdin até EOF e não tem como capturar o código de saída (`exit code`) do comando produtor à esquerda do pipe. | **Mitigado por Documentação**. O documento adverte expressamente o uso de `set -o pipefail` e instrui o operador a verificar o status da pipeline, registrando que o relatório não captura o código do produtor.            |
| **F60-02** | Informativo | [scripts/benchmarks/codex-usage.mjs:55-78](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs#L55-L78)   | O adaptador experimental espera `usage: { input_tokens, cached_input_tokens, output_tokens }`. A validação nativa de correspondência com o JSON emitido pela CLI do Codex na máquina local permanece pendente de execução real.  | **Requisito Previsto de Arquitetura**. A distinção entre aprovação do código offline e validação de schema real foi documentada com precisão na Task59 e Task60.                                                            |
| **F60-03** | Informativo | [scripts/benchmarks/codex-usage-cli.mjs:61](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs#L61)  | A opção de modo `0o600` em `writeFileSync` com flag `wx` depende da compatibilidade do sistema de arquivos subjacente (ex: volumes NTFS/FAT em WSL podem ignorar permissões POSIX).                                              | **Mitigado por Documentação e Testes**. A restrição foi adequadamente testada em diretório Linux temporário (`statSync(path).mode & 0o777 === 0o600`) e devidamente registrada em `docs/benchmarks/v03/tokens-tempo.md:29`. |

Nenhum achado bloqueante, crítico ou de severidade Alta/Média foi identificado.

---

## 5. Conclusão e Veredito

A entrega da Task59 atende rigorosamente a todos os critérios estabelecidos na especificação: o coletor é puramente offline, matematicamente exato, seguro contra vazamentos de dados ou DoS, epistemicamente conservador quanto a tempos e custos, e respaldado por testes abrangentes.

- **Veredito**: **APPROVE**
- **Condicionantes para Etapas Posteriores**:
  1. A presente aprovação valida exclusivamente o coletor offline e seus artefatos associados.
  2. Nenhuma inferência de custo, prova de execução ou validação definitiva do schema do Codex é atestada antes da realização da prova de conceito da pergunta única autorizada.
  3. Qualquer execução futura da pergunta única de sonda deve seguir estritamente o pipeline delimitado em [docs/benchmarks/v03/tokens-tempo.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md#L21-L27), mantendo a integridade do repositório sem commit/push não autorizados.
