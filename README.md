# MoneyMap

Control de finanzas personales. Una aplicación web moderna para registrar ingresos y gastos, visualizar balances con gráficos interactivos, y consultar la tasa de cambio USD/HNL en tiempo real.

## Stack

- **Next.js 16** — App Router, Server Actions, React 19
- **Supabase** — Autenticación (Google OAuth), base de datos PostgreSQL
- **TanStack Query** — Data fetching y cache en el cliente
- **TanStack Table** — Tablas con ordenamiento por columnas
- **GSAP** — Animaciones de UI y transiciones
- **Tailwind CSS v4** — Estilos utilitarios
- **BCH API** — Tasa de cambio del Banco Central de Honduras

## Requisitos

- Node.js 20+
- Una cuenta en [Supabase](https://supabase.com) con proyecto configurado
- Una cuenta en [BCH API](https://bchapi-am.developer.azure-api.net) (para la tasa de cambio)

## Configuración

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. Copiar `.env` y completar las variables:

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | Misma URL (expuesta al cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Misma anon key (expuesta al cliente) |
| `ACCESS_CODE` | PIN de 6 dígitos para el primer factor de autenticación |
| `BCH_API_KEY` | API key del portal de desarrollador del BCH |
| `BCH_API_URL` | `https://bchapi-am.azure-api.net` |

3. Configurar Supabase:
   - Crear las tablas `ingresos` y `gastos` en el schema `money`
   - Habilitar Google OAuth en Authentication > Providers
   - Configurar la URL de redirección: `http://localhost:3000/auth/callback`

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Uso

La aplicación tiene un flujo de autenticación de dos factores:

1. **PIN de acceso** — Ingresar el código de 6 dígitos configurado en `ACCESS_CODE`
2. **Google OAuth** — Iniciar sesión con una cuenta de Google vinculada a Supabase

Una vez dentro, el dashboard muestra un resumen con:
- Balance total (ingresos - gastos) convertido a lempiras
- Tasa de cambio USD/HNL actual con indicador de fuente (BCH o fallback)
- Gráfico de ingresos vs gastos de los últimos 6 meses
- Distribución de ingresos y gastos por categoría

### Páginas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con PIN + Google |
| `/personal` | Dashboard con resumen y gráficos |
| `/personal/ingresos` | CRUD de ingresos con tabla ordenable |
| `/personal/gastos` | CRUD de gastos con tabla ordenable |

Cada registro de ingreso o gasto incluye nombre, monto, moneda (HNL/USD) y fecha. Los montos en USD se convierten automáticamente usando la tasa de cambio vigente.

## Scripts

```bash
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción
npm run start  # Servidor de producción
npm run lint   # Linter
```

## Licencia

MIT
