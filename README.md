# Accessible Virtual Keyboard

A highly customizable and accessible virtual keyboard built with React and TypeScript, designed for users with special needs and motor impairments. Features touch optimization, visual feedback, and extensive customization options.

## Features

- **Multiple Layouts**:

  - QWERTY and ABC layouts
  - Adjustable number of rows (1-26)
  - Automatic key distribution

- **High Customization**:

  - Key size: 50% - 4000%
  - Text area size: 50% - 1500%
  - Themes: Light, Dark, and High Contrast
  - Configurable hold time
  - Sound feedback toggle
  - Saveable presets

- **Accessibility**:

  - Full ARIA support
  - Screen reader compatible
  - Visual feedback system
  - Touch-optimized interface
  - Proximity-based key detection

- **Mobile Optimized**:
  - PWA support for direct installation
  - Offline capability
  - Responsive design
  - Touch-first interface
  - Auto-updating

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/virtual-keyboard.git
cd virtual-keyboard
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## Development Guidelines

See [.cursorrules](.cursorrules) for detailed development guidelines and best practices.

### Key Principles:

- Test-Driven Development (TDD)
- Mobile-first design
- Accessibility as priority
- Performance optimization
- Clean code practices

## Project Structure

```
src/
  ├── components/
  │   └── VirtualKeyboard.tsx    # Main keyboard component
  ├── App.tsx                    # Application wrapper
  ├── main.tsx                   # Entry point
  └── vite-env.d.ts             # TypeScript declarations
```

## Technologies

- React 18 + TypeScript
- Tailwind CSS
- Vite
- PWA Support
- Vercel Deployment

## Contributing

1. Check existing issues or create a new one
2. Fork the repository
3. Create your feature branch
4. Follow the [.cursorrules](.cursorrules) guidelines
5. Submit a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with accessibility-first mindset
- Inspired by real user needs
- Community feedback and contributions
