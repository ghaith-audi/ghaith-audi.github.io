import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      id="main"
      className="container"
      style={{ minHeight: '100vh', display: 'grid', alignContent: 'center', gap: 20, paddingBlock: 64 }}
    >
      <p className="eyebrow">
        <b>404</b> Sheet missing
      </p>
      <h1 className="sec-title" style={{ margin: 0 }}>
        This drawing isn&apos;t in the set.
      </h1>
      <p className="sec-lead">The page may have moved, or the link is mistyped.</p>
      <div>
        <Link className="btn btn-primary" href="/">
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
