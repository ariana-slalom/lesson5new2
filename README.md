# FastForward Logistics Dashboard

A responsive executive operations dashboard with fictional shipment, delivery, regional, and exception data stored locally in `src/data/metrics.json`.

## Run Locally

```bash
npm install
npm run dev
```

Vite prints the local URL after the server starts. To validate a production build, run:

```bash
npm run build
```

## Dashboard

- Month, date range (7 days, 14 days, 1 month, quarter, or year), and region filters update the KPI cards, trend chart, regional comparison, and open-exceptions table.
- The dashboard defaults to dark mode; the header control toggles light mode.
- KPI cards share a typed `MetricCard.vue` component.
- The shipment and on-time trend is rendered by a small accessible SVG component.
- Exception columns can be sorted, and severity can be filtered independently.
- Loading, error, and empty states are included; focus indicators and reduced-motion preferences are supported.

All records are fictional and intended for education only. This dashboard is not approved for client delivery or production operations.
