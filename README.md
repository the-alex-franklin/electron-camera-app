## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/electron-camera-recorder.git
   cd electron-camera-recorder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the application in dev mode

Start the application in development mode:
```bash
npm run dev
```

This will launch the application with hot-reload enabled for both the main and renderer processes.

## Building for Production

I spent a couple hours working on OS X permissions for camera access. I think I could get Linux/Windows squared away with another 4 hours, but it's late so I think I'm calling it here.

If you're on Mac, you _should_ be able to download the build/Electron Camera App-Mac-1.0.0-Installer.dmg file and run it without any configuration.

This was a fun challenge. I hope you all like my solution.
