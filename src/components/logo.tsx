import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 text-primary ${className}`}>
      <Gamepad2 size={size} strokeWidth={2.5} />
      <span className={`font-bold`} style={{ fontSize: `${size * 0.75}px` }}>
        GamerHub
      </span>
    </Link>
  );
}
