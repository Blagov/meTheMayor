'use strict';

class Report{
    
    static initialize(){
        this.arround = [];
        this.last = [];
        this.userReports = {
            open: [],
            progress: [],
            closed: []
        }
        this.selected = null;
        this.UsrRepSelected = null;
    }
    
    static followReport(id, callback){
        var provider = app.data.mayorMobile;
        var data = provider.data('Followers');
        data.create({
            'Problem': id
        },
        function (data) {
          callback(null, data);
        },
        function (error) {
           callback(error, null);
        });
    }
    
    static unFollowReport(id, callback){
        var provider = app.data.mayorMobile;
        var data = provider.data('Followers');
        data.destroy ({
            'Problem': id,
            'Owner': User.getUser().Id
        },
        function () {
           callback(null);
        },
        function (error) {
            callback(error);
        });
    }
    
    static changeStatus(id, status, callback){
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        data.updateSingle({ Id: id, 'Status': status },
        function(data){
            callback(null, data);
        },
        function(error){
            callback(error, null);
        });
    }
    
    static getArroundData(callback){
        var self = this;
        var filter = new Everlive.Query();
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        var location = User.getUserLocation();
        filter.skip(Report.arround.length).take(5).orderDesc('CreatedAt').where().eq('Region', location.state);
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                    if(data.result.length > 0){
                        self.arround = self.arround.concat(data.result);
                        callback(null, data.result.length);
                    }else{
                        callback("No results", null);
                    }
                },
                function (error) {
                    callback(error, null);
                });
    }
    
    static getLastData(callback){
        var self = this;
        var filter = new Everlive.Query();
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        filter.skip(Report.last.length).take(5).orderDesc('CreatedAt');
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                    if(data.result.length > 0){
                        self.last = self.last.concat(data.result);
                        callback(null, data.result.length);
                    }else{
                        callback("No results", null);
                    }
                },
                function (error) {
                    callback(error, null);
                });
    }
    
    static getLoadedArReports(date, callback){
        var self = this;
        var filter = new Everlive.Query();
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        var location = User.getUserLocation();
        filter.skip(0).take(self.arround.length+1).orderDesc('CreatedAt').where().and().gte('CreatedAt', date).eq('Region', location.state);
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                self.arround = data.result;
                callback(null);
             },
             function (error) {
                callback(error);
             });
    }
    
    static getLoadedLtReports(date, callback){
        var self = this;
        var filter = new Everlive.Query();
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        filter.skip(0).take(self.last.length+1).orderDesc('CreatedAt').where().gte('CreatedAt', date);
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                self.last = data.result;
                callback(null);
             },
             function (error) {
                callback(error);
             });
    }
    
    static setSelected(id){
        this.selected = id;
    }
    
    static getSelectedArround(){
        return this.arround[this.selected];
    }
    
    static getSelectedLast(){
        return this.last[this.selected];
    }
    
    static getLastReports(){
        return this.last;
    }
    
    static getArroundReports(){
        return this.arround;
    }
    
    static getUserReports(callback){
        var user = User.getUser();
        var self = this;
        if(user != null){
            var id = user.Id;
            var provider = app.data.mayorMobile.data('Followers');
            var filter = new Everlive.Query();
            filter.orderDesc('ModifiedAt').where().eq('Owner', id);
            provider.withHeaders({
                    "X-Everlive-Expand": {
                        "Problem": {
                            "TargetTypeName": "Problems",
                            "Expand": {
                                "Category": {
                                    "Fields": {
                                        	"Id": 1,
                                            "Class": 1,
                                            "Name": 1
                                        },
                                    "TargetTypeName" : "Categories",
                                    "ReturnAs" : "Category"
                                    },
                                "Images.Problem": {
                                    "Fields": {
                                        	"Url": 1,
                                            "Problem": 0
                                        },
                                    "TargetTypeName" : "Images",
                                    "ReturnAs" : "Images"
                                    },
                                "Owner": {
                                    "TargetTypeName" : "Users",
                                    "ReturnAs" : "Owner"
                                    }
                            } 
                        }
                    }
                })
                .get(filter)
                .then(function (data) {
                	self.userReports = {
                        open: [],
                        progress: [],
                        closed: []
                    }
            		data.result.forEach(function(rep){
                        if(rep.Problem.Status == 0){
                            self.userReports.open.push(rep.Problem);
                        }else if(rep.Problem.Status == 1){
                            self.userReports.progress.push(rep.Problem);
                        }else if(rep.Problem.Status == 2){
                            self.userReports.closed.push(rep.Problem);
                        }
                    });
                    callback(null, self.userReports);
                },
                function (error) {
                    callback(error, null);
            });
        }else{
             callback("User not authenticated");
        }
    }
    
    static getUserLoadedReports(){
        return this.userReports;
    }
    
    static setUsrRepSelected(id){
        this.usrRepSelected = id;
    }
    
    static getUsrRepSelected(){
        return this.usrRepSelected;
    } 
    
    static getFollowedUpdatedProblems(callback){
        var user = User.getUser();
        if(user != null){
            var id = user.Id;
            var provider = app.data.mayorMobile.data('Followers');
            var filter = new Everlive.Query();
            filter.orderDesc('ModifiedAt').where().eq('Owner', id);
            provider.withHeaders({
                    "X-Everlive-Expand": {
                        "Problem": {
                            "TargetTypeName": "Problems",
                            "Expand": {
                                "Category": {
                                    "Fields": {
                                        	"Id": 1,
                                            "Class": 1,
                                            "Name": 1
                                        },
                                    "TargetTypeName" : "Categories",
                                    "ReturnAs" : "Category"
                                    },
                                "Images.Problem": {
                                    "Fields": {
                                        	"Url": 1,
                                            "Problem": 0
                                        },
                                    "TargetTypeName" : "Images",
                                    "ReturnAs" : "Images"
                                    },
                                "Owner": {
                                    "TargetTypeName" : "Users",
                                    "ReturnAs" : "Owner"
                                    }
                            } 
                        }
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
}