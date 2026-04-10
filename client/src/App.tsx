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
  const storyText = useStoryStore((s) => s.storyText);
  // Stay in StoryPlayer during 'loading' only if there's already story content
  // (Continue / Generate again). For a fresh Begin, stay on Home until streaming starts.
  const isReading = status === 'streaming' || status === 'done' || (status === 'loading' && storyText.length > 0);

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
