// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ size = "sm", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
