import axios from 'axios';

export function getData(id, port, network) {
  const nstr = [null, null, 'vatsim', 'ivao'][network];
  return axios.get(`http://localhost:${port.toFixed(0)}/data/${id}${nstr ? `?n=${nstr}` : ''}`);
}
