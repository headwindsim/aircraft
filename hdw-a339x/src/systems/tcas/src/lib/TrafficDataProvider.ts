import axios from "axios";

export function getData(id, port, speedOnly = false) {

  return axios.get(`http://localhost:${port.toFixed(0)}/${speedOnly ? "groundspeed" : "data"}/${id}`);
}
  