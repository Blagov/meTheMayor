'use strict';

var el = app.data.mayorMobile;
app.formView = kendo.observable({
    city: null,
    height: null,
    items: {
        data: [],
        pageSize: 0
    },
    views: {
        default: "start-report-view",
        views: ["start-report-view", "prev-next", "steps-view", "photos-view", "location-view", "comment-view", "user-info-view"],
        active: null
    },
    sendData: {
        userId: null,
        state: null,
        address: null,
        location: {
            longitude: null,
            latitude: null
        },
        pcategory: null,
        comment: null,
        files: []
    },
    onShow: function (e) {
        app.formView.removeStartReportView();
        app.formView.city = null;
        app.formView.startReportView();
        app.formView.height = e.view.content[0].clientHeight;
        app.formView.views.active = null;
        app.formView.initializeViews(); 
        app.formView.cityInfo("cityInfo");
    },
    checkLogin: function(e){
        var user = User.getUser();
        if(user == null){
             e.preventDefault();
             app.mobileApp.navigate('components/authenticationView/view.html');
        }
    },
    prev: function () {
        if (!(app.formView.views.active === 3)) {
            app.formView.views.active--;
            app.formView.initializeViews();
        }
    },
    next: function () {
        if (!(app.formView.views.active === app.formView.views.views.length - 1)) {
            app.formView.views.active++;
            app.formView.initializeViews()
        }
    },
    send: function () {
        $(".spinner").show();
        app.formView.city = null;
        app.formView.sendData.pcategory = $(".activeCategory").data('id');
        app.formView.sendData.comment = $(".comment").val();
        $(".comment").val('');
        var data = app.data.mayorMobile.data('Problems');
        var loc  = app.formView.sendData.state;
        data.create({
                Comment: app.formView.sendData.comment,
                Region: app.formView.sendData.state,
                Category: app.formView.sendData.pcategory,
                Latitude: app.formView.sendData.location.latitude,
                Longitude: app.formView.sendData.location.longitude,
                Status: 0,
                Owner: app.formView.sendData.userId,
                Address: app.formView.sendData.address
            },
            function (data) {
                var images = app.data.mayorMobile.data('Images');
                app.formView.sendData.files.forEach(function (img, i) {
                    var file = {
                        "Filename": "image.jpg",
                        "ContentType": "image/jpeg",
                        "base64": img
                    }
                    app.data.mayorMobile.files.create(file,
                        function (f) {
                            images.create({
                                    Problem: data.result.Id,
                                    Url: f.result.Uri
                                },
                                function (img) {
                                    if (i == app.formView.sendData.files.length - 1) {
                                        app.formView.items = {
                                            data: [],
                                            pageSize: 0
                                        };
                                        app.formView.sendData = {
                                            userId: null,
                                            state: null,
                                            location: {
                                                longitude: null,
                                                latitude: null
                                            },
                                            pcategory: null,
                                            comment: null,
                                            files: [],
                                            address: null
                                        }
                                        app.mobileApp.navigate('components/home/view.html');
                                    }
                                },
                                function (error) {
                                    console.log(error);
                                });

                        },
                        function (error) {
                            console.log(error);
                        });
                })
            },
            function (error) {
                console.log(error);
            });
    },
    takePhoto: function() {
        navigator.camera.getPicture(function(imageData){
            app.formView.views.active = 3;
            app.formView.initializeViews();
            $(".spinner").show();
            app.formView.rotateImage(imageData, function (i) {
                app.formView.items.data.push({
                    img: i
                });
                app.formView.items.pageSize = app.formView.items.data.length;
                var ds = new kendo.data.DataSource(app.formView.items);
                var scrollView = $("#scrollview").data("kendoMobileScrollView");
                scrollView.setDataSource(ds);
                app.formView.sendData.files.push(i);
                setTimeout(function () {
                    scrollView.refresh();
                    $(".spinner").hide();
                }, 500);
            });
        }, function(message){
            	console.log('Failed because: ' + message);
        }, {
            quality: 23,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation: true
        });
    },
    initializeViews: function(){
        var view;
        app.formView.views.active ? view = app.formView.views.active : view = 0;
        switch (app.formView.views.active) {
            case 3:
                app.formView.removeStartReportView();
                break;
            case 4:
                $(".spinner").show();
                app.formView.loadMap();
                break;
            case 5:
                $(".spinner").show();
                app.formView.getCategories();
                break;
            case 6:
                if ($(".activeCategory").data('id') == null) {
                    app.formView.views.active = app.formView.views.active - 1;
                    view = app.formView.views.active;
                    alert("Изберете категория!");
                } else {
                    $(".spinner").show();
                    app.formView.cityInfo("city");
                    app.formView.userInfo();
                }
                break;
        }
        app.formView.views.views.forEach(function (e, i) {
            if (view === i) {
                $('.' + app.formView.views.views[i]).show();
                if (app.formView.views.active) {
                    $('.' + app.formView.views.views[1]).show();
                    $('.' + app.formView.views.views[2]).show();
                }
            } else {
                $('.' + app.formView.views.views[i]).hide();
            }
        })
        if (app.formView.views.active >= 3 && app.formView.views.active < 6) {
            $(".navigation").show();
            $(".send").hide();
            app.formView.steps();
        } else if (app.formView.views.active == 6) {
            $(".navigation").hide();
            $(".send").show();
            app.formView.steps();
        }
    },
    loadMap: function(){
        var center, map, mapProp, mark;
        var location = new Geolocation();

        location.getCityInfo(function (locData) {
            var infowindow = new google.maps.InfoWindow({
                content: locData.address
            });
            center = new google.maps.LatLng(locData.coords.latitude, locData.coords.longitude);
            mapProp = {
                center: center,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("locationMap"), mapProp);
            mark = new google.maps.Marker({
                position: center,
            });
            mark.setMap(map);
            google.maps.event.addListener(mark, 'click', function () {
                infowindow.open(map, mark);
            });
            $("#locationMap").height(app.formView.height - $('.steps-view').height());
            app.formView.sendData.location.latitude = locData.coords.latitude;
            app.formView.sendData.location.longitude = locData.coords.longitude;
            app.formView.sendData.address = locData.address;
            $(".spinner").hide();
        })

    },
    cityInfo: function(v) {
        if(app.formView.city == null){
            var location = new Geolocation();
            location.getCityInfo(function (locationData) {
                var template = kendo.template("<h3>#= state #</h3>");
                var result = template(locationData);
                $("#" + v).html(result);
                app.formView.sendData.state = locationData.state;
                $(".spinner").hide();
                app.formView.city = locationData;
            });
        }else{
            var template = kendo.template("<h3>#= state #</h3>");
            var result = template(app.formView.city);
            $("#" + v).html(result);
            app.formView.sendData.state = app.formView.city.state;
            $(".spinner").hide();
        }
    },
    getCategories: function() {
        var data = el.data('Categories');
        var filter = new Everlive.Query();
        filter.orderDesc('CreatedAt');
        data.get(filter)
            .then(function (data) {
            		var template = kendo.template('# for (var i = 0; i < data.length; i++) { #<div data-id="#=data[i].Id#" onclick="app.formView.selectCategory(this);" class="col-3  #=app.formView.categoryClass(i)#"><span class="km-icon km-icon-#=data[i].Class #"></span><h5>#=data[i].Name #</h5></div># } #');
                    var result = template(data.result);
                    $("#categories").html(result);
                    $(".spinner").hide();
                },
                function (error) {
                    console.log("err", error);
                });
    },
    userInfo: function() {
        var user = User.getUser();
        var template = kendo.template("<div><label>Име</label>#= DisplayName #</div><div><label>Телефон</label></div><div><label>Ел. поща</label>#= Email #</div><div><label>Коментар</label>"+$(".comment").val()+"</div>");
        var result = template(user);
        $("#userInfo").html(result);
        app.formView.sendData.userId = user.Id;
    },
    steps: function() {
        var steps = $('.steps-view').children();
        steps.each(function (i) {
            if (i <= app.formView.views.active - 3) {
                $(this).addClass("active-step");
            } else {
                $(this).removeClass("active-step");
            }
        })
    },
    rotateImage: function(i, cb) {
        var image = new Image();
        image.src = "data:image/jpeg;base64," + i;
        setTimeout(function () {
            if (image.height > image.width) {
                //alert('in');
                var canvas = document.createElement("canvas");
                canvas.width = image.height;
                canvas.height = image.width;
                var cw = canvas.width * 0.5;
                var ch = canvas.height * 0.5;
                var ctx = canvas.getContext("2d");
                ctx.translate(cw, ch);
                ctx.rotate(90 * Math.PI / 180);
                ctx.translate(-image.width * 0.5, -image.height * 0.5);
                ctx.drawImage(image, 0, 0);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                var jpegUrl = canvas.toDataURL("image/jpeg");
                jpegUrl = jpegUrl.slice(23, jpegUrl.length);
                cb(jpegUrl);
            } else {
                cb(i);
            }
        }, 500);
    },
    startReportView: function() {
        $('.km-nova .km-content').css({'background':'rgba(0, 0, 0, 0.7)'});
        $('.km-nova header .km-tabstrip').css({'background':'rgba(0, 0, 0, 0.7)'});
        $('.km-nova header .km-tabstrip .km-button').css({'background':'transparent'});
    },
    removeStartReportView: function() {
        $('.km-nova .km-content').css({'background':'rgba(243, 243, 243, 1)'});
        $('.km-nova header .km-tabstrip').css({'background':'rgba(255, 255, 255, 1)'});
        $('.km-nova header .km-tabstrip .km-button').css({'background':'rgba(255, 255, 255, 1)'});
    },
    categoryClass: function(i) {
        if ((i + 1) % 4 != 0 && i < 3) {
            return "upCategory";
        }
        if ((i + 1) % 4 != 0 && i > 3 && i < 7) {
            return "downCategory";
        }
        if (i == 3) {
            return "lastCategory";
        }
    },
    selectCategory: function(e) {
        var cat = $('#categories div');
        $.each(cat, function (i) {
            if (i == $(e).index()) {
                $(this).addClass('activeCategory');
            } else {
                $(this).removeClass('activeCategory');
            }
        })
    }
});
