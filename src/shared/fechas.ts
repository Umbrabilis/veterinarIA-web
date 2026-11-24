// Fechas en la hora local del navegador (la de la clínica). La API recibe y devuelve instantes en ISO-8601 (UTC)
// y fechas sin hora como `YYYY-MM-DD`.

const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const HORA = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
const FECHA_HORA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

/** `YYYY-MM-DD` de una fecha en hora local. */
export function aISOFecha(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${fecha.getFullYear()}-${mes}-${dia}`
}

/** Fecha sin hora (`YYYY-MM-DD`) como medianoche local, sin el corrimiento de zona de `new Date('YYYY-MM-DD')`. */
export function desdeISOFecha(valor: string): Date {
    const [anio, mes, dia] = valor.split('-').map(Number)
    return new Date(anio, mes - 1, dia)
}

export function sumarDias(fecha: string, dias: number): string {
    const d = desdeISOFecha(fecha)
    d.setDate(d.getDate() + dias)
    return aISOFecha(d)
}

/** Rango [00:00, 24:00) de un día local, en ISO-8601, para filtrar la agenda. */
export function rangoDelDia(fecha: string): { desde: string; hasta: string } {
    const inicio = desdeISOFecha(fecha)
    const fin = desdeISOFecha(sumarDias(fecha, 1))
    return { desde: inicio.toISOString(), hasta: fin.toISOString() }
}

/** Fecha (`YYYY-MM-DD`) + hora (`HH:mm`) locales a un instante ISO-8601. */
export function combinarFechaHora(fecha: string, hora: string): string {
    const [h, m] = hora.split(':').map(Number)
    const d = desdeISOFecha(fecha)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
}

export function sumarMinutos(iso: string, minutos: number): string {
    return new Date(new Date(iso).getTime() + minutos * 60_000).toISOString()
}

export const formatearFechaLarga = (fecha: string) => {
    const texto = FECHA_LARGA.format(desdeISOFecha(fecha))
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}
export const formatearHora = (iso: string) => HORA.format(new Date(iso))
export const formatearFechaHora = (iso: string) => FECHA_HORA.format(new Date(iso))
/** Para valores `YYYY-MM-DD` (próximo control, vacunas). */
export const formatearFecha = (fecha: string) => FECHA_CORTA.format(desdeISOFecha(fecha))
/** Para instantes ISO-8601 (creación, cierre). */
export const formatearDiaDe = (iso: string) => FECHA_CORTA.format(new Date(iso))

/** `HH:mm` local de un instante (para precargar un campo de hora). */
export function horaLocal(iso: string): string {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
