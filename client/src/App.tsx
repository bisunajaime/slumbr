import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { AmbientPlayer } from './components/AmbientPlayer/AmbientPlayer';
import { AmberFilter } from './components/AmberFilter/AmberFilter';
import { Settings } from './components/Settings/Settings';
import { StoryPlayer } from './components/StoryPlayer/StoryPlayer';
import { Toaster } from './components/Toaster/Toaster';
import { SleepTimer } from './components/SleepTimer/SleepTimer';
import { Home } from './pages/Home';
import { useStoryStore } from './store/useStoryStore';

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const status = useStoryStore((s) => s.status);
  const isReading = status === 'loading' || status === 'streaming' || status === 'done';

  // Wait for Clerk to resolve auth state before rendering
  if (!isLoaded) return null;

  // Redirect unauthenticated users to Clerk's hosted sign-in
  if (!isSignedIn) return <RedirectToSignIn />;

  return (
    <>
      <AmbientPlayer />
      <AmberFilter active={isReading} />
      <Settings />
      <Toaster />
      <SleepTimer />
      {isReading ? <StoryPlayer /> : <Home />}
    </>
  );
}
