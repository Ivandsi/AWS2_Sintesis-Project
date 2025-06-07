export default function Button({
  children,
  className = "",
  variant = "default",
  loading = false,
  ...props
}) {
  const baseClass = "btn";
  const variantClass = variant === "outline" ? "btn-outline" : "btn-default";

  return (
    <button
      type="button"
      {...props}
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={loading || props.disabled}
      style={{ position: "relative" }} // for spinner positioning
    >
      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
