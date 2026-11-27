import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="page">
    <section className="container not-found">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link className="primary-button" to="/">
        Go home
      </Link>
    </section>
  </main>
);

export default NotFound;

