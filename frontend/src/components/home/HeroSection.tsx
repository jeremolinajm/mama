import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative bg-background overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA: Texto */}
          <div className="max-w-2xl text-center lg:text-left z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wide mb-6">
              Dermocosmiatría Clínica
            </span>
            
            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-primary leading-[1.1] mb-6">
              Descubrí la mejor <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-400">
                versión de tu piel
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0 font-sans">
              Tratamientos faciales y corporales personalizados, diseñados para realzar tu belleza natural con ciencia y dedicación.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/servicios"
                className="bg-primary text-white px-8 py-4 rounded-full font-medium shadow-lg hover:bg-accent hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Reservar Turno
              </Link>
              <Link
                to="/productos"
                className="bg-white text-primary border border-gray-200 px-8 py-4 rounded-full font-medium shadow-lg hover:border-accent hover:text-accent hover:-translate-y-1 transition-all duration-300"
              >
                Ver Productos
              </Link>
            </div>

            {/* Social Proof (Pequeño detalle de confianza) */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                ))}
              </div>
              <p>+500 clientas felices</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: Imagen */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Círculo decorativo de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/40 rounded-full blur-3xl -z-10"></div>
            
            {/* Imagen Principal con forma orgánica */}
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
              <img 
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" 
                alt="Tratamiento facial" 
                className="w-full h-full object-cover"
              />
              
              {/* Badge Flotante */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg max-w-[200px]">
                <p className="font-serif font-bold text-lg text-primary">Skin Glow</p>
                <p className="text-xs text-gray-500">Tratamiento estrella para luminosidad inmediata.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}