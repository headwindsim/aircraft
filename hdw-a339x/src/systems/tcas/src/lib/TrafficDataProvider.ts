import axios from 'axios';

export function getData(id, port, network) {
  const network = [null, null, 'vatsim', 'ivao'];
  return axios.get(`http://localhost:${port.toFixed(0)}/data/${id}${network ? `?n=${network}` : ''}`);
}
