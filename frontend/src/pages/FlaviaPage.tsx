import fotoFlavia from '../assets/flavia.jpg';

export default function FlaviaPage() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* 1. HERO BIO: Introducción e Imagen */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Imagen con Marco Decorativo */}
            <div className="w-full lg:w-1/2 relative flex justify-center">
              <div className="relative w-80 h-96 lg:w-[450px] lg:h-[550px]">
                {/* Marco desplazado */}
                <div className="absolute inset-0 border-2 border-accent rounded-[3rem] transform translate-x-6 translate-y-6"></div>
                {/* Imagen */}
                <img 
                  src={fotoFlavia}
                  alt="Flavia Dermocosmiatra" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-xl z-10"
                />
                {/* Badge Flotante */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-soft z-20 max-w-[200px] hidden md:block">
                  <p className="font-serif text-4xl font-bold text-accent mb-1">+10</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Años de Trayectoria</p>
                </div>
              </div>
            </div>

            {/* Texto Bio */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">Sobre Mí</span>
              <h1 className="font-serif text-5xl lg:text-6xl font-bold text-primary mb-8 leading-tight">
                Pasión por la <br/>
                <span className="italic text-accent">Belleza Saludable</span>
              </h1>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-sans">
                <p>
                  Hola, soy Flavia. Mi viaje en la dermocosmiatría comenzó con una simple creencia: <strong className="text-primary font-medium">la piel es el reflejo de nuestra salud integral.</strong>
                </p>
                <p>
                  A lo largo de mi carrera, me he dedicado a perfeccionar técnicas que no solo tratan afecciones superficiales, sino que buscan restaurar el equilibrio natural de la piel. Me alejo de las "modas pasajeras" para enfocarme en la ciencia dermatológica aplicada con calidez humana.
                </p>
                <p>
                  Mi consultorio es un espacio seguro donde cada tratamiento se diseña a medida. No creo en soluciones únicas para todos, porque cada rostro cuenta una historia diferente.
                </p>
              </div>

              {/* Firma */}
              <div className="mt-10">
                <p className="font-serif text-2xl text-primary italic">Flavia Dainotto.</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Fundadora & Directora</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FILOSOFÍA & CREDENCIALES (Fondo Blanco) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">Formación y Excelencia</h2>
            <p className="text-gray-500">Capacitación constante para brindarte lo mejor de la vanguardia estética.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-background rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24 50.552 50.552 0 00-2.658.813m-15.482 0A50.553 50.553 0 0112 13.489a50.551 50.551 0 016.482-1.206M6.75 21.75h10.5c-2.75-4.25-5.25-4.25-5.25-4.25s-2.5 0-5.25 4.25z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-2">Dermocosmiatría</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Títulación oficial técnica superior. Especialización en anatomía facial y patologías cutáneas.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-background rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-2">Química Cosmética</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Certificación en formulación y activos. Selección rigurosa de productos basada en evidencia científica.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-background rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-2">Enfoque Holístico</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Especialización en masajes faciales y técnicas de relajación para complementar los tratamientos clínicos.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SOCIAL CONTACT */}
      <section className="py-20 container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-primary mb-8">Sigamos Conectados</h2>
        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/flavia.dermobeauty"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <span className="text-pink-500 text-xl group-hover:scale-110 transition-transform">📸</span>
            <span className="font-medium text-gray-600 group-hover:text-primary">Instagram</span>
          </a>
          
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <span className="text-green-500 text-xl group-hover:scale-110 transition-transform">💬</span>
            <span className="font-medium text-gray-600 group-hover:text-primary">WhatsApp</span>
          </a>
        </div>
      </section>

    </div>
  );
}