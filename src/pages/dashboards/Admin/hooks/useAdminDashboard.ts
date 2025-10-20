import { useNavigate } from 'react-router-dom';

export const useAdminDashboard = () => {
  const navigate = useNavigate();

  const setView = (view: string) => {
    if (view === 'dashboard') {
      navigate('/dashboard/admin');
    } else {
      navigate(`/dashboard/admin?view=${view}`);
    }
  };

  return {
    setView
  };
};

export default useAdminDashboard;

