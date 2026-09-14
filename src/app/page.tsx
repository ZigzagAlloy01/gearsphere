export default function Home() {
  return (
    <main>
      <div className="space-y-4 p-8">
        <h1 className="text-3xl font-bold">GearSphere Page Title</h1>

        <h2 className="text-2xl font-semibold">Section Heading</h2>

        <h3 className="text-xl font-semibold">Subheading</h3>

        <p className="text-base">This is normal body text for GearSphere.</p>

        <p className="text-sm text-slate-500">
          This is supporting information.
        </p>

        <p className="text-xs text-slate-400">This is metadata.</p>
      </div>

      <div className="space-y-4 p-8">
        <div className="bg-primary text-white p-4">
          GearSphere Primary Color
        </div>

        <div className="bg-secondary text-white p-4">
          GearSphere Secondary Color
        </div>

        <div className="bg-accent text-white p-4">GearSphere Accent Color</div>
      </div>
    </main>
  );
}
