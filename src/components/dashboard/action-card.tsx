import React from 'react';
import Link from 'next/link';

interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ActionCard({ href, title, description, icon }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
        ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
        disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
        border border-input bg-background hover:bg-accent hover:text-accent-foreground
        px-4 h-auto py-6 flex flex-col items-center text-center space-y-2 border-dashed
        hover:border-primary"
    >
      {icon}
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
