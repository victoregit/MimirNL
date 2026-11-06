# Corpus piloto v0.3 — proposta revisão 1

**Estado: proposta não aceita, não executada; gold pendente.** Contrato [0.1](contrato.md) não aprovado; método em [metodologia.md](metodologia.md). Base documental atual commitada: `166e3cf047b2078952e43dc8e9171e053e99e2ce`. Os registros anteriores sobre entregas não commitadas permanecem históricos; preflight e métricas já existem neste HEAD.

Três casos reais de leitura do código versionado do próprio MimirNL, sem dados pessoais, DB ou fontes externas. São candidatos não ilustrativos, todos `development`; não representam holdout nem carga de trabalho representativa. Leitura de fontes para elaborar a proposta não é execução de benchmark. Nenhuma resposta foi conferida por revisor independente.

## Fontes congeladas e respostas candidatas

Hash SHA-256 calculado sobre bytes do trecho inclusivo obtido por `git show COMMIT:caminho`, incluindo a quebra final original. Não normalizar CRLF, espaços ou UTF-8. Conferir contra o objeto Git fixado, não contra arquivo de trabalho potencialmente alterado. Cada caso tem uma unidade relevante proposta; cada arquivo contém somente a unidade explicitada no JSON, sem chunks implícitos.

- `pilot-approval`: [src/learning/index.ts](../../../src/learning/index.ts), linhas 1–16; unidade `code-approval/behavior`; SHA-256 `8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b`. O link abre o arquivo corrente; commit e intervalo acima são a autoridade.
- `pilot-budget`: [src/optimization/index.ts](../../../src/optimization/index.ts), linhas 1–27; unidade `code-budget/behavior`; SHA-256 `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473`. O link abre o arquivo corrente; commit e intervalo acima são a autoridade.
- `pilot-failure`: [src/security/index.ts](../../../src/security/index.ts), linhas 68–96; unidade `code-failure/behavior`; SHA-256 `41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa`. O link abre o arquivo corrente; commit e intervalo acima são a autoridade.

## Fixture documental privada de avaliação

O bloco inteiro contém respostas e rubricas: uso local do avaliador, nunca contexto, histórico, seed ou memória do modelo. “Privada” é uma fronteira de uso, não uma promessa de ACL ou segredo neste repositório; não publicar o gold como holdout. Não criar arquivo público de execução a partir deste bloco. Um futuro exportador deverá usar allowlist somente de `model_context` e dos trechos autorizados, sem carregar este documento no processo do modelo. `permissions_ref=null` não autoriza envio.

O array é compatível com validação estrutural do preflight; `planCases` deve rejeitá-lo enquanto revisão/gold/permissões estiverem pendentes. Validação não comprova fontes nem aceite. Sucesso proposto: ambos os itens da rubrica satisfeitos; notas binárias, score ponderado dividido pela soma dos pesos (3), sucesso apenas score 1. O revisor poderá exigir revisão do caso.

```json
[
  {
    "contract_version": "0.1",
    "case_id": "pilot-approval",
    "case_revision": 1,
    "illustrative_only": false,
    "split": "development",
    "source": {
      "repository": "MimirNL",
      "commit_sha": "166e3cf047b2078952e43dc8e9171e053e99e2ce"
    },
    "sources": [
      {
        "source_id": "code-approval",
        "unit_id": "behavior",
        "path": "src/learning/index.ts",
        "start_line": 1,
        "end_line": 16,
        "excerpt": "import { AppError } from \"../security/index.js\";\nexport function nextStatus(\n  action: string,\n  current: string,\n  explicitApproval: boolean,\n): string {\n  if (action === \"approve\" && !explicitApproval)\n    throw new AppError(\n      \"APPROVAL_REQUIRED\",\n      \"Verification requires explicit user approval.\",\n    );\n  if (action === \"approve\") return \"verified\";\n  if (action === \"reject\") return \"rejected\";\n  if (action === \"deprecate\" || action === \"supersede\") return \"deprecated\";\n  return current;\n}\n",
        "sha256": "8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b"
      }
    ],
    "model_context": {
      "task": "Como nextStatus trata approve sem aprovação explícita, approve autorizado, reject, supersede e uma ação desconhecida? Cite a unidade.",
      "allowed_source_ids": ["code-approval"]
    },
    "evaluation_private": {
      "gold_status": "pending",
      "expected_answer": "Sem aprovação explícita, approve lança AppError APPROVAL_REQUIRED. Approve autorizado retorna verified; reject retorna rejected; supersede retorna deprecated; ação desconhecida mantém current.",
      "relevant_unit_ids": ["code-approval/behavior"],
      "success_criteria": [
        "Explica a exceção de approve e as quatro saídas sem inventar transições.",
        "Citar code-approval/behavior e não contradizer a fonte."
      ],
      "rubric": [
        {
          "id": "behavior",
          "criterion": "Explica a exceção de approve e as quatro saídas sem inventar transições.",
          "weight": 2
        },
        {
          "id": "citation",
          "criterion": "Cita code-approval/behavior sustentando a resposta.",
          "weight": 1
        }
      ]
    },
    "review": {
      "author": "equipe-principal/codex-task54",
      "source_reviewer": null,
      "codex_review_ref": null,
      "human_acceptance_ref": null,
      "decision": "pending",
      "notes": "Proposta fundamentada pelo autor; conferência independente e aceite humano pendentes."
    },
    "permissions_ref": null
  },
  {
    "contract_version": "0.1",
    "case_id": "pilot-budget",
    "case_revision": 1,
    "illustrative_only": false,
    "split": "development",
    "source": {
      "repository": "MimirNL",
      "commit_sha": "166e3cf047b2078952e43dc8e9171e053e99e2ce"
    },
    "sources": [
      {
        "source_id": "code-budget",
        "unit_id": "behavior",
        "path": "src/optimization/index.ts",
        "start_line": 1,
        "end_line": 27,
        "excerpt": "// UTF-8 bytes are a conservative upper bound, not a model tokenizer or savings metric.\nexport const estimateTokens = (value: unknown): number =>\n  Buffer.byteLength(JSON.stringify(value), \"utf8\");\nexport function optimize<T>(\n  items: T[],\n  budget: number,\n): { memories: T[]; estimatedTokens: number; estimator: string } {\n  const result = {\n    memories: [] as T[],\n    estimatedTokens: 0,\n    estimator: \"conservative UTF-8 byte upper bound; not model tokens\",\n  };\n  for (const item of items) {\n    const next = {\n      ...result,\n      memories: [...result.memories, item],\n      estimatedTokens: budget,\n    };\n    if (estimateTokens({ ok: true, data: next }) <= budget)\n      result.memories.push(item);\n  }\n  result.estimatedTokens = estimateTokens({\n    ok: true,\n    data: { ...result, estimatedTokens: budget },\n  });\n  return result;\n}\n",
        "sha256": "832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473"
      }
    ],
    "model_context": {
      "task": "O estimador mede tokens reais? Como optimize escolhe itens e pode um item posterior caber após outro ser omitido? Cite a unidade.",
      "allowed_source_ids": ["code-budget"]
    },
    "evaluation_private": {
      "gold_status": "pending",
      "expected_answer": "estimateTokens mede bytes UTF-8 do JSON serializado, limite conservador declarado, não tokenizer real. optimize percorre itens na ordem e inclui um item apenas se o envelope candidato serializado couber no budget; não usa break, logo um item posterior menor pode caber após uma omissão. Não demonstra economia de tokens.",
      "relevant_unit_ids": ["code-budget/behavior"],
      "success_criteria": [
        "Distingue bytes de tokens, descreve o envelope e a continuação do laço após omissão.",
        "Citar code-budget/behavior e não contradizer a fonte."
      ],
      "rubric": [
        {
          "id": "behavior",
          "criterion": "Distingue bytes de tokens, descreve o envelope e a continuação do laço após omissão.",
          "weight": 2
        },
        {
          "id": "citation",
          "criterion": "Cita code-budget/behavior sustentando a resposta.",
          "weight": 1
        }
      ]
    },
    "review": {
      "author": "equipe-principal/codex-task54",
      "source_reviewer": null,
      "codex_review_ref": null,
      "human_acceptance_ref": null,
      "decision": "pending",
      "notes": "Proposta fundamentada pelo autor; conferência independente e aceite humano pendentes."
    },
    "permissions_ref": null
  },
  {
    "contract_version": "0.1",
    "case_id": "pilot-failure",
    "case_revision": 1,
    "illustrative_only": false,
    "split": "development",
    "source": {
      "repository": "MimirNL",
      "commit_sha": "166e3cf047b2078952e43dc8e9171e053e99e2ce"
    },
    "sources": [
      {
        "source_id": "code-failure",
        "unit_id": "behavior",
        "path": "src/security/index.ts",
        "start_line": 68,
        "end_line": 96,
        "excerpt": "export function failure(e: unknown) {\n  // Keep local exception text and paths private, but retain bounded machine\n  // codes so CI and callers can distinguish I/O and SQLite failures.\n  const local =\n    e instanceof Error\n      ? (e as NodeJS.ErrnoException & { errcode?: number })\n      : undefined;\n  const causeCode =\n    !(e instanceof AppError) &&\n    typeof local?.code === \"string\" &&\n    /^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/.test(local.code)\n      ? local.code\n      : undefined;\n  return {\n    ok: false as const,\n    error: {\n      code: e instanceof AppError ? e.code : \"INVALID_REQUEST\",\n      message:\n        e instanceof AppError\n          ? e.message\n          : \"Invalid request or local operation failed.\",\n      ...(causeCode ? { causeCode } : {}),\n      ...(causeCode === \"ERR_SQLITE_ERROR\" &&\n      Number.isSafeInteger(local?.errcode)\n        ? { sqliteCode: local!.errcode }\n        : {}),\n    },\n  };\n}\n",
        "sha256": "41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa"
      }
    ],
    "model_context": {
      "task": "Como failure trata Error comum, causeCode e sqliteCode sem expor mensagens locais? Cite a unidade.",
      "allowed_source_ids": ["code-failure"]
    },
    "evaluation_private": {
      "gold_status": "pending",
      "expected_answer": "Error comum recebe INVALID_REQUEST e mensagem genérica. causeCode só é preservado para erro que não seja AppError, com code string aceito pela regex E[A-Z0-9_]{1,63} ou SQLITE_[A-Z_]{1,63}. sqliteCode exige causeCode ERR_SQLITE_ERROR e errcode inteiro seguro. AppError preserva seu próprio code e message.",
      "relevant_unit_ids": ["code-failure/behavior"],
      "success_criteria": [
        "Explica mensagem genérica, exceção AppError, filtro de causeCode e condição de sqliteCode.",
        "Citar code-failure/behavior e não contradizer a fonte."
      ],
      "rubric": [
        {
          "id": "behavior",
          "criterion": "Explica mensagem genérica, exceção AppError, filtro de causeCode e condição de sqliteCode.",
          "weight": 2
        },
        {
          "id": "citation",
          "criterion": "Cita code-failure/behavior sustentando a resposta.",
          "weight": 1
        }
      ]
    },
    "review": {
      "author": "equipe-principal/codex-task54",
      "source_reviewer": null,
      "codex_review_ref": null,
      "human_acceptance_ref": null,
      "decision": "pending",
      "notes": "Proposta fundamentada pelo autor; conferência independente e aceite humano pendentes."
    },
    "permissions_ref": null
  }
]
```

## Aceite pendente

Revisor diferente do autor deve conferir cada intervalo, hash, pergunta, resposta e relevância diretamente no commit fixado, registrar divergências e referência de revisão independente; mantenedor registra aceite humano. Só então versionar alterações e decidir accepted/validated. Não preencher referências fictícias nem trocar os estados para testar planejamento.

## Proposta de ampliação offline — Task83

Seis casos development adicionais em [casos-ampliados.md](casos-ampliados.md) e [corpus-ampliado.json](corpus-ampliado.json), total proposto nove. Revisão independente Task84 e aceite pendentes; esta ampliação não altera os três casos originais nem autoriza execução.
