<template>
  <section>
    <b-modal size="xl" id="modal-bulk-pembayaran" title="Bulk Pembayaran" ok-title="Proses" @hidden="resetModal" @ok="handleOk" lazy>
      <section>
        <b-row>
          <b-col md="8">
            <b-form-group label="Nama Supplier" label-cols-md="4">
              <v-select v-model="form.supplier" placeholder="Cara Pembayaran" label="nama" :clearable="true" :options="listSupplier" />
            </b-form-group>
            <b-form-group label-cols-md="4">
              <b-button variant="primary" class=" mr-1" @click="cari">
                Cari Data
              </b-button>
            </b-form-group>
            <hr />
            <section v-show="form.data_utang.length > 0 ? true : false">
              <b-form-group label="Total Pembayaran" label-cols-md="4">
                <b-form-input placeholder="Nominal Pembayaran" v-model="total_pembayaran" readonly />
              </b-form-group>
              <b-form-group label="Cara Pembayaran" label-for="cara-pembayaran" label-cols-md="4">
                <v-select
                  v-model="caraPembayaran"
                  placeholder="Cara Pembayaran"
                  label="title"
                  :options="jenisPembayaranOption"
                  :clearable="false"
                  @input="cekJenisPembayaran"
                />
              </b-form-group>
              <b-form-group label="form.transfer ke" label-for="bank" label-cols-md="4" v-show="form.transfer">
                <v-select v-model="form.bank" placeholder="Nama Bank" label="title" :clearable="false" :options="bankOption" />
              </b-form-group>
            </section>
          </b-col>
          <b-col md="4">
            <h4 v-show="total_pembayaran != 'Rp. 0' ? true : false">
              Total yang harus dibayarkan oleh Supplier {{ form.supplier.nama }} adalah {{ total_pembayaran }}
              <span v-show="form.transfer === true">Secara Transfer ke {{ form.bank.title }}</span>
              <span v-show="form.transfer === false">Secara Tunai</span>
            </h4>
          </b-col>
        </b-row>
      </section>
      <section>
        <b-table :fields="tableColumns" :items="form.data_utang" empty-text="Tidak ada data" class="position-relative">
          <!-- Column: Id -->
          <template #cell(id)="data">
            <span>
              {{ data.index + 1 }}
            </span>
          </template>
          <!-- Column: Tanggal -->
          <template #cell(nomor_transaksi)="data">
            <span>
              <b-link :to="{ name: 'transaksi-pembelian-invoice', params: { id: data.item.id } }" class="font-weight-bold">
                #{{ data.item.nomor_transaksi }}
              </b-link>
              <br />
              {{ moment(data.item.created_at) }}
            </span>
          </template>
          <!-- Column: Nominal -->
          <template #cell(grand_total)="data">
            <span>
              {{ formatRupiah(data.item.grand_total) }}
            </span>
          </template>

          <!-- Column: Nominal -->
          <template #cell(sisa_pembayaran)="data">
            <span>
              {{ formatRupiah(data.item.sisa_pembayaran) }}
            </span>
          </template>

          <!-- Column: Nominal -->
          <template #cell(nominal_pembayaran)="data">
            <b-form-input
              :placeholder="`maksimum Rp ${formatRupiah(data.item.sisa_pembayaran)}`"
              type="number"
              v-model="data.item.jumlah_pembayaran"
              @change="cekMax(data)"
            />
          </template>

          <template #cell(lunas)="data">
            <b-form-checkbox v-model="data.item.lunas_check" @change="lunas(data)">
              Lunas
            </b-form-checkbox>
          </template>
        </b-table>
      </section>
    </b-modal>
  </section>
</template>

<script>
import store from '@/store'
import { BLink, BRow, BCol, BButton, BFormInput, BFormCheckbox, BFormGroup, BTable } from 'bootstrap-vue'
import vSelect from 'vue-select'

export default {
  components: {
    BLink,
    BButton,
    BRow,
    BCol,
    BFormInput,
    BFormGroup,
    BFormCheckbox,
    BTable,
    vSelect,
  },
  props: {
    listSupplier: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      caraPembayaran: { title: 'Tunai', value: '0' },
      jenisPembayaranOption: [
        { title: 'Tunai', value: '0' },
        { title: 'transfer', value: '1' },
      ],
      // total_pembayaran: 0,
      bankOption: [],
      form: {
        supplier: '',
        data_utang: [],
        transfer: false,
        bank: '',
        nominal_pembayaran: 0,
        user: {},
      },
    }
  },
  computed: {
    total_pembayaran() {
      let total = 0
      this.form.data_utang.forEach(v => {
        total += parseFloat(v.jumlah_pembayaran)
        this.form.nominal_pembayaran += parseFloat(v.jumlah_pembayaran)
      })
      return this.formatRupiah(total)
    },
  },
  methods: {
    handleOk(mdl) {
      mdl.preventDefault()
      if (this.form.nominal_pembayaran === '' || this.form.nominal_pembayaran === 'Rp. 0' || this.form.data_utang.length < 1) {
        this.$swal({
          icon: 'error',
          title: 'Isi Form Pembayaran dengan Benar',
          customClass: {
            confirmButton: 'btn btn-success',
          },
        })
        return
      }
      if (this.form.nominal_pembayaran === '' || this.form.nominal_pembayaran === 'Rp. 0' || this.form.data_utang.length < 1) {
        this.$swal({
          icon: 'error',
          title: 'Isi Form Pembayaran dengan Benar',
          customClass: {
            confirmButton: 'btn btn-success',
          },
        })
        return
      }
      this.$swal({
        title: 'Proses pembayaran ?',
        text: `Total Pembayaran adalah ${this.formatRupiah(this.form.nominal_pembayaran)}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Proses!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.value) {
          this.form.user = JSON.parse(localStorage.getItem('userData'))
          store.dispatch('app-keuangan/storeBatchUtang', this.form).then(x => {
            if (x.status === 200) {
              mdl.hide()
              this.$swal({
                icon: 'success',
                title: 'Transaksi berhasil!',
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
    resetModal() {
      this.form.data_utang = []
      this.form.form.nominal_pembayaran = 0
      this.form.supplier = ''
    },
    cekJenisPembayaran(id) {
      if (id.value === '1') {
        this.form.transfer = true
      } else {
        this.form.transfer = false
        this.form.bank = ''
      }
    },
    lunas(x) {
      if (x.item.lunas_check === true) {
        this.form.data_utang[x.index].jumlah_pembayaran = x.item.sisa_pembayaran
      } else {
        this.form.data_utang[x.index].jumlah_pembayaran = 0
      }
    },
    cekMax(x) {
      if (x.item.jumlah_pembayaran >= x.item.sisa_pembayaran) {
        this.form.data_utang[x.index].lunas_check = true
        this.form.data_utang[x.index].jumlah_pembayaran = x.item.sisa_pembayaran
      } else {
        this.form.data_utang[x.index].lunas_check = false
      }
    },
    cari(dd = null, ddd = null) {
      if (this.form.supplier === '') {
        this.$swal({
          icon: 'error',
          title: 'Pilih Supplier',
          customClass: {
            confirmButton: 'btn btn-success',
          },
        })
        return
      }
      this.loadBank()
      const dataUser = JSON.parse(localStorage.getItem('userData'))
      const cabang = dataUser.cabang_id
      store
        .dispatch('app-keuangan/getUtang', {
          cabang,
          dd,
          ddd,
        })
        .then(res => {
          store.commit('app-keuangan/SET_DATA_UTANG', res.data)
          this.form.data_utang = res.data.filter(x => x.kontak_id === this.form.supplier.id)
          this.form.data_utang = res.data.filter(x => x.sisa_pembayaran > 0)
        })
    },
    loadBank() {
      store.dispatch('app-transaksi-penjualan/fetchDataBank', this.dataOrder).then(res => {
        this.bankOption = res.data
      })
    },
    moment(value) {
      return this.$moment(value).format('DD MMMM YYYY')
    },
    formatRupiah(value) {
      return `Rp. ${value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')}`
    },
    format(value) {
      return `${value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')}`
    },
    destroy(data) {
      const { id } = data.item
      this.$swal({
        title: 'Delete data ?',
        text: 'Data transaksi pembayaran akan di hapus!',
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
            .dispatch('app-transaksi-pembelian/deletePembayaranUtang', {
              id,
            })
            .then(x => {
              if (x.status === 200) {
                store.commit('app-transaksi-pembelian/UPDATE_REMOVE_PEMBAYARAN', data.index)
                store.commit('app-transaksi-pembelian/UPDATE_PEMBAYARAN', {
                  jenis: 'HAPUS',
                  nominal: data.item.nominal,
                })
                this.$swal({
                  icon: 'success',
                  title: 'Transaksi sudah di Delete!',
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
  },

  setup() {
    const tableColumns = [
      { key: 'id', label: '#', sortable: false },
      { key: 'nomor_transaksi', sortable: false },
      { key: 'grand_total', sortable: false },
      { key: 'sisa_pembayaran', sortable: false },
      { key: 'nominal_pembayaran', sortable: false },
      { key: 'lunas' },
    ]

    return {
      tableColumns,
    }
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>
