/* ARQUIVO GERADO por build.mjs. Não edite: altere main.js e rode `npm run build`. */
(() => {
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
function carregarTarefas(armazenamento) {
  const armazenamentoLocal = obterArmazenamento(armazenamento);
  const tarefasSalvas = armazenamentoLocal.getItem(CHAVE_TAREFAS);

  if (tarefasSalvas === null) return [];

  const tarefas = lerJsonTarefas(tarefasSalvas);
  validarColecaoTarefas(tarefas);
  return tarefas;
}

/** Persiste a coleção inteira de tarefas no navegador. */
function salvarTarefas(tarefas, armazenamento) {
  validarColecaoTarefas(tarefas);
  obterArmazenamento(armazenamento).setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}


const STATUS_TAREFA = Object.freeze({
  PENDENTE: "pendente",
  EM_ANDAMENTO: "em_andamento",
  FINALIZADO: "finalizado",
});

const FILTRO_TAREFA = Object.freeze({
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
function filtrarTarefas(tarefas, filtro = FILTRO_TAREFA.TODAS) {
  if (!Array.isArray(tarefas)) throw new TypeError("A lista de tarefas deve ser um array.");
  if (!Object.values(FILTRO_TAREFA).includes(filtro)) {
    throw new TypeError("Filtro de tarefas inválido.");
  }

  if (filtro === FILTRO_TAREFA.TODAS) return [...tarefas];
  return tarefas.filter((tarefa) => tarefa.status === filtro);
}

/** Pesquisa no título e na descrição, ignorando diferenças entre maiúsculas e minúsculas. */
function pesquisarTarefas(tarefas, consulta = "") {
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
function listarTarefas(
  { filtro = FILTRO_TAREFA.TODAS, consulta = "", armazenamento } = {},
) {
  return filtrarTarefas(pesquisarTarefas(carregarTarefas(armazenamento), consulta), filtro);
}

/** Procura uma tarefa pelo identificador; devolve null quando não existir. */
function obterTarefa(idTarefa, { armazenamento } = {}) {
  if (typeof idTarefa !== "string" || idTarefa.trim() === "") {
    throw new TypeError("O identificador da tarefa é obrigatório.");
  }
  return carregarTarefas(armazenamento).find((tarefa) => tarefa.id === idTarefa) ?? null;
}

/** Cria uma tarefa pendente. A descrição e a data limite são opcionais. */
function criarTarefa(
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
function atualizarTarefa(
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
function definirStatusTarefa(
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
function excluirTarefa(idTarefa, { armazenamento } = {}) {
  const tarefas = carregarTarefas(armazenamento);
  const indice = encontrarIndiceTarefa(tarefas, idTarefa);
  const [tarefaExcluida] = tarefas.splice(indice, 1);

  salvarTarefas(tarefas, armazenamento);
  return tarefaExcluida;
}

/** Calcula os totais de tarefas por status. */
function obterResumoTarefas({ armazenamento } = {}) {
  const tarefas = carregarTarefas(armazenamento);

  return {
    total: tarefas.length,
    pendentes: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.PENDENTE).length,
    emAndamento: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.EM_ANDAMENTO).length,
    finalizadas: tarefas.filter((tarefa) => tarefa.status === STATUS_TAREFA.FINALIZADO).length,
  };
}


const $ = (id) => document.getElementById(id);
const estado = { filtro: FILTRO_TAREFA.TODAS, consulta: "", editandoId: null, excluirId: null };

const ROTULO_STATUS = {
  [STATUS_TAREFA.PENDENTE]: "Pendente",
  [STATUS_TAREFA.EM_ANDAMENTO]: "Em andamento",
  [STATUS_TAREFA.FINALIZADO]: "Finalizada",
};

const FILTROS = [
  { valor: FILTRO_TAREFA.TODAS, rotulo: "Todas", campo: "total", icone: "fa-layer-group" },
  { valor: FILTRO_TAREFA.PENDENTE, rotulo: "Pendentes", campo: "pendentes", icone: "fa-clock" },
  { valor: FILTRO_TAREFA.EM_ANDAMENTO, rotulo: "Em andamento", campo: "emAndamento", icone: "fa-bars-progress" },
  { valor: FILTRO_TAREFA.FINALIZADO, rotulo: "Finalizadas", campo: "finalizadas", icone: "fa-circle-check" },
];

const ORDEM_STATUS = { pendente: 0, em_andamento: 0, finalizado: 1 };

const esc = (texto) =>
  texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- Datas ---------- */
function hojeISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatarData(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  const opcoes = { day: "numeric", month: "short" };
  if (a !== new Date().getFullYear()) opcoes.year = "numeric";
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", opcoes).replace(".", "");
}

function rotuloData(iso) {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  if (iso === hojeISO()) return "Hoje";
  if (iso === hojeISO(amanha)) return "Amanhã";
  return formatarData(iso);
}

/* ---------- Renderização ---------- */
function renderResumo() {
  const resumo = obterResumoTarefas();
  $("resumo").innerHTML = FILTROS.map(
    (f) => `<button type="button" class="stat" data-tipo="${f.valor}" data-filtro="${f.valor}" aria-pressed="${estado.filtro === f.valor}">
      <span class="ico"><i class="fa-solid ${f.icone}" aria-hidden="true"></i></span>
      <span class="numero">${resumo[f.campo]}</span><span class="rotulo">${f.rotulo}</span></button>`,
  ).join("");

  const pct = resumo.total ? Math.round((resumo.finalizadas / resumo.total) * 100) : 0;
  $("prog-texto").textContent = resumo.total
    ? `${resumo.finalizadas} de ${resumo.total} ${resumo.total === 1 ? "tarefa concluída" : "tarefas concluídas"}`
    : "Sem tarefas ainda";
  $("prog-pct").textContent = `${pct}%`;
  $("prog-barra").style.width = `${pct}%`;
  $("prog-trilho").setAttribute("aria-valuenow", pct);
  return resumo.total;
}

function htmlTarefa(t) {
  const atrasada = t.dataLimite && t.dataLimite < hojeISO() && t.status !== STATUS_TAREFA.FINALIZADO;
  const finalizada = t.status === STATUS_TAREFA.FINALIZADO;
  const chipData = t.dataLimite
    ? `<span class="chip${atrasada ? " atrasada" : t.dataLimite === hojeISO() && !finalizada ? " hoje" : ""}"><i class="fa-regular fa-calendar" aria-hidden="true"></i>${atrasada ? "Atrasada: " : ""}${rotuloData(t.dataLimite)}</span>`
    : "";
  const opcoes = Object.entries(ROTULO_STATUS)
    .map(([v, r]) => `<option value="${v}"${v === t.status ? " selected" : ""}>${r}</option>`)
    .join("");

  return `<li class="tarefa" data-id="${esc(t.id)}" data-status="${t.status}">
    <button type="button" class="check" data-acao="alternar" aria-pressed="${finalizada}"
      aria-label="${finalizada ? "Reabrir" : "Finalizar"} tarefa: ${esc(t.titulo)}"><i class="fa-solid fa-check" aria-hidden="true"></i></button>
    <div class="tarefa-corpo">
      <h3>${esc(t.titulo)}</h3>
      ${t.descricao ? `<p class="tarefa-desc">${esc(t.descricao)}</p>` : ""}
      ${chipData ? `<p class="meta">${chipData}</p>` : ""}
    </div>
    <div class="tarefa-acoes">
      <select data-acao="status" aria-label="Status de ${esc(t.titulo)}">${opcoes}</select>
      <button type="button" class="icone" data-acao="editar" aria-label="Editar ${esc(t.titulo)}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
      <button type="button" class="icone excluir" data-acao="excluir" aria-label="Excluir ${esc(t.titulo)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
    </div>
  </li>`;
}

function render() {
  try {
    $("erro-geral").hidden = true;
    const total = renderResumo();
    const tarefas = listarTarefas({ filtro: estado.filtro, consulta: estado.consulta })
      .map((t, i) => ({ t, i }))
      .sort(
        (a, b) =>
          ORDEM_STATUS[a.t.status] - ORDEM_STATUS[b.t.status] ||
          (a.t.dataLimite ?? "9999").localeCompare(b.t.dataLimite ?? "9999") ||
          a.i - b.i,
      )
      .map(({ t }) => t);

    $("lista").innerHTML = tarefas.map(htmlTarefa).join("");
    $("contagem").textContent = `${tarefas.length} ${tarefas.length === 1 ? "tarefa" : "tarefas"}`;

    const vazio = tarefas.length === 0;
    $("vazio").hidden = !vazio;
    if (vazio) {
      const semNenhuma = total === 0;
      $("vazio-titulo").textContent = semNenhuma ? "Nenhuma tarefa por aqui" : "Nada encontrado";
      $("vazio-texto").textContent = semNenhuma
        ? "Crie sua primeira tarefa para começar a organizar o seu dia."
        : "Nenhuma tarefa corresponde à busca ou ao filtro escolhido.";
      $("vazio-acao").hidden = !semNenhuma;
    }
  } catch (erro) {
    $("lista").innerHTML = "";
    $("vazio").hidden = true;
    $("erro-geral").hidden = false;
    $("erro-geral").textContent = `Não foi possível carregar as tarefas. ${erro.message}`;
  }
}

/* ---------- Aviso ---------- */
let temporizador;
function avisar(mensagem) {
  const toast = $("toast");
  toast.textContent = mensagem;
  toast.classList.add("visivel");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast.classList.remove("visivel"), 2600);
}

/* ---------- Formulário (criar / editar) ---------- */
function abrirFormulario(id = null) {
  estado.editandoId = id;
  const tarefa = id ? obterTarefa(id) : null;
  $("form-titulo").textContent = tarefa ? "Editar tarefa" : "Nova tarefa";
  $("f-enviar").textContent = tarefa ? "Salvar alterações" : "Criar tarefa";
  $("f-titulo").value = tarefa?.titulo ?? "";
  $("f-descricao").value = tarefa?.descricao ?? "";
  $("f-data").value = tarefa?.dataLimite ?? "";
  mostrarErroForm("");
  $("dlg-form").showModal();
  $("f-titulo").focus();
}

function mostrarErroForm(mensagem) {
  $("f-erro").hidden = !mensagem;
  $("f-erro").textContent = mensagem;
  $("f-titulo").setAttribute("aria-invalid", String(Boolean(mensagem)));
}

$("form").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = {
    titulo: $("f-titulo").value,
    descricao: $("f-descricao").value,
    dataLimite: $("f-data").value,
  };
  try {
    if (estado.editandoId) {
      atualizarTarefa(estado.editandoId, dados);
      avisar("Alterações salvas");
    } else {
      criarTarefa(dados);
      avisar("Tarefa criada");
    }
    $("dlg-form").close();
    render();
  } catch (erro) {
    mostrarErroForm(erro.message);
    $("f-titulo").focus();
  }
});

/* ---------- Exclusão ---------- */
function abrirExclusao(id) {
  const tarefa = obterTarefa(id);
  if (!tarefa) return render();
  estado.excluirId = id;
  $("excluir-texto").textContent = `“${tarefa.titulo}” será removida e não poderá ser recuperada.`;
  $("dlg-excluir").showModal();
}

$("form-excluir").addEventListener("submit", () => {
  try {
    excluirTarefa(estado.excluirId);
    avisar("Tarefa excluída");
  } catch (erro) {
    avisar(erro.message);
  }
  render();
});

/* ---------- Eventos gerais ---------- */
document.querySelectorAll("[data-fechar]").forEach((b) =>
  b.addEventListener("click", () => b.closest("dialog").close()),
);

$("btn-nova").addEventListener("click", () => abrirFormulario());
$("vazio-acao").addEventListener("click", () => abrirFormulario());
$("fab").addEventListener("click", () => abrirFormulario());

$("resumo").addEventListener("click", (e) => {
  const botao = e.target.closest("[data-filtro]");
  if (!botao) return;
  estado.filtro = botao.dataset.filtro;
  render();
  $("resumo").querySelector(`[data-filtro="${estado.filtro}"]`)?.focus();
});

$("busca").addEventListener("input", (e) => {
  estado.consulta = e.target.value;
  render();
});

$("lista").addEventListener("click", (e) => {
  const botao = e.target.closest("[data-acao]");
  const item = e.target.closest(".tarefa");
  if (!botao || !item || botao.tagName === "SELECT") return;
  const { id } = item.dataset;

  if (botao.dataset.acao === "editar") return abrirFormulario(id);
  if (botao.dataset.acao === "excluir") return abrirExclusao(id);

  const finalizada = item.dataset.status === STATUS_TAREFA.FINALIZADO;
  definirStatusTarefa(id, finalizada ? STATUS_TAREFA.PENDENTE : STATUS_TAREFA.FINALIZADO);
  render();
  $("lista").querySelector(`[data-id="${CSS.escape(id)}"] .check`)?.focus();
});

$("lista").addEventListener("change", (e) => {
  if (e.target.dataset.acao !== "status") return;
  const { id } = e.target.closest(".tarefa").dataset;
  definirStatusTarefa(id, e.target.value);
  render();
  $("lista").querySelector(`[data-id="${CSS.escape(id)}"] select`)?.focus();
});

$("data-hoje").textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

render();

})();
