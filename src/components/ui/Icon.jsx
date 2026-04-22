export default function Icon({ name, className = 'h-5 w-5' }) {
  const iconProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const icons = {
    dashboard: (
      <svg {...iconProps}>
        <rect x='3' y='3' width='7' height='7' rx='1.5' />
        <rect x='14' y='3' width='7' height='7' rx='1.5' />
        <rect x='3' y='14' width='7' height='7' rx='1.5' />
        <rect x='14' y='14' width='7' height='7' rx='1.5' />
      </svg>
    ),
    employees: (
      <svg {...iconProps}>
        <path d='M16 19c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4' />
        <circle cx='9.5' cy='8' r='3' />
        <path d='M21 19c0-1.9-1.2-3.4-3-3.8' />
        <path d='M16.5 5.2a3 3 0 0 1 0 5.6' />
      </svg>
    ),
    customers: (
      <svg {...iconProps}>
        <path d='M4 20V6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8V20' />
        <path d='M8 20v-5h8v5' />
        <path d='M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01' />
      </svg>
    ),
    vehicles: (
      <svg {...iconProps}>
        <path d='M5 16h14l-1.4-5.2A2.5 2.5 0 0 0 15.2 9H8.8a2.5 2.5 0 0 0-2.4 1.8L5 16Z' />
        <path d='M7 16v2M17 16v2M6.5 13h.01M17.5 13h.01' />
        <path d='M8 9l1-3h6l1 3' />
      </svg>
    ),
    reception: (
      <svg {...iconProps}>
        <path d='M4 17V7a2 2 0 0 1 2-2h8l6 6v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z' />
        <path d='M14 5v6h6' />
        <path d='M8 14h5M8 10h2' />
      </svg>
    ),
    orders: (
      <svg {...iconProps}>
        <path d='M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 0 1 2-2Z' />
        <path d='M8 9h8M8 13h6' />
      </svg>
    ),
    chat: (
      <svg {...iconProps}>
        <path d='M21 12a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.6-4.4A7.5 7.5 0 1 1 21 12Z' />
        <path d='M8 11h8M8 15h5' />
      </svg>
    ),
    profile: (
      <svg {...iconProps}>
        <circle cx='12' cy='8' r='4' />
        <path d='M4 21a8 8 0 0 1 16 0' />
      </svg>
    ),
    wrench: (
      <svg {...iconProps}>
        <path d='M14.7 6.3a5 5 0 0 0-6 6L4 17l3 3 4.7-4.7a5 5 0 0 0 6-6l-3.2 3.2-3-1 1-3 3.2-3.2Z' />
      </svg>
    ),
    signature: (
      <svg {...iconProps}>
        <path d='M16 4l4 4L9 19H5v-4L16 4Z' />
        <path d='M14 6l4 4' />
        <path d='M4 21h16' />
      </svg>
    ),
    camera: (
      <svg {...iconProps}>
        <path d='M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z' />
        <circle cx='12' cy='13' r='3.5' />
      </svg>
    ),
    download: (
      <svg {...iconProps}>
        <path d='M12 3v12' />
        <path d='m7 10 5 5 5-5' />
        <path d='M5 21h14' />
      </svg>
    ),
    more: (
      <svg {...iconProps}>
        <circle cx='5' cy='12' r='1' />
        <circle cx='12' cy='12' r='1' />
        <circle cx='19' cy='12' r='1' />
      </svg>
    ),
    arrowRight: (
      <svg {...iconProps}>
        <path d='M5 12h14' />
        <path d='m13 6 6 6-6 6' />
      </svg>
    ),
    arrowLeft: (
      <svg {...iconProps}>
        <path d='M19 12H5' />
        <path d='m11 6-6 6 6 6' />
      </svg>
    ),
    alert: (
      <svg {...iconProps}>
        <path d='M12 9v4' />
        <path d='M12 17h.01' />
        <path d='M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z' />
      </svg>
    ),
    trash: (
      <svg {...iconProps}>
        <path d='M4 7h16' />
        <path d='M10 11v6M14 11v6' />
        <path d='M6 7l1 14h10l1-14' />
        <path d='M9 7V4h6v3' />
      </svg>
    ),
    logout: (
      <svg {...iconProps}>
        <path d='M10 17l5-5-5-5' />
        <path d='M15 12H3' />
        <path d='M21 5v14' />
      </svg>
    ),
    chevron: (
      <svg {...iconProps}>
        <path d='M15 18 9 12l6-6' />
      </svg>
    ),
  };

  return icons[name] ?? icons.dashboard;
}
