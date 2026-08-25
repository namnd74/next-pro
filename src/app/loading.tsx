export default function Loading() {
  return (
    <div className="animate-pulse space-y-8 pt-8">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="bg-secondary mx-auto h-6 w-32 rounded-full" />
        <div className="bg-secondary mx-auto h-12 w-3/4 rounded-xl" />
        <div className="bg-secondary mx-auto h-5 w-1/2 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border bg-secondary/50 h-36 rounded-2xl border"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-border bg-secondary/40 h-64 rounded-2xl border" />
        <div className="border-border bg-secondary/40 h-64 rounded-2xl border" />
      </div>
    </div>
  );
}
