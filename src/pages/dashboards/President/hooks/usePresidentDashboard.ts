import { useState } from 'react';

type PresidentTab = 'vue-ensemble' | 'opinion' | 'situations' | 'vision';

export const usePresidentDashboard = () => {
  const [activeTab, setActiveTab] = useState<PresidentTab>('vue-ensemble');

  return {
    activeTab,
    setActiveTab
  };
};

export default usePresidentDashboard;

