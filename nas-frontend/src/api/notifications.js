import api from './client';

export const getNotifications = () => {
  return api.get('/notifications');
};

export const markNotificationAsRead = (notificationId) => {
  return api.delete(`/notifications/${notificationId}`);
};
