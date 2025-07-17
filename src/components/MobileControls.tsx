'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, RotateCcw, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface MobileControlsProps {
  onHome?: () => void;
  onRestart?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  className?: string;
}
export function MobileControls({ 
  onHome, 
  onRestart, 
  onSettings, 
  onHelp,
  className 
}: MobileControlsProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;  
  if (!isMobile) return null;
  return (
    <Card className={cn(
      'fixed bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-sm border shadow-lg z-50',
      className
    )}>
      <div className="flex items-center justify-around">
        {onHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHome}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
        )}        
        {onRestart && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-xs">Restart</span>
          </Button>
        )}        
        {onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        )}        
        {onHelp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHelp}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs">Help</span>
          </Button>
        )}
      </div>
    </Card>
  );
}