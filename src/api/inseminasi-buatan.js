import request from "@/utils/request";

export function addInseminasiBuatan(data) {
  return request({
    url: "/inseminasi",
    method: "post",
    data,
  });
}

export function getInseminasiBuatans() {
  return request({
    url: "/inseminasi",
    method: "get",
  });
}

export function editInseminasiBuatan(data, id) {
  return request({
    url: `/inseminasi/${id}`,
    method: "put",
    data,
  });
}

export function deleteInseminasiBuatan(data) {
  return request({
    url: `/inseminasi/${data.idInseminasi}`,
    method: "delete",
    data,
  });
}
