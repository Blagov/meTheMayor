'use strict';
app.updatedReports = kendo.observable({
    onShow: function(event) {
        app.formView.removeStartReportView();
        var reps = UpdateReport.getUpReports() || {};
        var h = event.view.content[0].clientHeight;
        $("#updated-reports").height(h);
        var html = app.updatedReports.view();
        var template = kendo.template(html);
        var result = template(reps);
        var scroller = $("#updated-reports").data("kendoMobileScroller");
        scroller.scrollElement.html(result);
        $(".item").height(h / 2.120);

    },
    view: function(){
        var height = screen.width;
        var img = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/';
        var html =
        '# for (var i=0; i < data.length; i++) { #'
            + '<div id=#=i# onclick="app.updatedReports.select(this.id)" class="listview-item item" >' 
            +	  '<img class="item-img" src='+img+'#=data[i].Problem.Images[0].Url#>' 
            +     '<div class="profile-image">' 
            +         '# if (data[i].Problem.Owner.IdentityProvider == "Facebook") {  # <img style="border-radius: 50%;" src="https://graph.facebook.com/#=data[i].Problem.Owner.Picture#/picture?type=large" width="50"> # }else{  # <img src="images/temp/user_profile_img.png" width="50"> #}#' 
            +     '</div>' 
                + '<div class="box-top-right">'
                + 	'<div class="report-date">' 
                + 		'<span class="km-icon km-icon-clock"></span>' 
                + 		'#=dateFormat(data[i].Problem.CreatedAt)#' 
                + 	'</div>' 
                + '</div>' 
                + '<div class="ad-category-info">' 
                + 	'<div class="address">'
                + 		'<span class="km-icon km-icon-pinmap"></span>' 
                + 		'#=data[i].Problem.Address#, #=data[i].Problem.Region#'
                + 	'</div>' 
                + 	'<div class="category">'
                + 		'<a class="km-widget km-button">' 
                + 			'<span class="km-text km-icon km-icon-#=data[i].Problem.Category.Class #"><!--&num;#=data[i].Problem.Category.Name #--></span>' 
                + 		'</a>'
                + 	'</div>'
                + '</div>'
            + '</div>'
        + '# } #'
        return html;
    },
    select: function(id){
        UpdateReport.setUpReport(id);
        app.mobileApp.navigate('components/selectUpdatedReport/view.html');
    }
});