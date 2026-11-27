import { Filter, Search } from "lucide-react";
import { useState } from "react";

const SearchFilters = ({ initialValues = {}, onSubmit }) => {
  const [values, setValues] = useState({
    search: initialValues.search || "",
    location: initialValues.location || "",
    priceMax: initialValues.priceMax || "",
    durationMax: initialValues.durationMax || ""
  });

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="filters" onSubmit={submit}>
      <label>
        <span>Search</span>
        <div className="input-with-icon">
          <Search size={17} aria-hidden="true" />
          <input name="search" value={values.search} onChange={update} placeholder="trek, coast, glacier" />
        </div>
      </label>
      <label>
        <span>Location</span>
        <input name="location" value={values.location} onChange={update} placeholder="Nepal" />
      </label>
      <label>
        <span>Max price</span>
        <input name="priceMax" type="number" min="0" value={values.priceMax} onChange={update} placeholder="1500" />
      </label>
      <label>
        <span>Max days</span>
        <input name="durationMax" type="number" min="1" value={values.durationMax} onChange={update} placeholder="8" />
      </label>
      <button className="primary-button" type="submit">
        <Filter size={18} aria-hidden="true" />
        Filter
      </button>
    </form>
  );
};

export default SearchFilters;

