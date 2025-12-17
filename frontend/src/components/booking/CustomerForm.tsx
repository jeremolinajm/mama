interface CustomerFormProps {
  name: string;
  email: string;
  whatsapp: string;
  comments: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onWhatsappChange: (whatsapp: string) => void;
  onCommentsChange: (comments: string) => void;
}

export default function CustomerForm({
  name,
  email,
  whatsapp,
  comments,
  onNameChange,
  onEmailChange,
  onWhatsappChange,
  onCommentsChange,
}: CustomerFormProps) {
  
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-gray-300";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
          Nombre completo <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Ana García"
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Email <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="ana@ejemplo.com"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => onWhatsappChange(e.target.value)}
            placeholder="11 5555 6666"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
          Comentarios adicionales
        </label>
        <textarea
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          placeholder="¿Alguna alergia o consulta específica?"
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  );
}