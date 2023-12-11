import request from "@/utils/request";
export function addKandang(data) {
  // Buat objek FormData untuk mengirim file
  const formData = new FormData();
  formData.append('idKandang', data.idKandang)
  formData.append('idPeternak', data.idPeternak)
  formData.append('namaPeternak', data.namaPeternak)
  formData.append('luas', data.luas)
  formData.append('kapasitas', data.kapasitas)
  formData.append('nilaiBangunan', data.nilaiBangunan)
  formData.append('alamat', data.alamat)
  formData.append('desa', data.desa)
  formData.append('kecamatan', data.kecamatan)
  formData.append('kabupaten', data.kabupaten)
  formData.append('provinsi', data.provinsi)
  formData.append('latitude', data.latitude)
  formData.append('longitude', data.longitude)
  formData.append('file', data.file.file); // 'file' sesuai dengan nama field di backend

  return request({
    url: "/kandang",
    method: "post",
    data: formData, // Mengirim FormData dengan file
  });
}

export function addKandangWithoutFile(data) {
  const formData = new FormData();
  formData.append('idKandang', data.idKandang)
  formData.append('idPeternak', data.idPeternak)
  formData.append('namaPeternak', data.namaPeternak)
  formData.append('luas', data.luas)
  formData.append('kapasitas', data.kapasitas)
  formData.append('nilaiBangunan', data.nilaiBangunan)
  formData.append('alamat', data.alamat)
  formData.append('desa', data.desa)
  formData.append('kecamatan', data.kecamatan)
  formData.append('kabupaten', data.kabupaten)
  formData.append('provinsi', data.provinsi)
  formData.append('latitude', data.latitude)
  formData.append('longitude', data.longitude)

  return request({
    url: "/kandang",
    method: "post",
    data: formData,
  });
}

export function getKandang() {
  return request({
    url: "/kandang",
    method: "get",
  });
}

export function getKandangWithPeternakInfo() {
  return request({
    url: "/kandang", 
    method: "get",
    params: {
      join: "peternak", // Melakukan join dengan tabel peternak
      fields: "idKandang, idPeternak, namaPeternak", // Kolom yang ingin diambil dari tabel kandang dan peternak
    },
  });
}

export function editKandang(data, idKandang) {
  return request({
    url: `/kandang/${idKandang}`,
    method: "put",
    data,
  });
}

export function deleteKandang(data) {
  return request({
    url: `/kandang/${data.idKandang}`,
    method: "delete",
    data,
  });
}
