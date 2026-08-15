// pointer-coarse:text-[16px] is not a design choice — Safari on iOS auto-zooms
// the page whenever a focused control is smaller than 16px, and that zoom widens
// the visual viewport into horizontal overflow on the body. Mouse-driven devices
// never zoom, so they keep the 15px of the design.
const FIELD_BASE =
  "w-full bg-transparent font-sans text-[15px] pointer-coarse:text-[16px] text-ink-strong " +
  "tracking-[-0.01em] outline-none placeholder:text-transparent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const WRAPPER_BASE =
  "relative rounded-[12px] border transition-colors duration-150 " +
  "focus-within:border-ink-strong";

type FloatingFieldProps = {
  /** DOM id — links label, control and error message together. */
  id: string;
  /** Submitted field name. */
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Called when this input may have entered the browser's autofill state. */
  onAutofill?: (input: HTMLInputElement) => void;
  /** Error text. Present means invalid: red styling + aria-invalid. */
  error?: string;
  type?: "text" | "email" | "tel";
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  /** Layout classes from the consumer (e.g. "sm:col-span-2"). */
  className?: string;
};

/**
 * Text field with a label that floats out of the way once the field is focused
 * or filled — the label stays visible while typing, so the visitor never has to
 * remember what an input was for.
 *
 * Logic-less: the consumer owns value, validation and when an error appears.
 */
export function FloatingField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  onAutofill,
  error,
  type = "text",
  multiline = false,
  rows = 6,
  maxLength,
  autoComplete,
  disabled = false,
  required = false,
  className = "",
}: FloatingFieldProps) {
  const errorId = `${id}-error`;
  const invalid = Boolean(error);

  const shared = {
    id,
    name,
    value,
    disabled,
    maxLength,
    autoComplete,
    required,
    // A non-empty placeholder is what makes :placeholder-shown mean "empty";
    // it is never visible (placeholder:text-transparent).
    placeholder: " ",
    "aria-invalid": invalid,
    "aria-describedby": invalid ? errorId : undefined,
    // Chrome injects a private autofill identifier before React hydrates.
    // Accept that one browser-owned attribute without hiding tree mismatches.
    suppressHydrationWarning: true,
    onBlur,
  };

  return (
    <div className={className}>
      <div
        className={`${WRAPPER_BASE} ${
          invalid
            ? "border-danger bg-danger-surface"
            : "border-ink-primary/20 bg-white hover:border-ink-primary"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {multiline ? (
          <textarea
            {...shared}
            rows={rows}
            onChange={(event) => onChange(event.target.value)}
            className={`${FIELD_BASE} ff-textarea block resize-y min-h-[168px] rounded-[12px] px-4 pt-[30px] pb-4 leading-[24px]`}
          />
        ) : (
          <input
            {...shared}
            type={type}
            onChange={(event) => onChange(event.target.value)}
            onAnimationStart={(event) => {
              if (event.currentTarget.matches(":autofill")) {
                onAutofill?.(event.currentTarget);
              }
            }}
            // Chromium reliably emits input for an interactive autofill even
            // when its CSS animation has already started before React listens.
            // The consumer re-checks :autofill after the browser has painted,
            // so ordinary typing passes through without side effects.
            onInput={(event) => onAutofill?.(event.currentTarget)}
            className={`${FIELD_BASE} ff-input block h-[60px] rounded-[12px] px-4 pt-[22px] pb-2`}
          />
        )}

        <label htmlFor={id} className={`ff-label ${invalid ? "!text-danger" : ""}`}>
          {label}
        </label>
      </div>

      {/* The message unfolds rather than sitting in permanently reserved space:
          three standing 24px gaps cost more rhythm on a phone than the occasional
          shift costs stability. 0fr→1fr is the one way to ease a box open to a
          height nobody has measured — `height: auto` does not interpolate, and
          max-height guesswork either clips a long message or slurs the timing.
          Where grid-template-rows will not animate the row simply snaps open,
          which is what prefers-reduced-motion asks for anyway. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          invalid ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        {/* overflow-hidden does double duty: it clips the collapsed message, and
            it zeroes the grid item's automatic minimum size, without which the
            row refuses to shrink below its content height. The gap above the
            message lives on the paragraph inside, not here — padding sits
            outside the content box, so on the grid item itself it would survive
            the collapse and leave a permanent 6px sliver. */}
        <div className="overflow-hidden">
          <p
            id={errorId}
            className={`pt-1.5 font-sans text-[15px] leading-[24px] text-danger transition-opacity duration-200 ease-out motion-reduce:transition-none ${
              invalid ? "opacity-100" : "opacity-0"
            }`}
          >
            {error ?? " "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FloatingField;
