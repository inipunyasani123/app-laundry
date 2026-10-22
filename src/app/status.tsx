import { Link, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Gambar from '@/components/Gambar';
import Ikon from '@/components/Ikon';
import { KURIR_GAMBAR } from '@/components/ikon-data';
import { KepalaDalam, Layar } from '@/components/kerangka';
import { LabelTahap } from '@/components/tanda';
import { Chip, Jahitan, Judul, Kartu, Kerangka, Lencana, Teks, Tombol } from '@/components/ui';
import { KURIR, LAYANAN, MEREK, TAHAP, kg, rupiah } from '@/lib/katalog';
import { hitungNota, indeksTahap, jamSlot, lunas, namaPewangi, namaTahapKini, perkiraanSelesai } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { hariKalimat, hariRelatif, jam, sisaWaktu } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/status',
    'Status Cucian per Tahap · Busa Ungu',
    'Lacak cucian dari diterima, ditimbang, dicuci, dikeringkan, disetrika, sampai diantar, lengkap dengan perkiraan selesai dalam WIB.',
  );
}

const KET: Record<string, string> = {
  diterima: 'Dicatat di outlet, diberi tiket gantung bernomor.',
  ditimbang: 'Ditimbang di timbangan digital, nota diperbarui.',
  dicuci: 'Dicuci mesin, suhu 30°, sesuai catatan khusus.',
  dikeringkan: 'Pengering suhu rendah supaya serat awet.',
  disetrika: 'Disetrika uap lalu dilipat atau digantung.',
  siap: 'Dikemas plastik, siap berangkat.',
};

export default function Status() {
  const { no } = useLocalSearchParams<{ no?: string }>();
  const { siap, kini, cari, berjalan, majukan, tandaiDiambil } = useBusa();
  const p = siap ? cari(no) ?? berjalan[0] : undefined;

  if (!siap) {
    return (
      <Layar kepala={<KepalaDalam judul="Status cucian" sub="Memuat tiket…" />}>
        <Kerangka tinggi={220} />
        <Kerangka tinggi={360} />
      </Layar>
    );
  }
  if (!p) {
    return (
      <Layar kepala={<KepalaDalam judul="Status cucian" />}>
        <Kartu style={{ gap: 12 }}>
          <Teks>Tiket {no ?? ''} tidak ditemukan. Mungkin data demo baru saja diatur ulang.</Teks>
          <Tombol label="Lihat riwayat" href="/riwayat" gaya="kedua" />
        </Kartu>
      </Layar>
    );
  }

  const i = indeksTahap(p, kini);
  const eta = perkiraanSelesai(p);
  const nota = hitungNota(p, kini);
  const selesaiSemua = i === 6;
  const lainnya = berjalan.filter((x) => x.no !== p.no);

  return (
    <Layar kepala={<KepalaDalam judul="Status cucian" sub={`${p.no} · ${LAYANAN[p.layanan].singkat}`} />}>
      {berjalan.length > 1 ? (
        <View role="radiogroup" aria-label="Pilih tiket" style={st.pilihTiket}>
          {berjalan.map((x) => (
            <Chip key={x.no} label={x.no} aktif={x.no === p.no} onPress={() => router.setParams({ no: x.no })} />
          ))}
        </View>
      ) : null}

      {/* Label satin: tahap kini & perkiraan selesai */}
      <View style={st.satin}>
        <View style={st.satinDalam}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={st.satinNo}>{p.no}</Text>
            {lunas(p, kini) ? <Lencana label="LUNAS" jenis="hijau" /> : p.bayar?.metode === 'tunai' ? <Lencana label="BAYAR TUNAI" jenis="kuning" /> : <Lencana label="BELUM BAYAR" jenis="koral" />}
          </View>
          <Judul level={2} ukuran={30} style={{ color: warna.unguTua }}>
            {namaTahapKini(p, kini)}
          </Judul>
          <LabelTahap p={p} kini={kini} />
          <Jahitan warnaGaris={warna.lavender} style={{ marginVertical: 4 }} />
          {i === -1 && p.jemput ? (
            <View>
              <Text style={st.etaLabel}>KURIR MENJEMPUT</Text>
              <Text style={st.etaBesar}>
                {hariRelatif(p.jemput, kini)}, {jamSlot(p.jemput)}
              </Text>
              <Teks redup kecil>
                Cucian selesai sekitar {hariKalimat(eta, kini)} {jam(eta)} WIB
              </Teks>
            </View>
          ) : selesaiSemua ? (
            <View>
              <Text style={st.etaLabel}>{p.antar ? 'DITERIMA' : 'DIAMBIL'}</Text>
              <Text style={st.etaBesar}>
                {hariRelatif(p.jadwal.tuntas, kini)}, {jam(p.jadwal.tuntas)} WIB
              </Text>
            </View>
          ) : (
            <View>
              <Text style={st.etaLabel}>{p.antar ? 'PERKIRAAN TIBA DI RUMAH' : 'PERKIRAAN SIAP DIAMBIL'}</Text>
              <Text style={st.etaBesar}>
                {hariRelatif(eta, kini)}, {jam(eta)} WIB
              </Text>
              <Teks redup kecil>
                {sisaWaktu(eta, kini)} · janji layanan {LAYANAN[p.layanan].ket.toLowerCase()}
              </Teks>
            </View>
          )}
        </View>
      </View>

      {/* Garis waktu */}
      <Kartu style={{ paddingVertical: 6 }}>
        <Judul level={2} ukuran={18} style={{ paddingTop: 10, paddingBottom: 4 }}>
          Perjalanan cucian
        </Judul>
        {p.jemput ? (
          <BarisWaktu
            simbol="motor"
            nama="Dijemput kurir"
            waktu={i >= 0 ? `${jam(p.jadwal.diterima - 40 * 60_000)} WIB` : `slot ${jamSlot(p.jemput)}`}
            ket={`${KURIR.nama} · ${p.alamat}`}
            keadaan={i >= 0 ? 'lewat' : 'kini'}
          />
        ) : null}
        {TAHAP.map((t, k) => {
          const keadaan = k < i || i === 6 ? 'lewat' : k === i ? 'kini' : 'nanti';
          const w = p.jadwal[t.kode];
          let nama = t.nama;
          if (t.kode === 'disetrika' && p.layanan === 'lipat') nama = 'Dilipat';
          if (t.kode === 'siap') nama = p.antar ? 'Siap & diantar' : 'Siap diambil';
          let ket = KET[t.kode];
          if (t.kode === 'ditimbang' && keadaan !== 'nanti' && p.berat > 0) ket = `Berat ${kg(p.berat)}. ${ket}`;
          if (t.kode === 'dicuci') ket = `${p.pisahWarna ? 'Putih & warna dipisah. ' : ''}Pewangi ${namaPewangi(p.pewangi)}.`;
          if (t.kode === 'siap') ket = p.antar ? `Kurir ${KURIR.nama} mengantar ke alamatmu.` : `Ambil di ${MEREK.outlet}, buka ${MEREK.jamBuka}.`;
          return (
            <BarisWaktu
              key={t.kode}
              simbol={t.simbol}
              nama={nama}
              waktu={keadaan === 'nanti' ? `perkiraan ${hariKalimat(w, kini)} ${jam(w)}` : `${hariKalimat(w, kini)} ${jam(w)} WIB`}
              ket={ket}
              keadaan={keadaan}
              terakhir={k === TAHAP.length - 1}
            />
          );
        })}
      </Kartu>

      {p.antar && (i === -1 || i >= 5) && !selesaiSemua ? (
        <Kartu style={st.kurir}>
          <Gambar bentuk={KURIR_GAMBAR} kotak={64} ukuran={60} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={st.kurirNama}>Kurir {KURIR.nama}</Text>
            <Teks kecil redup>{KURIR.motor}</Teks>
            <Teks kecil>{i === -1 ? `Datang ${hariKalimat(p.jemput!, kini)} slot ${jamSlot(p.jemput!)}` : `Tiba sekitar ${jam(eta)} WIB`}</Teks>
          </View>
        </Kartu>
      ) : null}

      <Kartu style={{ gap: 10 }}>
        <Judul level={2} ukuran={18}>Catatan khusus</Judul>
        <View style={st.catatan}>
          <Baris ikon="tetes" label="Pewangi" isi={namaPewangi(p.pewangi)} />
          <Baris ikon="pisah" label="Pisah warna" isi={p.pisahWarna ? 'Ya, putih dicuci terpisah' : 'Tidak'} />
          <Baris ikon={p.lipat === 'gantung' ? 'gantungan' : 'lipatan'} label="Selesai" isi={p.lipat === 'gantung' ? 'Digantung pakai hanger' : 'Dilipat'} />
          <Baris ikon="noda" label="Noda" isi={p.noda.length ? `${p.noda.join(', ')}${p.catatanNoda ? `: ${p.catatanNoda}` : ''}` : 'Tidak ada'} />
          {p.catatan ? <Baris ikon="info" label="Pesan" isi={p.catatan} /> : null}
        </View>
      </Kartu>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tombol label="Lihat nota" ikon="nota" gaya="kedua" href={{ pathname: '/nota', params: { no: p.no } }} style={{ flex: 1 }} />
          {!p.bayar ? (
            <Tombol label={`Bayar`} ikon="dompet" href={{ pathname: '/bayar', params: { no: p.no } }} style={{ flex: 1 }} labelAria={`Bayar ${p.no}`} />
          ) : null}
        </View>
        {!p.antar && i === 5 ? <Tombol label="Sudah saya ambil" ikon="cek" gaya="tipis" onPress={() => tandaiDiambil(p.no)} /> : null}
        {!selesaiSemua ? (
          <Tombol label="Majukan ke tahap berikutnya (simulasi)" ikon="maju" gaya="tipis" kecil onPress={() => majukan(p.no)} />
        ) : null}
        <Teks kecil redup style={{ textAlign: 'center' }}>
          {nota.sudahTimbang ? `Total ${rupiah(nota.total)}${lunas(p, kini) ? ', lunas' : ''}` : 'Total final setelah ditimbang'}
          {lainnya.length ? ` · ${lainnya.length} tiket lain berjalan` : ''}
        </Teks>
      </View>
      <Link href="/riwayat" style={st.tautan}>
        Lihat semua order
      </Link>
    </Layar>
  );
}

function BarisWaktu({ simbol, nama, waktu, ket, keadaan, terakhir }: {
  simbol: Parameters<typeof Ikon>[0]['nama']; nama: string; waktu: string; ket: string; keadaan: 'lewat' | 'kini' | 'nanti'; terakhir?: boolean;
}) {
  return (
    <View style={st.baris} aria-label={`${nama}, ${keadaan === 'lewat' ? 'selesai' : keadaan === 'kini' ? 'sedang berlangsung' : 'belum'}, ${waktu}. ${ket}`}>
      <View style={{ alignItems: 'center', width: 40 }}>
        <View style={[st.bulat, keadaan === 'lewat' && st.bulatLewat, keadaan === 'kini' && st.bulatKini]}>
          <Ikon nama={simbol} ukuran={20} warna={keadaan === 'kini' ? warna.putih : keadaan === 'lewat' ? warna.unguTua : '#7D7596'} />
        </View>
        {!terakhir ? <View style={[st.tali, keadaan === 'lewat' && { backgroundColor: warna.ungu }]} /> : null}
      </View>
      <View style={{ flex: 1, paddingBottom: terakhir ? 6 : 14, gap: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[st.barisNama, keadaan === 'nanti' && { color: warna.redup }]}>{nama}</Text>
          <Text style={st.barisWaktu}>{waktu}</Text>
        </View>
        <Text style={st.barisKet}>{ket}</Text>
      </View>
    </View>
  );
}

function Baris({ ikon, label, isi }: { ikon: Parameters<typeof Ikon>[0]['nama']; label: string; isi: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={st.ikonKecil}>
        <Ikon nama={ikon} ukuran={18} warna={warna.unguTua} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: warna.redup, fontWeight: '700' }}>{label}</Text>
        <Text style={{ fontSize: 14, color: warna.tinta, lineHeight: 20 }}>{isi}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  pilihTiket: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  satin: { backgroundColor: warna.kartu, borderRadius: sudut.besar, padding: 6, borderWidth: 1, borderColor: warna.garis },
  satinDalam: {
    borderRadius: sudut.besar - 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: warna.lavender,
    padding: 14,
    gap: 10,
  },
  satinNo: { fontFamily: hurufAngka, fontSize: 14, color: warna.redup, letterSpacing: 1 },
  etaLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: warna.redup },
  etaBesar: { fontFamily: hurufJudul, fontSize: 22, lineHeight: 28, color: warna.tinta },
  baris: { flexDirection: 'row', gap: 10, paddingTop: 10 },
  bulat: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#B9AEDA', alignItems: 'center', justifyContent: 'center', backgroundColor: warna.kartu },
  bulatLewat: { backgroundColor: warna.lavender, borderColor: warna.lavender },
  bulatKini: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  tali: { width: 2, flex: 1, backgroundColor: '#D5CCEE', marginTop: 4 },
  barisNama: { fontSize: 15, fontWeight: '800', color: warna.tinta },
  barisWaktu: { fontSize: 13, color: warna.redup, fontFamily: hurufAngka },
  barisKet: { fontSize: 13, lineHeight: 19, color: warna.redup },
  kurir: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: warna.kuningMuda, borderColor: '#F3DE8A' },
  kurirNama: { fontFamily: hurufJudul, fontSize: 18, color: warna.tinta },
  catatan: { gap: 12 },
  ikonKecil: { width: 34, height: 34, borderRadius: 17, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  tautan: { color: warna.unguTua, fontWeight: '700', fontSize: 14, textAlign: 'center', padding: 10, textDecorationLine: 'underline' },
});
