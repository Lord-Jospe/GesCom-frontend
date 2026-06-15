import { FC } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './vertical/sidebar/Sidebar';
import Header from './vertical/header/Header';
import SubscriptionBanner from 'src/components/shared/SubscriptionBanner';

const ContadorLayout: FC = () => {
  return (
    <>
            <div className="flex w-full min-h-screen">
        <div className="page-wrapper flex w-full ">
          {/* Header/sidebar */}
          <div className="xl:block hidden">
            <Sidebar />
          </div>
          <div className="body-wrapper w-full bg-white dark:bg-dark">
            {/* Top Header  */}
            <Header />
            <SubscriptionBanner />

            {/* Body Content  */}
            <div className={'container mx-auto px-6 py-30'}>
              <main className="grow">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContadorLayout;
