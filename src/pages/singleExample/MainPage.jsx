import React, { useState, useEffect, useRef } from "react";
import "../../styles/stylesheet.css"; // import the CSS file

import CalendarComponent from "../calendar/Calendar.jsx";
import Claims from "../claims/Claims.jsx";
import TweetCarousel from "./TweetCarousel.jsx";

import { fetchMonth, fetchNext } from "../../data/query";

/*

1. Collapse all rhetoric folders into single "rhetorical games" file (?)

2. Add manual Tweet cards (not using the Twitter widget and TweetIds, but having all the data stored in a database) and then displaying it

*/


const defaultDayData = [{ usTweets: [ { id: "id1" }], themTweets: [{id: "id1"}], claimText: "", text: "", keywordIds: [], claimIds: [], claims: [] }];


// Main Page
export default function MainPage() {

  const debounceRef = useRef(null);

  const [viewState, setViewState] = useState({
    displayedDate: "2023-10-07",
    summaryData: {},
    monthlyData: {},
    dayData: {},
    currentIndex: 0,
    calendarDate: new Date("2023-10-07"),
    usTweetsIndex: 0,
    themTweetsIndex: 0,
  })
  const [keywordId, setKeywordId] = useState(null);
  const [claimId, setClaimId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    findNextExample(viewState.displayedDate, true, false);
  }, []);

  const onDateSelect = (_dateString, _getNextMonth) => {
    console.log("_dateString 1 : ", _dateString);

    if (_getNextMonth) {
      const responseData =  fetchNext(_dateString, keywordId, claimId, searchText);
      handleNextResponse(responseData);
    }

    else {
      const newDayData = viewState.monthlyData[_dateString] ? viewState.monthlyData[_dateString] : defaultDayData;
      const [y, m, d] = _dateString.split("-").map(Number);


      setViewState(prev => ({
        ...prev,
        dayData: newDayData,
        displayedDate: _dateString,
        calendarDate: new Date(y, m - 1, d),
        themTweetsIndex: 0,
        usTweetsIndex: 0,
        currentIndex: 0
      }));
    }
  }

const findNextExample = (_dateString, _findNext, _findPrev) => {

    const [hasExample, newDate] = checkForNextDatesData(_findNext); // if we want next, findNext is true; else findNext is false (and we want previous)
    const [y, m, d] = newDate ? newDate.split("-").map(Number) : _dateString.split("-").map(Number);

    if (_findNext) {
      if (viewState.currentIndex < viewState.dayData.length - 1) {
        setViewState(prev => ({
          ...prev,
          themTweetsIndex: 0,
          usTweetsIndex: 0,
          currentIndex: prev.currentIndex + 1
        }));
      }
      else if (hasExample) {
        setViewState(prev => ({
          ...prev,
          dayData: prev.monthlyData[newDate],
          displayedDate: newDate,
          themTweetsIndex: 0,
          usTweetsIndex: 0,
          currentIndex: 0,
          calendarDate: new Date(y, m - 1, d)
        }));
      }
      else {
        const responseData =  fetchNext(_dateString, keywordId, claimId, searchText, _findNext, _findPrev);
        handleNextResponse(responseData);
      }
    }

    else if (_findPrev) {
      if (viewState.currentIndex > 0) {
        setViewState(prev => ({
          ...prev,
          themTweetsIndex: 0,
          usTweetsIndex: 0,
          currentIndex: prev.currentIndex - 1
        }));
      }
      else if (hasExample) {
        setViewState(prev => ({
          ...prev,
          dayData: prev.monthlyData[newDate],
          displayedDate: newDate,
          themTweetsIndex: 0,
          usTweetsIndex: 0,
          currentIndex: 0,
          calendarDate: new Date(y, m - 1, d)
        }));
      }
      else {
        const responseData =  fetchNext(_dateString, keywordId, claimId, searchText, _findNext, _findPrev);
        handleNextResponse(responseData);
      }
    }
  }


  const handleNextResponse = (_responseData) => {
    if (_responseData.noTarget) {
      // window.alert(`No results. Try a different search criteria.`);
    }
    else {

      let newDate = _responseData.nextDate; // both next or previous dates, depending on which direction we're going
      const [y, m, d] = newDate.split("-").map(Number); // needed to prevent timezone offsets
      const newData = _responseData.data[newDate] ? _responseData.data[newDate] : defaultDayData;

      console.log("newData 4 : ", newData);

      setViewState(prev => ({
        ...prev,
        dayData: newData,
        summaryData: _responseData.summaryData,
        monthlyData: _responseData.data,
        displayedDate: newDate,
        themTweetsIndex: 0,
        usTweetsIndex: 0,
        currentIndex: 0,
        calendarDate: new Date(y, m - 1, d) // new Date(y, m, d) prevents timezone offests, whereas new Date ("yyyy-mm-dd") includes a timezone offset
      }));
     
      if (!loaded) {
        setLoaded(true);
      }
    }
  }

  // _claimIdSelected will be a string or "" (if none)
  const onClaimSelect = (_claimIdSelected) => {
    const newClaimId = _claimIdSelected === "" ? null : _claimIdSelected;
    const findNext = true;
    const findPrev = false;
    const responseData =  fetchNext(viewState.displayedDate, keywordId, newClaimId, searchText, findNext, findPrev);
    setClaimId(newClaimId);
    handleNextResponse(responseData);
  }

  const fetchSearchResults = (text) => {
    const findNext = true;
    const findPrev = false;
    const [year, month] = viewState.displayedDate.split("-");
    const responseData = fetchNext(`${year}-${month}-01`, keywordId, claimId, text, findNext, findPrev);
    handleNextResponse(responseData);
  }

  // next is a boolean of whether you're checking for the next date or previous date
  const checkForNextDatesData = (next) => {
    const dates = Object.keys(viewState.monthlyData).sort(); // sorted chronologically (YYYY-MM-DD format)
    const index = dates.indexOf(viewState.displayedDate);

    if (next) {
      const hasNext = index < dates.length - 1;
      const nextDate = hasNext ? dates[index + 1] : null;
      return [hasNext, nextDate];
    }
    else {
      const hasPrev = index > 0;
      const prevDate = hasPrev ? dates[index - 1] : null;
      return [hasPrev, prevDate];
    }
  }


  const handleThemTweetsIndex = (index) => {
    setViewState(prev => ({
      ...prev,
      themTweetsIndex: index
    }));
  }

  const handleUsTweetsIndex = (index) => {
    setViewState(prev => ({
      ...prev,
      usTweetsIndex: index
    }));
  }


  if (!loaded) {
    return <div style={{ color: "white" }}>Loading ...</div>
  }

  return (
    <div className="page-shell space-y-8">

      <CalendarComponent onDateSelect={onDateSelect} displayedDate={ viewState.displayedDate } summaryData={ viewState.summaryData } calendarDate={ viewState.calendarDate } />
      
      <div className="filters-row">

        <div className="search-container search-container-inline">
          <input
            className="search-input"
            type="text"
            placeholder="Search…"
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);

              if (debounceRef.current) clearTimeout(debounceRef.current);

              debounceRef.current = setTimeout(() => {
                fetchSearchResults(value);
              }, 250);
            }}
          />
        </div>

        <Claims onClaimSelect={onClaimSelect} />
      
      </div>

      <div className="current-date-div">
        <p className="font-bold text-gray-700">{new Date(`${viewState.displayedDate}T00:00:00Z`).toLocaleString("default",{
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC"
        })}:
          <span style={{ marginLeft: "10px", marginRight: "10px" }}>{viewState.dayData[0].text === "" ? "0" : viewState.currentIndex + 1} of {viewState.dayData[0].text === "" ? "0" : viewState.dayData.length}</span>
          <button onClick={() => findNextExample(viewState.displayedDate, false, true)}>&lt;</button>
          <button onClick={() => findNextExample(viewState.displayedDate, true, false)}>&gt;</button>
        </p>
        {/* <p className="font-bold text-gray-700">{dayData[currentIndex].keywordIds.map((item, i) => <span key={item}>{item}, </span>)}</p> */}
      </div>

      <div>

        {(() => {
          const claimsArr = viewState.dayData[viewState.currentIndex].claims;

          const selectedClaim =
            claimId
              ? claimsArr.find((item) => item.claimId === claimId)
              : claimsArr.find((item) => item.claimShortText) || null;

          const shortText = selectedClaim?.claimShortText || "";
          const fullText  = selectedClaim?.claimText || "";

          return (
            <div className="short-text">
              <h2 className="claim-short">
                {shortText}
              </h2>

              <p className="claim-full">
                {fullText}
              </p>

              <p className="claim-description">
                { viewState.dayData[viewState.currentIndex].text }
                { viewState.dayData[viewState.currentIndex].source ? <p className="description-text"><a href={viewState.dayData[viewState.currentIndex].sourceLink}>{viewState.dayData[viewState.currentIndex].sourceLink}</a></p> : []}
              </p>
            </div>
          );
        })()}
        
      </div>

      <div className="flex-row">
        
        { viewState.dayData[viewState.currentIndex].standaloneTweets && viewState.dayData[viewState.currentIndex].standaloneTweets.length ?
        
          <div className="flex-1">
            <TweetCarousel tweets={viewState.dayData[viewState.currentIndex].standaloneTweets} displayedDate={ viewState.displayedDate } currentIndex={ viewState.currentIndex } tweetIndex={viewState.themTweetsIndex} handleTweetsIndex={handleThemTweetsIndex} />
          </div>

          :

          <div className="tweet-pair">
            <div className="tweet-col">
              <p className="font-bold mb-2 text-gray-700">{viewState.dayData[viewState.currentIndex].thenVsNowFormat ? "Then" : "Them"}:</p>
              <TweetCarousel
                tweets={viewState.dayData[viewState.currentIndex].thenVsNowFormat ? viewState.dayData[viewState.currentIndex].thenTweets : viewState.dayData[viewState.currentIndex].themTweets}
                displayedDate={ viewState.displayedDate }
                currentIndex={ viewState.currentIndex }
                tweetIndex={viewState.themTweetsIndex}
                handleTweetsIndex={handleThemTweetsIndex}
              />
            </div>

            <div className="tweet-col">
              <p className="font-bold mb-2 text-gray-700">{ viewState.dayData[viewState.currentIndex].thenVsNowFormat ? "Now" : "Us"}:</p>
              <TweetCarousel
                tweets={viewState.dayData[viewState.currentIndex].thenVsNowFormat ? viewState.dayData[viewState.currentIndex].nowTweets : viewState.dayData[viewState.currentIndex].usTweets}
                displayedDate={ viewState.displayedDate }
                currentIndex={ viewState.currentIndex }
                tweetIndex={viewState.usTweetsIndex}
                handleTweetsIndex={handleUsTweetsIndex}
              />
            </div>
          </div>
        }
      </div>
      <div style={{marginTop: "60px", marginBottom: "60px", fontStyle: "italic", color: "white", textAlign: "center", }}>Dor Hadash is an independent research project documenting recurring antizionist narratives, rhetorical patterns, hate and violence.</div>
      {/* <p className="font-bold mb-2 text-gray-700"><a target="_blank" href="https://icons8.com/icon/6bf4WpRiadUV/israel">Israel</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></p> */}
    </div>
  );
}
