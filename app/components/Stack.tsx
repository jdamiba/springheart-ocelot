interface StackItem {
  id: string;
  type: 'trigger';
  text: string;
  resolving: boolean;
  source: string;
}

interface StackProps {
  triggers: StackItem[];
  onResolve: (id: string) => void;
}

export default function Stack({ triggers, onResolve }: StackProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-black">Stack</h2>
      <div className="space-y-2">
        {triggers.length === 0 ? (
          <p className="text-black text-center">Stack is empty</p>
        ) : (
          triggers.map((trigger) => (
            <div
              key={trigger.id}
              className={`p-4 rounded-lg border ${
                trigger.resolving ? 'bg-green-100 border-green-500' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-black">{trigger.text}</p>
                  <p className="text-sm text-gray-600">Source: {trigger.source}</p>
                </div>
                {!trigger.resolving && (
                  <button
                    onClick={() => onResolve(trigger.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 