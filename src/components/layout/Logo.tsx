export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#143A66" />
      <circle cx="15" cy="15" r="6.2" fill="none" stroke="#9BC4EE" strokeWidth="2" />
      <path d="M19.6 19.6 L24 24" stroke="#F4F7FB" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15" cy="15" r="2.1" fill="#1A6BB8" />
    </svg>
  );
}
