(function ($) {
    $.fn.serializeToJSON = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);

function getFollowers(f) {
    var r;
    f.Followers != null ? r = f.Followers.length : r = 0;
    return r;

}

function dateFormat(date) {

    var mshours = 60 * 60 * 1000,
        msDay = 60 * 60 * 24 * 1000,
        msMinutes = 60 * 1000,
        then = new Date(date),
        now = new Date(),
        string = '';

    var days = Math.floor((now - then) / msDay),
        hours = Math.floor(((now - then) % msDay) / mshours),
        minutes = Math.floor(((now - then) % msDay) / msMinutes);
    if (days > 0 && hours == 0) {
        days == 1 ? string += days + " ден" : string += days + " дни";
    } else if (days > 0 && hours > 0) {
        days == 1 ? string += days + " ден, " : string += days + " дни, "; 
    }
    if (hours > 0) {
        hours == 1 ? string += hours + " час" : string += hours + " часа";
    }
    if (minutes > 0 && minutes < 60 && days == 0) {
        minutes == 1 ? string = minutes + " минута" : string = minutes + " минути";
    }
    if (days == 0 && hours == 0 && minutes == 0) {
        var seconds = Math.floor((now - then) / 1000);
        seconds == 1 ? string = seconds + " секунда" : string = seconds + " секунди";
    }

    return string;
}

function getUrlParams(url) {
    var params = {};
    url = url.slice(url.indexOf("?") + 1, url.length);
    var prmarr = url.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

// function removeStartReportView() {
//     $('#report-view').css('background', 'rgb(255, 255, 255)');
//     $('header .km-tabstrip').css('background-image', 'linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 100%);');
//     $('.km-nova .km-tabstrip .km-button').css('color', '#202C31');
//     $('*[data-role="content"]').css('background-color', 'rgb(255, 255, 255)');
// }