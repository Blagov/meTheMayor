'use strict';

class Geolocation {

    constructor() {
 
    }

    getLocation(cb) {

        var options = { maximumAge: 0, timeout: 500000, enableHighAccuracy: true };
        navigator.geolocation.getCurrentPosition(
            function (position) {
                cb(position, null);
            },
            function (error) {
                cb(null, error);
            },
            options);
    }

    getCityInfo(cb) {
        var that = this;
        that.getLocation(function (position, err) {
            if (err != null) {
                alert("Включи GPS!");
            } else {
                var location = {};
                var geocoder = new google.maps.Geocoder();
                var c = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geocoder.geocode({
                    'location': c
                }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            for (var ac = 0; ac < results[0].address_components.length; ac++) {
                                var component = results[0].address_components[ac];

                                switch (component.types[0]) {
                                    case 'locality':
                                        location.city = component.long_name;
                                        break;
                                    case 'administrative_area_level_1':
                                        location.state = component.short_name;
                                        break;
                                    case 'country':
                                        location.country = component.long_name;
                                        break;
                                }
                            };
                            var index = results[0].formatted_address.indexOf(',', results[0].formatted_address.indexOf(','));
                            var substring = results[0].formatted_address.slice(0, index);
                            location.address = substring;
                            location.coords = position.coords;

                            cb(location);
                        } else {
                            alert('No results found');
                        }
                    } else {
                        alert('Geocoder failed due to: ' + status);
                    }
                });
            }
        })
    }
}