/**
 * Contador que aparece al acercarse al máximo de caracteres y avisa al llegar.
 * El `maxLength` del input ya impide escribir más; esto explica por qué el campo "dejó de escribir"
 * (sobre todo al pegar texto, que el navegador recorta sin decir nada).
 */
export default function AvisoLimite({ valor, max, umbral = 0.8 }: {
    valor: string
    max: number
    /** Fracción del máximo a partir de la cual se muestra el contador. */
    umbral?: number
}) {
    const usados = valor.length
    if (usados < Math.ceil(max * umbral)) return null

    const alLimite = usados >= max
    return (
        <p
            className="mt-1 flex items-center justify-between gap-2 text-xs"
            style={{ color: alLimite ? '#EF4444' : '#B45309' }}
            role={alLimite ? 'alert' : undefined}
            aria-live="polite"
        >
            <span>{alLimite ? `Llegaste al máximo de ${max} caracteres.` : 'Te estás acercando al límite.'}</span>
            <span className="tabular-nums font-medium">{usados}/{max}</span>
        </p>
    )
}
