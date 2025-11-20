import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/menu/Navbar';
import Footer from '@shared/components/menu/Footer';
import useFetch from '@shared/hooks/useFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';

const MenuLayout = () => {
  const { getTranslation } = useLanguage();

  // Fetch company data once at layout level
  const { data: companyData } = useFetch('/company/');

  // Extract company info from paginated response
  const company = companyData?.results?.[0];
  const companyName = getTranslation(company?.translations, 'name') || 'Digital Letter';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
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

export default MenuLayout;
