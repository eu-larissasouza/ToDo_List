import { carregarTarefas, salvarTarefas } from "./taskStorage.js";

export const STATUS_TAREFA = Object.freeze({
  PENDENTE: "pendente",
  EM_ANDAMENTO: "em_andamento",
  FINALIZADO: "finalizado",
});

export const FILTRO_TAREFA = Object.freeze({
  TODAS: "todas",
  PENDENTE: STATUS_TAREFA.PENDENTE,
  EM_ANDAMENTO: STATUS_TAREFA.EM_ANDAMENTO,
  FINALIZADO: STATUS_TAREFA.FINALIZADO,
});

function gerarId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function obterDataHoraAgora(agora) {
  const dataHora = agora();
  if (!(dataHora instanceof Date) || Number.isNaN(dataHora.getTime())) {
    throw new TypeError("A função de data deve retornar uma data válida.");
  }
  return dataHora.toISOString();
}

function normalizarDataLimite(valor) {
  if (valor === undefined || valor === null || valor === "") return null;

  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new TypeError("A data limite deve estar no formato AAAA-MM-DD.");
  }

  const data = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    throw new TypeError("Informe uma data limite válida.");
  }

  return valor;
}

function normalizarDadosTarefa(dados) {
  if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
    throw new TypeError("Os dados da tarefa devem ser informados em um objeto.");
  }

  if (typeof dados.titulo !== "string" || dados.titulo.trim() === "") {
    throw new TypeError("O título da tarefa é obrigatório.");
  }

  if (dados.descricao != null && typeof dados.descricao !== "string") {
    throw new TypeError("A descrição deve ser um texto.");
  }

  return {
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() ?? "",
    dataLimite: normalizarDataLimite(dados.dataLimite),
  };
}

function encontrarIndiceTarefa(tarefas, idTarefa) {
  if (typeof idTarefa !== "string" || idTarefa.trim() === "") {
    throw new TypeError("O identificador da tarefa é obrigatório.");
  }

  const indice = tarefas.findIndex((tarefa) => tarefa.id === idTarefa);
  if (indice === -1) throw new Error("Tarefa não encontrada.");
  return indice;
}

/** Filtra uma coleção pelo status selecionado. */
export function filtrarTarefas(tarefas, filtro = FILTRO_TAREFA.TODAS) {
  if (!Array.isArray(tarefas)) throw new TypeError("A lista de tarefas deve ser um array.");
  if (!Object.values(FILTRO_TAREFA).includes(filtro)) {
    throw new TypeError("Filtro de tarefas inválido.");
  }

  if (filtro === FILTRO_TAREFA.TODAS) return [...tarefas];
  return tarefas.filter((tarefa) => tarefa.status === filtro);
}

/** Pesquisa no título e na descrição, ignorando diferenças entre maiúsculas e minúsculas. */
export function pesquisarTarefas(tarefas, consulta = "") {
  if (!Array.isArray(tarefas)) throw new TypeError("A lista de tarefas deve ser um array.");
  if (typeof consulta !== "string") throw new TypeError("A pesquisa deve ser um texto.");

  const consultaNormalizada = consulta.trim().toLocaleLowerCase("pt-BR");
  if (!consultaNormalizada) return [...tarefas];

  return tarefas.filter((tarefa) =>
    `${tarefa.titulo} ${tarefa.descricao}`
      .toLocaleLowerCase("pt-BR")
      .includes(consultaNormalizada),
  );
}

/** Devolve tarefas filtradas e pesquisadas para a listagem. */
export function listarTarefas(
  { filtro = FILTRO_TAREFA.TODAS, consulta = "", armazenamento } = {},
) {
  return filtrarTarefas(pesquisarTarefas(carregarTarefas(armazenamento), consulta), filtro);
}

/** Procura uma tarefa pelo identificador; devolve null quando não existir. */
export function obterTarefa(idTarefa, { armazenamento } = {}) {
  if (typeof idTarefa !== "string" || idTarefa.trim() === "") {
    throw new TypeError("O identificador da tarefa é obrigatório.");
  }
  return carregarTarefas(armazenamento).find((tarefa) => tarefa.id === idTarefa) ?? null;
}

/** Cria uma tarefa pendente. A descrição e a data limite são opcionais. */
export function criarTarefa(
  dados,
  { armazenamento, agora = () => new Date(), gerarIdentificador = gerarId } = {},
) {
  const camposTarefa = normalizarDadosTarefa(dados);
  const tarefas = carregarTarefas(armazenamento);
  const dataHora = obterDataHoraAgora(agora);
  const tarefa = {
    id: gerarIdentificador(),
    ...camposTarefa,
    status: STATUS_TAREFA.PENDENTE,
    criadoEm: dataHora,
    atualizadoEm: dataHora,
  };

  tarefas.push(tarefa);
  salvarTarefas(tarefas, armazenamento);
  return tarefa;
}

/** Atualiza os campos editáveis e mantém o status e a data de criação. */
export function atualizarTarefa(
  idTarefa,
  dados,
  { armazenamento, agora = () => new Date() } = {},
) {
  const tarefas = carregarTarefas(armazenamento);
  const indice = encontrarIndiceTarefa(tarefas, idTarefa);
  const tarefaAtualizada = {
    ...tarefas[indice],
    ...normalizarDadosTarefa(dados),
    atualizadoEm: obterDataHoraAgora(agora),
  };

  tarefas[indice] = tarefaAtualizada;
  salvarTarefas(tarefas, armazenamento);
  return tarefaAtualizada;
}

/** Define explicitamente uma tarefa como pendente, em andamento ou finalizada. */
export function definirStatusTarefa(
  idTarefa,
  status,
  { armazenamento, agora = () => new Date() } = {},
) {
  if (!Object.values(STATUS_TAREFA).includes(status)) {
    throw new TypeError("Status de tarefa inválido.");
  }

  const tarefas = carregarTarefas(armazenamento);
  const indice = encontrarIndiceTarefa(tarefas, idTarefa);
  const tarefaAtualizada = {
    ...tarefas[indice],
    status,
    atualizadoEm: obterDataHoraAgora(agora),
  };

  tarefas[indice] = tarefaAtualizada;
  salvarTarefas(tarefas, armazenamento);
  return tarefaAtualizada;
}

/** Exclui uma tarefa e devolve o registro removido. */
export function excluirTarefa(idTarefa, { armazenamento } = {}) {
  const tarefas = carregarTarefas(armazenamento);
  const indice = encontrarIndiceTarefa(tarefas, idTarefa);
  const [tarefaExcluida] = tarefas.splice(indice, 1);

  salvarTarefas(tarefas, armazenamento);
  return tarefaExcluida;
}

/** Calcula os totais de tarefas por status. */
export function obterResumoTarefas({ armazenamento } = {}) {
  const tarefas = carregarTarefas(armazenamento);

  return {
    total: tarefas.length,
    pendentes: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.PENDENTE).length,
    emAndamento: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.EM_ANDAMENTO).length,
    finalizadas: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.FINALIZADO).length,
  };
}
