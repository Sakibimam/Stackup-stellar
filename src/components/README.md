# Stackup Components Structure

## Directory Overview

### `GameMode/`
- Components related to game mode selection and management
- Contains logic for Casual and Wallet modes
- Handles mode switching and configuration

### `UI/`
- Reusable UI components
- Includes buttons, inputs, animations, and layout components
- Implements design system and interaction states

### `Wallet/`
- Wallet connection and blockchain-related components
- Handles wallet connection, transactions, and blockchain interactions
- Includes error handling and connection state management

### `Game/`
- Core game logic and gameplay components
- Implements game mechanics, scoring, and state management
- Integrates with GameMode and Wallet components

## Best Practices
- Keep components modular and single-responsibility
- Use TypeScript for type safety
- Implement comprehensive error handling
- Follow responsive design principles
- Utilize Framer Motion for animations
