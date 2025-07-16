# Digital Tally Sheet - React Native Android App

This is the React Native version of the Digital Tally Sheet app, designed to work as a native Android application.

## Features

- **Dual Counter System**: Each tally sheet has two counters - "Getrunken" (consumed) and "Bezahlt" (paid)
- **Traditional Tally Marks**: Visual representation with traditional tally mark groups (4 vertical lines + 1 diagonal)
- **Haptic Feedback**: Tactile feedback when incrementing/decrementing counters
- **Persistent Storage**: Data saved locally using AsyncStorage
- **Color Customization**: Choose from 8 different colors for each counter
- **Touch-Optimized**: Large buttons and touch-friendly interface
- **Native Alerts**: Android-style confirmation dialogs
- **Share Functionality**: Share the app with others
- **Responsive Design**: Works on phones and tablets

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- An Android device or emulator

### Installation

1. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on Android:**
   - For physical device: Scan the QR code with Expo Go app
   - For emulator: Press 'a' in the terminal to open Android emulator

### Building for Production

1. **Build APK:**
   ```bash
   npx expo build:android
   ```

2. **Build AAB (for Google Play Store):**
   ```bash
   npx expo build:android -t app-bundle
   ```

## File Structure

```
├── App.tsx                 # Main React Native app component
├── app.json               # Expo configuration
├── package-rn.json        # React Native dependencies
├── assets/                # App icons and splash screens
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── README-ReactNative.md  # This file
```

## Key Differences from Web Version

1. **Native Components**: Uses React Native components instead of HTML/CSS
2. **AsyncStorage**: Local storage using React Native's AsyncStorage
3. **Haptic Feedback**: Uses Expo Haptics for tactile feedback
4. **Native Alerts**: Android-style confirmation dialogs
5. **Touch Optimization**: Larger touch targets and better mobile UX
6. **Native Icons**: Uses Expo Vector Icons instead of Lucide React

## Usage

1. **Add Counter**: Tap "Add New Counter" to create a new tally sheet
2. **Increment/Decrement**: Use + and - buttons for each counter type
3. **Reset**: Reset individual counters or both at once
4. **Delete**: Remove unwanted counters
5. **Change Color**: Tap the color palette icon to change counter colors
6. **Share**: Use the share button to share the app with others

## Technical Details

- **Framework**: React Native with Expo
- **Storage**: AsyncStorage for persistent data
- **Icons**: Expo Vector Icons (Ionicons)
- **Haptics**: Expo Haptics for tactile feedback
- **Platform**: Android (iOS compatible with minor adjustments)

## Permissions

The app requests the following permissions:
- `android.permission.VIBRATE` - For haptic feedback

## Troubleshooting

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Android build issues**: Ensure Android SDK is properly configured
3. **Dependency issues**: Delete node_modules and run `npm install` again

## Future Enhancements

- Cloud sync between devices
- Export data to CSV
- Custom counter categories
- Dark mode support
- Widget support for Android home screen