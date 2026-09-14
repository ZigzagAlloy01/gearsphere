export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-primary p-4">Welcome to GearSphere!</h1>
      <h2 className="text-2xl font-semibold text-secondary p-4">Available Equipment</h2>
      <h3 className="text-xl font-medium text-accent p-4">Rent Now!</h3>
      <p className="p-4">Check out our wide range of equipment for rent!</p>
      <p className="text-sm text-slate-500 p-4">
        Available from verified equipment owners.
      </p>
      <div className="bg-primary text-white p-4">GearSphere Primary Color</div>

      <div className="bg-secondary text-white p-4">
        GearSphere Secondary Color
      </div>

      <div className="bg-accent text-white p-4">GearSphere Accent Color</div>

    </main>
  );
}
