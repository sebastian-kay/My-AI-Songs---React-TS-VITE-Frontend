import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onTogglePlay: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleMute: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  isPlaying: boolean;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  onNextTrack,
  onPreviousTrack,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { code, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey || shiftKey;

      switch (code) {
        case 'Space':
          event.preventDefault();
          onTogglePlay();
          break;
        
        case 'ArrowRight':
          if (!isModifierPressed) {
            event.preventDefault();
            onSeekForward();
          }
          break;
        
        case 'ArrowLeft':
          if (!isModifierPressed) {
            event.preventDefault();
            onSeekBackward();
          }
          break;
        
        case 'ArrowUp':
          if (!isModifierPressed) {
            event.preventDefault();
            onVolumeUp();
          }
          break;
        
        case 'ArrowDown':
          if (!isModifierPressed) {
            event.preventDefault();
            onVolumeDown();
          }
          break;
        
        case 'KeyM':
          if (!isModifierPressed) {
            event.preventDefault();
            onToggleMute();
          }
          break;
        
        case 'KeyN':
          if (ctrlKey || metaKey) {
            event.preventDefault();
            onNextTrack();
          }
          break;
        
        case 'KeyP':
          if (ctrlKey || metaKey) {
            event.preventDefault();
            onPreviousTrack();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlay, onSeekForward, onSeekBackward, onVolumeUp, onVolumeDown, onToggleMute, onNextTrack, onPreviousTrack]);
}