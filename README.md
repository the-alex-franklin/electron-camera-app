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

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later)

### Running the application in dev mode

Start the application in development mode:
```bash
npm i && npm run dev
```

This will launch the application with hot-reload enabled for both the main and renderer processes.

### Building for Production

I spent a couple hours working on Apple system permissions for camera access, so I'm calling it quits here. If you're on Windows/Linux, no guarantees that the permissions are set up to allow access. If you're on Mac however, you should be able to just download the .dmg file from within the build/ folder and run that to install the app and it should be good to go. I'm calling it quits here. It was a fun challenge (until I got into the system-level permissions stuff).
