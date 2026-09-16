import { createClient } from '@/src/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: categories, error
  } = await supabase
        .from('categories')
        .select('*')

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

      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">
          Connection to supabase
        </h1>

        {error ? (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-200">
            <p className="font-bold">There was an error: </p>
            <p className="text-sm mt-1">{error.message}</p>
            <p className="text-xs mt-3 text-red-400">
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary text-white p-4 thedatawassuccesfullyloaded">
              <p className="font-bold"> The data was successfully loaded </p>
              <p className="text-sm mt-1">
                {categories?.length || 0} were found
              </p>
            </div>

            <div className="bg-secondary text-white p-4 categoriesindatabase">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">
                Categories in the database:
              </h2>
              <ul className="space-y-2">
                {categories?.map((cat) => (
                  <li 
                    key={cat.id} 
                    className="p-3 bg-gray-800/50 rounded-md border border-gray-700/50 flex justify-between items-center"
                  >
                    <span className="font-medium text-emerald-300">{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
