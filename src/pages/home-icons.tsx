const SHARED_PROPS = {
  viewBox: '0 0 64 64',
  fill: 'none',
  strokeWidth: 3,
  strokeLinecap: 'round' as const,
}

export function TicTacToeIcon() {
  return (
    <svg {...SHARED_PROPS} aria-hidden="true">
      <line x1="23" y1="9" x2="23" y2="55" />
      <line x1="41" y1="9" x2="41" y2="55" />
      <line x1="9" y1="23" x2="55" y2="23" />
      <line x1="9" y1="41" x2="55" y2="41" />
      <line x1="12" y1="12" x2="20" y2="20" />
      <line x1="20" y1="12" x2="12" y2="20" />
      <circle cx="32" cy="32" r="6.5" />
    </svg>
  )
}

export function ConnectFourIcon() {
  return (
    <svg {...SHARED_PROPS} aria-hidden="true">
      <rect x="9" y="12" width="46" height="42" rx="4" />
      <circle cx="22" cy="24" r="5.5" />
      <circle cx="36" cy="24" r="5.5" />
      <circle cx="22" cy="38" r="5.5" />
      <circle cx="36" cy="38" r="5.5" />
      <line x1="49" y1="14" x2="49" y2="24" />
      <line x1="45" y1="20" x2="49" y2="24" />
      <line x1="53" y1="20" x2="49" y2="24" />
    </svg>
  )
}

export function DotsAndBoxesIcon() {
  return (
    <svg {...SHARED_PROPS} aria-hidden="true">
      <circle className="dot" cx="14" cy="14" r="3" />
      <circle className="dot" cx="32" cy="14" r="3" />
      <circle className="dot" cx="50" cy="14" r="3" />
      <circle className="dot" cx="14" cy="32" r="3" />
      <circle className="dot" cx="32" cy="32" r="3" />
      <circle className="dot" cx="50" cy="32" r="3" />
      <circle className="dot" cx="14" cy="50" r="3" />
      <circle className="dot" cx="32" cy="50" r="3" />
      <circle className="dot" cx="50" cy="50" r="3" />
      <line x1="14" y1="14" x2="32" y2="14" />
      <line x1="14" y1="14" x2="14" y2="32" />
      <line x1="32" y1="14" x2="32" y2="32" />
      <line x1="14" y1="32" x2="32" y2="32" />
    </svg>
  )
}
