const CHAVE_TAREFAS = "todo-list.tarefas.v1";
const STATUS_VALIDOS = new Set(["pendente", "em_andamento", "finalizado"]);

function obterArmazenamento(armazenamento) {
  if (armazenamento) return armazenamento;

  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("LocalStorage não está disponível neste ambiente.");
  }

  return window.localStorage;
}

function tarefaValida(tarefa) {
  return (
    tarefa !== null &&
    typeof tarefa === "object" &&
    typeof tarefa.id === "string" &&
    typeof tarefa.titulo === "string" &&
    typeof tarefa.descricao === "string" &&
    (tarefa.dataLimite === null || typeof tarefa.dataLimite === "string") &&
    STATUS_VALIDOS.has(tarefa.status) &&
    typeof tarefa.criadoEm === "string" &&
    typeof tarefa.atualizadoEm === "string"
  );
}

function validarColecaoTarefas(tarefas) {
  if (!Array.isArray(tarefas) || !tarefas.every(tarefaValida)) {
    throw new TypeError("A coleção de tarefas tem um formato inválido.");
  }
}

function lerJsonTarefas(valor) {
  try {
    return JSON.parse(valor);
  } catch (erro) {
    throw new Error("Os dados de tarefas salvos não são um JSON válido.", {
      cause: erro,
    });
  }
}

/** Lê e valida as tarefas salvas no navegador. */
export function carregarTarefas(armazenamento) {
  const armazenamentoLocal = obterArmazenamento(armazenamento);
  const tarefasSalvas = armazenamentoLocal.getItem(CHAVE_TAREFAS);

  if (tarefasSalvas === null) return [];

  const tarefas = lerJsonTarefas(tarefasSalvas);
  validarColecaoTarefas(tarefas);
  return tarefas;
}

/** Persiste a coleção inteira de tarefas no navegador. */
export function salvarTarefas(tarefas, armazenamento) {
  validarColecaoTarefas(tarefas);
  obterArmazenamento(armazenamento).setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}
