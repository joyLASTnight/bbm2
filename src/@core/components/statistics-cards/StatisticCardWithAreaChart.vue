<template>
  <b-card no-body>
    <b-card-body class="pb-0">
      <b-avatar class="mb-1" :variant="`light-${color}`" size="45">
        <feather-icon size="21" :icon="icon" />
      </b-avatar>
      <div class="truncate">
        <h2 class="mb-25 font-weight-bolder">
          {{ statistic }}
        </h2>
        <span>{{ statisticTitle }}</span>
      </div>
    </b-card-body>

    <vue-apex-charts type="area" height="100" width="100%" :options="chartOptionsComputed" :series="chartData" />
  </b-card>
</template>

<script>
import { BCard, BCardBody, BAvatar } from 'bootstrap-vue'
import VueApexCharts from 'vue-apexcharts'
import { $themeColors } from '@themeConfig'
import { areaChartLabel, areaChartOptions } from './chartOptions'

export default {
  components: {
    VueApexCharts,
    BCard,
    BCardBody,
    BAvatar,
  },
  props: {
    icon: {
      type: String,
      required: true,
    },
    statistic: {
      type: [Number, String],
      required: true,
    },
    statisticTitle: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'primary',
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    chartOptions: {
      type: Object,
      default: null,
    },
    label: {
      type: Boolean,
      default: false,
    },
    chartLabel: {
      type: Array,
      default: null,
    },
  },
  computed: {
    chartOptionsComputed() {
      if (this.chartOptions === null) {
        if (this.label === false) {
          const options = JSON.parse(JSON.stringify(areaChartOptions))
          options.theme.monochrome.color = $themeColors[this.color]
          return options
        }
        const options = JSON.parse(JSON.stringify(areaChartLabel))
        options.xaxis.categories = this.chartLabel
        return options
      }
      return this.chartOptions
    },
  },
}
</script>
