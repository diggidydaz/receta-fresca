// Small inline icon set. Icons are decorative (aria-hidden); meaning is always carried by visible text too.
const paths: Record<string, React.ReactNode> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  left: <path d="M14.5 5l-7 7 7 7" />,
  right: <path d="M9.5 5l7 7-7 7" />,
  mic: (<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" /></>),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
  speaker: (<><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" /><path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a7.8 7.8 0 010 11" /></>),
  home: <path d="M4 11.5L12 4.5l8 7M6.5 10v9.5h11V10" />,
  leaf: (<><path d="M5 19c0-8 5-13.5 14.5-14 .3 9.5-5 14.5-13 14.5" /><path d="M5 19c2.5-4 5.5-6.8 9.5-9" /></>),
  clipboard: (<><rect x="5.5" y="5" width="13" height="15.5" rx="2" /><path d="M9 5V3.500h6V5M9 10.500h6M9 14.500h6" /></>),
  store: (<><path d="M4 9.500l1.5-5h13l1.5 5M5 9.500v10h14v-10" /><path d="M4 9.500a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0 2.7 2.7 0 005.3 0M10 19.500v-5h4v5" /></>),
  person: (<><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>),
  plate: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /></>),
  calendar: (<><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.500v4M15.5 3.500v4" /></>),
  bag: (<><path d="M5.5 8.500h13l-1 11.500h-11l-1-11.500z" /><path d="M9 8.500V7a3 3 0 016 0v1.5" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.500M12 7.500v.500" /></>),
  warn: (<><path d="M12 4l9 15.500H3L12 4z" /><path d="M12 10v4.500M12 17v.300" /></>),
  hand: (<><path d="M8 3.500h8l4.5 4.500v8L16 20.500H8L3.5 16V8L8 3.500z" /><path d="M8.5 12h7" /></>),
  refresh: (<><path d="M19.5 12a7.5 7.5 0 11-2.2-5.3" /><path d="M19.5 4.500v4h-4" /></>),
  camera: (<><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10.5H4V8.5z" /><circle cx="12" cy="13.5" r="3.5" /></>),
  truck: (<><path d="M3 6.500h10.500v10H3zM13.5 10h4l3 3v3.500h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>),
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 28, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      {paths[name]}
    </svg>
  );
}
