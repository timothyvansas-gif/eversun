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
    onBlur,
  };

  return (
    <div className={className}>
      <div
        className={`${WRAPPER_BASE} ${
          invalid
            ? "border-[#A6371A] bg-[#FDF3EF]"
            : "border-transparent bg-surface-page hover:border-line"
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
            className={`${FIELD_BASE} ff-input block h-[60px] rounded-[12px] px-4 pt-[22px] pb-2`}
          />
        )}

        <label htmlFor={id} className={`ff-label ${invalid ? "!text-[#A6371A]" : ""}`}>
          {label}
        </label>
      </div>

      {/* Reserved height, so a validation message never nudges the layout. */}
      <p
        id={errorId}
        className={`mt-1.5 min-h-[24px] font-sans text-[15px] leading-[24px] text-[#A6371A] transition-opacity duration-150 ${
          invalid ? "opacity-100" : "opacity-0"
        }`}
      >
        {error ?? " "}
      </p>
    </div>
  );
}

export default FloatingField;
