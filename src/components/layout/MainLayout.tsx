import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <div className="md:pl-64 transition-all duration-300">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
