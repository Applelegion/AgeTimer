function leap_year(year, month) {
    //checks if current_year or next_year is a leap_year
    if (month < 2) {
        if (year % 400 === 0 || ((year % 4 === 0) && (year % 100 !== 0))) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        const next_year = year + 1;
        if (next_year % 400 === 0 || ((next_year % 4 === 0) && (next_year % 100 !== 0))) {
            return true;
        }
        else {
            return false;
        }
    }
}

function find_units(time) {
    //converts milliseconds into days/hours/minutes/...
    const unit_list = ["day", "hour", "minute", "second", "millisecond"];
    const table = {
        "day": 86400000,
        "hour": 3600000,
        "minute": 60000,
        "second": 1000,
        "millisecond": 1
    };
    const unit_counter = {};
    for (let unit in unit_list) {
        const unit_value = table[unit_list[unit]];
        unit_counter[unit_list[unit]] = (time - (time % unit_value)) / unit_value;
        time = time % unit_value;
    }
    return unit_counter;
}

function find_birthday(age) {
    current_time = new Date();
    if (leap_year(currrent_time.getFullYear(), current_time.getMonth() + 1)) {
        return new Date(new Date(Date.now() - age % 1 * 31622400000).setFullYear(current_time.getFullYear() - Math.floor(age)));
    }
    return new Date(new Date(Date.now() - age % 1 * 31536000000).setFullYear(current_time.getFullYear() - Math.floor(age)));

}
function make_options(select_element, list) {
    //appends a list of options to a select element
    for (let element of list) {
        const number = element;
        const option = document.createElement("option");
        option.textContent = number;
        select_element.appendChild(option);
    }
}

function display_birthday() {
    chrome.storage.local.get("birthday", function (result) {
        var birthday_interval;
        const birthday_result = result.birthday;
        display_birthday_number(birthday_result);

        function display_birthday_number(birthday) {
            const current_time = new Date();
            const last_bday = new Date(birthday.month.toString() +
                "-" + birthday.day.toString() + "-" + current_time.getFullYear().toString() +
                " " + birthday.hour.toString() + ":" + birthday.minute.toString() + ":00");
            if (current_time - last_bday < 0) {
                last_bday.setFullYear(last_bday.getFullYear() - 1);
            }
            const years_of_age = last_bday.getFullYear() - birthday.year;
            const partial_year = current_time.getTime() - last_bday.getTime();

            function change_age(year_length) {
                //constantly updates the age
                let changing_age = years_of_age + partial_year / year_length;
                changing_number.textContent = changing_age.toFixed(10);
                birthday_interval = setInterval(function () {
                    changing_age += 100 / year_length;
                    changing_number.textContent = changing_age.toFixed(10);
                }, 100);

            }
            if (leap_year(last_bday.getFullYear(), last_bday.getMonth())) {
                change_age(31622400000);
            } else {
                change_age(31536000000);
            }
        }
        document.addEventListener("visibilitychange", function () {
            //refreshes the timer whenever the user looks away
            if (!document.hidden) {
                display_birthday_number(birthday_result);
            }
            else if (document.hidden) {
                clearInterval(birthday_interval);
            }
        });
    });
}

function first_time_check() {
    chrome.storage.local.get(["first_use"], function (result) {
        if (result.first_use === false) {
            display_birthday();
        }
        else {
            const current_time = new Date();
            const day_month_map = {
                "January": 31,
                "February": 28,
                "March": 31,
                "April": 30,
                "May": 31,
                "June": 30,
                "July": 31,
                "August": 31,
                "September": 30,
                "October": 31,
                "November": 30,
                "December": 31
            };
            const day_month_map_leap = {
                "January": 31,
                "February": 29,
                "March": 31,
                "April": 30,
                "May": 31,
                "June": 30,
                "July": 31,
                "August": 31,
                "September": 30,
                "October": 31,
                "November": 30,
                "December": 31
            };
            const select_div = document.createElement("div");
            select_div.className = "center";
            const year_select = document.createElement("select");
            const year_list = [];
            for (let i = current_time.getFullYear(); i >= current_time.getFullYear() - 120; i--) {
                year_list.push(i);
            }
            const month_select = document.createElement("select");
            const month_list = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const day_select = document.createElement("select");
            let day_list = [];
            for (let i = 1; i <= 30; i++) {
                day_list.push(i);
            }
            const hour_select = document.createElement("select");
            const hour_list = [];
            for (let i = 0; i < 24; i++) {
                hour_list.push(i);
            }
            const minute_select = document.createElement("select");
            const minute_list = [];
            for (let i = 0; i < 60; i++) {
                minute_list.push(i);
            }
            const button = document.createElement("button");
            button.id = "gobutton";
            button.addEventListener("click", function () {
                chrome.storage.local.set({
                    "birthday": {
                        "month": month_select.value,
                        "day": day_select.value,
                        "year": year_select.value,
                        "hour": hour_select.value,
                        "minute": minute_select.value
                    },
                    "first_use": false
                });
                document.body.removeChild(select_div);
                display_birthday();
            });
            make_options(year_select, year_list);
            make_options(month_select, month_list);
            make_options(day_select, day_list);
            make_options(hour_select, hour_list);
            make_options(minute_select, minute_list);
            select_div.append(year_select, month_select, day_select, hour_select, minute_select, button);
            document.body.appendChild(select_div);

            month_select.addEventListener("change", function () {
                //changes the number of days in the day menu depending on the month selected
                let month = month_select.value;
                day_list = [];
                while (day_select.firstChild) {
                    day_select.removeChild(day_select.firstChild);
                }
                if (leap_year(current_time.getFullYear(), 0)) {
                    for (let i = 1; i <= day_month_map_leap[month]; i++) {
                        day_list.push(i);
                    }
                }
                else {
                    for (let i = 1; i <= day_month_map[month]; i++) {
                        day_list.push(i);
                    }
                }
                make_options(day_select, day_list);
            });
        }
    });
}
const changing_number = document.createElement("p");
changing_number.id = "changing";
document.body.appendChild(changing_number);
window.addEventListener("load", function () {
    first_time_check();
});


