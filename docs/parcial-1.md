# Tarea: Parcial 1 — Frontend completo (veterinarIA-web)

Lee CLAUDE.md antes de empezar y respeta todas sus reglas. Esta es una SPA en React que
consume veterinarIA-API (Spring Boot 4, contrato OpenAPI generado por springdoc).

Primero guarda esta tarea completa en docs/parcial-1.md para que todos los agentes puedan releerla.

## Requerimientos

R1 — Librería de UI común (todos deben usarla)
- Detecta en package.json la librería de UI instalada. Si no hay ninguna, detente y pregúntame cuál usar.
- Tema centralizado (colores, tipografía, espaciados) en un solo lugar.
- Componentes envoltorio reutilizables en src/components/ui/.
- Prohibido: estilos ad-hoc repetidos o componentes que dupliquen los de la librería.

R2 — Registro y Login
- Validación en cliente y errores del API visibles para el usuario.
- Manejo del token según CLAUDE.md y cierre de sesión.
- Rutas protegidas por rol; tras el login, redirigir según el tipo de usuario.

R3 — Perfil: ver y editar la información completa, según el tipo de usuario
- Los campos dependen del tipo de usuario. NO inventar campos: derivarlos de los DTO del OpenAPI.
- Confirmación al guardar y manejo de errores.

R4 — Home del lado de clientes, estilo landing
- Hero con propuesta de valor, servicios, cómo funciona, llamado a la acción y footer.
- Responsive (móvil primero) y accesible (contraste AA, teclado, textos alternativos).

R5 — Al menos 2 páginas del lado de clientes, además del Home
- Propuesta a confirmar en la Fase 0: "Mis mascotas" (listado y detalle) y "Mis citas" (listado y agendamiento).

## Restricciones
- Si un endpoint no existe en el OpenAPI, crear mocks con MSW basados en el contrato
  y listarlos en docs/endpoints-pendientes.md para el equipo backend.
- Tipos TypeScript derivados del OpenAPI, nunca escritos a mano.
- Una rama por bloque; nunca commits directos a main; nunca hacer merge.
- PRs pequeños, revisables por dos personas en menos de 30 minutos.

## Equipo de agentes (créalos en .claude/agents/ si no existen)
- ui-architect: tema y componentes base (R1) y diseño de la landing (R4) con la skill frontend-design.
  No implementa lógica de negocio.
- react-developer: páginas, rutas, formularios y consumo del API.
- api-contract-checker (solo lectura): verifica tipos, peticiones y mocks contra el OpenAPI.
- Revisión antes de cada PR: pr-review-toolkit, y Chrome DevTools MCP para revisión visual,
  consola sin errores y accesibilidad en móvil y escritorio.

## Orden de ramas
1. feat/ui-base (R1) → ui-architect
2. feat/auth (R2) → react-developer
3. feat/home-landing (R4) → ui-architect + react-developer
4. feat/perfil (R3) → react-developer + api-contract-checker
5. feat/paginas-cliente (R5) → react-developer + api-contract-checker
Las ramas 3, 4 y 5 pueden avanzar en paralelo cuando 1 y 2 estén mergeadas.

## Fase 0 (obligatoria, sin escribir código)
1. Usa el agente Explore para mapear el repo: estructura, dependencias, rutas y componentes existentes.
2. Revisa el OpenAPI y lista qué endpoints existen para cada requerimiento.
3. Escribe docs/parcial-1-plan.md: tareas por requerimiento, agente asignado,
   endpoints disponibles vs. pendientes, y riesgos.
4. DETENTE y espera mi aprobación.

## Definición de terminado (por rama)
- Lint, tests y build en verde (los mismos comandos del CI).
- pr-review-toolkit sin hallazgos críticos.
- Revisión visual con Chrome DevTools sin errores de consola.
- PR abierto con descripción, capturas y los R# que cubre. Luego DETENTE y espera mi indicación.
