import { Link } from 'react-router-dom';
import fotoFlavia from '../../assets/flavia.jpg'

export default function MiniBio() {
  return (
    <section className="py-24 bg-accent/5 relative overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Columna Imagen */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              <div className="absolute inset-0 border-2 border-accent/30 rounded-full transform translate-x-4 translate-y-4"></div>
              <img
                src={fotoFlavia} 
                alt="Flavia, Dermocosmiatra"
                className="w-full h-full object-cover rounded-full shadow-lg relative z-10"
              />
            </div>
          </div>

          {/* Columna Texto */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-6">
              Hola, soy Flavia
            </h2>
            
            <div className="space-y-6 text-gray-600 leading-relaxed font-sans">
              <p>
                Especialista en dermocosmiatría con más de 10 años dedicados al cuidado integral de la piel. Mi filosofía combina la ciencia dermatológica con un enfoque holístico del bienestar.
              </p>
              <p>
                Creo firmemente que cada piel cuenta una historia única. En mi consultorio, no solo tratamos afecciones, sino que diseñamos rutinas personalizadas que se adaptan a tu estilo de vida y objetivos.
              </p>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
              <Link
                to="/flavia"
                className="text-primary font-semibold hover:text-accent transition-colors flex items-center gap-2"
              >
                Conocer más sobre mi trayectoria
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
              
              {/* Firma decorativa (Simulada con fuente cursiva o imagen) */}
              <span className="font-serif italic text-2xl text-accent/80">Flavia Dainotto.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}