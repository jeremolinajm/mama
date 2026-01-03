import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import ScheduleEditor from '../../components/admin/ScheduleEditor';
import { toast } from 'sonner';
import {
  Store,
  CalendarClock,
  Truck,
  Save,
  Loader2,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Mail,
  AlertCircle
} from 'lucide-react';

// Definimos las secciones de configuración
type SettingsTab = 'general' | 'agenda' | 'store';

// Sub-componente de Botón de Menú Lateral (Corregido y Accesible)
const TabButton = ({ 
  id, 
  label, 
  icon: Icon, 
  description, 
  isActive, 
  onClick 
}: { 
  id: SettingsTab, 
  label: string, 
  icon: React.ElementType,
  description: string,
  isActive: boolean,
  onClick: () => void
}) => (
  <button
    type="button"
    id={`tab-${id}`} // ✅ CORRECCIÓN: Usamos la variable 'id'
    aria-selected={isActive}
    aria-controls={`panel-${id}`}
    role="tab"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-4 group ${
      isActive 
        ? 'bg-white shadow-md border border-gray-100 ring-1 ring-black/5' 
        : 'hover:bg-white/50 hover:shadow-sm'
    }`}
  >
    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:text-primary'}`}>
      <Icon size={20} strokeWidth={2} />
    </div>
    <div>
      <span className={`block font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
        {label}
      </span>
      <span className="text-xs text-gray-400 font-medium leading-tight">
        {description}
      </span>
    </div>
  </button>
);

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // Estado unificado para todos los valores (Key-Value map)
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await adminApi.config.getAll();
      const configMap: Record<string, string> = {};
      data.forEach(item => {
        configMap[item.key] = item.value;
      });
      setValues(configMap);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(values).map(([key, value]) => 
        adminApi.config.update(key, value)
      );

      await Promise.all(updates);
      toast.success('Configuración guardada correctamente', {
        description: 'Los cambios se verán reflejados en la web pública.'
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mr-2" /> Cargando sistema...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-500 mt-2">Controla la información pública, horarios y reglas de negocio.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR DE NAVEGACIÓN */}
        <div className="lg:col-span-4 space-y-2">
          <TabButton 
            id="general" label="Identidad & Contacto" icon={Store} description="Nombre, redes sociales y ubicación." 
            isActive={activeTab === 'general'} onClick={() => setActiveTab('general')}
          />
          <TabButton 
            id="agenda" label="Agenda & Turnos" icon={CalendarClock} description="Horarios de atención y políticas." 
            isActive={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')}
          />
          <TabButton
            id="store" label="Tienda & Envíos" icon={Truck} description="Costos de envío y reglas de venta."
            isActive={activeTab === 'store'} onClick={() => setActiveTab('store')}
          />
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            
            {/* Header del Tab */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {activeTab === 'general' && 'Información Pública'}
                {activeTab === 'agenda' && 'Reglas de Agenda'}
                {activeTab === 'store' && 'Configuración E-commerce'}
              </h2>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar
              </button>
            </div>

            {/* Body del Tab (Scrollable) */}
            <div className="p-8 space-y-8 flex-1">
              
              {/* --- TAB: IDENTIDAD & CONTACTO --- */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 gap-6">
                    <InputGroup label="Nombre del Sitio" description="Aparece en la pestaña del navegador y emails.">
                      <input 
                        type="text" 
                        value={values['site.name'] || ''}
                        onChange={e => handleChange('site.name', e.target.value)}
                        className="form-input" 
                      />
                    </InputGroup>
                    
                    <InputGroup label="Descripción Corta (SEO)" description="Resumen para Google (Meta Description).">
                      <textarea 
                        value={values['site.description'] || ''}
                        onChange={e => handleChange('site.description', e.target.value)}
                        className="form-textarea" 
                        rows={2}
                      />
                    </InputGroup>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={18}/> Redes & Contacto
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Esta información se sincroniza automáticamente con el pie de página y la sección de contacto.</p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* WhatsApp */}
                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-600">
                              <MessageCircle size={18} />
                            </div>
                            <input 
                              type="text" 
                              placeholder="+54 9 11..."
                              value={values['contact.whatsapp'] || ''}
                              onChange={e => handleChange('contact.whatsapp', e.target.value)}
                              className="form-input pl-10" 
                            />
                          </div>
                        </div>

                        {/* Instagram */}
                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-600">
                              <Instagram size={18} />
                            </div>
                            <input 
                              type="text" 
                              placeholder="URL Instagram"
                              value={values['social.instagram'] || ''}
                              onChange={e => handleChange('social.instagram', e.target.value)}
                              className="form-input pl-10" 
                            />
                          </div>
                        </div>

                        {/* Dirección */}
                        <div className="relative md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Dirección del Consultorio</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <MapPin size={18} />
                            </div>
                            <input 
                              type="text" 
                              placeholder="Av. Santa Fe 1234, CABA"
                              value={values['contact.address'] || ''}
                              onChange={e => handleChange('contact.address', e.target.value)}
                              className="form-input pl-10" 
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="relative md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Email de Contacto</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <Mail size={18} />
                            </div>
                            <input 
                              type="email" 
                              placeholder="contacto@flavia.com"
                              value={values['contact.email'] || ''}
                              onChange={e => handleChange('contact.email', e.target.value)}
                              className="form-input pl-10" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: AGENDA --- */}
              {activeTab === 'agenda' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <p>Los cambios en los horarios base afectarán a la disponibilidad de turnos futuros.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Horarios Semanales</h3>
                    <ScheduleEditor 
                      initialSchedule={values['schedule.weekly'] || '{}'} 
                      onSave={(json) => handleChange('schedule.weekly', json)} 
                    />
                  </div>

                  <InputGroup label="Política de Cancelación" description="Texto visible para el cliente al reservar.">
                    <textarea 
                      value={values['policy.cancellation'] || ''}
                      onChange={e => handleChange('policy.cancellation', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </InputGroup>
                </div>
              )}

              {/* --- TAB: STORE --- */}
              {activeTab === 'store' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <p>El costo de envío se calcula manualmente para cada pedido. Puedes configurar un monto a partir del cual el envío es gratis.</p>
                  </div>

                  <InputGroup label="Envío GRATIS a partir de ($)" description="Si el pedido supera este monto, el envío es gratis. Deja en 0 para desactivar.">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        value={values['delivery.free_threshold'] || '0'}
                        onChange={e => handleChange('delivery.free_threshold', e.target.value)}
                        className="form-input pl-8"
                      />
                    </div>
                  </InputGroup>

                  <div className="border-t border-gray-100 pt-6">
                    <InputGroup label="Política de Devolución" description="Texto legal sobre cambios y devoluciones.">
                      <textarea
                        value={values['policy.returns'] || ''}
                        onChange={e => handleChange('policy.returns', e.target.value)}
                        className="form-textarea"
                        rows={4}
                      />
                    </InputGroup>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componente simple para layout de inputs
const InputGroup = ({ label, description, children }: { label: string, description?: string, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-bold text-gray-900">{label}</label>
    {children}
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);