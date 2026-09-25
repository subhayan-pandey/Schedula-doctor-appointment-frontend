type NavIconProps = {
  itemKey: string;
  className?: string;
};

const sharedProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export default function AdminNavIcon({ itemKey, className = "" }: NavIconProps) {
  switch (itemKey) {
    case "dashboard":
      return (
        <svg {...sharedProps} className={className}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );

    case "doctors":
      return (
        <svg {...sharedProps} className={className}>
          <path d="M7 4v6a5 5 0 0 0 10 0V4" />
          <path d="M7 4H5.5M17 4h1.5" />
          <circle cx="19" cy="15.5" r="2.5" />
          <path d="M12 14.5v-2.5" />
        </svg>
      );

    case "doctor-verification":
      return (
        <svg {...sharedProps} className={className}>
          <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 8.9 4.1-1.5 7-4.7 7-8.9V6z" />
          <path d="m9.2 12 1.9 1.9L15 10" />
        </svg>
      );

    case "patients":
      return (
        <svg {...sharedProps} className={className}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
        </svg>
      );

    case "appointments":
      return (
        <svg {...sharedProps} className={className}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17" />
          <path d="M8 3v3M16 3v3" />
        </svg>
      );

    case "payments":
      return (
        <svg {...sharedProps} className={className}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
          <path d="M2.5 9.5h19" />
          <path d="M6 15h4" />
        </svg>
      );

    case "reviews":
      return (
        <svg {...sharedProps} className={className}>
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z" />
        </svg>
      );

    case "notifications":
      return (
        <svg {...sharedProps} className={className}>
          <path d="M6 10a6 6 0 1 1 12 0c0 4 1.2 5.2 1.2 5.2H4.8S6 14 6 10Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );

    case "reports":
      return (
        <svg {...sharedProps} className={className}>
          <path d="M4 20V4" />
          <rect x="7" y="12" width="3" height="8" />
          <rect x="13" y="8" width="3" height="12" />
          <rect x="19" y="14" width="0" height="6" />
          <path d="M4 20h17" />
        </svg>
      );

    case "admin-users":
      return (
        <svg {...sharedProps} className={className}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
          <path d="M16 8.5a2.8 2.8 0 1 0 0-5.6" />
          <path d="M18.5 13.2c2 .6 3 2.9 3 5.8" />
        </svg>
      );

    case "audit-logs":
      return (
        <svg {...sharedProps} className={className}>
          <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h3.5" />
        </svg>
      );

    case "settings":
      return (
        <svg {...sharedProps} className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
        </svg>
      );

    default:
      return (
        <svg {...sharedProps} className={className}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
