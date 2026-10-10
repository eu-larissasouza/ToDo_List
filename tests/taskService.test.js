import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  criarTarefa,
  definirStatusTarefa,
  excluirTarefa,
  FILTRO_TAREFA,
  listarTarefas,
  obterResumoTarefas,
  obterTarefa,
  pesquisarTarefas,
  STATUS_TAREFA,
  atualizarTarefa,
} from "../js/taskService.js";

const CHAVE_TAREFAS = "todo-list.tarefas.v1";
const DATA_FIXA = new Date("2026-10-09T12:00:00.000Z");

class ArmazenamentoFalso {
  dados = new Map();

  getItem(chave) {
    return this.dados.get(chave) ?? null;
  }

  setItem(chave, valor) {
    this.dados.set(chave, String(valor));
  }
}

function criarTarefaDeTeste(armazenamento, dados = {}) {
  return criarTarefa(
    { titulo: "  Comprar pão  ", ...dados },
    {
      armazenamento,
      agora: () => DATA_FIXA,
      gerarIdentificador: () => "tarefa-1",
    },
  );
}

describe("criarTarefa", () => {
  it("cria e persiste uma tarefa com identificador e status iniciais", () => {
    const armazenamento = new ArmazenamentoFalso();
    const tarefa = criarTarefaDeTeste(armazenamento, {
      descricao: "  Padaria perto de casa  ",
      dataLimite: "2026-10-10",
    });

    assert.deepEqual(tarefa, {
      id: "tarefa-1",
      titulo: "Comprar pão",
      descricao: "Padaria perto de casa",
      dataLimite: "2026-10-10",
      status: STATUS_TAREFA.PENDENTE,
      criadoEm: DATA_FIXA.toISOString(),
      atualizadoEm: DATA_FIXA.toISOString(),
    });
    assert.deepEqual(JSON.parse(armazenamento.getItem(CHAVE_TAREFAS)), [tarefa]);
  });

  it("gera um identificador automaticamente quando não é injetado", () => {
    const armazenamento = new ArmazenamentoFalso();
    const tarefa = criarTarefa({ titulo: "Estudar" }, { armazenamento });

    assert.equal(typeof tarefa.id, "string");
    assert.notEqual(tarefa.id, "");
  });

  it("rejeita título vazio, dados inválidos e data inexistente sem salvar", () => {
    const armazenamento = new ArmazenamentoFalso();

    assert.throws(() => criarTarefa({ titulo: "  " }, { armazenamento }), /obrigatório/);
    assert.throws(() => criarTarefa(null, { armazenamento }), /objeto/);
    assert.throws(
      () => criarTarefa({ titulo: "Prazo", dataLimite: "2026-02-30" }, { armazenamento }),
      /data limite válida/,
    );
    assert.equal(armazenamento.getItem(CHAVE_TAREFAS), null);
  });
});

describe("operações de tarefas", () => {
  it("atualiza dados editáveis sem alterar o status ou a data de criação", () => {
    const armazenamento = new ArmazenamentoFalso();
    const tarefa = criarTarefaDeTeste(armazenamento);
    definirStatusTarefa(tarefa.id, STATUS_TAREFA.EM_ANDAMENTO, {
      armazenamento,
      agora: () => new Date("2026-10-09T13:00:00.000Z"),
    });

    const atualizada = atualizarTarefa(
      tarefa.id,
      { titulo: "  Comprar leite  ", descricao: "" },
      {
        armazenamento,
        agora: () => new Date("2026-10-09T14:00:00.000Z"),
      },
    );

    assert.equal(atualizada.titulo, "Comprar leite");
    assert.equal(atualizada.descricao, "");
    assert.equal(atualizada.status, STATUS_TAREFA.EM_ANDAMENTO);
    assert.equal(atualizada.criadoEm, DATA_FIXA.toISOString());
    assert.equal(atualizada.atualizadoEm, "2026-10-09T14:00:00.000Z");
  });

  it("define qualquer um dos três status e rejeita status desconhecido", () => {
    const armazenamento = new ArmazenamentoFalso();
    const tarefa = criarTarefaDeTeste(armazenamento);

    for (const status of Object.values(STATUS_TAREFA)) {
      assert.equal(
        definirStatusTarefa(tarefa.id, status, { armazenamento }).status,
        status,
      );
    }
    assert.throws(
      () => definirStatusTarefa(tarefa.id, "cancelada", { armazenamento }),
      /Status de tarefa inválido/,
    );
  });

  it("filtra e pesquisa tarefas sem alterar a coleção original", () => {
    const armazenamento = new ArmazenamentoFalso();
    const primeira = criarTarefaDeTeste(armazenamento);
    const segunda = criarTarefa(
      { titulo: "Estudar JavaScript", descricao: "Prova final" },
      { armazenamento, gerarIdentificador: () => "tarefa-2" },
    );
    definirStatusTarefa(segunda.id, STATUS_TAREFA.FINALIZADO, { armazenamento });

    assert.deepEqual(
      listarTarefas({ filtro: FILTRO_TAREFA.PENDENTE, armazenamento }).map(({ id }) => id),
      [primeira.id],
    );
    assert.deepEqual(
      listarTarefas({
        filtro: FILTRO_TAREFA.FINALIZADO,
        consulta: "JAVASCRIPT",
        armazenamento,
      }).map(({ id }) => id),
      [segunda.id],
    );
    assert.equal(pesquisarTarefas([primeira, segunda], "  ").length, 2);
    assert.throws(() => listarTarefas({ filtro: "desconhecido", armazenamento }), /Filtro/);
  });

  it("localiza, exclui e calcula o resumo por status", () => {
    const armazenamento = new ArmazenamentoFalso();
    const pendente = criarTarefaDeTeste(armazenamento);
    const emAndamento = criarTarefa(
      { titulo: "Ler" },
      { armazenamento, gerarIdentificador: () => "tarefa-2" },
    );
    const finalizada = criarTarefa(
      { titulo: "Revisar" },
      { armazenamento, gerarIdentificador: () => "tarefa-3" },
    );
    definirStatusTarefa(emAndamento.id, STATUS_TAREFA.EM_ANDAMENTO, { armazenamento });
    definirStatusTarefa(finalizada.id, STATUS_TAREFA.FINALIZADO, { armazenamento });

    assert.deepEqual(obterResumoTarefas({ armazenamento }), {
      total: 3,
      pendentes: 1,
      emAndamento: 1,
      finalizadas: 1,
    });
    assert.equal(obterTarefa(pendente.id, { armazenamento }).id, pendente.id);
    assert.equal(obterTarefa("inexistente", { armazenamento }), null);
    assert.equal(excluirTarefa(pendente.id, { armazenamento }).id, pendente.id);
    assert.equal(obterResumoTarefas({ armazenamento }).total, 2);
    assert.throws(() => excluirTarefa("inexistente", { armazenamento }), /não encontrada/);
  });

  it("rejeita identificadores vazios e datas de relógio inválidas", () => {
    const armazenamento = new ArmazenamentoFalso();

    assert.throws(() => obterTarefa(" ", { armazenamento }), /identificador/);
    assert.throws(
      () => criarTarefa({ titulo: "Tarefa" }, { armazenamento, agora: () => "hoje" }),
      /data válida/,
    );
  });
});
