import { v4 as uuidv4 } from 'uuid';
import { Outlet } from 'react-router-dom';
import Bar from './components/Bar';
import { useEffect, useState } from 'react';
import userEndpoint from './api/userEndpoint';
import { encrypt } from './util/crypto';

const AppLayout = () => {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId');
    const userId = localStorage.getItem('userId');
    if (deviceId !== null && userId !== null) {
      setReady(true);
      return;
    }
    userEndpoint.getUser().then((res) => {
      if (!res) return;
      if (res.data === null) {
        if (deviceId === null) localStorage.setItem('deviceId', uuidv4());
      } else {
        if (userId === null)
          localStorage.setItem('userId', encrypt(res.data.id.toString(), res.data.deviceId));
        if (deviceId === null) localStorage.setItem('deviceId', res.data.deviceId);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return <div>loading...</div>;

  return (
    <>
      <Bar />
      <div className="mx-4 mt-4 mb-20 sm:mx-10 md:mx-auto md:w-[945px]">
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;
