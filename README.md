# Accessible Virtual Keyboard

A highly customizable and accessible virtual keyboard built with React and TypeScript, designed for users with special needs.

## Features

- **Multiple Layouts**: QWERTY and ABC layouts available
- **High Customization**:
  - Adjustable key sizes (100% - 600%)
  - Variable text sizes for keyboard (50% - 500%) and text area (50% - 300%)
  - Three themes: Light, Dark, and High Contrast
- **Accessibility**:
  - Scanning mode for motor impairments
  - Configurable hold time for key activation
  - Real-time text display
  - Hideable text area
- **Touch Optimized**:
  - Independent scrolling for keyboard area
  - Proximity-based key detection
  - Uniform grid distribution
  - Adaptive spacing

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/virtual-keyboard.git
cd virtual-keyboard
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Usage

1. Access the keyboard through your web browser
2. Use the settings panel (gear icon) to customize:
   - Hold time for key activation
   - Key and text sizes
   - Layout (QWERTY/ABC)
   - Sound effects
   - Theme
3. Toggle the text area visibility with the "Show/Hide Text" button
4. Type by touching or clicking the keys

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Vercel (deployment)

## Development

### Project Structure

```
src/
  ├── components/
  │   └── VirtualKeyboard.tsx
  ├── App.tsx
  └── main.tsx
```

### Development Guidelines

- Test-Driven Development (TDD)
- Comprehensive logging
- Clean code principles
- Modular and reusable components
- Real device testing

## Roadmap

- [ ] Word prediction
- [ ] More keyboard layouts
- [ ] Emoji support
- [ ] Advanced theme customization
- [ ] Configuration persistence
- [ ] Text history
- [ ] Configuration sharing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with accessibility in mind
- Inspired by the need for better virtual keyboard solutions
- Thanks to all contributors and users for their feedback
