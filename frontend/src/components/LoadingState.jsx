const LoadingState = ({ label = "Loading" }) => (
  <div className="state state-loading" role="status" aria-live="polite">
    <span className="spinner" />
    <span>{label}</span>
  </div>
);

export default LoadingState;

