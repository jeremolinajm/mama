import { useState, useEffect } from 'react';
import type { WeeklySchedule, DaySchedule } from '../../types/domain';

interface ScheduleEditorProps {
  initialSchedule: string; // JSON string from DB
  onSave: (schedule: string) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_DAY: DaySchedule = { enabled: true, startTime: '09:00', endTime: '18:00' };

// Helper puro fuera del componente para parsear la lógica
const parseSchedule = (json: string): WeeklySchedule => {
  try {
    const parsed = json ? JSON.parse(json) : {};
    const fullSchedule: WeeklySchedule = {};
    DAYS.forEach((day) => {
      // Aseguramos que existan todos los días con defaults si faltan
      fullSchedule[day.key] = parsed[day.key] || { ...DEFAULT_DAY, enabled: false };
    });
    return fullSchedule;
  } catch (e) {
    console.error('Error parsing schedule', e);
    // Fallback seguro en caso de JSON corrupto
    const fallback: WeeklySchedule = {};
    DAYS.forEach((day) => {
        fallback[day.key] = { ...DEFAULT_DAY, enabled: false };
    });
    return fallback;
  }
};

export default function ScheduleEditor({ initialSchedule, onSave }: ScheduleEditorProps) {
  // CORRECCIÓN 1: Lazy Initialization.
  // Pasamos una función a useState. Se ejecuta solo una vez al montar.
  // Evita el doble render y el warning de useEffect.
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => parseSchedule(initialSchedule));

  // Sincronizar solo si la prop cambia externamente (ej: recarga de datos)
  useEffect(() => {
    setSchedule(parseSchedule(initialSchedule));
  }, [initialSchedule]);

  // CORRECCIÓN 2: Tipado estricto en lugar de 'any'
  const handleChange = (dayKey: string, field: keyof DaySchedule, value: string | boolean) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        [field]: value,
      },
    };
    setSchedule(newSchedule);
    // Sincronizar inmediatamente con el padre
    onSave(JSON.stringify(newSchedule));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Horarios de Atención Semanal</h3>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.key} className="flex items-center gap-4 py-2 border-b last:border-0">
            <div className="w-32">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule[day.key]?.enabled ?? false}
                  onChange={(e) => handleChange(day.key, 'enabled', e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <span
                  className={`font-medium ${
                    schedule[day.key]?.enabled ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {day.label}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={schedule[day.key]?.startTime || '09:00'}
                onChange={(e) => handleChange(day.key, 'startTime', e.target.value)}
                disabled={!schedule[day.key]?.enabled}
                className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
              />
              <span className="text-gray-500">a</span>
              <input
                type="time"
                value={schedule[day.key]?.endTime || '18:00'}
                onChange={(e) => handleChange(day.key, 'endTime', e.target.value)}
                disabled={!schedule[day.key]?.enabled}
                className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            {!schedule[day.key]?.enabled && (
              <span className="text-sm text-red-400 italic">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Los cambios se guardan con el botón "Guardar" de arriba.
      </p>
    </div>
  );
}