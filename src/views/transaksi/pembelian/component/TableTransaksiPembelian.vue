<template>
  <section>
    <div class="mb-2">
      <!-- Table Top -->
      <b-row>
        <!-- Per Page -->
        <b-col cols="12" md="6" class="d-flex align-items-center justify-content-start mb-1 mb-md-0">
          <label>Entries</label>
          <v-select v-model="perPage" :options="perPageOptions" :clearable="false" class="per-page-selector d-inline-block ml-50 mr-1" />
          <b-button variant="primary" :to="{ name: 'transaksi-pembelian-tambah' }">
            Tambah Data
          </b-button>
        </b-col>

        <!-- Search -->
        <b-col cols="12" md="6" v-show="components">
          <div class="d-flex align-items-center justify-content-end">
            <b-form-input v-model="searchQuery" class="d-inline-block mr-1" placeholder="Cari data... (Nomor Transaksi , Nama Pelanggan)" />
            <v-select v-model="filterQuery" :options="filterOptions" class="invoice-filter-select  mr-1" placeholder="Status Pembayaran">
              <template #selected-option="{ label }">
                <span class="text-truncate overflow-hidden">
                  {{ label }}
                </span>
              </template>
            </v-select>
          </div>
        </b-col>
      </b-row>
    </div>

    <b-table
      ref="refTable"
      :fields="tableColumns"
      :items="dataTransaksi"
      :current-page="currentPage"
      :per-page="perPage"
      :sort-by.sync="sortBy"
      :sort-desc.sync="isSortDirDesc"
      show-empty
      empty-text="Tidak ada data"
      class="position-relative"
    >
      <!-- Column: Id -->
      <template #cell(id)="data">
        <span>
          {{ data.index + 1 }}
        </span>
      </template>

      <!-- Column: Nomor Transaksi -->
      <template #cell(nomorTransaksi)="data">
        <b-link :to="{ name: 'transaksi-pembelian-invoice', params: { id: data.item.id } }" class="font-weight-bold"> #{{ data.item.nomorTransaksi }} </b-link>
      </template>

      <!-- Column: Issued Date -->
      <template #cell(tanggalTransaksi)="data">
        <span class="text-nowrap">
          {{ moment(data.item.tanggalTransaksi) }}
        </span>
      </template>

      <!-- Column: Nama Supplier -->
      <template #cell(namaSupplier)="data">
        <span>
          {{ data.item.supplier.nama }}
        </span>
      </template>

      <!-- Column: Total -->
      <template #cell(total)="data">
        <span class="text-nowrap">
          {{ formatRupiah(data.item.invoice.grandTotal) }}
        </span>
      </template>

      <!-- Column: Balance -->
      <template #cell(saldo)="data">
        <div class="text-nowrap">
          <template v-if="data.item.pembayaran.sisaPembayaran === null || data.item.pembayaran.sisaPembayaran === 0">
            <b-badge pill variant="light-success">
              Lunas
            </b-badge>
          </template>
          <template v-else>
            <b-badge pill variant="light-danger">
              <span :id="`transaksi-row-${data.item.id}-tooltip-saldo`">-{{ formatRupiah(data.item.pembayaran.sisaPembayaran) }}</span>
            </b-badge>
            <b-tooltip :target="`transaksi-row-${data.item.id}-tooltip-saldo`">
              <span v-if="data.item.pembayaran.statusPembayaran.value === 1">
                Kredit
                <br />
                Jt. Tempo : {{ moment(data.item.pembayaran.tanggalJatuhTempo) }}
                <br />
                Total Tagihan : {{ formatRupiah(data.item.pembayaran.sisaPembayaran) }}
              </span>
            </b-tooltip>
          </template>
        </div>
      </template>

      <!-- Column: Actions -->
      <template #cell(actions)="data">
        <div class="text-nowrap">
          <feather-icon
            :id="`invoice-row-${data.item.id}-preview-icon`"
            icon="EyeIcon"
            size="16"
            class="mx-1"
            @click="
              $router.push({
                name: 'transaksi-pembelian-invoice',
                params: { id: data.item.id },
              })
            "
          />
          <b-tooltip title="Preview Invoice" :target="`invoice-row-${data.item.id}-preview-icon`" />
          <b-dropdown variant="link" toggle-class="p-0" no-caret>
            <template #button-content>
              <feather-icon icon="MoreVerticalIcon" size="16" class="align-middle text-body" />
            </template>
            <b-dropdown-item>
              <feather-icon icon="CastIcon" />
              <span class="align-middle ml-50">Print Invoice</span>
            </b-dropdown-item>
            <b-dropdown-item v-show="data.item.pembayaran.statusPembayaran.value === 1" @click="showModalPembayaran(data.item.pembayaran)">
              <feather-icon icon="ActivityIcon" />
              <span class="align-middle ml-50">Pembayaran</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'akuntansi-jurnal-detail', params: { id: data.item.nomorJurnal } }">
              <feather-icon icon="BookIcon" />
              <span class="align-middle ml-50">Jurnal</span>
            </b-dropdown-item>
            <hr />
            <b-dropdown-item @click="retur(data)" v-if="!typeRetur">
              <feather-icon icon="CornerUpLeftIcon" />
              <span class="align-middle ml-50">Retur</span>
            </b-dropdown-item>
            <b-dropdown-item @click="destroy(data)">
              <feather-icon icon="TrashIcon" />
              <span class="align-middle ml-50">Delete</span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </template>
    </b-table>
    <div class="mx-2 mb-2">
      <b-row>
        <b-col cols="12" sm="6" class="d-flex align-items-center justify-content-center justify-content-sm-start">
          <span class="text-muted"
            >Showing {{ dataMeta.from }} to {{ dataMeta.to }} of {{ dataMeta.of }} entries || From {{ $moment(tanggal.awal).format('DD MMM YY') }} to
            {{ $moment(tanggal.akhir).format('DD MMM YY') }}</span
          >
        </b-col>
        <!-- Pagination -->
        <b-col cols="12" sm="6" class="d-flex align-items-center justify-content-center justify-content-sm-end">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalInvoices"
            :per-page="perPage"
            first-number
            last-number
            class="mb-0 mt-1 mt-sm-0"
            prev-class="prev-item"
            next-class="next-item"
          >
            <template #prev-text>
              <feather-icon icon="ChevronLeftIcon" size="18" />
            </template>
            <template #next-text>
              <feather-icon icon="ChevronRightIcon" size="18" />
            </template>
          </b-pagination>
        </b-col>
      </b-row>
    </div>
    <modal-daftar-pembayaran />
  </section>
</template>

<script>
import { ref } from '@vue/composition-api'

import { BRow, BCol, BFormInput, BButton, BTable, BLink, BBadge, BDropdown, BDropdownItem, BPagination, BTooltip } from 'bootstrap-vue'
import vSelect from 'vue-select'
import ModalDaftarPembayaran from '@/views/transaksi/invoice/component/ModalDaftarPembayaranPembelian.vue'

export default {
  components: {
    BRow,
    BCol,
    BFormInput,
    BButton,
    BTable,
    BLink,
    BBadge,
    BDropdown,
    BDropdownItem,
    BPagination,
    BTooltip,
    vSelect,
    ModalDaftarPembayaran,
  },
  data() {
    return {
      filterQuery: '',
      searchQuery: '',
      refTable: null,
    }
  },
  watch: {
    searchQuery(query) {
      this.$emit('searchdata', query)
    },
    filterQuery(query) {
      this.$emit('filterdata', query)
    },
    dataTransaksi() {
      this.totalInvoices = this.dataTransaksi.length
    },
  },
  props: {
    dataTransaksi: {
      type: Array,
      required: true,
    },
    dataTemp: {
      type: Array,
      required: true,
    },
    typeRetur: {
      type: Boolean,
    },
    tanggalData: {
      type: Object,
      required: true,
    },
    components: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    tanggal() {
      return {
        awal: this.$moment(this.tanggalData.awal).format('DD MMMM YYYY'),
        akhir: this.$moment(this.tanggalData.akhir).format('DD MMMM YYYY'),
      }
    },
    dataMeta() {
      const localItemsCount = this.$refs.refTable ? this.$refs.refTable.computedItems.length : 0
      return {
        from: this.perPage * (this.currentPage - 1) + (localItemsCount ? 1 : 0),
        to: this.perPage * (this.currentPage - 1) + localItemsCount,
        of: this.totalInvoices,
      }
    },
  },
  methods: {
    destroy(data) {
      this.$emit('destroy', data)
    },
    retur(data) {
      this.$emit('retur', data)
    },
    moment(value) {
      return this.$moment(value).format('DD MMMM YYYY')
    },
    formatRupiah(value) {
      return `Rp. ${value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')}`
    },
    showModalPembayaran(data) {
      this.$store.commit('app-transaksi-pembelian/SET_LIST_PEMBAYARAN', data.listPembayaran)
      this.$bvModal.show('modal-daftar-pembayaran')
    },
  },
  setup() {
    const filterOptions = ['Lunas', 'Kredit']
    const tableColumns = [
      { key: 'id', label: '#', sortable: true },
      { key: 'nomorTransaksi', sortable: true },
      { key: 'tanggalTransaksi', sortable: true },
      { key: 'namaSupplier', sortable: true },
      { key: 'total', sortable: true },
      { key: 'saldo', sortable: true },
      { key: 'actions' },
    ]

    const perPage = ref(10)
    const totalInvoices = ref(0)
    const currentPage = ref(1)
    const perPageOptions = [10, 25, 50, 100]
    const sortBy = ref('id')
    const isSortDirDesc = ref(true)
    const statusFilter = ref(null)

    return {
      filterOptions,
      tableColumns,
      perPage,
      isSortDirDesc,
      currentPage,
      totalInvoices,
      perPageOptions,
      sortBy,
      statusFilter,
    }
  },
}
</script>

<style lang="scss" scoped>
.per-page-selector {
  width: 90px;
}

.invoice-filter-select {
  min-width: 190px;

  ::v-deep .vs__selected-options {
    flex-wrap: nowrap;
  }

  ::v-deep .vs__selected {
    width: 100px;
  }
}
</style>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
@import '@core/scss/vue/libs/vue-flatpicker.scss';
</style>
