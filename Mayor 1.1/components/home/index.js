'use strict';

app.home = kendo.observable({
    onShow: function (event) {
        app.formView.removeStartReportView();
        $(".spinner").show();
        var scroller = $("#import-reports").data("kendoMobileScroller");
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                $(".spinner").show();
                scrollBool = true;
                if (e.index == 0 && fastSelect) {
                    fastSelect = false;
                    switchView = 0;
                    scroller.scrollTo(0, 0);
                    app.home.showAroundReports(event, scroller)
                } else if(e.index == 1 && fastSelect){
                    fastSelect = false;
                    switchView = 1;
                    scroller.scrollTo(0, 0);
                    app.home.showLastReports(event, scroller)
                }
            },
            index: 0
        });
        var buttongroup = $("#reports").data("kendoMobileButtonGroup");
        buttongroup.select(switchView);
        
        var user = User.getUser();
        if(user == null){
            User.authentication(function(err){
                app.home.showAroundReports(event, scroller);
                if(err == null){
                   User.getFollowedUpdatedProblems(function(err, report){
                        if(err == null){
                            UpdateReport.setUpReports(report);
                            $('#counter-update-reports .km-text').html(UpdateReport.getUpReports().length);
                        }else{
                            console.log(err);
                        }
                   });
                }else{
                   console.log(err);
                }
        	});
        }else{
            if (switchView == 0) {
                app.home.showAroundReports(event, scroller)
            } else if(switchView == 1){
                app.home.showLastReports(event, scroller)
            }
        }
    },
    showAroundReports: function(event, scroller){
        if(Report.arround.length == 0){
           Report.getArroundData(function(err, data){
                fastSelect = true;
                $(".spinner").hide();
                if(err){
                    console.log(err);
                }else{
                    app.home.initializeReportView(event, scroller);
                    
                }
           })   
        }else{
            app.home.updateView(event, scroller);
        }
    },
    showLastReports: function(event, scroller){
        if(Report.last.length == 0){
           Report.getLastData(function(err, data){
                fastSelect = true;
                $(".spinner").hide();
                if(err){
                    console.log(err);
                }else{
                    app.home.initializeReportView(event, scroller);
                }
           })   
        }else{
            app.home.updateView(event, scroller);
        }
    },
    initializeReportView: function(event, scroller){
        var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
        var html = app.home.reportView(0);
        var template = kendo.template(html);
        var result;
        if(switchView==0){
            result = template(Report.getArroundReports());
        }else if(switchView==1){
            result = template(Report.getLastReports());
        }
        $("#import-reports").height(h);
        scroller.scrollElement.html(result);
        $(".item").height(h / 1.955555);
        scroller.bind("scroll", function(e) {
            var eqh = $("#import-reports").data("kendoMobileScroller").scrollHeight()
            if(e.scrollTop + e.sender.scrollElement.context.clientHeight == eqh && scrollBool) {
                scrollBool = false;
                app.home.appendItems(event, scroller);
            }
        });
       fastSelect = true;
    },
    updateView: function(event, scroller){
        var date;
        if(switchView==0){
            date = Report.arround[Report.arround.length - 1].CreatedAt;
            Report.getLoadedArReports(date, function(err){
               $(".spinner").hide();
               if(err){
                   console.log(err);
                   if(err.code == 618){
                       Report.arround = [];
                    }
               }else{
                   app.home.initializeReportView(event, scroller);
               } 
            });
        }else if(switchView==1){
            date = Report.last[Report.last.length - 1].CreatedAt;
            Report.getLoadedLtReports(date, function(err){
               $(".spinner").hide();
               if(err){
                   if(err.code == 618){
                       Report.arround = [];
                    }
                   console.log(err);
               }else{
                   app.home.initializeReportView(event, scroller);
               } 
            });
        }
    },
    appendItems: function(event, scroller){
        if(switchView == 0 && Report.arround.length >= 5){
			$(".spinner").show();
            Report.getArroundData(function(err, data){
                $(".spinner").hide();
                if(err){
                    console.log(err);
                }else{
                    scrollBool = true;
                    app.home.initializeReportView(event, scroller);
                }
           });  
        }else if(switchView == 1 && Report.last.length >= 5){
             $(".spinner").show();
             Report.getLastData(function(err, data){
                $(".spinner").hide();
                if(err){
                    console.log(err);
                }else{
                    scrollBool = true;
                    app.home.initializeReportView(event, scroller);
                }
           }); 
        }
    },
    reportView: function(items){
        var s = '';
        var height = screen.width;
        var img = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/';
        if(switchView==0){
            s = '#=data[i].Address#';
        }else{
            s = '#=data[i].Address#, #=data[i].Region#';
        }
        var html =
        '# for (var i=' + Number(items) + '; i < data.length; i++) { #'
            + '<div id=#=i# onclick="app.home.onSelect(this.id)"  class="listview-item item" >' 
            +	  '<img class="item-img" src='+img+'#=data[i].Images[0].Url#>' 
            +     '<div class="profile-image">' 
            +         '# if (data[i].Owner.IdentityProvider == "Facebook") {  # <img style="border-radius: 50%;" src="https://graph.facebook.com/#=data[i].Owner.Picture#/picture?type=large" width="50"> # }else{  # <img src="images/temp/user_profile_img.png" width="50"> #}#' 
            +     '</div>' 
                + '<div class="box-top-right">'
                + 	'<div class="report-date">' 
                + 		'<span class="km-icon km-icon-clock"></span>' 
                + 		'#=dateFormat(data[i].CreatedAt)#' 
                + 	'</div>' 
                + 	'<div class="report-followers">' 
                + 		'<span class="km-icon km-icon-follower"></span>' 
                + 		'#= getFollowers(data[i]) #' 
                + 	'</div>'
                + '</div>' 
                + '<div class="ad-category-info">' 
                + 	'<div class="address">'
                + 		'<span class="km-icon km-icon-pinmap"></span>' 
                + 		s
                + 	'</div>' 
                + 	'<div class="category">'
                + 		'<a class="km-widget km-button">' 
                + 			'<span class="km-text km-icon km-icon-#=data[i].Category.Class #"><!--&num;#=data[i].Category.Name #--></span>' 
                + 		'</a>'
                + 	'</div>'
                + '</div>'
            + '</div>'
        + '# } #'
        // var html =
        // '# for (var i=' + Number(items) + '; i < data.length; i++) { #' 
        //     + '<div id=#=i# onclick="app.home.onSelect(this.id)"  class="item" style="overflow:hidden;position: relative;">' 
        //     +	  '<img width="100%" style="position: absolute;" src='+img+'#=data[i].Images[0].Url#>' 
        //     +     '<div class="profile-image">' 
        //     +         '# if (data[i].Owner.IdentityProvider == "Facebook") {  # <img style="border-radius: 50%;" src="https://graph.facebook.com/#=data[i].Owner.Picture#/picture?type=large" width="50"> # }else{  # <img src="images/temp/user_profile_img.png" width="50"> #}#' 
        //     +     '</div>' 
        //     +     '<div class="report-date">' 
        //     +         '<img src="images/temp/clock-icon-300x300.png" width="14">' 
        //     +         '<p style="margin-left: 0.2rem;">' 
        //     +             '#=dateFormat(data[i].CreatedAt)#' 
        //     +         '</p>' 
        //     +     '</div>' 
        //     +     '<div class="report-followers">' 
        //     +         '<img src="images/temp/gnome_stock_person.png" width="15">' 
        //     +         '<p style="margin-left: 0rem;margin-right: 0.2rem;">' 
        //     +             '#= getFollowers(data[i]) #' 
        //     +         '</p>' 
        //     +     '</div>' 
        //     +     '<div class="ad-category-info">' 
        //     +         '<img src="images/temp/map-marker-256-white.png" width="15" class="marker-report">' 
        //     +         '<p style="margin-left: 0rem;margin-right: 0.2rem;font-size:10px;">' 
        //     + s
        //     +         '</p>' 
        //     +         '<a style="display:inline-block;border-radius:30px;float:right;top:10px;font-size:12px;" class="km-widget km-button km-state-active">' 
        //     +             '<span class="km-text">&num;#=data[i].Category.Name #</span>' 
        //     +         '</a>' 
        //     +     '</div>' 
        //     + '</div>' 
        // + '# } #'
        return html;
    },
    onSelect: function(id){
        $(".spinner").show();
        Report.setSelected(id);
        app.mobileApp.navigate('components/selectedReport/view.html');
    }
});


