import { useState, useCallback } from 'react';

interface UseModalsResult {
  isProjectsViewOpen: boolean;
  setProjectsViewOpen: (isOpen: boolean) => void;
  isSaveModalOpen: boolean;
  setSaveModalOpen: (isOpen: boolean) => void;
  isBuyCreditsModalOpen: boolean;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  isHotmartRedirectModalOpen: boolean;
  setHotmartRedirectModalOpen: (isOpen: boolean) => void;
  redirectUrl: string;
  setRedirectUrl: (url: string) => void;
  closeAllModals: () => void;
}

export const useModals = (): UseModalsResult => {
  const [isProjectsViewOpen, setProjectsViewOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [isHotmartRedirectModalOpen, setHotmartRedirectModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  const closeAllModals = useCallback(() => {
    setProjectsViewOpen(false);
    setSaveModalOpen(false);
    setBuyCreditsModalOpen(false);
    setHotmartRedirectModalOpen(false);
    setRedirectUrl('');
  }, []);

  return {
    isProjectsViewOpen,
    setProjectsViewOpen,
    isSaveModalOpen,
    setSaveModalOpen,
    isBuyCreditsModalOpen,
    setBuyCreditsModalOpen,
    isHotmartRedirectModalOpen,
    setHotmartRedirectModalOpen,
    redirectUrl,
    setRedirectUrl,
    closeAllModals,
  };
};