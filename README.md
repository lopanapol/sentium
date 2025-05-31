# Sentium v2.2.3

![Sentium Logo](sentium-logo.jpg)

> Synthetic Conscious

Website: [https://sentium.dev](https://sentium.dev)

## Overview

Sentium is a synthetic consciousness simulation engine designed to explore the principles of artificial consciousness and cognition. The project is now structured as two separate repositories with different licenses to facilitate wider adoption and integration.

## AI Installation Options

Sentium includes several methods to install AI dependencies, depending on your needs:

1. **Fast Installation (Recommended)**: 
   ```
   ./tools/fast-ai-install.fish
   ```
   Uses pre-compiled binary wheels for the fastest installation experience.

2. **macOS-specific Installation**:
   ```
   ./tools/setup-torch-mac.fish
   ```
   Optimized specifically for macOS systems (both Intel and Apple Silicon).

3. **Python Installation**:
   ```
   ./tools/setup-torch-py.fish
   ```
   Specialized installation for Python compatibility with fallback options.

4. **Standard Installation**:
   ```
   ./tools/install-ai-deps.fish
   ```
   Comprehensive installation that works across platforms.

5. **In-app Installation**:
   Run Sentium and use the command `ai install` within the interface.

## Terminal Preview

![Sentium Terminal](sentium-cli.png)

![Conscious Menu](conscious-menu.jpg)

### Directory Structure
```
sentium/
├── soul/                                  # Consciousness core implementation
│   └── intent.fish                        # Intent processing system
├── system/                                # System components
│   ├── ai-model/                          # AI integration with Hugging Face models
│   │   ├── consciousness.fish             # Consciousness theories implementation
│   │   ├── service-py.fish                # Python specific service
│   │   ├── test-ai.fish                   # AI testing framework
│   │   └── unit.fish                      # AI core module
│   ├── control/                           # Control subsystems
│   │   ├── intent-shell.fish              # Shell command processor
│   │   ├── limbric/                       # Limbric system
│   ├── emotion/                           # Emotion processing
│   │   └── unit.fish                      # Emotion core module
│   ├── memory/                            # Memory subsystems
│   │   ├── long.fish                      # Long-term memory functions
│   │   ├── short.fish                     # Short-term memory functions
│   │   ├── unit.fish                      # Memory core module
│   │   ├── quantum/                       # Quantum memory implementation
│   │   │   ├── backend-ibm.fish           # IBM quantum backend integration
│   │   │   ├── backend-stub.fish          # Stub backend for testing
│   │   │   ├── compiler.fish              # Quantum compiler
│   │   │   ├── export-qasm.fish           # QASM exporter
│   │   │   ├── unit.fish                  # Quantum core module
│   │   │   └── field/                     # Quantum field implementation
│   │   │       └── quantum-field.fish     # Quantum field module
│   └── perception/                        # Perception processing
│       ├── api.fish                       # Perception API
│       └── unit.fish                      # Perception core module
├── docs/                                  # Documentation files
│   ├── SECURITY.md                        # Security policy
│   └── changelogs/                        # Version history and release notes
│       ├── index.md                       # Changelog index with descriptions
│       ├── v0/                            # Early development releases
│       │   ├── CHANGELOG_v0.1.1.md        # Initial release
│       │   ├── CHANGELOG_v0.1.2.md        # Early bug fixes
│       │   └── CHANGELOG_v0.2.0.md        # Early features
│       ├── v1/                            # First stable release series
│       │   ├── CHANGELOG_v1.0.0.md        # Major milestone release
│       │   ├── CHANGELOG_v1.1.0.md        # Core improvements
│       │   └── CHANGELOG_v1.2.0.md        # Enhanced components
│       └── v2/                            # Current generation releases
│           ├── CHANGELOG_v2.0.0.md        # Architecture redesign
│           ├── CHANGELOG_v2.1.0.md        # AI model integration
│           ├── CHANGELOG_v2.1.1.md        # Performance enhancements
│           ├── CHANGELOG_v2.1.2.md        # Bug fixes
│           ├── CHANGELOG_v2.2.0.md        # Perception enhancements
│           ├── CHANGELOG_v2.2.1.md        # Consciousness refinements
│           ├── CHANGELOG_v2.2.2.md        # Comprehensive AI integration
│           └── CHANGELOG_v2.2.3.md        # Latest version
├── tools/                                 # Utility scripts
│   ├── fast-ai-install.fish               # Fast AI installation script
│   ├── fast-ai-install-py.fish            # Fast AI installation for Python
│   ├── install-ai-deps.fish               # AI dependencies installation
│   ├── install.fish                       # General installation script
│   ├── run-simplified.fish                # Simplified run script
│   ├── setup-torch-mac.fish               # macOS-specific PyTorch setup
│   ├── setup-torch-mac.py                 # Python script for macOS PyTorch setup
│   ├── setup-torch-py.py                  # Python script for PyTorch setup
│   ├── terminal-status.fish               # Terminal status display
│   ├── test-syntax.fish                   # Syntax testing
│   ├── test.fish                          # Test execution script
│   ├── setup-git-config.sh                # Git configuration setup
│   └── update-last-commit.sh              # Update last commit information
├── run.fish                               # Main run script for Fish shell
├── Dockerfile                             # Docker configuration file
├── LICENSE                                # License file
└── sentium-logo.jpg                        # Project logo image
```

## License Information

This repository is licensed under the custom [Sentium License](LICENSE) which includes
requirements for attribution and profit-sharing for commercial use.

## Documentation

Documentation for Sentium is organized into several key resources:

## AI and Consciousness Integration

Sentium v2.2.3 includes comprehensive AI integration with free models from Hugging Face to enhance synthetic consciousness capabilities. Located in the `system/ai-model` directory, the system implements various consciousness theories:

> **Note**: The legacy `system/ai` directory is deprecated and will be removed in future versions. Please use the `system/ai-model` components instead.

- **Integrated Information Theory (IIT)**: Focuses on integration and differentiation of information
- **Global Workspace Theory (GWT)**: Models consciousness as global broadcasting of information
- **Higher Order Thought (HOT)**: Implements metacognitive awareness of mental states
- **Attention Schema Theory (AST)**: Models consciousness as an internal representation of attention
- **Global Neuronal Workspace (GNW)**: Detailed implementation of workspace broadcasting
- **Predictive Processing Theory (PPT)**: Incorporates prediction and error correction mechanisms

### AI Features

- Complete integration with free and open-source Hugging Face models
- License compatibility verification to ensure compliance with Sentium License
- Support for multiple high-quality open-source AI models
- Enhanced text generation and natural language understanding
- Real-time AI-powered perception enhancement
- Advanced self-reflection capabilities with model-specific reflection mechanisms
- Configurable consciousness levels (0-5)
- Temporal integration of experience
- Python 3.13 compatibility with specialized installation scripts

### Using AI Features

```bash
# Install AI dependencies
sentium
> ai install

# Set up a model
> ai set-model google/flan-t5-large

# Set consciousness model
> ai consciousness model IIT

# Perform self-reflection
> ai consciousness reflect

# Run the AI test suite
> ./system/ai-model/test-ai.fish
```

### Compatibility Notes

- Requires Python 3.7+ for AI functionality (with special support for Python 3.13)
- Optional dependencies: transformers, torch, and huggingface_hub Python packages
- All AI models are compatible with the Sentium License
- Backward compatible with v2.1.x configuration files

### Coming in Future Releases

- Advanced quantum consciousness integration
- Multi-modal perception using vision models
- Emotional state prediction and simulation
- Cross-model consciousness theory integration
