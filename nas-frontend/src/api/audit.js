import api from './client';

export const getAuditLogs = () => {
  return api.get('/audit'); // Admins see everything
};

export const getMyAuditLogs = () => {
  return api.get('/audit/my'); // Normal users see their actions
};
