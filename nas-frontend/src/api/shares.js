import api from './client';

export const listShares = () => {
  return api.get('/shares');
};

export const getShareDetails = (shareId) => {
  return api.get(`/shares/${shareId}`);
};

export const createShare = (shareData) => {
  return api.post('/shares', shareData); // Admin-only
};

export const updateShare = (shareId, shareData) => {
  return api.put(`/shares/${shareId}`, shareData);
};

export const deleteShare = (shareId) => {
  return api.delete(`/shares/${shareId}`);
};
