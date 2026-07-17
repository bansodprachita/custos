export default function Icon({ name, className = "", filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "icon-filled" : ""} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
