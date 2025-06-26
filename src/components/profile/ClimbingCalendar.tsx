
import React from 'react';
import { ClimbingDay } from '../../types';
import { Tooltip as ReactTooltip } from 'react-tooltip'; // Using a specific tooltip library for better control

interface ClimbingCalendarProps {
  activity: ClimbingDay[];
  year?: number; // To show a specific year, defaults to current
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// FIX: Define an interface for the data structure of each day square in the calendar
interface CalendarDaySquareData {
  date: Date;
  count: number;
  gyms: { name: string; logoUrl: string }[];
}

const ClimbingCalendar: React.FC<ClimbingCalendarProps> = ({ activity, year = new Date().getFullYear() }) => {
  const today = new Date();
  const startDate = new Date(year, 0, 1); // Jan 1st of the target year
  const endDate = (year === today.getFullYear()) ? today : new Date(year, 11, 31); // Today or Dec 31st

  const daysInYear: CalendarDaySquareData[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    const activitiesOnDate = activity.filter(act => act.date === dateString);
    const uniqueGyms = Array.from(new Set(activitiesOnDate.map(a => a.gymId)))
      .map(id => {
        const gymActivity = activitiesOnDate.find(a => a.gymId === id);
        return { name: gymActivity!.gymName, logoUrl: gymActivity!.gymLogoUrl };
      });

    daysInYear.push({
      date: new Date(currentDate),
      count: activitiesOnDate.length,
      gyms: uniqueGyms,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-slate-200 hover:bg-slate-300'; // No activity
    if (count === 1) return 'bg-green-200 hover:bg-green-300';
    if (count <= 3) return 'bg-green-400 hover:bg-green-500';
    return 'bg-green-600 hover:bg-green-700'; // 4+ activities
  };

  // Create weeks structure for rendering
  // FIX: Corrected type for 'weeks' to be an array of 'CalendarDaySquareData' arrays.
  const weeks: CalendarDaySquareData[][] = [];
  // FIX: Corrected type for 'currentWeek' to be an array of 'CalendarDaySquareData'.
  let currentWeek: CalendarDaySquareData[] = [];

  // Pad start of the first week if Jan 1st is not a Sunday
  if (daysInYear.length > 0) { // Ensure daysInYear is not empty before accessing its first element
    const firstDayOfWeek = daysInYear[0].date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: new Date(0), count: -1, gyms: [] }); // Placeholder for empty days, use a distinct date like epoch
    }
  }


  daysInYear.forEach(day => {
    currentWeek.push(day);
    if (day.date.getDay() === 6) { // Saturday, end of week
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) { // Add remaining days of the last week
    // Pad the end of the last week if it's not full
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), count: -1, gyms: [] }); // Placeholder
    }
    weeks.push(currentWeek);
  }


  return (
    <div className="bg-white p-6 rounded-lg shadow-md my-8">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">Climbing Activity ({year})</h3>
      <div className="flex mb-2 text-xs text-neutral">
        {/* FIX: Ensure 'day.count' and 'day.date' are accessed correctly due to corrected types for 'weeks' and 'currentWeek'. */}
        {MONTH_NAMES.map((month, i) => {
          const isMonthVisible = weeks.some(week => week.some(day => day.count !== -1 && day.date.getMonth() === i && day.date.getDate() < 8));
          if(!isMonthVisible && i > 0 && !weeks.some(week => week.some(day => day.count !== -1 && day.date.getMonth() === i-1 && day.date.getFullYear() === year))) return null; 
          return (
            <div key={month} style={{ flexBasis: `${100/12}%` }} className="text-center">{month}</div>
          );
        })}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(1rem,1fr))] gap-1" style={{gridTemplateColumns: `repeat(${weeks[0]?.length || 7}, minmax(0, 1fr))`}}>
        {/* This grid structure might need refinement for exact GitHub layout. Using fixed column count for now. */}
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 auto-cols-max">
        {/* This is a common way to represent it. Requires knowing number of weeks */}
        {/* Simplified layout: a long row of days, wrapped by CSS, less GitHub like */}
        {/* This rendering part assumes a flat list of days, if weeks structure is used, map over weeks then days */}
        {daysInYear.map((dayData, index) => { // Or map over weeks.flat() if using the weeks structure for rendering
          const { date, count, gyms } = dayData;
          if (count === -1) { // Skip rendering placeholder days if that's the intent, or style them differently
            return <div key={`padding-${index}`} className="w-4 h-4 rounded-sm bg-transparent"></div>;
          }
          const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          let tooltipContent = `${dateString}: No activity`;
          if (count > 0) {
            tooltipContent = `${dateString}: Climbed ${count} time(s). Gyms: ${gyms.map(g => g.name).join(', ')}`;
          }
          
          return (
            <div
              key={index}
              data-tooltip-id="climbing-day-tooltip"
              data-tooltip-content={tooltipContent}
              className={`w-4 h-4 rounded-sm ${getIntensityColor(count)} transition-colors duration-150 flex items-center justify-center overflow-hidden`}
            >
              {count > 0 && gyms[0]?.logoUrl && (
                 <img src={gyms[0].logoUrl} alt={gyms[0].name.substring(0,1)} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
              {count > 0 && !gyms[0]?.logoUrl && gyms[0]?.name && (
                 <span className="text-[8px] text-white font-bold">{gyms[0]?.name.substring(0,1)}</span>
              )}
            </div>
          );
        })}
      </div>
      <ReactTooltip id="climbing-day-tooltip" place="top" className="z-50"/>
      <div className="flex justify-end mt-4 space-x-2">
        <span className="text-xs text-neutral">Less</span>
        <div className="w-3 h-3 bg-slate-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
        <span className="text-xs text-neutral">More</span>
      </div>
    </div>
  );
};


export default ClimbingCalendar;
