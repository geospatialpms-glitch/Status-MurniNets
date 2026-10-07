# Dashboard Status MURNInets Negeri Selangor 2026 (SUO)

Dashboard **statik, interaktif** untuk GitHub Pages. Data berpunca daripada `analisa (10).xls` (sebenarnya eksport jadual HTML yang menggunakan sambungan `.xls`).

## Kandungan

- `index.html` — halaman utama.
- `styles.css` — reka bentuk responsif.
- `data.js` — **data sebenar yang diekstrak daripada fail pengguna**: 12 PBT × 48 kod indikator, skor skala 1–3.
- `app.js` — carian PBT, penapisan, peta penanda, carta interaktif, kedudukan, eksport CSV.

## Pasang di GitHub Pages

1. Buka atau cipta repositori GitHub, contohnya `Dashboard-MURNInets-Selangor`.
2. Muat naik **keempat-empat fail** di atas ke akar (root) repositori. Jika memuat naik ZIP, *extract* dahulu; GitHub Pages tidak membuka ZIP secara automatik.
3. Pergi ke **Settings → Pages**.
4. Dalam **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih **Branch: main**, **Folder: / (root)** dan klik **Save**.
6. Alamat lazimnya: `https://USERNAME.github.io/Dashboard-MURNInets-Selangor/`.

Peta menggunakan **Leaflet + OpenStreetMap** dan carta menggunakan **Chart.js**, dimuat melalui CDN. Sambungan Internet diperlukan untuk paparan peta dan carta.

## Kaedah pengiraan & had sumber

- Setiap PBT mempunyai 48 skor indikator skala 1, 2 atau 3 di baris ketiga bagi setiap kelompok PBT dalam fail sumber.
- Skor dashboard = `jumlah skor indikator / (3 × 48) × 100`.
- Untuk skor dimensi, hanya indikator dimensi berkenaan digunakan dengan pengiraan yang sama.
- Skor indikator negeri = `purata skor 12 PBT / 3 × 100`.
- Kategori **Cemerlang ≥80%**, **Baik ≥60%**, **Sederhana ≥40%** dan **Perlu Tindakan <40%** ialah **kategori paparan contoh**, bukan ambang rasmi yang disahkan.
- Nilai purata sekitar **94.3%** ialah **indeks normalisasi**, bukan jaminan skor penilaian rasmi MURNInets.
- **Tahun 2026** ialah label tajuk yang diminta untuk dashboard. Fail tidak mempunyai metadata kukuh yang mengesahkan tahun data; elakkan menggambarkannya sebagai dapatan rasmi tahun 2026 sehingga disahkan.
- Koordinat peta adalah **anggaran lokasi pusat PBT**. Ia **bukan poligon sempadan PBT** dan tidak mewakili liputan pentadbiran sebenar. Untuk peta sempadan rasmi, tambah fail GeoJSON sempadan PBT Selangor dengan ID PBT yang dipadankan.
- Sesetengah lajur asal mempunyai beberapa input bagi satu kod indikator; `data.js` memaparkan **skor indikator unik** (bukan setiap nilai input mentah).

## Cara kemas kini data

Fail `data.js` mempunyai objek `window.MURNINETS_DATA` dengan `pbt`, `indicators`, dan metadata. Kemaskini data tersebut mengikut struktur sama dan muat naik semula ke GitHub. Tiada pangkalan data atau backend diperlukan.
