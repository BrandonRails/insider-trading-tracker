interface AdSlotProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function AdSlot({ width = 300, height = 250, className = "" }: AdSlotProps) {
  return (
    <div 
      className={`ad-slot ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      Advertisement
    </div>
  );
}