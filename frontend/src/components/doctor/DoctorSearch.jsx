import React, { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

const DoctorSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search doctors by name or specialization..."
        className="input-base"
      />
    </div>
  );
};
export default DoctorSearch;