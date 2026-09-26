/** Shared SVG markers and patterns, rendered once per page and referenced by every diagram. */
export default function DiagramDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <marker id="dg-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="mk" d="M0,0 L10,5 L0,10 z" />
        </marker>
        <marker id="dg-ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="mkr" d="M0,0 L10,5 L0,10 z" />
        </marker>
        <pattern id="dg-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect className="hatch-bg" width="7" height="7" />
          <line className="hatch-line" x1="0" y1="0" x2="0" y2="7" />
        </pattern>
      </defs>
    </svg>
  );
}
