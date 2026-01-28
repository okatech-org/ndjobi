import { useState } from 'react';

export type PresidentTab = 'vue-ensemble' | 'opinion' | 'situations' | 'vision';

export const usePresidentDashboard = () => {
  const [activeTab, setActiveTab] = useState<PresidentTab>('vue-ensemble');

  const handleTabChange = (value: string) => {
    if (value === 'vue-ensemble' || value === 'opinion' || value === 'situations' || value === 'vision') {
      setActiveTab(value);
    }
  };

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
};

export default usePresidentDashboard;

