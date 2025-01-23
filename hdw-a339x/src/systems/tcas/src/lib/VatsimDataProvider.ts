import axios from "axios";

export function getData() {
  return axios.get("https://data.vatsim.net/v3/vatsim-data.json");
}