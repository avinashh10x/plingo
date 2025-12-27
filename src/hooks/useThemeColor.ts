import { useEffect } from 'react';

const DEFAULT_PRIMARY = '217 91% 60%';

export function useThemeColor() {
  useEffect(() => {
    const savedColor = localStorage.getItem('plingo-primary-color') || DEFAULT_PRIMARY;
    const root = document.documentElement;
    
    root.style.setProperty('--primary', savedColor);
    root.style.setProperty('--ring', savedColor);
    root.style.setProperty('--accent', savedColor);
    root.style.setProperty('--scheduled', savedColor);
    root.style.setProperty('--activity-bar-active', savedColor);
    root.style.setProperty('--sidebar-primary', savedColor);
    root.style.setProperty('--sidebar-ring', savedColor);
  }, []);
}
