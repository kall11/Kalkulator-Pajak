document.addEventListener("DOMContentLoaded", () => {
  const ptkpMap = {
    "TK/0": 54000000,
    "K/0": 58500000,
    "K/1": 63000000,
    "K/2": 67500000,
    "K/3": 72000000,
  };

  const btnTetap = document.getElementById("btn-tetap");
  const btnTidakTetap = document.getElementById("btn-tidaktetap");
  const btnBukan = document.getElementById("btn-bukan");
  const hasilBox = document.getElementById("hasil");

  const inputGroups = document.querySelectorAll(".form-group");

  function showInput(ids) {
    inputGroups.forEach(group => group.style.display = "none");
    ids.forEach(id => {
      const el = document.getElementById(`group-${id}`);
      if (el) el.style.display = "block";
    });
    hasilBox.innerHTML = "";
  }

  btnTetap.onclick = () => {
    setActive(btnTetap);
    showInput(["gaji", "pensiun", "zakat", "jht", "status-ptkp"]);
  };

  btnTidakTetap.onclick = () => {
    setActive(btnTidakTetap);
    showInput(["harian", "frekuensi", "zakat-tt", "jht-tt", "status-ptkp-tt"]);
  };

  btnBukan.onclick = () => {
    setActive(btnBukan);
    showInput(["kegiatan", "bruto-bp", "nppn", "npwp", "zakat-bp"]);
  };

  function setActive(activeBtn) {
    [btnTetap, btnTidakTetap, btnBukan].forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  // Format otomatis ke Rupiah
  document.querySelectorAll("input[type='text']").forEach(input => {
    input.addEventListener("input", () => {
      let angka = input.value.replace(/[^0-9]/g, "");
      input.value = angka ? formatRupiah(angka) : "";
    });
  });

  document.getElementById("hitungBtn").onclick = () => {
    if (btnTetap.classList.contains("active")) return hitungTetap();
    if (btnTidakTetap.classList.contains("active")) return hitungTidakTetap();
    if (btnBukan.classList.contains("active")) return hitungBukanPegawai();
  };

  function hitungTetap() {
    const gaji = getAngka("gaji");
    const pensiun = getAngka("pensiun");
    const zakat = getAngka("zakat");
    const jht = getAngka("jht");
    const status = document.getElementById("statusPtkp").value;

    const bruto = gaji * 12;
    const biayaJabatan = Math.min(0.05 * bruto, 6000000);
    const totalPengurang = biayaJabatan + (pensiun * 12) + zakat + jht;
    const neto = bruto - totalPengurang;
    const pkp = Math.max(0, neto - ptkpMap[status]);

    const pajak = hitungTarif(pkp);
    hasilBox.innerHTML = `
      <div><strong>Bruto Setahun:</strong> Rp ${formatRupiah(bruto)}</div>
      <div><strong>Biaya Jabatan:</strong> Rp ${formatRupiah(biayaJabatan)}</div>
      <div><strong>Total Pengurang:</strong> Rp ${formatRupiah(totalPengurang)}</div>
      <div><strong>Neto Setahun:</strong> Rp ${formatRupiah(neto)}</div>
      <div><strong>PKP:</strong> Rp ${formatRupiah(pkp)}</div>
      <hr>
      <div><strong>PPh 21 Setahun:</strong> Rp ${formatRupiah(pajak)}</div>
      <div><strong>PPh 21 per Bulan:</strong> Rp ${formatRupiah(pajak / 12)}</div>
    `;
  }

  function hitungTidakTetap() {
    const harian = getAngka("harian");
    const frek = parseInt(document.getElementById("frekuensi").value) || 0;
    const zakat = getAngka("zakat-tt");
    const jht = getAngka("jht-tt");
    const status = document.getElementById("statusPtkpTt").value;

    const bruto = harian * frek;
    const dasar = bruto > 2500000 ? bruto * 0.5 : 0;
    const pkp = Math.max(0, dasar - zakat - jht - ptkpMap[status]);

    const pajak = hitungTarif(pkp);
    hasilBox.innerHTML = `
      <div><strong>Bruto Harian:</strong> Rp ${formatRupiah(harian)}</div>
      <div><strong>Frekuensi Kerja:</strong> ${frek} hari</div>
      <div><strong>Total Bruto:</strong> Rp ${formatRupiah(bruto)}</div>
      <div><strong>Dasar Pajak:</strong> Rp ${formatRupiah(dasar)}</div>
      <div><strong>PKP:</strong> Rp ${formatRupiah(pkp)}</div>
      <hr>
      <div><strong>PPh 21 Setahun:</strong> Rp ${formatRupiah(pajak)}</div>
    `;
  }

  function hitungBukanPegawai() {
    const bruto = getAngka("bruto-bp");
    const persen = parseFloat(document.getElementById("nppn").value) || 50;
    const npwp = document.getElementById("npwp").value === "Ya";
    const zakat = getAngka("zakat-bp");

    const nppn = bruto * (persen / 100);
    const dpp = Math.max(0, nppn - zakat);
    const tarif = npwp ? 0.05 : 0.06;
    const pajak = dpp * tarif;

    hasilBox.innerHTML = `
      <div><strong>Bruto:</strong> Rp ${formatRupiah(bruto)}</div>
      <div><strong>NPPN (${persen}%):</strong> Rp ${formatRupiah(nppn)}</div>
      <div><strong>Pengurang (Zakat):</strong> Rp ${formatRupiah(zakat)}</div>
      <div><strong>DPP:</strong> Rp ${formatRupiah(dpp)}</div>
      <div><strong>Tarif (${tarif * 100}%):</strong></div>
      <hr>
      <div><strong>PPh 21:</strong> Rp ${formatRupiah(pajak)}</div>
    `;
  }

  function hitungTarif(pkp) {
    let pajak = 0;
    if (pkp <= 0) return 0;
    if (pkp <= 60000000) pajak = pkp * 0.05;
    else if (pkp <= 250000000) pajak = 3000000 + (pkp - 60000000) * 0.15;
    else if (pkp <= 500000000) pajak = 3000000 + 28500000 + (pkp - 250000000) * 0.25;
    else pajak = 3000000 + 28500000 + 62500000 + (pkp - 500000000) * 0.3;
    return pajak;
  }

  function formatRupiah(angka) {
    return parseInt(angka).toLocaleString('id-ID');
  }

  function getAngka(id) {
    const el = document.getElementById(id);
    return parseInt(el.value.replace(/[^\d]/g, "")) || 0;
  }

  // Default load
  btnTetap.click();
});
// Event listener SKD
const brutoInput = document.getElementById("bruto");
const kursInput = document.getElementById("kurs");
const mataUangSelect = document.getElementById("mataUang");
const skdSelect = document.getElementById("skd");
const tarifContainer = document.getElementById("tarifContainer");
const tarifP3BInput = document.getElementById("tarifP3B");

const detailNama = document.getElementById("detailNama");
const detailNegara = document.getElementById("detailNegara");
const detailBruto = document.getElementById("detailBruto");
const detailKurs = document.getElementById("detailKurs");
const detailBrutoIDR = document.getElementById("detailBrutoIDR");
const detailTarif = document.getElementById("detailTarif");
const detailPPh = document.getElementById("detailPPh");
const hasilDiv = document.getElementById("hasil");

// Format angka ke mata uang (IDR atau mata uang lain)
function formatCurrency(value, currency) {
  if (!value) return '-';
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  });
  return formatter.format(value);
}

// Ambil angka murni dari input (menghapus karakter selain angka)
function parseNumber(str) {
  return Number(str.replace(/[^\d]/g, ""));
}

// Format otomatis input angka untuk penghasilan bruto
function setupCurrencyInput(inputElement) {
  inputElement.addEventListener("input", () => {
    const mataUang = mataUangSelect.value;
    const rawValue = parseNumber(inputElement.value);
    inputElement.value = formatCurrency(rawValue, mataUang === "IDR" ? "IDR" : mataUang);
  });
}

setupCurrencyInput(brutoInput); // hanya bruto, bukan kurs

// Menyembunyikan atau menampilkan input kurs sesuai dengan mata uang yang dipilih
mataUangSelect.addEventListener("change", () => {
  const mataUang = mataUangSelect.value;
  if (mataUang === "IDR") {
    kursInput.disabled = true;  // Menonaktifkan input kurs
    kursInput.value = '';      // Mengosongkan nilai kurs
  } else {
    kursInput.disabled = false; // Mengaktifkan input kurs
    kursInput.placeholder = `Masukkan kurs (${mataUang})`; // Menampilkan placeholder sesuai mata uang
  }
});

// Format kurs untuk IDR atau untuk angka biasa
kursInput.addEventListener("input", () => {
  const mataUang = mataUangSelect.value;
  if (mataUang !== "IDR") {
    const kursRaw = parseNumber(kursInput.value);
    kursInput.value = formatCurrency(kursRaw, "IDR");  // Kurs selalu dalam format IDR (Rupiah)
  }
});

// Tampilkan input tarif P3B jika punya SKD
skdSelect.addEventListener("change", () => {
  tarifContainer.style.display = skdSelect.value === "ya" ? "block" : "none";
});

// Fungsi utama hitung PPh 26
function hitungPPh26() {
  const nama = document.getElementById("nama").value;
  const negara = document.getElementById("negara").value;
  const mataUang = mataUangSelect.value;
  const brutoRaw = parseNumber(brutoInput.value);
  const kurs = Number(kursInput.value.replace(/[^\d]/g, ""));  // Mengambil angka kurs tanpa simbol
  const skd = skdSelect.value;
  const tarifP3B = parseFloat(tarifP3BInput.value);

  if (!brutoRaw || (mataUang !== "IDR" && !kurs)) {
    alert("Mohon isi penghasilan bruto dan kurs jika mata uang bukan IDR.");
    return;
  }

  let brutoIDR = brutoRaw;
  if (mataUang !== "IDR") {
    brutoIDR = brutoRaw * kurs;
  }

  let tarif = 20; // default tarif PPh 26
  if (skd === "ya" && !isNaN(tarifP3B)) {
    tarif = tarifP3B;
  }

  const pph = Math.round((tarif / 100) * brutoIDR);

  // Tampilkan hasil
  detailNama.textContent = `Nama: ${nama}`;
  detailNegara.textContent = `Negara Domisili: ${negara}`;
  detailBruto.textContent = `Penghasilan Bruto (${mataUang}): ${formatCurrency(brutoRaw, mataUang)}`;
  detailKurs.textContent = mataUang !== "IDR"
    ? `Kurs: Rupiah (Rp ${kurs.toLocaleString("id-ID")})`
    : "Kurs: -";
  detailBrutoIDR.textContent = `Bruto dalam IDR: ${formatCurrency(brutoIDR, "IDR")}`;
  detailTarif.textContent = `Tarif Pajak: ${tarif}%`;
  detailPPh.textContent = `PPh 26 Terutang: ${formatCurrency(pph, "IDR")}`;

  hasilDiv.style.display = "block";
}
