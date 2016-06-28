'use strict';

class User{

    constructor() {
		this.user = null;
        this.location = null;
    }
    
    static signIn(data, callback){
        var self = this;
        var provider = app.data.mayorMobile;
        var user = {
            username: data.username,
            password: data.password
        }
        provider.authentication.login(user.username, user.password, function(data) {
            self.authentication(function(err){
                callback(err, null);
            })
        }, function(err) {
            callback(err, null);
        });
    }
    
    static fbAuth(callback){
        var self = this;
        var facebookConfig = {
                    name: 'Facebook',
                    loginMethodName: 'loginWithFacebook',
                    endpoint: 'https://www.facebook.com/dialog/oauth',
                    response_type: 'token',
                    client_id: appSettings.facebook.appId,
                    redirect_uri: appSettings.facebook.redirectUri,
                    access_type: 'online',
                    scope: 'email',
                    display: 'touch'
                };

        var facebook = new IdentityProvider(facebookConfig);
        facebook.getAccessToken(function (accessToken) {
            Everlive.$.Users.loginWithFacebook(accessToken,
                function (success) {
                    self.authentication(function(err){
                        if(err == null){
                            var provider = app.data.mayorMobile;
                            provider.Users.updateSingle({ Id: User.getUser().Id, 'Picture': User.getUser().Identity.Facebook.id },
                                function(data){
                                	callback(null, true);
                                },
                                function(error){
                                    alert(JSON.stringify(error));
                                });
                        }else{
                           alert(JSON.stringify(err));
                        }
                    });
                },
                function (error) {
                    alert(JSON.stringify(error));
                }
            );

        });
    }
    
    static register(user, callback){
        var self = this;
        var provider = app.data.mayorMobile;
        var user = {
            username: user.username,
            password: user.password
        }
        var attrs = {
            Email: user.username,
            DisplayName: user.displayName
        };
        provider.Users.register(user.username,
            user.password,
            attrs,
            function(data) {
            	self.signIn(user, function(err, data){
                    if(err){
                        callback(err, null);
                    }else{
                        callback(null, data);
                    }
                })
            },
            function(error) {
                callback(error, null);
            });
    }
    
    static authentication(callback){
        var self = this;
        var provider = app.data.mayorMobile;
        provider.Users.currentUser(function (data) {
            if (data.result) {
                self.user = data.result;
                var pushSettings = {
                    iOS: { 
                        badge: true,
                        sound: true,
                        alert: true,
                        clearBadge: true 
                    },
                    android: {
                        senderID: appSettings.androidProjectNumber
                    },
                    notificationCallbackAndroid : function(args) {
                        if(args.payload.created){
                            UpdateReport.setNewReportId(args.payload.problem);
                            setTimeout(function(){ 
                                app.mobileApp.navigate('components/home/view.html');
                                app.mobileApp.navigate('components/newReport/view.html'); 
                            }, 2000);
                        }
                    },
                    notificationCallbackIOS : function(args) {
                        if(args.payload.created){
                            UpdateReport.setNewReportId(args.payload.problem);
                            setTimeout(function(){ 
                                app.mobileApp.navigate('components/home/view.html');
                                app.mobileApp.navigate('components/newReport/view.html'); 
                            }, 2000);
                        }
                    },
                    customParameters: {}
                };
                provider.push.register(pushSettings)
                .then(
                    function () {
                        //alert('suc');
                    },
                    function (err) {
                       // alert('REGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
                
                
            } else {
                var err = "Not authenticated";
                console.log(err);
            }
            if(self.location == null){
                self.setUserLocation(function(){
                	callback(null);
                });
            }else{
                callback(null);
            }
        }, function (err) {
			callback(err);
        });
    }
    
    static logout(callback){
        var self = this;
        var provider = app.data.mayorMobile;
        provider.Users.logout()
        .then(function() {
            self.user = null;
            callback(null);
        },
        function () {
            callback('Failed logout');
        });  
    }
    
    static setUserLocation(callback){
        var self = this;
        if(this.location == null){
            var geolocation = new Geolocation();
            geolocation.getCityInfo(function(error, location){
                if(error){
                   self.location = {
                       city: "Бургас",
                       address: "ул. „Одрин“",
                       country: "България",
                       state: "Бургас",
                       coords: {
                           accuracy:"150.00",
                           altitude:"100",
                           altitudeAccuracy:"80.00",
                           heading:"1.00",
                           latitude:42.5048,
                           longitude:27.4626,
                           speed:"0.00"
                       }
                   }
                }else{
                   self.location = location;
                }
                callback();
            });
        }
    }
    
    static getFollowedProblems(callback){
        var user = this.getUser();
        if(user != null){
            var id = user.Id;
            var provider = app.data.mayorMobile.data('Followers');
            var filter = new Everlive.Query();
            filter.select('Problem','ModifiedAt').where().eq('Owner', id);
            provider.withHeaders({
                     "X-Everlive-Expand": {
                        "Problem": {
                            "TargetTypeName": "Problems",
                        },
                    }
                })
                .get(filter)
                .then(function (data) {
                    callback(null, data.result);
                },
                function (error) {
                    callback(error, null);
            });
        }else{
             callback("User not authenticated");
        }
    }
   
    
    static isFollowedProblem(problemId, callback){
        var user = this.getUser();
        if(user != null){
            var id = user.Id;
            var provider = app.data.mayorMobile.data('Followers');
            var filter = new Everlive.Query();
            filter.where().and().eq('Owner', id).eq('Problem',problemId);
            provider.get(filter)
                .then(function (data) {
                    callback(null, data.result.length, user);
                },
                function (error) {
                    callback(error, null, null);
            });
        }else{
             callback("User not authenticated");
        }
    }
    
    static getUser(){
        return this.user;
    }
    
    static getUserLocation(){
        return this.location;
    }
    
    static userUpdate(data, callback){
        var self = this;
        var provider = app.data.mayorMobile
        provider.Users.update(data, // data
            { Id: self.id }, // filter
            function(data){
                self.authentication(function(err){
                    if(err){
                        callback(err);
                    }else{
                        callback(null);
                    }
            	})
            },
            function(error){
                callback(error);
            });
    }
}