# Busa Ungu — demo aplikasi pelanggan laundry

Demo aplikasi mobile buatan [PintuWeb](https://www.pintuweb.id) untuk usaha laundry **fiktif**.
Live: https://app-laundry.pintuweb.id

- React Native + Expo SDK 58 (expo-router, web `output: "static"`): satu kode untuk Android, iOS, dan web.
- Data disimulasikan di perangkat (AsyncStorage / localStorage). Tanpa server, tanpa layanan berbayar.
- Fitur: status cucian per tahap dengan perkiraan selesai WIB, pesan jemput-antar (slot jam), daftar harga,
  nota digital, pembayaran simulasi, riwayat, poin & promo, catatan noda/pewangi, notifikasi simulasi.

```bash
npm install
npx expo start          # Android / iOS (Expo Go atau development build) dan web
npx expo export -p web  # hasil statis di dist/
```

Sumber gambar dan huruf: `public/images/SUMBER.md`.
