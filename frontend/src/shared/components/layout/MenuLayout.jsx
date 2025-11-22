import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/menu/Navbar';
import Footer from '@shared/components/menu/Footer';
import { CompanyProvider, useCompany } from '@shared/contexts/CompanyContext';
import { useLanguage } from '@shared/contexts/LanguageContext';

const MenuLayoutContent = () => {
  const { getTranslation } = useLanguage();
  const { company } = useCompany();

  const companyName = getTranslation(company?.translations, 'name') || 'Digital Letter';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg transition-colors duration-200">
      {/* Navbar */}
      <Navbar companyName={companyName} />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer company={company} />
    </div>
  );
};

const MenuLayout = () => {
  return (
    <CompanyProvider>
      <MenuLayoutContent />
    </CompanyProvider>
  );
};

export default MenuLayout;
