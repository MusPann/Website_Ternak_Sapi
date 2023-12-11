import request from "@/utils/request";

export function addPeternak(data) {
  return request({
    url: "/peternak",
    method: "post",
    data,
  });
}

export function getPeternaks() {
  return request({
    url: "/peternak",
    method: "get",
  });
}

export function editPeternak(data, id) {
  return request({
    url: `/peternak/${id}`,
    method: "put",
    data,
  });
}

export function deletePeternak(data) {
  return request({
    url: `/peternak/${data.idPeternak}`,
    method: "delete",
    data,
  });
}
