<template>
  <b-row>
    <b-col cols="12">
      <b-card>
        <b-card-header class="pb-50">
          <h4>
            Data Transaksi Pembelian
          </h4>
        </b-card-header>
        <b-card-body>
          <div>
            <!-- Add New Item Button -->
            <div class="flex justify-content-end">
              <b-form-group>
                <div class="d-flex align-items-center">
                  <b-button variant="primary" @click="toTambahScreen()">
                    <span class="text-nowrap">Add Transaksi</span>
                  </b-button>
                </div>
              </b-form-group>
            </div>
            <!-- search input -->
            <div class="custom-search d-flex justify-content-end">
              <b-form-group>
                <div class="d-flex align-items-center">
                  <label class="mr-1">Search</label>
                  <b-form-input v-model="searchTerm" placeholder="Search" type="text" class="d-inline-block" />
                </div>
              </b-form-group>
            </div>
            <vue-good-table
              :line-numbers="true"
              :columns="columns"
              :rows="rows"
              :search-options="{
                enabled: true,
                externalQuery: searchTerm,
              }"
              :pagination-options="{
                enabled: true,
                perPage: pageLength,
              }"
            >
              <template slot="table-row" slot-scope="props">
                <!-- Column: Status -->
                <span v-if="props.column.field === 'status'">
                  <b-badge :variant="statusPembayaran(props.row.pembayaran.statusPembayaran.value)">
                    {{ props.row.pembayaran.statusPembayaran.title === 'Cash On Delivery (COD)' ? 'COD' : props.row.pembayaran.statusPembayaran.title }}
                  </b-badge>
                </span>

                <!-- Column: Action -->
                <span v-if="props.column.field === 'action'">
                  <span>
                    <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret>
                      <template v-slot:button-content>
                        <feather-icon icon="MoreVerticalIcon" size="16" class="text-body align-middle mr-25" />
                      </template>
                      <b-dropdown-item @click="view(props.row.nomor, props.index)">
                        <feather-icon icon="EyeIcon" class="mr-50" />
                        <span>View</span>
                      </b-dropdown-item>
                      <b-dropdown-item @click="del(props.index)">
                        <feather-icon icon="TrashIcon" class="mr-50" />
                        <span>Delete</span>
                      </b-dropdown-item>
                    </b-dropdown>
                  </span>
                </span>

                <!-- Column: Common -->
                <span v-else>
                  {{ props.formattedRow[props.column.field] }}
                </span>
              </template>
              <!-- pagination -->
              <template slot="pagination-bottom" slot-scope="props">
                <div class="d-flex justify-content-between flex-wrap">
                  <div class="d-flex align-items-center mb-0 mt-1">
                    <span class="text-nowrap ">
                      Showing 1 to
                    </span>
                    <b-form-select
                      v-model="pageLength"
                      :options="['10', '20', '50']"
                      class="mx-1"
                      @input="value => props.perPageChanged({ currentPerPage: value })"
                    />

                    <span class="text-nowrap"> of {{ props.total }} entries </span>
                  </div>
                  <div>
                    <b-pagination
                      :value="1"
                      :total-rows="props.total"
                      :per-page="pageLength"
                      first-number
                      last-number
                      align="right"
                      prev-class="prev-item"
                      next-class="next-item"
                      class="mt-1 mb-0"
                      @input="value => props.pageChanged({ currentPage: value })"
                    >
                      <template #prev-text>
                        <feather-icon icon="ChevronLeftIcon" size="18" />
                      </template>
                      <template #next-text>
                        <feather-icon icon="ChevronRightIcon" size="18" />
                      </template>
                    </b-pagination>
                  </div>
                </div>
              </template>
            </vue-good-table>
          </div>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
// import { onUnmounted } from '@vue/composition-api'

import {
  BBadge,
  BRow,
  BCol,
  BPagination,
  BFormGroup,
  BFormInput,
  BButton,
  BCard,
  BCardHeader,
  BFormSelect,
  BCardBody,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue'
import { VueGoodTable } from 'vue-good-table'
import Ripple from 'vue-ripple-directive'
import store from '@/store'
import router from '@/router'

export default {
  components: {
    BDropdown,
    BDropdownItem,
    BBadge,
    BRow,
    BCol,
    VueGoodTable,
    BPagination,
    BFormGroup,
    BFormInput,
    BButton,
    BFormSelect,
    BCard,
    BCardHeader,
    BCardBody,
  },
  directives: {
    Ripple,
  },
  data() {
    return {
      pageLength: 10,
      dir: false,
      columns: [
        {
          label: 'Nama Supplier',
          field: 'supplier.nama',
        },
        {
          label: 'Jumlah Item',
          field: this.jumlahItem,
        },
        {
          label: 'Total',
          field: 'invoice.grandTotal',
          formatFn: this.formatRupiah,
        },

        {
          label: 'Action',
          field: 'action',
        },
      ],
      rows: '',
      searchTerm: '',
    }
  },
  created() {
    this.rows = store.getters['app-transaksi-pembelian/getListDraftPembelian']
    if (this.rows.length === 0) {
      this.loadData()
    }
  },
  methods: {
    del(index) {
      this.$swal({
        title: 'Delete ?',
        text: 'Draft Pembelian akan di Hapus',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.value) {
          store.commit('app-transaksi-pembelian/REMOVE_DRAFT_PEMBELIAN', index)
          this.$swal({
            icon: 'success',
            title: 'Deleted!',
            customClass: {
              confirmButton: 'btn btn-success',
            },
          })
        }
      })
    },
    /* eslint-disable */
    view(nomor, index) {
      router.push({
        name: 'transaksi-pembelian-tambah',
        params: {
          id: index,
          nomor: nomor,
        },
      })
    },
    /* eslint-disable */
    jumlahItem(obj) {
      return obj.orders.length
    },
    invoice(id) {
      store.commit('app-transaksi-pembelian/SET_DATA_INVOICE_FROM_DAFTAR', id)
      router.push({ name: 'transaksi-pembelian-invoice' })
    },
    loadData() {
      this.rows = store.getters['app-transaksi-pembelian/getListDraftPembelian']
    },
    statusPembayaran(status) {
      const statusColor = {
        /* eslint-disable key-spacing */
        0: 'light-success',
        1: 'light-danger',
        2: 'light-warning',
        /* eslint-enable key-spacing */
      }

      return statusColor[status]
    },
    toTambahScreen() {
      this.$router.push({
        name: 'transaksi-pembelian-tambah',
      })
    },
    formatDate(value) {
      return this.$moment(value).format('DD MMMM YYYY')
    },
    formatRupiah(value) {
      return `Rp. ${value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')}`
    },
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-good-table.scss';
</style>
