import api from './client';

export const listGroups = () => {
  return api.get('/groups');
};

export const createGroup = (groupData) => {
  return api.post('/groups', groupData); // Admin-only
};

export const addUserToGroup = (groupId, userId) => {
  return api.post('/groups/addUser', { groupId, userId });
};

export const assignShareToGroup = (groupId, shareId) => {
  return api.post('/groups/assignShare', { groupId, shareId });
};
