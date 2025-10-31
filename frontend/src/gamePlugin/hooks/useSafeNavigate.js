import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import ConfirmModal from '../games/9Players/components/ConfirmModal';

export const useSafeNavigate = () => {
  const navigate = useNavigate();
  const { gameName } = useParams();
  const { shouldBlockNavigation, navigationWarningConfig } = useGameContext();
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const safeNavigate = (path, options) => {
    if (!gameName) {
      navigate(path, options);
      return;
    }
    let currentPath = window.location.pathname;
    const isNavigatingAway = !currentPath.endsWith(path);

    if (shouldBlockNavigation && isNavigatingAway) {
      setPendingNavigation({ path, options });
      setShowNavigationWarning(true);
    } else {
      navigate(path, options);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      setShowNavigationWarning(false);
      navigate(pendingNavigation.path, pendingNavigation.options);
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  const NavigationWarningModal = () => (
    <ConfirmModal
      isOpen={showNavigationWarning}
      onClose={cancelNavigation}
      onConfirm={confirmNavigation}
      title={navigationWarningConfig.title}
      message={navigationWarningConfig.message}
      confirmText={navigationWarningConfig.confirmText}
      cancelText={navigationWarningConfig.cancelText}
      type="warning"
    />
  );

  return { safeNavigate, NavigationWarningModal };
};

export default useSafeNavigate;

