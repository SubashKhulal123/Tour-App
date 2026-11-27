const EmptyState = ({ title, message }) => (
  <div className="state empty-state">
    <h3>{title}</h3>
    {message ? <p>{message}</p> : null}
  </div>
);

export default EmptyState;

