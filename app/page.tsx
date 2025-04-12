'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Stack from './components/Stack';
import { v4 as uuidv4 } from 'uuid';

const CAT_NAMES = [
  'Whiskers', 'Mittens', 'Luna', 'Oliver', 'Bella', 'Leo', 'Lily', 'Charlie', 'Lucy', 'Max',
  'Chloe', 'Simba', 'Nala', 'Milo', 'Sophie', 'Jack', 'Loki', 'Oreo', 'Bella', 'Tiger',
  'Shadow', 'Smokey', 'Ginger', 'Coco', 'Pepper', 'Misty', 'Daisy', 'Rocky', 'Angel', 'Sammy',
  'Felix', 'Garfield', 'Tom', 'Jerry', 'Puss', 'Boots', 'Salem', 'Cheshire', 'Bagheera', 'Shere Khan',
  'Mufasa', 'Scar', 'Tigger', 'Pumbaa', 'Timon', 'Rafiki', 'Sylvester', 'Tweety', 'Meowth', 'Hello Kitty',
  'Marie', 'Berlioz', 'Toulouse', 'Duchess', 'Thomas', 'Malley', 'Scat Cat', 'Si', 'Am', 'Figaro',
  'Jiji', 'Muta', 'Baron', 'Toto', 'Yuki', 'Haru', 'Muta', 'Moon', 'Sunny', 'Stella',
  'Luna', 'Nova', 'Comet', 'Star', 'Cosmo', 'Astro', 'Orion', 'Nebula', 'Galaxy', 'Cosmic',
  'Pixel', 'Byte', 'Chip', 'Bug', 'Java', 'Python', 'Ruby', 'Swift', 'Rust', 'Go',
  'Mocha', 'Latte', 'Cappuccino', 'Espresso', 'Macchiato', 'Frappe', 'Chai', 'Matcha', 'Brew', 'Bean',
  'Pepper', 'Salt', 'Sugar', 'Spice', 'Cinnamon', 'Nutmeg', 'Basil', 'Oregano', 'Sage', 'Thyme',
  'Rain', 'Storm', 'Cloud', 'Mist', 'Fog', 'Dew', 'Frost', 'Snow', 'Ice', 'Hail',
  'Autumn', 'Winter', 'Spring', 'Summer', 'April', 'May', 'June', 'July', 'August', 'September',
  'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ceres', 'Eris'
];

interface StackItem {
  id: string;
  type: 'trigger';
  text: string;
  resolving: boolean;
  source: string;
}

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

interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [turns, setTurns] = useState(1);
  const [stack, setStack] = useState<StackItem[]>([]);
  const [phase, setPhase] = useState<'main' | 'end'>('main');
  const [nextCopyNumber, setNextCopyNumber] = useState(1);
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set(['Ocelot Pride']));
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLogEntry = (message: string) => {
    setLog(prev => [...prev, {
      id: uuidv4(),
      message,
      timestamp: Date.now()
    }]);
  };

  const getUniqueName = () => {
    const availableNames = CAT_NAMES.filter(name => !usedNames.has(name));
    if (availableNames.length === 0) {
      // If we run out of names, add a number to make it unique
      const baseName = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
      let newName = baseName;
      let counter = 1;
      while (usedNames.has(newName)) {
        newName = `${baseName} ${counter}`;
        counter++;
      }
      setUsedNames(prev => new Set([...prev, newName]));
      return newName;
    }
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    setUsedNames(prev => new Set([...prev, name]));
    return name;
  };

  // Initialize with one Ocelot Pride on the battlefield
  useEffect(() => {
    setUsedNames(new Set());
    setTokens([{ 
      id: uuidv4(), 
      name: getUniqueName(), 
      isNew: false, 
      source: 'battlefield', 
      copyNumber: 0, 
      type: 'ocelot',
      copySource: 'none'
    }]);
  }, [getUniqueName]);

  const handleLandDrop = () => {
    const newToken: Token = {
      id: uuidv4(),
      name: getUniqueName(),
      isNew: true,
      source: 'land',
      copyNumber: nextCopyNumber,
      type: 'ocelot',
      copiedFrom: tokens[0].id,
      createdBy: tokens[0].id,
      copySource: 'springheart'
    };
    setTokens(prev => [...prev, newToken]);
    setNextCopyNumber(prev => prev + 1);
  };

  const handleEndStep = () => {
    setPhase('end');
    addLogEntry(`=== Turn ${turns} End Step ===`);
    // Add triggers to the stack for each Ocelot Pride that was on the battlefield before end step
    const ocelotsBeforeEndStep = tokens.filter(token => token.type === 'ocelot');
    
    const newTriggers: StackItem[] = ocelotsBeforeEndStep.map((token) => {
      addLogEntry(`${token.name} triggers: Create a 1/1 white Cat creature token and copy new tokens`);
      return {
        id: uuidv4(),
        type: 'trigger',
        text: `At the beginning of your end step, create a 1/1 white Cat creature token. Then for each token you control that entered this turn, create a token that's a copy of it.`,
        resolving: false,
        source: token.name
      };
    });
    
    setStack([...newTriggers, ...stack]);
  };

  const handleResolve = (id: string) => {
    setStack(stack.map(item => 
      item.id === id ? { ...item, resolving: true } : item
    ));
    setTimeout(() => {
      const trigger = stack.find(item => item.id === id);
      if (trigger) {
        const sourceOcelot = tokens.find(t => t.name === trigger.source);
        
        // Create a cat token
        const catToken: Token = {
          id: uuidv4(),
          name: getUniqueName(),
          isNew: true,
          source: 'trigger' as const,
          copyNumber: 0,
          type: 'cat',
          createdBy: sourceOcelot?.id,
          copySource: 'none'
        };
        
        addLogEntry(`${sourceOcelot?.name || 'Unknown'} creates a Cat token named ${catToken.name}`);
        
        // Get all tokens that entered this turn, including the cat token we just created
        const tokensToCopy = [...tokens, catToken].filter(t => t.isNew);
        const copies: Token[] = tokensToCopy.map(token => ({
          id: uuidv4(),
          name: getUniqueName(),
          isNew: true,
          source: 'trigger' as const,
          copyNumber: nextCopyNumber + tokensToCopy.indexOf(token),
          type: token.type,
          copiedFrom: token.id,
          createdBy: sourceOcelot?.id,
          copySource: 'ocelot' as const
        }));
        
        copies.forEach(copy => {
          const originalToken = tokensToCopy[copies.indexOf(copy)];
          addLogEntry(`${sourceOcelot?.name || 'Unknown'} creates a copy of ${originalToken.name} named ${copy.name}`);
        });
        
        setTokens(prev => {
          const newTokens = [...prev, catToken, ...copies];
          if (stack.length === 1) {
            const ocelotCount = newTokens.filter(t => t.type === 'ocelot').length;
            const catCount = newTokens.filter(t => t.type === 'cat').length;
            addLogEntry(`=== End of Turn ${turns} ===`);
            addLogEntry(`Total Ocelot Prides: ${ocelotCount}`);
            addLogEntry(`Total Cat Tokens: ${catCount}`);
            setTurns(prev => prev + 1);
            setPhase('main');
            return newTokens.map(token => ({ ...token, isNew: false }));
          }
          return newTokens;
        });
      }
      setStack(stack.filter(item => item.id !== id));
    }, 1000);
  };

  const handleReset = () => {
    setTurns(1);
    setStack([]);
    setPhase('main');
    setUsedNames(new Set());
    setLog([]);
    setTokens([{ 
      id: uuidv4(), 
      name: getUniqueName(), 
      isNew: false, 
      source: 'battlefield', 
      copyNumber: 0, 
      type: 'ocelot',
      copySource: 'none'
    }]);
    addLogEntry('=== Game Reset ===');
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">Springheart Nantuko & Ocelot Pride Interaction</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-black">How it works:</h2>
          <div className="prose text-black max-w-none">
            <p className="text-lg mb-4">
              This simulation demonstrates the interaction between <span className="font-semibold">Springheart Nantuko</span> and <span className="font-semibold">Ocelot Pride</span>:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-lg">
              <li>
                <span className="font-semibold">Springheart Nantuko</span> is an Aura that can be bestowed on a creature. When a land enters the battlefield under your control, you may pay one green mana and one generic mana if this permanent is attached to a creature you control. If you do, create a token that&apos;s a copy of that creature. If you didn&apos;t create a token this way, create a 1/1 green Insect creature token.
              </li>
              <li>
                <span className="font-semibold">Ocelot Pride</span> has a triggered ability: &quot;At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you have the city&apos;s blessing, for each token you control that entered the battlefield under your control this turn, create a token that&apos;s a copy of it.&quot;
              </li>
              <li>
                When you make a land drop with Springheart Nantuko, you create a token that&apos;s a copy of the enchanted creature (Ocelot Pride). 
              </li>
              <li>
                At the beginning of your end step, each Ocelot Pride that was on the battlefield before end step will trigger.
              </li>
              <li>
                Each trigger creates a 1/1 white Cat token and then copies all tokens that entered the battlefield under your control this turn (including the Cat token just created).
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-black">Cards</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <Image
                  src="/springheart.jpg"
                  alt="Springheart Nantuko"
                  width={300}
                  height={420}
                  className="rounded-lg"
                />
                <p className="mt-4 text-center font-semibold text-black">Springheart Nantuko</p>
              </div>
              <div className="relative">
                <Image
                  src="/ocelot.jpg"
                  alt="Ocelot Pride"
                  width={300}
                  height={420}
                  className="rounded-lg"
                />
                <p className="mt-4 text-center font-semibold text-black">Ocelot Pride</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-black">Current State</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-lg text-black">Turn: <span className="font-bold">{turns}</span></p>
                <p className="text-lg text-black">Phase: <span className="font-bold">{phase === 'main' ? 'Main Phase' : 'End Step'}</span></p>
                <p className="text-lg text-black">Total Ocelot Prides: <span className="font-bold">{tokens.filter(t => t.type === 'ocelot').length}</span></p>
                <p className="text-lg text-black">Total Cats: <span className="font-bold">{tokens.filter(t => t.type === 'cat').length}</span></p>
                <p className="text-lg text-black">
                  New This Turn: <span className="font-bold">{tokens.filter(t => t.isNew).length}</span>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {phase === 'main' && (
                  <button
                    onClick={handleLandDrop}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Make Land Drop & Create Token
                  </button>
                )}
                {phase === 'main' && (
                  <button
                    onClick={handleEndStep}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Move to End Step
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <Stack triggers={stack} onResolve={handleResolve} />

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-black">Battlefied:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {tokens.map((token, index) => {
              const originalToken = token.copiedFrom ? tokens.find(t => t.id === token.copiedFrom) : null;
              const creatorToken = token.createdBy ? tokens.find(t => t.id === token.createdBy) : null;
              
              return (
                <div key={token.id} className="flex flex-col items-center">
                  <div className="relative">
                    {index === 0 && (
                      <Image
                        src="/springheart.jpg"
                        alt="Springheart Nantuko"
                        width={150}
                        height={210}
                        className="absolute -top-6 -left-6 rounded-lg"
                      />
                    )}
                    <Image
                      src={token.type === 'cat' ? "/cat.jpg" : token.source === 'battlefield' ? "/ocelot.jpg" : "/copy.jpg"}
                      alt={token.type === 'cat' ? "Cat Token" : "Ocelot Pride Token"}
                      width={150}
                      height={210}
                      className={`rounded-lg relative z-10 ${token.source !== 'battlefield' ? 'opacity-75' : ''}`}
                    />
                    {token.type === 'ocelot' && token.source !== 'battlefield' && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        Copy #{token.copyNumber}
                      </div>
                    )}
                    {token.isNew && (
                      <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        New
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-black">
                      {token.name}
                    </p>
                    <div className="text-xs text-gray-600 space-y-1 mt-2">
                      {token.type === 'ocelot' && token.source === 'battlefield' ? (
                        <p>Original Ocelot Pride</p>
                      ) : (
                        <>
                          {token.source === 'land' ? (
                            <p>Created by: Springheart Landfall</p>
                          ) : token.copySource !== 'ocelot' && (
                            <p>Created by: {creatorToken?.name || 'Unknown'}</p>
                          )}
                          {token.copiedFrom && (
                            <p>Copy of: {originalToken?.name || 'Unknown'}</p>
                          )}
                          {token.copySource === 'ocelot' && (
                            <p className="text-purple-600">Created by {creatorToken?.name || 'Unknown'} Trigger</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-black">Game Log:</h2>
          <div className="h-64 overflow-y-auto bg-gray-50 p-6 rounded">
            {log.map(entry => (
              <div key={entry.id} className="text-sm text-gray-800 mb-2">
                {entry.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
