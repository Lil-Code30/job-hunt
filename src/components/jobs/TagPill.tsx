export default function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-800 border border-gray-700 px-2.5 py-0.5 text-xs text-gray-300">
      {tag}
    </span>
  );
}
