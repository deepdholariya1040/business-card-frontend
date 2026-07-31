import { initials, cx } from "../../utils/format.js";

const sizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

export const Avatar = ({ name, src, size = "md", className }) => {
  console.log("Avatar Props:", { name, src });

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={cx(
          "shrink-0 rounded-full object-cover ring-1 ring-ink-100",
          sizes[size],
          className
        )}
        referrerPolicy="no-referrer"
        loading="eager"
        onLoad={() => {
          console.log("✅ Avatar loaded:", src);
        }}
        onError={(e) => {
          console.error("❌ Avatar failed:", src);
          console.error(e);

          // Hide broken image so fallback is shown
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-ink-900 font-semibold text-white",
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
};

export default Avatar;