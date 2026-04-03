/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import YouTubePlayer from './components/YouTubePlayer';
import LyricsOverlay from './components/LyricsOverlay';
import Controls from './components/Controls';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-white/30">
      <TopBar />
      <YouTubePlayer />
      <LyricsOverlay />
      <Sidebar />
      <Controls />
    </div>
  );
}
