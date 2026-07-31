import { cx } from "../../utils/format.js";

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 overflow-x-auto border-b border-ink-100 px-1 scrollbar-thin">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={cx(
          "relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
          active === tab.value ? "text-ink-900" : "text-ink-400 hover:text-ink-600"
        )}
      >
        {tab.label}
        {active === tab.value && (
          <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal" />
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
