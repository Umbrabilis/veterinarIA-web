// Mismas reglas que `common/.../Patrones.java` del backend: si cambias una, cambia la otra.
// El backend es quien decide; esto solo evita viajes inútiles y da mensajes inmediatos.

export const LIMITES = {
  nombre: 100,
  email: 100,
  // bcrypt solo usa los primeros 72 bytes: más caracteres se ignorarían sin avisar.
  passwordMin: 8,
  passwordMax: 72,
  busqueda: 100,
  nombreMascota: 100,
  raza: 100,
  color: 60,
  pesoMaxKg: 9999.99,
  documento: 30,
  telefono: 30,
  direccion: 255,
} as const

const NOMBRE_PERSONA = /^\p{L}[\p{L} .'-]*$/u
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
const PASSWORD_LETRA = /\p{L}/u
const PASSWORD_NUMERO = /\p{N}/u
const BUSQUEDA = /^[\p{L}\p{N} .@'-]*$/u
const NOMBRE_COSA = /^[\p{L}\p{N}][\p{L}\p{N} .'()/-]*$/u
const TEXTO_DESCRIPTIVO = /^[\p{L} .,'/-]*$/u
const DOCUMENTO = /^[A-Za-z0-9.-]{3,30}$/
const TELEFONO = /^(?=(?:\D*\d){7,15}\D*$)[0-9+()\s-]{7,30}$/
const DIRECCION = /^[\p{L}\p{N} #.,'°º/()-]*$/u

/** Devuelve el mensaje de error, o `undefined` si el valor es válido. */
export function validarNombre(valor: string): string | undefined {
  const nombre = valor.trim()
  if (!nombre) return 'Ingresa el nombre'
  if (nombre.length > LIMITES.nombre) return `El nombre no puede superar ${LIMITES.nombre} caracteres`
  if (!NOMBRE_PERSONA.test(nombre)) return 'El nombre solo puede contener letras, espacios, puntos, apóstrofos y guiones'
  return undefined
}

export function validarEmail(valor: string): string | undefined {
  const email = valor.trim()
  if (!email) return 'Ingresa el correo'
  if (email.length > LIMITES.email) return `El correo no puede superar ${LIMITES.email} caracteres`
  if (!EMAIL.test(email)) return 'Ingresa un correo válido, por ejemplo usuario@clinica.com'
  return undefined
}

/** Para contraseñas nuevas (registro y cambio de contraseña). */
export function validarPasswordNueva(password: string): string | undefined {
  if (password.length < LIMITES.passwordMin) return `La contraseña debe tener al menos ${LIMITES.passwordMin} caracteres`
  if (password.length > LIMITES.passwordMax) return `La contraseña no puede superar ${LIMITES.passwordMax} caracteres`
  if (!PASSWORD_LETRA.test(password) || !PASSWORD_NUMERO.test(password)) {
    return 'La contraseña debe incluir al menos una letra y un número'
  }
  return undefined
}

export function validarDocumento(valor: string): string | undefined {
  const documento = valor.trim()
  if (!documento) return 'Ingresa el documento'
  if (!DOCUMENTO.test(documento)) return 'El documento solo puede contener letras, números, puntos y guiones (entre 3 y 30)'
  return undefined
}

export function validarTelefono(valor: string): string | undefined {
  const telefono = valor.trim()
  if (!telefono) return 'Ingresa el teléfono'
  if (!TELEFONO.test(telefono)) return 'Ingresa un teléfono válido, entre 7 y 15 dígitos (ej. 300 123 4567)'
  return undefined
}

export function validarDireccion(valor: string): string | undefined {
  const direccion = valor.trim()
  if (direccion.length > LIMITES.direccion) return `La dirección no puede superar ${LIMITES.direccion} caracteres`
  if (!DIRECCION.test(direccion)) return 'La dirección contiene caracteres no permitidos'
  return undefined
}

export function validarNombreMascota(valor: string): string | undefined {
  const nombre = valor.trim()
  if (!nombre) return 'Ingresa el nombre de la mascota'
  if (nombre.length > LIMITES.nombreMascota) return `El nombre no puede superar ${LIMITES.nombreMascota} caracteres`
  if (!NOMBRE_COSA.test(nombre)) return 'El nombre contiene caracteres no permitidos'
  return undefined
}

/** Raza o color: opcionales, solo letras y separadores simples. */
export function validarTextoDescriptivo(valor: string, campo: string, max: number): string | undefined {
  const texto = valor.trim()
  if (texto.length > max) return `${campo} no puede superar ${max} caracteres`
  if (!TEXTO_DESCRIPTIVO.test(texto)) return `${campo} solo puede contener letras y separadores simples`
  return undefined
}

/** Peso opcional: mayor que cero, máximo 9999.99 y dos decimales. */
export function validarPeso(valor: string): string | undefined {
  const texto = valor.trim().replace(',', '.')
  if (!texto) return undefined
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(texto)) return 'Ingresa el peso en kg con máximo dos decimales (ej. 12.5)'
  const peso = Number(texto)
  if (peso <= 0) return 'El peso debe ser mayor que cero'
  if (peso > LIMITES.pesoMaxKg) return 'El peso no es válido'
  return undefined
}

/** Fecha `YYYY-MM-DD` opcional que no puede estar en el futuro. */
export function validarFechaPasada(valor: string, campo: string): string | undefined {
  if (!valor) return undefined
  if (valor > hoyISO()) return `${campo} no puede estar en el futuro`
  return undefined
}

/** Fecha local de hoy en `YYYY-MM-DD` (no UTC: en Colombia la noche ya es "mañana" en UTC). */
export function hoyISO(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function busquedaValida(valor: string): boolean {
  return valor.length <= LIMITES.busqueda && BUSQUEDA.test(valor)
}

/** Extrae un mensaje legible de un error de la API (`ApiError`: `message` + `detalles`). */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  const data = (error as { response?: { data?: { message?: string; detalles?: unknown } } })?.response?.data
  if (Array.isArray(data?.detalles) && data.detalles.length > 0) return data.detalles.join('. ')
  return data?.message || porDefecto
}
