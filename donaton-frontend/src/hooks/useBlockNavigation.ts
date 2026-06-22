import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useBlockNavigation = (
  isDirty: boolean, 
  isSubmitted: boolean, 
  onCancelForm: () => void
) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'navigate', url: string } | { type: 'cancel' } | { type: 'back' } | null>(null);

  useEffect(() => {
    if (isDirty && !isSubmitted && location.hash !== '#form') {
      globalThis.history.pushState(null, '', globalThis.location.pathname + '#form');
    }
  }, [isDirty, isSubmitted, location.hash]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitted) {
        e.preventDefault();
        (e as any).returnValue = '';
      }
    };
    globalThis.addEventListener('beforeunload', handleBeforeUnload);

    const handlePopState = () => {
      if (isDirty && !isSubmitted && globalThis.location.hash !== '#form') {
        globalThis.history.pushState(null, '', globalThis.location.pathname + '#form');
        setPendingAction({ type: 'back' });
        setShowExitModal(true);
      }
    };
    globalThis.addEventListener('popstate', handlePopState);

    const handleClick = (e: MouseEvent) => {
      if (!isDirty || isSubmitted) return;

      const target = (e.target as HTMLElement).closest('a, button');
      if (!target) return;

      const isNavigationLink = target.tagName === 'A' && target.hasAttribute('href');
      const isVolverBtn = target.tagName === 'BUTTON' && (target.textContent?.includes('Volver') || target.textContent?.includes('Iniciar Sesi'));

      if (isNavigationLink || isVolverBtn) {
        e.preventDefault();
        e.stopPropagation();

        if (isNavigationLink) {
          const href = target.getAttribute('href');
          if (href) setPendingAction({ type: 'navigate', url: href });
        } else if (isVolverBtn) {
          setPendingAction({ type: 'cancel' });
        }
        setShowExitModal(true);
      }
    };
    
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      globalThis.removeEventListener('beforeunload', handleBeforeUnload);
      globalThis.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isDirty, isSubmitted]);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (pendingAction?.type === 'navigate') {
      navigate(pendingAction.url);
    } else if (pendingAction?.type === 'cancel') {
      onCancelForm();
    } else if (pendingAction?.type === 'back') {
      globalThis.history.go(-2);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingAction(null);
  };

  return { showExitModal, handleConfirmExit, handleCancelExit };
};
