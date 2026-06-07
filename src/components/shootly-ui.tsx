/* ============================================================
   Shootly redesign — shared UI primitives
   Button (5 variants), Logo, Avatars, selectable Opt tile,
   FieldLabel, TextField, CreditsPill.
   ============================================================ */
import * as React from 'react';
import { Gem } from 'lucide-react';

type ButtonVariant = 'primary' | 'dark' | 'ghost' | 'invert' | 'line';

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full whitespace-nowrap transition-all duration-300 active:scale-[.97] px-6 py-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[image:var(--grad)] text-white shadow-float hover:-translate-y-0.5 hover:shadow-deep',
  dark: 'bg-ink text-white shadow-float hover:bg-black hover:-translate-y-0.5',
  ghost: 'bg-white text-ink border border-line shadow-float hover:border-ink/25 hover:-translate-y-0.5',
  invert: 'bg-white text-ink shadow-deep hover:-translate-y-0.5',
  line: 'bg-white/10 text-white border border-white/15 hover:bg-white/[0.16]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

export function Logo({ onClick, size = 36 }: { onClick?: () => void; size?: number }) {
  return (
    <button onClick={onClick} className="flex items-center select-none shrink-0" type="button">
      <img
        src="/logo-new.png"
        alt="Shootly"
        className="w-auto"
        style={{ height: Math.round(size * 1.25) }}
      />
    </button>
  );
}

const AVATAR_FILLS = ['ph-a', 'ph-b', 'ph-c', 'ph-d'];
export function Avatars() {
  return (
    <div className="flex -space-x-2.5">
      {AVATAR_FILLS.map((c, i) => (
        <span key={i} className={`w-8 h-8 rounded-full ${c} ring-2 ring-paper`} />
      ))}
    </div>
  );
}

/* Selectable option tile (title + optional description). */
export function Opt({
  active,
  onClick,
  title,
  desc,
  compact,
  className = '',
}: {
  active?: boolean;
  onClick?: () => void;
  title: React.ReactNode;
  desc?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border transition-all duration-200 active:scale-[.98] ${
        compact ? 'p-3' : 'p-4'
      } ${
        active
          ? 'border-transparent bg-ink text-white shadow-float'
          : 'border-line bg-white hover:border-ink/20 hover:-translate-y-0.5'
      } ${className}`.trim()}
    >
      <div
        className={`font-bold ${compact ? 'text-sm' : 'text-[15px]'} leading-tight ${
          active ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </div>
      {desc && (
        <div
          className={`${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1'} ${
            active ? 'text-white/65' : 'text-ink-faint'
          }`}
        >
          {desc}
        </div>
      )}
    </button>
  );
}

/* Section label with icon (director controls & forms). */
export function FieldLabel({
  icon: Ic,
  children,
  hint,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      {Ic && <Ic size={16} className="text-ink-soft" />}
      <span className="text-sm font-semibold text-ink">{children}</span>
      {hint && <span className="text-xs text-ink-faint font-normal">{hint}</span>}
    </div>
  );
}

/* Text input with leading icon + optional trailing slot. */
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trailing?: React.ReactNode;
}

export function TextField({ icon: Ic, trailing, className = '', ...rest }: TextFieldProps) {
  return (
    <div className="relative">
      {Ic && <Ic size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />}
      <input
        className={`w-full ${Ic ? 'pl-12' : 'pl-4'} ${
          trailing ? 'pr-12' : 'pr-4'
        } py-3.5 bg-white border border-line rounded-2xl text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/80 focus:border-transparent transition-all ${className}`.trim()}
        {...rest}
      />
      {trailing && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

/* Credits pill (internal pages). */
export function CreditsPill({ credits }: { credits: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full bg-white border border-line shadow-float">
      <Gem size={15} className="text-ink" />
      <span className="text-sm font-bold">{credits}</span>
      <span className="hidden sm:inline text-sm text-ink-faint">credits</span>
    </div>
  );
}
