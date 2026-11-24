import type { RolPersonal } from '../../api/usuariosService'

export const ROL_LABEL: Record<RolPersonal, string> = {
    ADMINISTRADOR: 'Administrador',
    VETERINARIO: 'Veterinario',
}

export const ROL_COLOR: Record<RolPersonal, { fondo: string; texto: string }> = {
    ADMINISTRADOR: { fondo: 'var(--primary-light)', texto: 'var(--primary)' },
    VETERINARIO: { fondo: 'var(--secondary-light)', texto: '#065F46' },
}
