
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { EnhancedTooltip } from './enhanced-tooltip';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Moon;

  return (
    <EnhancedTooltip content="Alterar tema da interface" type="info">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
            <CurrentIcon className="h-4 w-4 transition-transform hover:scale-110" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-fade-in">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </EnhancedTooltip>
  );
};
