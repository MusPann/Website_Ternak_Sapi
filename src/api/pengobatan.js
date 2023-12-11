import request from "@/utils/request";

export function addPengobatan(data) {
  return request({
    url: "/pengobatan",
    method: "post",
    data,
  });
}

export function getPengobatan() {
  return request({
    url: "/pengobatan",
    method: "get",
  });
}

export function editPengobatan(data, id) {
  return request({
    url: `/pengobatan/${id}`,
    method: "put",
    data,
  });
}

export function deletePengobatan(data) {
  return request({
    url: `/pengobatan/${data.idKasus}`,
    method: "delete",
    data,
  });
}
