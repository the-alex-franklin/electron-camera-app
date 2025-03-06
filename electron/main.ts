import { app, BrowserWindow, ipcMain, dialog, systemPreferences } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Define types for video formats
type VideoFormat = 'webm' | 'mp4' | 'avi' | 'mov';

// Define interfaces for our IPC communication
type SaveRecordingRequest = {
  buffer: number[];
  format: VideoFormat;
}

type SaveRecordingResponse = {
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

async function checkCameraPermission() {
  if (process.platform !== 'darwin') return true;

  try {
    const status = systemPreferences.getMediaAccessStatus('camera');
    console.log('Camera permission status:', status);

    if (status !== 'granted') {
      const granted = await systemPreferences.askForMediaAccess('camera');
      console.log('Camera access granted:', granted);
      return granted;
    }

    return true;
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
}

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: true,
      contextIsolation: true,
    },
  });

  win.webContents.session.setPermissionCheckHandler((_webContents, permission) => {
    return permission === 'media';
  });

  // Set Content Security Policy
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " + 
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob:; " +
          "media-src 'self' blob:; " +
          "connect-src 'self' ws:;"
        ]
      }
    });
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  if (VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools();
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle saving video recording with format selection
ipcMain.handle('save-recording', async (_, request: SaveRecordingRequest): Promise<SaveRecordingResponse> => {
  if (!win) return { success: false, error: 'Window not available' };

  try {
    const formatExtensions: Record<VideoFormat, string> = {
      webm: 'webm',
      mp4: 'mp4',
      avi: 'avi',
      mov: 'mov',
    };

    const extension = formatExtensions[request.format] || 'webm';
    const formatFilters: Record<VideoFormat, { name: string, extensions: string[] }> = {
      webm: { name: 'WebM files', extensions: ['webm'] },
      mp4: { name: 'MP4 files', extensions: ['mp4'] },
      avi: { name: 'AVI files', extensions: ['avi'] },
      mov: { name: 'QuickTime files', extensions: ['mov'] },
    };

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Recording',
      defaultPath: `recording-${Date.now()}.${extension}`,
      filters: [
        formatFilters[request.format],
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['createDirectory'],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, Buffer.from(request.buffer));
    return { success: true, filePath };
  } catch (error) {
    console.error('Failed to save recording:', error);
    return { success: false, error: String(error) };
  }
});

app.whenReady().then(async () => {
  await checkCameraPermission();
  createWindow();
});