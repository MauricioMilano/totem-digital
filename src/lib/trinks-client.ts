/**
 * Cliente HTTP tipado para a API pública do Trinks (https://api.trinks.com).
 *
 * Auth: header `X-Api-Key` + header `estabelecimentoId` em todas as chamadas.
 *
 * ⚠️ ORÇAMENTO DE REQUESTS: a API provisionada tem limite de 5000 requests/mês.
 * Este cliente é deliberado para minimizar chamadas: pageSize baixo, filtros
 * diretos (clienteId/CPF), sem loop de paginação. As funções são puras (fetch
 * isolado por endpoint) para que uma futura camada de cache possa envolvê-las
 * (espelho local AgendamentoTrinks + webhooks — ver COMADIG-16/20).
 */

const TRINKS_BASE_URL = "https://api.trinks.com";
const REQUEST_TIMEOUT_MS = 15_000;

/** Limite de página padrão: mantém o consumo baixo (orçamento de 5000 req/mês). */
export const DEFAULT_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Tipos — conforme spec OpenAPI oficial da Trinks
// https://trinks.readme.io/reference/get_v1-agendamentos.md
// https://trinks.readme.io/reference/get_v1-clientes.md
// ---------------------------------------------------------------------------

/** Wrapper paginado usado por GET /v1/agendamentos. */
export interface AgendamentoItemListDTOPagedList {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  data: AgendamentoItemListDTO[] | null;
}

/** Wrapper paginado usado por GET /v1/clientes. */
export interface ClienteItemListDTOPaged {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  data: ClienteItemListDTO[] | null;
}

export interface StatusDTO {
  id: number;
  nome?: string | null;
}

export interface ClienteResumeDTO {
  id: number;
  nome?: string | null;
}

export interface ServicoResumeDTO {
  id: number;
  nome?: string | null;
}

export interface ProfissionalResumeDTO {
  id: number;
  nome?: string | null;
}

export interface AgendamentoItemListDTO {
  id: number;
  status: StatusDTO;
  cliente: ClienteResumeDTO;
  servico: ServicoResumeDTO;
  profissional: ProfissionalResumeDTO;
  dataHoraInicio: string;
  duracaoEmMinutos: number;
  observacoesDoEstabelecimento?: string | null;
  observacoesDoCliente?: string | null;
  valor: number;
}

export interface TelefoneItemListDTO {
  ddi?: string | null;
  ddd?: string | null;
  telefone?: string | null;
}

export interface EtiquetaAssociadaDTO {
  id: number;
  conteudo?: string | null;
  cor?: string | null;
  tipoId: number;
  tipoNome?: string | null;
}

export interface ClienteEnderecoDTO {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
}

export interface ComoNosConheceuDTO {
  id: number;
  descricao?: string | null;
}

export interface ClientePreferenciasDTO {
  recebeSMSLembreteDeAgendamento: boolean;
  recebeEmailLembreteDeAgendamento: boolean;
  recebeSMSMarketing: boolean;
  recebeEmailMarketing: boolean;
}

/** Resposta de GET /v1/clientes/{id}. */
export interface ClienteDetailsDTO {
  id: number;
  nome?: string | null;
  email?: string | null;
  cpf?: string | null;
  /** M = Masculino, F = Feminino, N = Não-Binário, X = Não informado. */
  genero?: string | null;
  observacoes?: string | null;
  codigoExterno?: string | null;
  telefone?: string[] | null;
  pessoaFisicaId: number;
  preferencias?: ClientePreferenciasDTO;
  podeAgendarOnlineNoEstabelecimento: boolean;
  dataCadastro?: string | null;
  dataUltimaAlteracao?: string | null;
  ativo: boolean;
  dataNascimento?: string | null;
  endereco?: ClienteEnderecoDTO;
  comoNosConheceu?: ComoNosConheceuDTO;
  etiquetasAssociadas?: EtiquetaAssociadaDTO[] | null;
}

/** Item de GET /v1/clientes (listagem). */
export interface ClienteItemListDTO {
  id: number;
  dataCadastro?: string | null;
  email?: string | null;
  nome?: string | null;
  telefones?: TelefoneItemListDTO[] | null;
  clienteDetalhes?: ClienteDetailsDTO;
  etiquetasAssociadas?: EtiquetaAssociadaDTO[] | null;
}

// ---------------------------------------------------------------------------
// Parâmetros dos endpoints
// ---------------------------------------------------------------------------

export interface ListAgendamentosParams {
  /** Filtro direto — prefira usar para economizar requests. */
  clienteId?: number;
  /** ISO date / datetime, ex.: "2026-09-04". */
  dataInicio?: string;
  /** ISO date / datetime, ex.: "2026-09-30". */
  dataFim?: string;
  page?: number;
  pageSize?: number;
}

export interface ListClientesParams {
  nome?: string;
  cpf?: string;
  page?: number;
  pageSize?: number;
}

/** Status aceitos por PATCH /v1/agendamentos/{id}/status/{status}. */
export type TrinksAgendamentoStatus =
  | "confirmado"
  | "cancelado"
  | "ematendimento"
  | "finalizado"
  | "clientefaltou";

// ---------------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------------

export class TrinksError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TrinksError";
    this.status = status;
  }
}

/** Lançado quando TRINKS_API_KEY / TRINKS_ESTABELECIMENTO_ID não estão no ambiente. */
export class TrinksConfigError extends TrinksError {
  constructor() {
    super(
      "Trinks: variáveis de ambiente ausentes. Defina TRINKS_API_KEY e TRINKS_ESTABELECIMENTO_ID no .env (limite da API: 5000 requests/mês)."
    );
    this.name = "TrinksConfigError";
  }
}

/**
 * Trava de segurança para mutações (PATCH/PUT): com `TRINKS_DRY_RUN=true|1` no
 * ambiente, as funções de alteração simulam a chamada (log + retorno) SEM
 * disparar request à API — útil para simular o fluxo sem alterar dados reais.
 */
export function isTrinksDryRun(): boolean {
  const v = (process.env.TRINKS_DRY_RUN ?? "").trim().toLowerCase();
  return v === "true" || v === "1";
}

// ---------------------------------------------------------------------------
// Núcleo HTTP
// ---------------------------------------------------------------------------

function getAuthHeaders(): Record<string, string> {
  const apiKey = process.env.TRINKS_API_KEY;
  const estabelecimentoId = process.env.TRINKS_ESTABELECIMENTO_ID;
  if (!apiKey || !estabelecimentoId) throw new TrinksConfigError();
  return { "X-Api-Key": apiKey, estabelecimentoId };
}

async function trinksFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Valida credenciais ANTES do fetch para o erro de config não ser engolido pelo catch de rede.
  const authHeaders = getAuthHeaders();

  let res: Response;
  try {
    res = await fetch(`${TRINKS_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...authHeaders,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new TrinksError(`Trinks: timeout de ${REQUEST_TIMEOUT_MS}ms em ${path}.`);
    }
    throw new TrinksError(`Trinks: falha de rede ao chamar ${path}.`, undefined);
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {
      // corpo inexistente/ilegível — ignora
    }
    if (res.status === 401) {
      throw new TrinksError(
        "Trinks: autenticação inválida (401). Verifique TRINKS_API_KEY e TRINKS_ESTABELECIMENTO_ID.",
        401
      );
    }
    if (res.status === 429) {
      throw new TrinksError(
        "Trinks: limite mensal de requests atingido (429). Orçamento: 5000 requests/mês — reduza chamadas ou aguarde o próximo ciclo.",
        429
      );
    }
    throw new TrinksError(
      `Trinks: erro HTTP ${res.status} em ${path}.${detail ? ` Detalhes: ${detail}` : ""}`,
      res.status
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Núcleo de mutações (PATCH/PUT/POST). Aplica a trava `TRINKS_DRY_RUN`:
 * quando ativa, simula a chamada sem disparar request — mas ainda valida as
 * credenciais, para o fluxo de erro ser idêntico ao real.
 */
async function trinksMutate<T>(
  path: string,
  method: "PATCH" | "PUT" | "POST",
  body?: unknown
): Promise<T> {
  getAuthHeaders(); // valida credenciais mesmo em dry-run

  if (isTrinksDryRun()) {
    console.warn(`[trinks] DRY_RUN — simulando ${method} ${path} (nenhum request à API).`);
    return undefined as T;
  }

  return trinksFetch<T>(path, {
    method,
    body: JSON.stringify(body ?? {}),
  });
}

// ---------------------------------------------------------------------------
// Endpoints — Agendamentos
// ---------------------------------------------------------------------------

/** GET /v1/agendamentos — query em camelCase (page, pageSize, clienteId, dataInicio, dataFim). */
export function listAgendamentos(
  params: ListAgendamentosParams = {}
): Promise<AgendamentoItemListDTOPagedList> {
  const qs = new URLSearchParams();
  if (params.clienteId != null) qs.set("clienteId", String(params.clienteId));
  if (params.dataInicio) qs.set("dataInicio", params.dataInicio);
  if (params.dataFim) qs.set("dataFim", params.dataFim);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? DEFAULT_PAGE_SIZE));
  return trinksFetch<AgendamentoItemListDTOPagedList>(`/v1/agendamentos?${qs}`);
}

/** GET /v1/agendamentos/{id}. */
export function getAgendamento(id: number): Promise<AgendamentoItemListDTO> {
  return trinksFetch<AgendamentoItemListDTO>(`/v1/agendamentos/${id}`);
}

/**
 * PATCH /v1/agendamentos/{agendamentoId}/status/{status}.
 * Respeita a trava `TRINKS_DRY_RUN` (não dispara request quando ativa).
 */
export function patchStatus(
  agendamentoId: number,
  status: TrinksAgendamentoStatus
): Promise<void> {
  return trinksMutate<void>(
    `/v1/agendamentos/${agendamentoId}/status/${status}`,
    "PATCH"
  );
}

// ---------------------------------------------------------------------------
// Endpoints — Clientes
// ---------------------------------------------------------------------------

/**
 * GET /v1/clientes — ⚠️ query em PascalCase na spec (Nome, CPF, Page, PageSize).
 */
export function listClientes(
  params: ListClientesParams = {}
): Promise<ClienteItemListDTOPaged> {
  const qs = new URLSearchParams();
  if (params.nome) qs.set("Nome", params.nome);
  if (params.cpf) qs.set("CPF", params.cpf);
  qs.set("Page", String(params.page ?? 1));
  qs.set("PageSize", String(params.pageSize ?? DEFAULT_PAGE_SIZE));
  return trinksFetch<ClienteItemListDTOPaged>(`/v1/clientes?${qs}`);
}

/** GET /v1/clientes/{id} → ClienteDetailsDTO. */
export function getCliente(id: number): Promise<ClienteDetailsDTO> {
  return trinksFetch<ClienteDetailsDTO>(`/v1/clientes/${id}`);
}
