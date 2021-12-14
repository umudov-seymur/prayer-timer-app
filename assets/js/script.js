const prayerDateTable = document.querySelector(".namaz-date-table");
const prayerTable = document.querySelector(".namaz-table");

const API_URL = "https://api.aladhan.com/v1";
const PRAYER_CONFIG = {
  lat: 40,
  long: 49,
};

class Helper {
  static getTimestamp(timestamp) {
    return Math.round(timestamp / 1000);
  }
  static getApiUrl(route) {
    return `${API_URL}/${route}?latitude=${PRAYER_CONFIG.lat}&longitude=${PRAYER_CONFIG.long}&method=2`;
  }
}

class PrayerTimingsService {
  static async getPrayerTimingByDate(timestamp) {
    const response = await fetch(Helper.getApiUrl(`timings/${timestamp}`));
    const { data } = await response.json();

    return data.timings;
  }

  static async getPrayerTimingsByMonth(date) {
    const response = await fetch(
      `${Helper.getApiUrl(`calendar`)}&month=${
        date.getMonth() + 1
      }&year=${date.getFullYear()}`
    );
    const { data: prayersTimings } = await response.json();

    return prayersTimings;
  }
}

class UI {
  static displayPrayerTimeByDate(timestamp) {
    PrayerTimingsService.getPrayerTimingByDate(timestamp).then((timings) => {
      const timingTitles = Object.keys(timings);
      const timingVallues = Object.values(timings);

      prayerDateTable.querySelector("thead").innerHTML =
        this.createPrayerTableHeader(timingTitles);

      prayerDateTable.querySelector("tbody").innerHTML =
        this.createPrayerTableBody(timingVallues);
    });
  }

  static displayPrayerTimesByMonth(date) {
    PrayerTimingsService.getPrayerTimingsByMonth(date).then((prayerTimings) => {
      let timingTitles = ["Date", ...Object.keys(prayerTimings[0].timings)];

      const prayerTableHead = prayerTable.querySelector("thead");
      const prayerTableBody = prayerTable.querySelector("tbody");

      prayerTableHead.innerHTML = this.createPrayerTableHeader(timingTitles);
      prayerTableBody.innerHTML = "";

      prayerTimings.forEach((prayerTiming) => {
        const prayerDate = moment(prayerTiming.date.timestamp * 1000).format(
          "D MMMM"
        );
        const timingValues = Object.values(prayerTiming.timings).map(
          (timing) => timing.split(" ")[0]
        );

        const timings = [prayerDate, ...timingValues];

        prayerTableBody.innerHTML += this.createPrayerTableBody(timings);
      });
    });
  }

  static createPrayerTableHeader(timingTitles) {
    let timingTableHeader = "<tr>";

    timingTitles.forEach((timingHeader) => {
      timingTableHeader += `<th>${timingHeader}</th>`;
    });

    return `${timingTableHeader}</tr`;
  }

  static createPrayerTableBody(timings) {
    let timingTableBody = "<tr>";

    timings.forEach((timing) => {
      timingTableBody += `<td>${timing}</td>`;
    });

    return `${timingTableBody}</tr`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  flatpickr(".namaz-date-picker", {
    defaultDate: "today",
    dateFormat: "d-m-Y",
    onChange: function (selectedDates) {
      const selectedDate = selectedDates[0];
      const selectedDateTimestamp = Helper.getTimestamp(selectedDate.getTime());

      UI.displayPrayerTimeByDate(selectedDateTimestamp);
      UI.displayPrayerTimesByMonth(selectedDate);
    },
  });

  UI.displayPrayerTimeByDate(Helper.getTimestamp(new Date().getTime()));
  UI.displayPrayerTimesByMonth(new Date());
});
