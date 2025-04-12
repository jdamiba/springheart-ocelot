# Springheart Nantuko & Ocelot Pride Simulation

This project simulates the interaction between two Magic: The Gathering cards: Springheart Nantuko and Ocelot Pride. It demonstrates how their abilities interact to create a token generation engine.

## Card Text

### Springheart Nantuko
```
Bestow {1}{G}
Enchanted creature gets +1/+1.

Landfall — Whenever a land you control enters, you may pay {1}{G} if this permanent is attached to a creature you control. If you do, create a token that's a copy of that creature. If you didn't create a token this way, create a 1/1 green Insect creature token.
```

### Ocelot Pride
```
At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you have the city's blessing, for each token you control that entered the battlefield under your control this turn, create a token that's a copy of it.
```

## Implementation Details

### Game State
The simulation tracks several key pieces of state:
- `tokens`: Array of tokens on the battlefield
- `turns`: Current turn number
- `stack`: Stack of triggered abilities waiting to resolve
- `phase`: Current game phase (main or end)
- `nextCopyNumber`: Counter for tracking copy numbers
- `usedNames`: Set of used cat names to ensure uniqueness
- `log`: Game log for tracking events

### Token Structure
Each token is represented with the following properties:
```typescript
interface Token {
  id: string;
  name: string;
  isNew: boolean;
  source: 'land' | 'trigger' | 'battlefield';
  copyNumber: number;
  type: 'ocelot' | 'cat';
  copiedFrom?: string;
  createdBy?: string;
  copySource: 'springheart' | 'ocelot' | 'none';
}
```

### Key Interactions

1. **Land Drop with Springheart Nantuko**
   - When a land enters, you may pay {1}{G}
   - If paid, creates a copy of the enchanted creature (Ocelot Pride)
   - If not paid, creates a 1/1 green Insect token

2. **End Step Triggers**
   - Each Ocelot Pride on the battlefield triggers
   - Creates a 1/1 white Cat token
   - Copies all tokens that entered this turn

### Technical Implementation

#### Token Creation
- Uses UUID for unique token IDs
- Maintains a list of used cat names to ensure uniqueness
- Tracks source of token creation (land drop, trigger, or battlefield)

#### Stack Resolution
- Implements a stack for triggered abilities
- Resolves triggers one at a time
- Updates game state after each resolution

#### State Management
- Uses React's useState for state management
- Implements useEffect for initialization
- Maintains game log for tracking events

## Development Process

1. **Initial Setup**
   - Created Next.js project
   - Set up basic UI components
   - Implemented token display

2. **Core Mechanics**
   - Implemented token creation logic
   - Added stack resolution system
   - Created turn and phase management

3. **Card Interactions**
   - Implemented Springheart Nantuko's landfall trigger
   - Added Ocelot Pride's end step trigger
   - Created token copying system

4. **UI Improvements**
   - Added visual representation of tokens
   - Implemented game log
   - Created controls for game actions

## Technical Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **UI Components**: Custom components

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Improvements

1. Add mana payment system for Springheart Nantuko's ability
2. Implement proper token type tracking (Cat vs Insect)
3. Add visual indicators for bestowed status
4. Implement proper phase structure
5. Add undo/redo functionality
