import api from './client';

export const listFilesInShare = (shareId) => {
  return api.get(`/shares/${shareId}/files`);
};

export const uploadFile = (shareId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/shares/${shareId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadFile = (shareId, fileId) => {
  return api.get(`/shares/${shareId}/files/${fileId}/download`, { responseType: 'blob' });
};

export const deleteFile = (shareId, fileId) => {
  return api.delete(`/shares/${shareId}/files/${fileId}`);
};
