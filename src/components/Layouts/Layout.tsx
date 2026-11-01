import { ReactNode, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Layout.scss';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useScrollReveal(wrapperRef);

  return (
    <div className="wrapper" ref={wrapperRef}>
      <Header />
      <div className="scroll-progress" aria-hidden="true" />
      <main className="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
