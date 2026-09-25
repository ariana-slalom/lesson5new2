<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MetricCard from './components/MetricCard.vue'
import TrendChart from './components/TrendChart.vue'
import metrics from './data/metrics.json'

type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
type RangeKey = '7' | '14'
type SortKey = 'id' | 'region' | 'severity' | 'owner' | 'age'
type SortDirection = 'ascending' | 'descending'

interface DailyMetric {
  date: string
  region: string
  shipments: number
  delivered: number
  onTime: number
}
interface ExceptionRecord {
  id: string
  date: string
  region: string
  severity: Severity
  owner: string
  nextAction: string
}
interface DashboardDataset {
  asOf: string
  daily: DailyMetric[]
  exceptions: ExceptionRecord[]
}
interface RegionSummary {
  name: string
  shipments: number
  delivered: number
  onTime: number
  onTimeRate: number
}
interface SortColumn {
  key: SortKey
  label: string
}

const dataset = metrics as DashboardDataset
const dashboardData = ref<DashboardDataset | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const selectedRange = ref<RangeKey>('7')
const selectedRegion = ref('All regions')
const selectedSeverity = ref('All levels')
const sortKey = ref<SortKey>('age')
const sortDirection = ref<SortDirection>('descending')
const columns: SortColumn[] = [
  { key: 'id', label: 'Reference' },
  { key: 'region', label: 'Region' },
  { key: 'severity', label: 'Severity' },
  { key: 'owner', label: 'Owner' },
  { key: 'age', label: 'Age' },
]
const rangeOptions = [
  { title: 'Last 7 days', value: '7' },
  { title: 'Last 14 days', value: '14' },
]
const severityOptions = ['All levels', 'Critical', 'High', 'Medium', 'Low']
const regionOptions = computed(() => [
  'All regions',
  ...new Set((dashboardData.value?.daily ?? []).map((record) => record.region)),
])
const asOfDate = computed(() => dashboardData.value?.asOf ?? dataset.asOf)
const selectedStartDate = computed(() => {
  const cutoff = new Date(`${asOfDate.value}T00:00:00Z`)
  cutoff.setUTCDate(cutoff.getUTCDate() - Number(selectedRange.value) + 1)
  return cutoff.toISOString().slice(0, 10)
})
const filteredDaily = computed(() => (dashboardData.value?.daily ?? []).filter((record) => (
  record.date >= selectedStartDate.value
  && record.date <= asOfDate.value
  && (selectedRegion.value === 'All regions' || record.region === selectedRegion.value)
)))
const totals = computed(() => filteredDaily.value.reduce((sum, record) => ({
  shipments: sum.shipments + record.shipments,
  delivered: sum.delivered + record.delivered,
  onTime: sum.onTime + record.onTime,
}), { shipments: 0, delivered: 0, onTime: 0 }))
const onTimeRate = computed(() => totals.value.delivered ? totals.value.onTime / totals.value.delivered * 100 : 0)
const filteredExceptions = computed(() => (dashboardData.value?.exceptions ?? []).filter((record) => (
  record.date >= selectedStartDate.value
  && record.date <= asOfDate.value
  && (selectedRegion.value === 'All regions' || record.region === selectedRegion.value)
  && (selectedSeverity.value === 'All levels' || record.severity === selectedSeverity.value)
)))

function ageInDays(date: string): number {
  const reported = new Date(`${date}T00:00:00Z`).getTime()
  const current = new Date(`${asOfDate.value}T00:00:00Z`).getTime()
  return Math.floor((current - reported) / 86_400_000)
}

const sortedExceptions = computed(() => [...filteredExceptions.value].sort((first, second) => {
  const firstValue = sortKey.value === 'age' ? ageInDays(first.date) : first[sortKey.value]
  const secondValue = sortKey.value === 'age' ? ageInDays(second.date) : second[sortKey.value]
  const result = typeof firstValue === 'number' && typeof secondValue === 'number'
    ? firstValue - secondValue
    : String(firstValue).localeCompare(String(secondValue), undefined, { sensitivity: 'base' })
  return sortDirection.value === 'ascending' ? result : -result
}))
const trendPoints = computed(() => {
  const byDate = new Map<string, { shipments: number; delivered: number; onTime: number }>()
  for (const record of filteredDaily.value) {
    const day = byDate.get(record.date) ?? { shipments: 0, delivered: 0, onTime: 0 }
    day.shipments += record.shipments
    day.delivered += record.delivered
    day.onTime += record.onTime
    byDate.set(record.date, day)
  }
  return [...byDate.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([date, day]) => ({
    date,
    shipments: day.shipments,
    onTimeRate: day.delivered ? day.onTime / day.delivered * 100 : 0,
  }))
})
const regions = computed<RegionSummary[]>(() => {
  const byRegion = new Map<string, RegionSummary>()
  for (const record of filteredDaily.value) {
    const region = byRegion.get(record.region) ?? {
      name: record.region,
      shipments: 0,
      delivered: 0,
      onTime: 0,
      onTimeRate: 0,
    }
    region.shipments += record.shipments
    region.delivered += record.delivered
    region.onTime += record.onTime
    region.onTimeRate = region.delivered ? region.onTime / region.delivered * 100 : 0
    byRegion.set(record.region, region)
  }
  return [...byRegion.values()].sort((first, second) => second.onTimeRate - first.onTimeRate)
})
const summary = computed(() => {
  if (!totals.value.shipments) return 'No shipment activity matches the selected filters.'
  const leader = selectedRegion.value === 'All regions' ? regions.value[0] : undefined
  const leadText = leader ? ` ${leader.name} leads on on-time delivery at ${leader.onTimeRate.toFixed(1)}%.` : ''
  return `${totals.value.shipments.toLocaleString()} shipments across ${trendPoints.value.length} operating days; ${onTimeRate.value.toFixed(1)}% of deliveries arrived on time.${leadText}`
})
const metricCards = computed(() => [
  {
    label: 'Shipments',
    value: totals.value.shipments.toLocaleString(),
    detail: `${selectedRange.value} day view · ${selectedRegion.value.toLowerCase()}`,
    icon: 'mdi-package-variant-closed',
    tone: 'blue' as const,
  },
  {
    label: 'On-time delivery',
    value: `${onTimeRate.value.toFixed(1)}%`,
    detail: `${totals.value.onTime.toLocaleString()} of ${totals.value.delivered.toLocaleString()} deliveries`,
    icon: 'mdi-clock-check-outline',
    tone: 'green' as const,
  },
  {
    label: 'Delivered',
    value: totals.value.delivered.toLocaleString(),
    detail: `${trendPoints.value.length} operating days in view`,
    icon: 'mdi-truck-check-outline',
    tone: 'amber' as const,
  },
  {
    label: 'Open exceptions',
    value: filteredExceptions.value.length.toLocaleString(),
    detail: `${filteredExceptions.value.filter((record) => record.severity === 'Critical').length} critical · ${filteredExceptions.value.filter((record) => record.severity === 'High').length} high`,
    icon: 'mdi-alert-circle-outline',
    tone: 'red' as const,
  },
])

function resetFilters() {
  selectedRange.value = '7'
  selectedRegion.value = 'All regions'
  selectedSeverity.value = 'All levels'
}
function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'ascending' ? 'descending' : 'ascending'
    return
  }
  sortKey.value = key
  sortDirection.value = key === 'age' ? 'descending' : 'ascending'
}
function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
  return sortKey.value === key ? sortDirection.value : 'none'
}
function sortLabel(key: SortKey): string {
  return sortKey.value === key ? `Sorted ${sortDirection.value}; activate to reverse` : 'Activate to sort'
}
function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`))
}
async function loadDashboard() {
  isLoading.value = true
  loadError.value = ''
  try {
    await Promise.resolve()
    if (!dataset.daily.length || !dataset.exceptions.length) throw new Error('Dashboard data is unavailable.')
    dashboardData.value = dataset
  } catch {
    loadError.value = 'Dashboard data could not be loaded. Please try again.'
  } finally {
    isLoading.value = false
  }
}
onMounted(loadDashboard)
</script>

<template>
  <v-app>
    <header class="app-header">
      <div class="app-header__inner">
        <a class="brand" href="#main-content" aria-label="FastForward Logistics operations dashboard">
          <span class="brand__mark"><v-icon icon="mdi-truck-fast-outline" size="24" aria-hidden="true" /></span>
          <span class="brand__name">FastForward <strong>Logistics</strong></span>
        </a>
        <div class="header-status">
          <span class="data-badge"><span class="data-badge__dot"></span> Fictional data</span>
          <span class="header-status__date">Updated {{ formatDate(asOfDate) }}, 08:30 ET</span>
        </div>
      </div>
    </header>
    <v-main>
      <div id="main-content" class="dashboard-shell">
        <div class="page-heading">
          <div>
            <p class="eyebrow">OPERATIONS / EXECUTIVE VIEW</p>
            <h1>Operations overview</h1>
            <p class="page-heading__sub">A clear view of delivery health across the network.</p>
          </div>
          <div class="freshness-note"><span class="freshness-note__dot"></span> Live snapshot <span class="freshness-note__divider">·</span> {{ formatDate(asOfDate) }}</div>
        </div>

        <section class="filter-bar" aria-label="Dashboard filters">
          <div class="filter-bar__controls">
            <v-select v-model="selectedRange" :items="rangeOptions" item-title="title" item-value="value" label="Date range" variant="outlined" density="compact" hide-details class="filter-select filter-select--range" />
            <v-select v-model="selectedRegion" :items="regionOptions" label="Region" variant="outlined" density="compact" hide-details class="filter-select" />
          </div>
          <v-btn class="reset-button" variant="text" prepend-icon="mdi-filter-remove-outline" @click="resetFilters">Reset filters</v-btn>
        </section>

        <section class="summary-line" aria-live="polite" aria-atomic="true">
          <span class="summary-line__icon"><v-icon icon="mdi-text-box-check-outline" size="19" aria-hidden="true" /></span>
          <p><strong>Executive summary</strong> {{ summary }}</p>
        </section>

        <div v-if="isLoading" class="state-panel" role="status" aria-live="polite">
          <v-progress-linear indeterminate color="secondary" aria-label="Loading dashboard data" />
          <p>Loading operations data…</p>
        </div>
        <section v-else-if="loadError" class="state-panel state-panel--error" role="alert">
          <v-icon icon="mdi-alert-circle-outline" size="28" aria-hidden="true" />
          <h2>Dashboard unavailable</h2>
          <p>{{ loadError }}</p>
          <v-btn color="primary" variant="tonal" @click="loadDashboard">Try again</v-btn>
        </section>
        <template v-else>
          <section class="metric-grid" aria-label="Key performance indicators">
            <MetricCard v-for="metric in metricCards" :key="metric.label" v-bind="metric" />
          </section>

          <div class="insight-grid">
            <section class="dashboard-section trend-section" aria-labelledby="trend-heading">
              <div class="section-heading">
                <div><p class="eyebrow">NETWORK PULSE</p><h2 id="trend-heading">Shipment volume &amp; on-time delivery</h2></div>
                <span class="section-unit">Daily totals</span>
              </div>
              <TrendChart :points="trendPoints" />
            </section>
            <section class="dashboard-section region-section" aria-labelledby="region-heading">
              <div class="section-heading"><div><p class="eyebrow">BY REGION</p><h2 id="region-heading">Regional performance</h2></div></div>
              <div v-if="regions.length" class="region-list">
                <article v-for="(region, index) in regions" :key="region.name" class="region-row">
                  <div class="region-row__topline">
                    <div class="region-row__name-wrap"><span class="region-rank">{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ region.name }}</h3></div>
                    <strong>{{ region.onTimeRate.toFixed(1) }}%</strong>
                  </div>
                  <div class="region-track" role="meter" :aria-label="`${region.name} on-time delivery`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Number(region.onTimeRate.toFixed(1))">
                    <span class="region-track__fill" :style="{ width: `${region.onTimeRate}%` }"></span>
                  </div>
                  <p>{{ region.shipments.toLocaleString() }} shipments <span>·</span> {{ region.delivered.toLocaleString() }} delivered</p>
                </article>
              </div>
              <p v-else class="empty-state">No regional data matches these filters.</p>
            </section>
          </div>

          <section class="dashboard-section exceptions-section" aria-labelledby="exceptions-heading">
            <div class="section-heading exceptions-heading">
              <div>
                <p class="eyebrow">NEEDS ATTENTION</p>
                <h2 id="exceptions-heading">Open exceptions <span class="section-count">{{ filteredExceptions.length }}</span></h2>
              </div>
              <v-select v-model="selectedSeverity" :items="severityOptions" label="Severity" variant="outlined" density="compact" hide-details class="filter-select filter-select--severity" />
            </div>
            <div v-if="sortedExceptions.length" class="table-scroll" tabindex="0" aria-label="Scrollable open exceptions table">
              <table class="exceptions-table">
                <caption class="sr-only">Open shipment exceptions matching the selected date, region, and severity filters</caption>
                <thead>
                  <tr>
                    <th v-for="column in columns" :key="column.key" scope="col" :aria-sort="ariaSort(column.key)">
                      <button class="sort-button" type="button" :aria-label="`${column.label}, ${sortLabel(column.key)}`" @click="toggleSort(column.key)">
                        {{ column.label }}
                        <v-icon v-if="sortKey === column.key" :icon="sortDirection === 'ascending' ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="14" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in sortedExceptions" :key="record.id">
                    <td class="exception-id">{{ record.id }}<small>{{ formatDate(record.date) }}</small></td>
                    <td>{{ record.region }}</td>
                    <td><span class="severity-pill" :class="`severity-pill--${record.severity.toLowerCase()}`"><span></span>{{ record.severity }}</span></td>
                    <td>{{ record.owner }}</td>
                    <td>{{ ageInDays(record.date) }}d</td>
                    <td class="next-action">{{ record.nextAction }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state empty-state--table">
              <v-icon icon="mdi-check-circle-outline" size="23" aria-hidden="true" />
              <p>No open exceptions match the selected filters.</p>
              <button class="text-button" type="button" @click="selectedSeverity = 'All levels'">Clear severity filter</button>
            </div>
          </section>
        </template>
        <footer class="page-footer">
          <span>FastForward Logistics</span>
          <span>Fictional training data · Not for operational use</span>
          <span>Lesson Ouput by Ariana de Ryss, Protogen</span>
        </footer>
      </div>
    </v-main>
  </v-app>
</template>
