import { useRef, useEffect, useCallback, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface OscilloscopeProps {
  data: Float32Array;
  sampleRate?: number;
}

export function Oscilloscope({ data, sampleRate = 48000 }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const {
    scopeTimeDiv,
    scopeVoltDiv,
    scopeTriggerLevel,
    scopePaused,
    setScopeTimeDiv,
    setScopeVoltDiv,
    toggleScopePause,
  } = useUIStore();

  const [displayData, setDisplayData] = useState<Float32Array>(() => new Float32Array(2048));

  // Update display data (with pause support)
  useEffect(() => {
    if (!scopePaused && data.length > 0) {
      setDisplayData(new Float32Array(data));
    }
  }, [data, scopePaused]);

  // Draw oscilloscope
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const gridDivisions = 10;
    for (let i = 0; i <= gridDivisions; i++) {
      const x = (width / gridDivisions) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const vDivisions = 8;
    for (let i = 0; i <= vDivisions; i++) {
      const y = (height / vDivisions) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line (brighter)
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Trigger level line
    if (scopeTriggerLevel !== 0) {
      const triggerY = centerY - (scopeTriggerLevel / scopeVoltDiv) * (height / vDivisions);
      ctx.strokeStyle = '#ff6b6b44';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, triggerY);
      ctx.lineTo(width, triggerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waveform
    if (displayData.length > 0) {
      // Find trigger point
      let triggerIndex = 0;
      for (let i = 1; i < displayData.length - 1; i++) {
        if (displayData[i - 1] < scopeTriggerLevel && displayData[i] >= scopeTriggerLevel) {
          triggerIndex = i;
          break;
        }
      }

      // Calculate samples per pixel based on time division
      const samplesPerMs = sampleRate / 1000;
      const totalMs = scopeTimeDiv * gridDivisions;
      const totalSamples = Math.min(totalMs * samplesPerMs, displayData.length);
      const samplesPerPixel = totalSamples / width;

      // Draw
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const sampleIndex = Math.floor(triggerIndex + x * samplesPerPixel);
        if (sampleIndex >= displayData.length) break;

        const sample = displayData[sampleIndex];
        // Scale: scopeVoltDiv V per division, vDivisions/2 divisions above/below center
        const scaledSample = (sample / scopeVoltDiv) * (height / vDivisions);
        const y = centerY - scaledSample;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = '#00d4aa44';
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`${scopeTimeDiv}ms/div`, 10, height - 10);
    ctx.fillText(`${scopeVoltDiv}V/div`, width - 70, height - 10);

    // Paused indicator
    if (scopePaused) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '12px sans-serif';
      ctx.fillText('PAUSED', width - 60, 20);
    }
  }, [displayData, scopeTimeDiv, scopeVoltDiv, scopeTriggerLevel, scopePaused, sampleRate]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });

    resizeObserver.observe(canvas.parentElement!);
    return () => resizeObserver.disconnect();
  }, []);

  // Time division options (ms/div)
  const timeDivOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  // Volt division options (V/div)
  const voltDivOptions = [0.1, 0.2, 0.5, 1, 2, 5];

  return (
    <div className="h-full flex bg-bg-secondary">
      {/* Scope display */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Controls */}
      <div className="w-48 p-3 border-l border-gray-800 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase">Oscilloscope</h3>

        {/* Time/Div */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Time/Div</label>
          <select
            value={scopeTimeDiv}
            onChange={(e) => setScopeTimeDiv(Number(e.target.value))}
            className="w-full px-2 py-1 text-sm bg-bg-tertiary border border-gray-700 rounded text-text-primary"
          >
            {timeDivOptions.map(v => (
              <option key={v} value={v}>{v}ms</option>
            ))}
          </select>
        </div>

        {/* Volt/Div */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Volt/Div</label>
          <select
            value={scopeVoltDiv}
            onChange={(e) => setScopeVoltDiv(Number(e.target.value))}
            className="w-full px-2 py-1 text-sm bg-bg-tertiary border border-gray-700 rounded text-text-primary"
          >
            {voltDivOptions.map(v => (
              <option key={v} value={v}>{v}V</option>
            ))}
          </select>
        </div>

        {/* Pause button */}
        <button
          onClick={toggleScopePause}
          className={`px-3 py-2 text-sm rounded ${
            scopePaused
              ? 'bg-accent-warning text-bg-primary'
              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
          }`}
        >
          {scopePaused ? '▶ Resume' : '⏸ Pause'}
        </button>

        {/* Info */}
        <div className="mt-auto text-xs text-text-muted">
          <div>Sample rate: {(sampleRate / 1000).toFixed(1)}kHz</div>
          <div>Buffer: {displayData.length} samples</div>
        </div>
      </div>
    </div>
  );
}
