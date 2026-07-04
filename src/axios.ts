import axios from 'axios';
const token = localStorage.getItem('accessToken');
const instance = axios.create({
  baseURL: 'http://localhost:5062/api',
  headers: {
    'content-type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

export default instance;
