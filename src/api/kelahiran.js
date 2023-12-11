import request from "@/utils/request";

export function addKelahiran(data) {
  return request({
    url: "/kelahiran",
    method: "post",
    data,
  });
}

export function getKelahiran() {
  return request({
    url: "/kelahiran",
    method: "get",
  });
}

export function editKelahiran(data, id) {
  return request({
    url: `/kelahiran/${id}`,
    method: "put",
    data,
  });
}

export function deleteKelahiran(data) {
  return request({
    url: `/kelahiran/${data.idKejadian}`,
    method: "delete",
    data,
  });
}
