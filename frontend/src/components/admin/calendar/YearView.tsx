import { 
  startOfYear, 
  eachMonthOfInterval, 
  endOfYear, 
  format, 
  getDay, 
  getDaysInMonth 
} from 'date-fns';
import { es } from 'date-fns/locale';

interface YearViewProps {
  currentDate: Date;
  onMonthSelect: (date: Date) => void;
}

export default function YearView({ currentDate, onMonthSelect }: YearViewProps) {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {months.map((month) => {
        const daysInMonth = getDaysInMonth(month);
        const startDay = getDay(month); // 0 = Domingo
        
        return (
          <div 
            key={month.toString()} 
            className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-accent hover:shadow-soft transition-all cursor-pointer group"
            onClick={() => onMonthSelect(month)}
          >
            <h3 className="font-serif font-bold text-lg text-primary mb-3 capitalize group-hover:text-accent">
              {format(month, 'MMMM', { locale: es })}
            </h3>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map(d => (
                <span key={d} className="text-[10px] text-gray-400 font-bold">{d}</span>
              ))}
              
              {/* Espacios vacíos iniciales */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Días */}
              {Array.from({ length: daysInMonth }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-6 w-6 flex items-center justify-center text-xs text-gray-600 rounded-full hover:bg-accent/10"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}