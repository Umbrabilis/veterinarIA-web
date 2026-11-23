import { useEffect, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import { EVENTO_SESION_EXPIRADA } from '../api/axiosClient'

/** Aviso que llega por WebSocket desde notificaciones-service. */
export interface Aviso {
  id: string
  tipo: 'CITA_AGENDADA' | 'CITA_REPROGRAMADA' | 'CITA_CANCELADA' | 'RESUMEN_PENDIENTE' | 'RESUMEN_ENVIADO'
  titulo: string
  mensaje: string
  fecha: string
}

const SEVERIDAD: Record<Aviso['tipo'], 'info' | 'success' | 'warning'> = {
  CITA_AGENDADA: 'info',
  CITA_REPROGRAMADA: 'info',
  CITA_CANCELADA: 'warning',
  RESUMEN_PENDIENTE: 'warning',
  RESUMEN_ENVIADO: 'success',
}

const DURACION_MS = 8000
const MAXIMO_VISIBLES = 4

/**
 * URL del WebSocket a partir de la de la API. Con VITE_API_URL relativa ("/", la API en el mismo origen) se usa el
 * origen de la página. El navegador envía la cookie de sesión en el handshake: no hace falta token.
 */
function urlWebSocketAvisos(): string {
  const base = new URL(import.meta.env.VITE_API_URL || 'http://localhost:8080', window.location.href)
  const url = new URL('/api/v1/notificaciones/ws', base)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

/**
 * Muestra en la esquina los avisos en tiempo real (nuevas citas, resúmenes listos para revisar...). Se reconecta
 * sola si se cae la conexión, con espera creciente, y deja de intentarlo cuando la sesión vence.
 */
export default function AvisosEnVivo() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const temporizadores = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    let socket: WebSocket | null = null
    let reintento: ReturnType<typeof setTimeout> | undefined
    let espera = 1000
    let activo = true
    const pendientes = temporizadores.current

    const quitar = (id: string) => {
      setAvisos(actuales => actuales.filter(a => a.id !== id))
      pendientes.delete(id)
    }

    const conectar = () => {
      socket = new WebSocket(urlWebSocketAvisos())
      socket.onopen = () => {
        espera = 1000
      }
      socket.onmessage = evento => {
        try {
          const aviso = JSON.parse(evento.data) as Aviso
          setAvisos(actuales => [aviso, ...actuales].slice(0, MAXIMO_VISIBLES))
          pendientes.set(aviso.id, setTimeout(() => quitar(aviso.id), DURACION_MS))
        } catch {
          // mensaje que no es un aviso: se ignora
        }
      }
      socket.onclose = () => {
        if (!activo) return
        reintento = setTimeout(conectar, espera)
        espera = Math.min(espera * 2, 30000)
      }
    }

    const alVencerSesion = () => {
      activo = false
      socket?.close()
    }

    conectar()
    window.addEventListener(EVENTO_SESION_EXPIRADA, alVencerSesion)
    return () => {
      activo = false
      clearTimeout(reintento)
      socket?.close()
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alVencerSesion)
      pendientes.forEach(clearTimeout)
      pendientes.clear()
    }
  }, [])

  if (avisos.length === 0) return null

  return (
    <Stack
      spacing={1}
      role="status"
      aria-live="polite"
      sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1400, width: 'min(360px, calc(100vw - 32px))' }}
    >
      {avisos.map(aviso => (
        <Alert
          key={aviso.id}
          severity={SEVERIDAD[aviso.tipo] ?? 'info'}
          variant="filled"
          onClose={() => setAvisos(actuales => actuales.filter(a => a.id !== aviso.id))}
          sx={{ boxShadow: 3 }}
        >
          <AlertTitle>{aviso.titulo}</AlertTitle>
          {aviso.mensaje}
        </Alert>
      ))}
    </Stack>
  )
}
