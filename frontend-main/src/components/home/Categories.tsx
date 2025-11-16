import { Sparkles, Hand, Droplet, Palette, Eye, Scissors, Sun, Smile } from 'lucide-react';

const categories = [
  { name: 'Facials', icon: Sparkles },
  { name: 'Nails & Pedicures', icon: Hand },
  { name: 'Waxing', icon: Droplet },
  { name: 'Makeup', icon: Palette },
  { name: 'Lash Extensions', icon: Eye },
  { name: 'Skincare', icon: Scissors },
  { name: 'Spray Tans', icon: Sun },
  { name: 'Brows & PMU', icon: Smile },
];

export default function Categories() {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Built for Every Beauty Service
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From facials to spray tans, GlamBooking handles it all seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group relative flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full border-2 border-gray-900 bg-white mb-4 group-hover:bg-black transition-colors">
                <category.icon className="h-8 w-8 text-black group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-center text-black">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
