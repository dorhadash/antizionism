import React, { useState, useMemo } from "react";
import "../../styles/calendarStyles.css"; // import the CSS file

const Calendar = ({ onDateSelect, summaryData, displayedDate, calendarDate }) => {
  // const [calendarDate, setCalendarDate] = useState(new Date(displayedDate));

  console.log("displayedDate 5 : ", displayedDate);
  console.log("calendarDate5 : ", calendarDate);


  // Move to previous month
  const changeMonth = (direction) => {

    // iterate the next month WITHIN a new Date so it will rollover onto new years, othrwies you'll get "2023-13-01"
    const year = calendarDate.getFullYear();
    const month = direction === "next" ? calendarDate.getMonth() + 1 : calendarDate.getMonth() - 1;

    console.log("month : ", month);
    const newDate = new Date(year, month, "1");

    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();

    console.log("newMonth 1 : ", newMonth);

    // need to add +1 back to the month, because new Date() (above) is 0-indexed, so January is 0 and September is 8.
    // But for the onDateSelect, we want the actual months 1-indexed, so January is 01 and September is 09
    // In each case - nextMonth or prevMonth - we add 1 to the month
    // If we're in September and we want the NEXT month (October), we want it to be a 10
    // calendar.getMonth() == 8 (September), then above we add 1 to it to make it 9, but we want 10 so we add another 1 to it
    // Conversly, if we're in September and we want the PREV month (August), we want it to be an 8
    // calendar.getMonth() == 8 (September), then above we subtract 1 from it to make it 7, but we want 8 so we add 1 back to it
    onDateSelect(`${newYear}-${newMonth + 1}-01`, true);
  };

  // Get all days in the current month
  const getDateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const getDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const key = getDateKey(date);
      const count = summaryData[key] || 0;
      days.push({ label: date.getDate(), key, count });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  console.log("month : ", month);
  const days = useMemo(() => getDaysInMonth(year, month), [year, month, summaryData]);

  const handleDateClick = (key) => {
    // onDateSelect(dateString, newKeywordId, newClaimId, findNext, findPrev, fromCalendar)
    onDateSelect(key);
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-row">
        {/* LEFT: fixed-width month/year */}
        <div className="calendar-month">
          <button onClick={() => changeMonth("prev")}>&lt;</button>
          <span className="calendar-month-label">
            {calendarDate.toLocaleString("default", { month: "long" })} {year}
          </span>
          <button onClick={() => changeMonth("next")}>&gt;</button>
        </div>

        {/* RIGHT: dates strip */}
        <div className="calendar-days">
          {days.map((day) => (
            <button
              key={day.key}
              className={`day-button
                ${summaryData[day.key] > 0 ? "has-data" : "has-no-data"}
                ${displayedDate === day.key ? "selected" : ""}
              `}
              onClick={() => handleDateClick(day.key)}
            >
              <div className="day-number">{day.label}</div>
              {day.count > 0 && <div className="day-count">{day.count}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

};

export default Calendar;
