/** Renders a JSON-LD <script> tag. `data` must be a plain JSON-serializable object — never raw user HTML. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
