export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'María González',
      service: 'Limpieza Facial Profunda',
      rating: 5,
      comment: 'Mi piel nunca se sintió mejor. El tratamiento personalizado fue excepcional. Flavia explica cada paso y los productos son increíbles.',
    },
    {
      id: 2,
      name: 'Laura Fernández',
      service: 'Peeling Químico',
      rating: 5,
      comment: 'Estaba nerviosa por el peeling, pero la delicadeza y profesionalismo me dieron total confianza. Los resultados superaron mis expectativas.',
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      service: 'Rutina Skincare',
      rating: 5,
      comment: 'No solo es el tratamiento, es lo que aprendes. Flavia me ayudó a armar una rutina simple que realmente puedo mantener en casa.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">
            Historias Reales
          </h2>
          <p className="text-gray-500">La experiencia de quienes confían en nosotros.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              className="bg-background rounded-3xl p-8 relative hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Icono Comillas Decorativo */}
              <div className="absolute top-6 right-8 text-accent/20 text-6xl font-serif leading-none">
                "
              </div>

              {/* Estrellas */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${i < t.rating ? 'text-accent' : 'text-gray-300'}`}>
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-600 mb-6 font-sans italic relative z-10">
                "{t.comment}"
              </p>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-primary font-serif">{t.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t.service}</p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}