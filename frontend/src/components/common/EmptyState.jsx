export const EmptyState = ({
  icon = '📭',
  title = 'No data',
  description = 'No items to display',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      {action && action}
    </div>
  );
};

export default {
  EmptyState
};