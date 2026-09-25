# FastForward Logistics - Operations Executive Dashboard

An educational operations dashboard for FastForward Logistics. It presents fictional shipment, delivery, regional performance, and exception data in a responsive executive view.

## Technology

- Vue 3 with Vite and TypeScript
- Vuetify 3 with Material Design Icons
- Pinia is not required; filtering uses local Vue state
- Recharts-style SVG charting is implemented with a focused local chart component
- Deploys to Vercel as a Vite static application

## Product Requirements

- Deep navy application header with FastForward Logistics branding, dashboard title, subtitle, and fictional freshness date
- Functional date-range and region filters with reset behavior
- Dynamically generated executive summary
- Reusable typed `MetricCard.vue` components for four required KPIs
- Responsive shipment-volume and on-time-delivery trend visualization
- Comparative regional performance section
- Sortable, filter-aware open exceptions table with severity, ownership, age, and next actions
- Intentional loading, empty, and user-friendly error states
- Keyboard-accessible controls, visible focus states, semantic headings, chart summaries, and reduced-motion support

## Data and Safety

All operational records are fictional and stored locally in `src/data/metrics.json`. No client, company-sensitive, or production data is included. This application is for educational purposes only and is not approved for client delivery or internal production use.
