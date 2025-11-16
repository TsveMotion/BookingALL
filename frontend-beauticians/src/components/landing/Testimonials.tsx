import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophie Mitchell',
    role: 'Lash Technician',
    location: 'Manchester',
    image: null,
    content: 'GlamBooking transformed my business. No more Instagram DM chaos—everything is automated. My clients love the booking experience and I get paid upfront every time.',
    rating: 5,
  },
  {
    name: 'Emma Richardson',
    role: 'Facialist & Skincare Specialist',
    location: 'London',
    image: null,
    content: 'The patch test tracking alone saved me hours every week. Plus the before/after photo logs help me show clients their progress. Couldn\'t run my clinic without it.',
    rating: 5,
  },
  {
    name: 'Chloe Davis',
    role: 'Brow Artist & PMU',
    location: 'Birmingham',
    image: null,
    content: 'My no-show rate dropped by 75% since using deposits through Stripe. The automated reminders work perfectly and the booking page looks so professional.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Trusted by Beauty Professionals
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Real beauticians. Real results.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-lg border border-gray-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-black text-black" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                <div>
                  <div className="font-semibold text-black">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
