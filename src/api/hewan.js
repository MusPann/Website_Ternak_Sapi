import request from "@/utils/request";
export function addHewan(data) {
  // Buat objek FormData untuk mengirim file
  const formData = new FormData();
  formData.append('kodeEartagNasional', data.kodeEartagNasional)
  formData.append('noKartuTernak', data.noKartuTernak)
  formData.append('provinsi', data.provinsi)
  formData.append('kabupaten', data.kabupaten)
  formData.append('kecamatan', data.kecamatan)
  formData.append('desa', data.desa)
  formData.append('alamat', data.alamat)
  formData.append('latitude', data.latitude)
  formData.append('longitude', data.longitude)
  formData.append('idPeternak', data.idPeternak)
  formData.append('idKandang', data.idKandang)
  formData.append('spesies', data.spesies)
  formData.append('sex', data.sex)
  formData.append('umur', data.umur)
  formData.append('identifikasiHewan', data.identifikasiHewan)
  formData.append('petugasPendaftar', data.petugasPendaftar)
  formData.append('tanggalTerdaftar', data.tanggalTerdaftar)
  formData.append('file', data.file.file); // 'file' sesuai dengan nama field di backend

  return request({
    url: "/hewan",
    method: "post",
    data: formData, // Mengirim FormData dengan file
  });
}

export function addHewanWithoutFile(data) {
  // Buat objek FormData untuk mengirim file
  const formData = new FormData();
  formData.append('kodeEartagNasional', data.kodeEartagNasional)
  formData.append('noKartuTernak', data.noKartuTernak)
  formData.append('provinsi', data.provinsi)
  formData.append('kabupaten', data.kabupaten)
  formData.append('kecamatan', data.kecamatan)
  formData.append('desa', data.desa)
  formData.append('latitude', data.latitude)
  formData.append('longitude', data.longitude)
  formData.append('idPeternak', data.idPeternak)
  formData.append('idKandang', data.idKandang)
  formData.append('spesies', data.spesies)
  formData.append('sex', data.sex)
  formData.append('umur', data.umur)
  formData.append('identifikasiHewan', data.identifikasiHewan)
  formData.append('petugasPendaftar', data.petugasPendaftar)
  formData.append('tanggalTerdaftar', data.tanggalTerdaftar)

  return request({
    url: "/hewan",
    method: "post",
    data: formData, // Mengirim FormData dengan file
  });
}

export function getHewans() {
  return request({
    url: "/hewan",
    method: "get",
  });
}

export function editHewan(data, id) {
  const formData = new FormData();
  formData.append('kodeEartagNasional', data.kodeEartagNasional)
  formData.append('noKartuTernak', data.noKartuTernak)
  formData.append('provinsi', data.provinsi)
  formData.append('kabupaten', data.kabupaten)
  formData.append('kecamatan', data.kecamatan)
  formData.append('desa', data.desa)
  formData.append('idPeternak', data.idPeternak)
  formData.append('idKandang', data.idKandang)
  formData.append('spesies', data.spesies)
  formData.append('sex', data.sex)
  formData.append('umur', data.umur)
  formData.append('identifikasiHewan', data.identifikasiHewan)
  formData.append('petugasPendaftar', data.petugasPendaftar)
  formData.append('tanggalTerdaftar', data.tanggalTerdaftar)

  return request({
    url: `/hewan/${id}`,
    method: "put",
    data: formData,
  });
}

export function deleteHewan(data) {
  return request({
    url: `/hewan/${data.kodeEartagNasional}`,
    method: "delete",
    data,
  });
}


