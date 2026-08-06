import axios from '../axios';
import type { ICostingRequest } from '../global/interfaces';

export const postCostingRequest = async (
  costingRequestData: ICostingRequest,
) => {
  const data = await axios.post('/costing', costingRequestData).then((res) => {
    return res?.data;
  });
  return data;
};

export const getMaterialsByCategoryRequest = async (category: number) => {
  const data = await axios.get(`/materials/${category}`).then((res) => {
    return res?.data;
  });
  return data;
};

export const getFormulas = async () => {
  const data = await axios.get('/formulas').then((res) => {
    return res?.data;
  });
  return data;
};

export const getFormulaById = async (id: number) => {
  const data = await axios.get(`/formulas/${id}`).then((res) => {
    return res?.data;
  });
  return data;
};

export const getMaterialCategories = async () => {
  const data = await axios.get(`/categories`).then((res) => {
    return res?.data;
  });
  return data;
};

export const getMachines = async () => {
  const data = await axios.get('/machines').then((res) => {
    return res?.data;
  });
  return data;
};
