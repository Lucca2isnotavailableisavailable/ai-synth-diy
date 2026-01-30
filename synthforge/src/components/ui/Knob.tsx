import { useCallback, useRef, useState, useEffect } from 'react';
import { clamp, mapRange } from '../../lib/utils';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  size?: number;
  label?: string;
  curve?: 'linear' | 'logarithmic' | 'exponential';
  className?: string;
}

export function Knob({
  value,
  min,
  max,
  onChange,
  size = 40,
  label,
  curve = 'linear',
  className = '',
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0, value: 0 });

  // Convert value to normalized (0-1) based on curve
  const normalizeValue = useCallback((val: number): number => {
    if (curve === 'logarithmic') {
      const minLog = Math.log(Math.max(min, 0.001));
      const maxLog = Math.log(max);
      const valLog = Math.log(Math.max(val, 0.001));
      return (valLog - minLog) / (maxLog - minLog);
    }
    return (val - min) / (max - min);
  }, [min, max, curve]);

  // Convert normalized (0-1) to value based on curve
  const denormalizeValue = useCallback((norm: number): number => {
    if (curve === 'logarithmic') {
      const minLog = Math.log(Math.max(min, 0.001));
      const maxLog = Math.log(max);
      return Math.exp(minLog + norm * (maxLog - minLog));
    }
    return min + norm * (max - min);
  }, [min, max, curve]);

  const normalizedValue = normalizeValue(value);
  const rotation = mapRange(normalizedValue, 0, 1, -135, 135);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      y: e.clientY,
      value: normalizedValue,
    };
  }, [normalizedValue]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartRef.current.y - e.clientY;
      const sensitivity = e.shiftKey ? 0.001 : 0.005; // Fine control with shift
      const newNormalized = clamp(dragStartRef.current.value + deltaY * sensitivity, 0, 1);
      const newValue = denormalizeValue(newNormalized);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, denormalizeValue, onChange]);

  // Double-click to reset
  const handleDoubleClick = useCallback(() => {
    onChange((min + max) / 2);
  }, [min, max, onChange]);

  // Format display value
  const displayValue = useCallback(() => {
    if (max >= 1000) {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
      return value.toFixed(0);
    }
    if (max <= 1) return value.toFixed(2);
    if (max <= 10) return value.toFixed(1);
    return value.toFixed(0);
  }, [value, max]);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        ref={knobRef}
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Background ring */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          className="absolute inset-0"
        >
          {/* Track */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#333"
            strokeWidth="3"
            strokeDasharray="75.4 25.1"
            strokeDashoffset="18.85"
            transform="rotate(135 20 20)"
          />
          {/* Value arc */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#00d4aa"
            strokeWidth="3"
            strokeDasharray={`${normalizedValue * 75.4} 100.5`}
            strokeDashoffset="18.85"
            transform="rotate(135 20 20)"
            strokeLinecap="round"
          />
        </svg>

        {/* Knob body */}
        <div
          className="absolute inset-1 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute left-1/2 top-1 w-0.5 h-3 bg-accent-primary rounded-full"
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className="text-xs text-text-secondary truncate max-w-full">
          {label}
        </span>
      )}

      {/* Value display */}
      <span className="text-xs text-text-muted font-mono">
        {displayValue()}
      </span>
    </div>
  );
}
