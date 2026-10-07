// Tipos comunes a varios servicios. Contrato: `common/.../PaginaResponse.java`.

export interface PaginaResponse<T> {
  contenido: T[]
  pagina: number
  tamano: number
  totalElementos: number
  totalPaginas: number
}
