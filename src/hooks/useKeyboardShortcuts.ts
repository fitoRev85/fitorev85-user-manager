
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if Ctrl (or Cmd on Mac) is pressed
      if (!event.ctrlKey && !event.metaKey) return;

      switch (event.key) {
        case '1':
          event.preventDefault();
          navigate('/');
          break;
        case '2':
          event.preventDefault();
          navigate('/executive');
          break;
        case '3':
          event.preventDefault();
          navigate('/analysis');
          break;
        case '4':
          event.preventDefault();
          navigate('/reports');
          break;
        case '5':
          event.preventDefault();
          navigate('/financial');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
