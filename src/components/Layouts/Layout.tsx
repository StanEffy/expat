import { ReactNode, lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Layout.scss';

const GlowingShapes = lazy(() => import('../Decorative/GlowingShapes'));

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="wrapper">
      <Suspense fallback={null}>
        <GlowingShapes />
      </Suspense>
      <Header />
      <main className="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
