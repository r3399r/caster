import { v4 as uuidv4 } from 'uuid';
import { Outlet } from 'react-router-dom';
import Bar from './components/Bar';
import { useEffect, useState } from 'react';
import userEndpoint from './api/userEndpoint';

const AppLayout = () => {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    userEndpoint.getUser().then((res) => {
      if (res === null) {
        if (localStorage.getItem('deviceId') === null) localStorage.setItem('deviceId', uuidv4());
      } else {
        localStorage.setItem('userId', res.data.id.toString());
        localStorage.setItem('deviceId', res.data.deviceId);
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
