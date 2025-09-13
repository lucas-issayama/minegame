export function KeyControls() {
  const controls = [
    { key: 'W/↑', action: 'Move Forward' },
    { key: 'S/↓', action: 'Move Backward' },
    { key: 'A/←', action: 'Move Left' },
    { key: 'D/→', action: 'Move Right' },
    { key: 'Space', action: 'Jump' },
    { key: 'Shift', action: 'Run' },
    { key: 'F/Left Click', action: 'Hit/Destroy' },
    { key: 'Mouse', action: 'Look Around' },
  ]

  return (
    <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg p-4 text-white">
      <h3 className="text-lg font-bold mb-2">Controls</h3>
      <div className="space-y-1">
        {controls.map((control, index) => (
          <div key={index} className="flex justify-between items-center min-w-48">
            <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
              {control.key}
            </span>
            <span className="text-sm">{control.action}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-300">
        Click to start playing!
      </div>
    </div>
  )
}