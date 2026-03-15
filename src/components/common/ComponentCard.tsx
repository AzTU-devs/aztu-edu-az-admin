interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  actions?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  actions,
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {desc && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {/* Card Body */}
      <div className={`p-5 sm:p-6`}>
        {children}
      </div>
    </div>
  );
};

export default ComponentCard;
