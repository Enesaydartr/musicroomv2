import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
import DiscordRPC from 'discord-rpc';

const store = new Store();

// Discord RPC Setup
const clientId = '123456789012345678'; // Replace with actual Discord Client ID
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let rpcReady = false;

rpc.on('ready', () => {
  rpcReady = true;
  console.log('Discord RPC Ready');
  setActivity('Boşta', 'Müzik seçiliyor...');
});

rpc.login({ clientId }).catch(console.error);

function setActivity(title: string, artist: string, isPlaying: boolean = true) {
  if (!rpcReady) return;
  
  rpc.setActivity({
    details: `🎵 ${title}`,
    state: `👤 ${artist}`,
    startTimestamp: isPlaying ? new Date() : undefined,
    largeImageKey: 'logo', // Needs to be uploaded to Discord Developer Portal
    largeImageText: 'Enestify',
    smallImageKey: isPlaying ? 'play' : 'pause',
    smallImageText: isPlaying ? 'Oynatılıyor' : 'Duraklatıldı',
    instance: false,
  }).catch(console.error);
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Frameless window
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Required for some iframe/CORS bypasses if needed, though YT API usually works
    },
    backgroundColor: '#000000',
  });

  // Load the Vite dev server or the local file
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

ipcMain.on('update-discord-rpc', (_, { title, artist, isPlaying }) => {
  setActivity(title, artist, isPlaying);
});

// Store Handlers
ipcMain.handle('store-get', (_, key) => store.get(key));
ipcMain.handle('store-set', (_, key, value) => store.set(key, value));
