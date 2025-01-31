import axios from "axios";

export function getData(id, port) {

  return axios.get(`http://localhost:${port.toFixed(0)}/data/${id}`);
}
  