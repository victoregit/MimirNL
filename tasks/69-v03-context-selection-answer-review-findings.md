# Parecer de Revisão Independente de Qualidade e Medições — Task69

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Alvo:** Avaliação independente de respostas, hashes, contextos e métricas da Task68  
**Diretório de Evidências Reais:** `/tmp/mimir-context-selection-task68-20261027`  
**Fonte Auditada no Git:** [`src/optimization/index.ts`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts) no commit `166e3cf047b2078952e43dc8e9171e053e99e2ce` (SHA-256: `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473`, 850 bytes)  
**Pergunta Avaliada:**
> *"estimateTokens mede tokens reais de um modelo? Como optimize decide quais itens incluir e um item menor posterior pode entrar após um item maior ser descartado? Cite a fonte e responda em até 120 palavras."*

---

## 1. Matriz de Qualidade das Seis Respostas

A rubrica avalia três critérios conceituais e a restrição de extensão de forma independente:
- **(C1) Distinção de Bytes vs Tokens:** Afirma que mede bytes UTF-8 de JSON serializado como limite superior conservador, não tokens reais nem métrica de economia.
- **(C2) Lógica Cumulativa e Continuidade:** Descreve inclusão condicional ao orçamento cumulativo via envelope `{ ok: true, data: next }` e continuidade do laço após descarte permitindo itens menores posteriores.
- **(C3) Citação da Fonte:** Citação exata de `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
- **Extensão:** Limite estrito de até 120 palavras por resposta.

| Run | Par | Ordem | Condição | C1 (Bytes vs Tokens) | C2 (Lógica / Continuidade) | C3 (Citação da Fonte) | Extensão (Palavras) | Veredito |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 1 | A | `contexto_completo` | **PASS** | **PASS** | **PASS** | 101 palavras (≤ 120) | **APROVADO** |
| **2** | 1 | B | `selecao_mimir` | **PASS** | **PASS** | **PASS** | 99 palavras (≤ 120) | **APROVADO** |
| **3** | 2 | B | `selecao_mimir` | **PASS** | **PASS** | **PASS** | 95 palavras (≤ 120) | **APROVADO** |
| **4** | 2 | A | `contexto_completo` | **PASS** | **PASS** | **PASS** | 92 palavras (≤ 120) | **APROVADO** |
| **5** | 3 | A | `contexto_completo` | **PASS** | **PASS** | **PASS** | 103 palavras (≤ 120) | **APROVADO** |
| **6** | 3 | B | `selecao_mimir` | **PASS** | **PASS** | **PASS** | 99 palavras (≤ 120) | **APROVADO** |

### Justificativas por Posição

1. **Run 1 (`response-1.txt`, 101 palavras)**:
   - *C1 (PASS)*: Responde negativamente; especifica que mede tamanho em bytes UTF-8 de `JSON.stringify(value)`, limite conservador, sem tokens de modelo nem economia.
   - *C2 (PASS)*: Explica iteração sequencial cumulativa no envelope `{ ok: true, data: next }` sob `budget`; confirma que o descarte não interrompe o laço e item menor posterior entra se couber.
   - *C3 (PASS)*: Cita `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
2. **Run 2 (`response-2.txt`, 99 palavras)**:
   - *C1 (PASS)*: Nega medição de tokens; indica bytes UTF-8 de `JSON.stringify(value)` como teto superior sem promessa de economia.
   - *C2 (PASS)*: Descreve montagem de candidato cumulativo sob `budget`; pontua que descartar não encerra o laço e candidato menor cabe.
   - *C3 (PASS)*: Cita a fonte e revisão exatas.
3. **Run 3 (`response-3.txt`, 95 palavras)**:
   - *C1 (PASS)*: Distingue bytes UTF-8 do JSON de contagem real de modelo ou economia.
   - *C2 (PASS)*: Explica montagem com `estimatedTokens: budget` e continuidade do laço após descarte.
   - *C3 (PASS)*: Cita a fonte e revisão exatas.
4. **Run 4 (`response-4.txt`, 92 palavras)**:
   - *C1 (PASS)*: Nega tokens reais; aponta bytes UTF-8 de `JSON.stringify(value)` como teto conservador.
   - *C2 (PASS)*: Detalha inclusão condicional `<= budget` e laço contínuo com itens rejeitados não acumulados.
   - *C3 (PASS)*: Cita a fonte e revisão exatas.
5. **Run 5 (`response-5.txt`, 103 palavras)**:
   - *C1 (PASS)*: Distingue bytes UTF-8 serializados de tokens reais.
   - *C2 (PASS)*: Detalha envelope cumulativo sob orçamento e laço contínuo testando candidatos posteriores.
   - *C3 (PASS)*: Cita a fonte e revisão exatas.
6. **Run 6 (`response-6.txt`, 99 palavras)**:
   - *C1 (PASS)*: Nega tokens de modelo e economia; define como limite conservador em bytes UTF-8.
   - *C2 (PASS)*: Detalha critério do envelope cumulativo e continuidade do laço com itens menores.
   - *C3 (PASS)*: Cita a fonte e revisão exatas.

Todas as respostas apresentam conformidade factual estrita ao código [`src/optimization/index.ts`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts). Nenhuma resposta inventou suporte a tokenizadores reais ou alucinou comportamentos.

---

## 2. Auditoria Aritmética e de Métricas

### 2.1. Execuções e Exclusões
- Total de chamadas planejadas e executadas: 6 (3 pares em desenho balanceado AB/BA/AB).
- Status: 6/6 `completed`, `exit_code: 0`, `timeout: false`, `tools_detected: false`.
- Exclusões globais e por métrica: zero (`exclusions: []`, `metric_exclusions: {}`).

### 2.2. Aritmética de Tokens e Não-Duplicação de Cache
Para cada execução, verificou-se $\text{total\_tokens} = \text{input\_tokens} + \text{output\_tokens}$. O campo `cached_input_tokens` (12.288 tokens constantes em todas as 6 chamadas) é subconjunto lido do prompt (`usage_status: host-reported`) e **não foi somado duplamente**.

| Run | Condição | Input Tokens | Cache (lido) | Output Tokens | Total Tokens | $\text{In} + \text{Out} = \text{Tot}$ |
| :---: | :---: | ---: | ---: | ---: | ---: | :---: |
| 1 | `contexto_completo` (A) | 21.127 | 12.288 | 180 | 21.307 | $21.127 + 180 = 21.307$ (OK) |
| 2 | `selecao_mimir` (B) | 14.958 | 12.288 | 179 | 15.137 | $14.958 + 179 = 15.137$ (OK) |
| 3 | `selecao_mimir` (B) | 14.958 | 12.288 | 177 | 15.135 | $14.958 + 177 = 15.135$ (OK) |
| 4 | `contexto_completo` (A) | 21.127 | 12.288 | 170 | 21.297 | $21.127 + 170 = 21.297$ (OK) |
| 5 | `contexto_completo` (A) | 20.584 | 12.288 | 180 | 20.764 | $20.584 + 180 = 20.764$ (OK) |
| 6 | `selecao_mimir` (B) | 14.958 | 12.288 | 182 | 15.140 | $14.958 + 182 = 15.140$ (OK) |

### 2.3. Aritmética de Tempo e Isolamento do Setup
- `setup_ms` em B: 1.400,59 ms (Run 2, cold setup do SQLite e fixture), 17,91 ms (Run 3), 12,31 ms (Run 6). Registrado isoladamente; **não** entra em `wall_ms` nem em `end_to_end_ms`.
- `close_ms` em B: 0,97 ms, 1,03 ms, 0,77 ms (isolado).
- `end_to_end_ms = wall_ms + retrieval_ms` (somado exatamente 1x em B; 0x em A). Auditado sem divergências (diferença absoluta $< 10^{-9}$ ms em todos os runs).

| Run | Condição | Setup (ms) | Retrieval (ms) | Wall (ms) | End-to-End (ms) |
| :---: | :---: | ---: | ---: | ---: | ---: |
| 1 | `contexto_completo` | 0,00 | 0,000000 | 7.726,095978 | 7.726,095978 |
| 2 | `selecao_mimir` | 1.400,585499 | 2,687013 | 8.544,825698 | 8.547,512711 |
| 3 | `selecao_mimir` | 17,909656 | 0,499880 | 6.118,620326 | 6.119,120206 |
| 4 | `contexto_completo` | 0,00 | 0,000000 | 6.297,200347 | 6.297,200347 |
| 5 | `contexto_completo` | 0,00 | 0,000000 | 7.338,559344 | 7.338,559344 |
| 6 | `selecao_mimir` | 12,312324 | 0,644314 | 8.366,788500 | 8.367,432814 |

---

## 3. Tabela de Medianas e Deltas Pareados

### 3.1. Medianas por Condição ($n=3$ cada)

| Métrica | Contexto Completo (A) | Seleção Mimir (B) |
| :--- | ---: | ---: |
| Input tokens reportados | 21.127 | 14.958 |
| Cache lido (subconjunto da entrada) | 12.288 | 12.288 |
| Output tokens reportados | 180 | 179 |
| Total tokens reportados | 21.297 | 15.137 |
| Tempo de processo do modelo (`wall_ms`), ms | 7.338,559344 | 8.366,788500 |
| Tempo composto (`end_to_end_ms`), ms | 7.338,559344 | 8.367,432814 |
| Primeira mensagem completa (`first_agent_msg`), ms | 6.631,928580 | 7.815,078198 |
| Tempo de busca local (`retrieval_ms`), ms | 0,000000 | 0,644314 |

### 3.2. Deltas Pareados ($B - A$)

| Métrica | Par 1 (Run 2 vs 1) | Par 2 (Run 3 vs 4) | Par 3 (Run 6 vs 5) | Mediana dos Deltas ($B - A$) |
| :--- | ---: | ---: | ---: | ---: |
| $\Delta$ Input tokens | -6.169 | -6.169 | -5.626 | **-6.169** |
| $\Delta$ Output tokens | -1 | +7 | +2 | **+2** |
| $\Delta$ Total tokens | -6.170 | -6.162 | -5.624 | **-6.162** |
| $\Delta$ End-to-end (ms) | +821,416733 | -178,080141 | +1.028,873470 | **+821,416733** |
| $\Delta$ Wall (ms) | +818,729720 | -178,580021 | +1.028,229156 | **+818,729720** |
| $\Delta$ Retrieval (ms) | +2,687013 | +0,499880 | +0,644314 | **+0,644314** |
| $\Delta$ First agent msg (ms) | +645,297281 | -268,225238 | +1.183,149618 | **+645,297281** |

> [!NOTE]
> **Distinção Estatística**: A mediana dos deltas pareados de tokens totais é **-6.162 tokens** (redução mediana de 28,93%), enquanto a diferença das medianas brutas é $15.137 - 21.297 = \mathbf{-6.160\text{ tokens}}$ (-28,92%). No tempo composto, a mediana dos deltas pareados é **+821,42 ms**, enquanto a diferença das medianas é **+1.028,87 ms**. As fórmulas são matematicamente distintas e ambas foram apuradas corretamente no `summary.json`.

---

## 4. Auditoria de Contextos, Hashes e Não-Duplicação

Ao contrário das execuções exploratórias anteriores (Task64/65), a Condição B **não duplicou** o código-fonte:
1. **Condição A (`contexto_completo`)**:
   - Fornece integralmente os 6 módulos reais do repositório no commit `166e3cf`.
   - Contexto JSON normalizado: 27.734 bytes (SHA-256: `45323cbb5b87e9efb97cd2d1ee0349f5a02b3400a694456b1e2372feab2f6bc9`).
   - Envelope textual do prompt: 26.668 bytes (SHA-256: `224858517c3024e267cbd71becb75cc60e367ea9ebbc1933f53732e0cbb8d963`).
2. **Condição B (`selecao_mimir`)**:
   - Fornece **estritamente** a unidade retornada pela busca local (`src/optimization/index.ts`), sem injeção do restante do corpus e sem duplicar o preâmbulo.
   - Contexto JSON normalizado: 975 bytes (SHA-256: `52e0a26eb91133be003f28d214f388c69939b855e5877e4e890d28ced23cdb71`).
   - Envelope textual do prompt: 1.280 bytes (SHA-256: `9c039abdab2101901483fdc9f7183582c1ed78f6fd59283f1a85d4f8069776bf`).
   - Os hashes SHA-256 e tamanhos em bytes são idênticos em todas as três repetições de cada condição.

---

## 5. Limitações e Ressalvas Metodológicas

1. **Interpretação da Redução de Tokens**: A redução de tokens na Condição B reflete unicamente o fato de o prompt conter menos contexto (1 módulo de 850 bytes vs 6 módulos de 26,6 KB). Trata-se de economia proporcionada pelo corte de contexto desnecessário via busca/recuperação, e **não de alteração no motor de inferência, tokenizador ou compressão interna**.
2. **Latência de Inferência**: O tempo composto e de processo do modelo foi mediano superior na Condição B (+821,42 ms mediano pareado). Com $n=3$ pares em ambiente de nuvem, essa flutuação reflete a variabilidade da carga externa do provedor e tempo de raciocínio, sem significância causal atribuível ao Mimir.
3. **Identidade do Backend**: O modelo solicitado foi `gpt-6.1-sol` com esforço `low`. A identidade pública de backend e snapshot permanece `"unavailable"`; `model_divergence: null` indica ausência de divergência detectável no payload público, sem garantir snapshot invariável.
4. **Variabilidade Interna e Cache**: Observou-se cache idêntico de 12.288 tokens em todos os 6 disparos. Na Condição A, houve variação interna não controlada de 543 tokens entre as execuções (Runs 1 e 4 com 21.127 tokens vs Run 5 com 20.584 tokens) apesar do envelope textual rigorosamente idêntico (26.668 bytes).
5. **Métricas Não Disponíveis**: TTFT e custo financeiro permanecem `"unavailable"`.

---

## 6. Conclusão da Revisão

O conjunto de evidências em `/tmp/mimir-context-selection-task68-20261027` é matematicamente consistente, metodologicamente íntegro e atende plenamente aos critérios de qualidade factual e citações. O parecer é **APPROVE**.
