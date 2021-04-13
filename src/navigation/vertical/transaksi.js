export default [
  {
    header: 'Transaksi',
  },
  {
    title: 'Penjualan',
    icon: 'HomeIcon',
    tag: '2',
    tagVariant: 'light-warning',
    children: [
      {
        title: 'Daftar',
        route: 'transaksi-penjualan-daftar',
      },
      {
        title: 'Transaksi Baru',
        route: 'transaksi-penjualan-tambah',
      },
      {
        title: 'Draft Transaksi',
        route: 'transaksi-penjualan-draft',
      },
    ],
  },
]
