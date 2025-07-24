'use client'

interface FontSizeControlsProps {
  fontSize: string
  setFontSize: (size: string) => void
}

export function FontSizeControls({ fontSize, setFontSize }: FontSizeControlsProps) {
  const fontSizes = [
    { key: 'font-size-sm', label: 'S', value: '14px' },
    { key: 'font-size-base', label: 'M', value: '16px' },
    { key: 'font-size-lg', label: 'L', value: '18px' },
    { key: 'font-size-xl', label: 'XL', value: '20px' },
    { key: 'font-size-2xl', label: 'XXL', value: '24px' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-1">
      <span className="text-xs text-gray-600 px-2">A</span>
      {fontSizes.map((size) => (
        <button
          key={size.key}
          onClick={() => setFontSize(size.key)}
          className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
            fontSize === size.key
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-white/20'
          }`}
          title={`Font size: ${size.value}`}
        >
          {size.label}
        </button>
      ))}
    </div>
  )
}