<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

interface TrendPoint {
  date: string
  shipments: number
  onTimeRate: number
}

const props = defineProps<{ points: TrendPoint[] }>()
const { width: viewportWidth } = useDisplay()
const plot = { left: 54, right: 668, top: 26, bottom: 202 }
const height = plot.bottom - plot.top
const width = plot.right - plot.left

const maxShipments = computed(() => Math.max(1, ...props.points.map((point) => point.shipments)))
const rateMinimum = computed(() => Math.max(80, Math.floor(Math.min(100, ...props.points.map((point) => point.onTimeRate)) / 5) * 5 - 5))
const barWidth = computed(() => Math.min(30, width / Math.max(props.points.length, 1) * 0.54))
const rightAxisX = computed(() => viewportWidth.value <= 650 ? 723 : 710)
const positions = computed(() => props.points.map((point, index) => {
  const x = props.points.length < 2
    ? plot.left + width / 2
    : plot.left + (index / (props.points.length - 1)) * width
  const shipmentY = plot.bottom - (point.shipments / maxShipments.value) * height
  const rateY = plot.bottom - ((point.onTimeRate - rateMinimum.value) / (100 - rateMinimum.value)) * height
  return { ...point, x, shipmentY, rateY }
}))
const linePath = computed(() => positions.value
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.rateY.toFixed(1)}`)
  .join(' '))
const gridTicks = computed(() => [0, 1, 2, 3].map((index) => {
  const fraction = index / 3
  return {
    y: plot.top + fraction * height,
    shipments: Math.round(maxShipments.value * (1 - fraction)),
    rate: Math.round(100 - fraction * (100 - rateMinimum.value)),
  }
}))
const dateLabels = computed(() => {
  const interval = Math.max(1, Math.ceil(positions.value.length / 7))
  return positions.value.map((point, index) => ({
    ...point,
    label: index % interval === 0 || index === positions.value.length - 1
      ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${point.date}T00:00:00Z`))
      : '',
  }))
})
const chartSummary = computed(() => {
  if (!props.points.length) return 'No shipment trend data for this selection.'
  const averageRate = props.points.reduce((total, point) => total + point.onTimeRate, 0) / props.points.length
  const shipmentTotal = props.points.reduce((total, point) => total + point.shipments, 0)
  return `${shipmentTotal.toLocaleString()} shipments across ${props.points.length} days, with an average on-time rate of ${averageRate.toFixed(1)} percent.`
})
</script>

<template>
  <div class="trend-chart">
    <div class="chart-legend" aria-hidden="true">
      <span><i class="legend-swatch legend-swatch--shipments"></i> Shipments</span>
      <span><i class="legend-swatch legend-swatch--rate"></i> On-time delivery</span>
    </div>
    <p class="sr-only" role="img" :aria-label="chartSummary"></p>
    <svg class="trend-chart__svg" viewBox="0 0 720 254" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g v-for="tick in gridTicks" :key="tick.y">
        <line :x1="plot.left" :x2="plot.right" :y1="tick.y" :y2="tick.y" class="chart-gridline" />
        <text :x="plot.left - 10" :y="tick.y + 4" text-anchor="end" class="chart-axis-label">{{ tick.shipments }}</text>
        <text :x="rightAxisX" :y="tick.y + 4" text-anchor="end" class="chart-axis-label chart-axis-label--right">{{ tick.rate }}%</text>
      </g>
      <g v-for="point in positions" :key="point.date">
        <rect
          :x="Math.max(plot.left, Math.min(plot.right - barWidth, point.x - barWidth / 2))"
          :y="point.shipmentY"
          :width="barWidth"
          :height="plot.bottom - point.shipmentY"
          rx="3"
          class="chart-bar"
        />
      </g>
      <path :d="linePath" class="chart-rate-line" />
      <circle v-for="point in positions" :key="`${point.date}-rate`" :cx="point.x" :cy="point.rateY" r="3.5" class="chart-rate-point" />
      <text v-for="point in dateLabels.filter((item) => item.label)" :key="`${point.date}-label`" :x="point.x" y="230" text-anchor="middle" class="chart-axis-label">{{ point.label }}</text>
      <text :x="plot.left" y="13" class="chart-axis-title">SHIPMENTS</text>
      <text x="710" y="13" text-anchor="end" class="chart-axis-title">ON-TIME RATE</text>
    </svg>
  </div>
</template>
