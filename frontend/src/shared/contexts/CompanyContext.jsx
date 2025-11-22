import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import useFetch from '@shared/hooks/useFetch';

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  // Fetch company data
  const { data: companyData, loading, error } = useFetch('/company/');

  // Extract company info from paginated response
  const company = companyData?.results?.[0];

  return (
    <CompanyContext.Provider value={{ company, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

CompanyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export default CompanyContext;
