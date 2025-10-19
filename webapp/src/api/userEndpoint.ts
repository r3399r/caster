import http from 'src/api/http';
import type { User } from 'src/model/backend/entity/UserEntity';

const getUser = async () => {
  try {
    return await http.get<User>('user', {
      headers: {
        'x-user-id': localStorage.getItem('userId') || 'no-user-id',
        'x-device-id': localStorage.getItem('deviceId') || 'no-device-id',
      },
    });
  } catch {
    console.log('User not found');
    return null;
  }
};

export default {
  getUser,
};
