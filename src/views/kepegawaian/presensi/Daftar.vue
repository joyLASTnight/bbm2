<template>
  <section>
    <b-row class="match-height">
      <b-col lg="9" cols="12">
        <!-- <card-statistics-group :data-presensi="dataPresensi" /> -->
      </b-col>
      <b-col lg="12" cols="12">
        <b-card>
          <div class="mb-2">
            <!-- Table Top -->
            <b-row>
              <!-- Per Page -->

              <b-col cols="12" md="9" class=" justify-content-start mb-1 mb-md-0">
                <b-row>
                  <b-col cols="12" md="6">
                    <b-form-group label="Tanggal" label-cols-md="3">
                      <b-form-datepicker v-model="tanggal" locale="id" />
                    </b-form-group>
                  </b-col>
                  <b-col cols="12" md="6">
                    <b-button variant="primary" @click="pilihModal">
                      Tambah Data
                    </b-button>
                  </b-col>
                </b-row>
              </b-col>

              <!-- Search -->
              <b-col cols="12" md="3">
                <div class="d-flex align-items-center justify-content-end">
                  <b-form-input v-model="searchQuery" class="d-inline-block mr-1" placeholder="Cari data... (Nama Pegawai)" />
                </div>
              </b-col>
            </b-row>
          </div>

          <b-table
            ref="refTable"
            primary-key="id"
            :fields="tableColumns"
            :items="dataPresensi"
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

            <!-- Column: Jam Masuk -->
            <template #cell(jam_masuk)="data">
              <span>
                {{ data.item.jam_masuk !== null ? data.item.jam_masuk : '-' }}
              </span>
            </template>

            <!-- Column: Jam Keluar -->
            <template #cell(jam_keluar)="data">
              <span>
                {{ data.item.jam_keluar !== null ? data.item.jam_keluar : '-' }}
              </span>
            </template>

            <!-- Column: Actions -->
            <template #cell(actions)="data">
              <div class="text-nowrap">
                <b-dropdown variant="link" toggle-class="p-0" no-caret>
                  <template #button-content>
                    <feather-icon icon="MoreVerticalIcon" size="16" class="align-middle text-body" />
                  </template>

                  <b-dropdown-item @click="showModal(data.item.id, 'MASUK')">
                    <feather-icon icon="TrashIcon" />
                    <span class="align-middle ml-50">Absen Masuk</span>
                  </b-dropdown-item>
                  <b-dropdown-item @click="showModal(data.item.id, 'KELUAR')">
                    <feather-icon icon="TrashIcon" />
                    <span class="align-middle ml-50">Absen Keluar</span>
                  </b-dropdown-item>
                  <hr />
                  <b-dropdown-item @click="delAbsenMasuk(data.item.id)">
                    <feather-icon icon="TrashIcon" />
                    <span class="align-middle ml-50">Delete Absen Masuk</span>
                  </b-dropdown-item>
                  <b-dropdown-item @click="delAbsenKeluar(data.item.id)">
                    <feather-icon icon="TrashIcon" />
                    <span class="align-middle ml-50">Delete Absen Keluar</span>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </template>
          </b-table>
          <div class="mx-2 mb-2">
            <b-row>
              <b-col cols="12" sm="6" class="d-flex align-items-center justify-content-center justify-content-sm-start">
                <span class="text-muted">Showing {{ dataMeta.from }} to {{ dataMeta.to }} of {{ dataMeta.of }} entries</span>
              </b-col>
              <!-- Pagination -->
              <b-col cols="12" sm="6" class="d-flex align-items-center justify-content-center justify-content-sm-end">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalPresensi"
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
        </b-card>
      </b-col>
    </b-row>
    <b-modal ref="absen-modal" id="modal-center" @ok="storeAbsen" centered :title="titleModalAbsen" ok-only ok-title="Accept">
      <b-card-text>
        Absen di lakukan manual. <br />
        silahkan Pilih Jam Absen
      </b-card-text>
      <hr />
      <b-form-group label="Tanggal" label-cols-md="4">
        <b-form-datepicker v-model="tanggal" locale="id" disabled />
      </b-form-group>
      <b-form-group label="Jam Keluar" label-for="tanggal" label-cols-md="4">
        <b-form-timepicker v-model="timePicker" locale="id" />
        <small class="text-danger">Jam Keluar adalah jam 16:00 </small>
      </b-form-group>
      <!-- <flat-pickr v-model="timePicker" class="form-control" :config="config" /> -->
    </b-modal>
    <b-modal ref="pilih-modal" id="modal-center" ok-only ok-title="Close" centered>
      <b-row>
        <b-col lg="6">
          <b-button variant="primary" :to="{ name: 'master-presensi-tambah-manual' }">
            Manual
          </b-button>
        </b-col>
        <b-col lg="6">
          <b-button variant="primary" :to="{ name: 'master-presensi-tambah-bulk' }">
            Upload
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </section>
</template>

<script>
import store from '@/store'
import { ref } from '@vue/composition-api'
// import flatPickr from 'vue-flatpickr-component'

import {
  BFormDatepicker,
  BFormTimepicker,
  BFormGroup,
  BCard,
  BModal,
  BCardText,
  BRow,
  BCol,
  BFormInput,
  BButton,
  BTable,
  BDropdown,
  BDropdownItem,
  BPagination,
} from 'bootstrap-vue'
// import vSelect from 'vue-select'

export default {
  components: {
    BFormDatepicker,
    BFormTimepicker,
    BButton,
    BFormGroup,
    BModal,
    BCardText,
    BCard,
    BRow,
    BCol,
    BFormInput,
    BTable,
    BDropdown,
    BDropdownItem,
    BPagination,
    //
    // flatPickr,
    //
    // vSelect,
  },
  data() {
    return {
      tanggal: new Date(),
      timePicker: '',
      titleModalAbsen: 'Absen Masuk Pegawai',
      jenisAbsen: '',
      filterQuery: '',
      searchQuery: '',
      refTable: null,
      dataPresensi: [],
      dataTemp: [],
    }
  },
  watch: {
    searchQuery(query) {
      if (query === '') {
        this.dataPresensi = this.dataTemp
      } else {
        this.dataPresensi = this.dataTemp.filter(item => item.nama.toLowerCase().indexOf(query.toLowerCase()) > -1)
      }
    },
    tanggal(x) {
      this.loadPresensi(x)
    },
  },
  computed: {
    dataMeta() {
      const localItemsCount = this.$refs.refTable ? this.$refs.refTable.computedItems.length : 0
      return {
        from: this.perPage * (this.currentPage - 1) + (localItemsCount ? 1 : 0),
        to: this.perPage * (this.currentPage - 1) + localItemsCount,
        of: this.totalPresensi,
      }
    },
    totalPresensi() {
      return this.dataPresensi.length
    },
  },
  methods: {
    storeAbsen() {
      if (this.jenisAbsen === 'MASUK') {
        this.absenMasuk()
      } else {
        this.absenKeluar()
      }
    },
    umur() {
      const x = this.$moment()
      const y = this.$moment()
      return this.$moment.duration(y.diff(x))
    },
    loadPresensi(x = null) {
      let date = x
      if (x === null) {
        date = this.$moment(Date.now())
      }
      store.dispatch('app-pegawai/fetchListPresensi', date).then(res => {
        store.commit('app-pegawai/SET_LIST_PRESENSI', res.data)
        this.dataTemp = store.getters['app-pegawai/getListPresensi']
        this.dataPresensi = this.dataTemp
        console.info(this.dataTemp)
      })
    },
    pilihModal() {
      this.$refs['pilih-modal'].show()
    },
    showModal(id, fun) {
      this.jenisAbsen = fun
      this.idAbsen = id
      this.$refs['absen-modal'].show()
      if (fun === 'KELUAR') {
        this.titleModalAbsen = 'Absen Keluar Pegawai'
      }
    },
    absenMasuk() {
      this.$swal({
        title: 'Absen Masuk',
        text: 'Absen Masuk akan di Proses ?',
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
            .dispatch('app-pegawai/updateAbsenMasuk', {
              id: this.idAbsen,
              jam: this.timePicker,
              tanggal: this.tanggal,
            })
            .then(res => {
              if (res.status === 200) {
                this.loadPresensi(this.tanggal)
                this.$swal({
                  icon: 'success',
                  title: 'Absen Berhasi!',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              }
            })
        }
      })
    },
    absenKeluar() {
      this.$swal({
        title: 'Absen Keluar',
        text: 'Absen Keluar akan di Proses ?',
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
            .dispatch('app-pegawai/updateAbsenKeluar', {
              id: this.idAbsen,
              jam: this.timePicker,
              tanggal: this.tanggal,
            })
            .then(res => {
              if (res.status === 200) {
                this.loadPresensi(this.tanggal)
                this.$swal({
                  icon: 'success',
                  title: 'Absen Berhasi!',
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                })
              }
            })
        }
      })
    },
  },
  mounted() {
    this.loadPresensi()
  },
  setup() {
    const tableColumns = [
      { key: 'id', label: '#', sortable: true },
      { key: 'nama', sortable: true },
      { key: 'jam_masuk', sortable: true },
      { key: 'jam_keluar', sortable: true },
      { key: 'catatan', sortable: true },
      { key: 'actions' },
    ]

    // const searchQuery = ref('')
    const perPage = ref(10)
    const currentPage = ref(1)
    const perPageOptions = [10, 25, 50, 100]
    const sortBy = ref('id')
    const isSortDirDesc = ref(true)
    const statusFilter = ref(null)

    return {
      tableColumns,
      perPage,
      isSortDirDesc,
      currentPage,
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

.presensi-filter-select {
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
</style>

<style lang="scss">
@import '@core/scss/vue/libs/vue-flatpicker.scss';
</style>
