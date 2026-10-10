import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { carregarTarefas, salvarTarefas } from "../js/taskStorage.js";

const CHAVE_TAREFAS = "todo-list.tarefas.v1";

class ArmazenamentoFalso {
  dados = new Map();

  getItem(chave) {
    return this.dados.get(chave) ?? null;
  }

  setItem(chave, valor) {
    this.dados.set(chave, String(valor));
  }
}

describe("armazenamento de tarefas", () => {
  it("retorna uma lista vazia quando ainda não há dados", () => {
    assert.deepEqual(carregarTarefas(new ArmazenamentoFalso()), []);
  });

  it("salva e carrega uma coleção no formato atual", () => {
    const armazenamento = new ArmazenamentoFalso();
    const tarefas = [
      {
        id: "atual",
        titulo: "Formato atual",
        descricao: "",
        dataLimite: null,
        status: "em_andamento",
        criadoEm: "2026-10-08T12:00:00.000Z",
        atualizadoEm: "2026-10-08T12:00:00.000Z",
      },
    ];

    salvarTarefas(tarefas, armazenamento);
    assert.deepEqual(carregarTarefas(armazenamento), tarefas);
    assert.equal(armazenamento.getItem(CHAVE_TAREFAS), JSON.stringify(tarefas));
  });

  it("rejeita coleções, status e JSON inválidos com erros explícitos", () => {
    const armazenamento = new ArmazenamentoFalso();

    assert.throws(() => salvarTarefas({}, armazenamento), /formato inválido/);
    armazenamento.setItem(CHAVE_TAREFAS, "{");
    assert.throws(() => carregarTarefas(armazenamento), /JSON válido/);

    armazenamento.setItem(
      CHAVE_TAREFAS,
      JSON.stringify([
        {
          id: "invalida",
          titulo: "Status inválido",
          descricao: "",
          dataLimite: null,
          status: "pending",
          criadoEm: "2026-10-08T12:00:00.000Z",
          atualizadoEm: "2026-10-08T12:00:00.000Z",
        },
      ]),
    );
    assert.throws(() => carregarTarefas(armazenamento), /formato inválido/);
    armazenamento.setItem(CHAVE_TAREFAS, "null");
    armazenamento.setItem(CHAVE_TAREFAS, "null");
    assert.throws(() => carregarTarefas(armazenamento), /formato inválido/);
  });
});
