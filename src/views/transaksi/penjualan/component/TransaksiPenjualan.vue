<template>
  <section>
    <b-row class="match-height">
      <b-col lg="3" cols="12">
        <b-card>
          <b-form-group>
            <h5>Filter</h5>
            <hr />
            <h6 class="mb-1">Tanggal Transaksi</h6>
            <b-input-group>
              <flat-pickr v-model="date.value" class="form-control" :config="date.config" placeholder="Filter By Tanggal" />
              <b-input-group-append>
                <b-button variant="outline-primary" @click="clear">
                  Clear
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-card>
      </b-col>
      <b-col lg="9" cols="12">
        <statistik :data-transaksi="dataTransaksi" />
      </b-col>
      <b-col lg="12" cols="12">
        <b-card>
          <table-transaksi-penjualan
            @destroy="destroyId"
            @retur="returId"
            @searchdata="searchQuery"
            @filterdata="filterQuery"
            :dataTransaksi="dataTransaksi"
            :dataTemp="dataTemp"
            :typeRetur="false"
            :tanggalData="tanggal"
            :components="true"
          />
        </b-card>
      </b-col>
    </b-row>
  </section>
</template>

<script>
import store from '@/store'
import { ref } from '@vue/composition-api'

import { BCard, BRow, BCol, BInputGroupAppend, BFormGroup, BInputGroup, BButton } from 'bootstrap-vue'

import flatPickr from 'vue-flatpickr-component'
import Statistik from './Statistik.vue'
import TableTransaksiPenjualan from './TableTransaksiPenjualan.vue'

export default {
  components: {
    TableTransaksiPenjualan,
    BFormGroup,
    BInputGroupAppend,
    BInputGroup,
    flatPickr,
    Statistik,
    BCard,
    BRow,
    BCol,
    BButton,
  },
  data() {
    return {
      tanggal: {
        awal: '',
        akhir: '',
      },
      tabIndex: 0,
      date: {
        value: '',
        config: {
          wrap: true, // set wrap to true only when using 'input-group'
          altFormat: 'd F y',
          altInput: true,
          dateFormat: 'Y-m-d',
          mode: 'range',
        },
      },
      refTable: null,
    }
  },
  watch: {
    dateFilter(x) {
      if (x === '') {
        this.loadTransaksi()
      } else {
        const d = x.split(' to ')
        if (d.length > 1) {
          this.loadTransaksi(this.$moment(d[0]), this.$moment(d[1]))
        } else {
          this.loadTransaksi(this.$moment(d[0]), this.$moment(d[0]))
        }
      }
    },
  },
  computed: {
    totalInvoices() {
      return this.dataTransaksi.length
    },
    dateFilter() {
      return this.date.value
    },
  },
  methods: {
    returId(data) {
      const { id } = data.item
      this.$swal({
        title: 'Retur data ?',
        text: 'Data transaksi penjualan akan di retur',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.value) {
          store
            .dispatch('app-transaksi-penjualan/returTransaksi', {
              id,
            })
            .then(x => {
              if (x.status === 200) {
                store.commit('app-transaksi-penjualan/RETUR_DATA_PENJUALAN', id)
                this.$swal({
                  icon: 'success',
                  title: 'Transaksi sudah di Retur!',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              } else {
                this.$swal({
                  icon: 'error',
                  title: 'Oopps!! Kesalahan',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              }
            })
        }
      })
    },
    destroyId(data) {
      const { id } = data.item
      this.$swal({
        title: 'Delete data ?',
        text: 'Data penjualan akan di hapus',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.value) {
          store
            .dispatch('app-transaksi-penjualan/deleteTransaksi', {
              id,
            })
            .then(x => {
              if (x.status === 200) {
                store.commit('app-transaksi-penjualan/REMOVE_DATA_PENJUALAN', id)
                this.$swal({
                  icon: 'success',
                  title: 'Transaksi berhasil di Delete!',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              } else {
                this.$swal({
                  icon: 'error',
                  title: 'Oopps!! Kesalahan',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              }
            })
        }
      })
    },
    searchQuery(query) {
      if (query === '') {
        this.dataTransaksi = this.dataTemp
      } else {
        this.dataTransaksi = this.dataTemp.filter(
          item => item.nomorTransaksi.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.pelanggan.nama.toLowerCase().indexOf(query.toLowerCase()) > -1,
        )
      }
    },
    filterQuery(query) {
      if (query === 'Lunas') {
        this.dataTransaksi = this.dataTemp.filter(trx => trx.pembayaran.sisaPembayaran === null || trx.pembayaran.sisaPembayaran === 0)
      } else if (query === 'COD') {
        this.dataTransaksi = this.dataTemp.filter(trx => parseFloat(trx.pembayaran.sisaPembayaran) >= 0 && trx.pembayaran.statusPembayaran.value === 2)
      } else if (query === 'Kredit') {
        this.dataTransaksi = this.dataTemp.filter(trx => parseFloat(trx.pembayaran.sisaPembayaran) >= 0 && trx.pembayaran.statusPembayaran.value === 1)
      } else if (query === null || query === 'Semua') {
        this.dataTransaksi = this.dataTemp
      }
    },
    clear() {
      this.date.value = ''
    },
    moment(value) {
      return this.$moment(value).format('DD MMMM YYYY')
    },
    loadTransaksi(dateawal = null, dateakhir = null) {
      this.tanggal.awal = dateawal
      this.tanggal.akhir = dateakhir
      store
        .dispatch('app-transaksi-penjualan/fetchListTransaksiPenjualan', {
          cabang: this.userData.cabang_id,
          dateawal,
          dateakhir,
        })
        .then(res => {
          store.commit('app-transaksi-penjualan/SET_LIST_TRANSAKSI_PENJUALAN', res.data)
          this.dataTemp = store.getters['app-transaksi-penjualan/getListTransaksiPenjualan']
          if (this.userData.role.nama === 'KASIR') {
            this.dataTemp = store.getters['app-transaksi-penjualan/getListTransaksiPenjualan'].filter(x => x.user.id === this.userData.id)
          }
          this.dataTransaksi = this.dataTemp
        })
    },
    loadAwal() {
      // const d = new Date()
      // const m = d.getMonth()
      // const y = d.getFullYear()
      // this.loadTransaksi(this.$moment(new Date(y, m, 1)), this.$moment(Date.now()))
      this.loadTransaksi()
    },
  },
  mounted() {
    this.loadAwal()
  },
  setup() {
    const dataTransaksi = ref([])
    const dataTemp = ref([])
    const userData = JSON.parse(localStorage.getItem('userData'))

    return {
      dataTransaksi,
      dataTemp,
      userData,
    }
  },
}
</script>

<style lang="scss" scoped>
.per-page-selector {
  width: 90px;
}
</style>

<style lang="scss">
@import '@core/scss/vue/libs/vue-flatpicker.scss';
</style>
