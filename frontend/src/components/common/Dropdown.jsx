export const Dropdown = ({ trigger, items = [] }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
        {trigger}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default {

  Dropdown,
 
};