'use strict';

app.selectUpdatedReport = kendo.observable({
    onShow: function() {
        app.formView.removeStartReportView();
        var reports = Report.getUserLoadedReports();
        var selected = Report.getUsrRepSelected();
        var report;
        if(switchviewProfile == 0){
            report = reports.open[selected];
        }else if(switchviewProfile == 1){
            report = reports.progress[selected];
        }else if(switchviewProfile == 2){
            report = reports.closed[selected];
        }
        var height = screen.width;
        var items = {
            data: report.Images,
            pageSize: 0
        };
        $('#updateReportView').height(height-80);
        items.data[0].Url = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/'+items.data[0].Url;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#updateReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        var html = "<div class=\"info-row\"><label>Докладвано преди</label> #=dateFormat(data.CreatedAt)#</div><div class=\"info-row\"><label>Докладвано от</label>#=data.Owner.DisplayName#</div><div class=\"info-row\"><label>Отговорен орган</label>#=data.Region#</div><div class=\"info-row\"><label>Адрес</label>#=data.Address#</div><div class=\"info-row comment-info\"><label>Коментар</label><div class=\"comment-txt\">#=data.Comment#</div></div>";
        var template = kendo.template(html);
        var result = template(report);
        var scroller = $("#updateRportInfo").data("kendoMobileScroller");
        scroller.scrollElement.html(result);
        $('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.unFollow(\''+ report.Id + '\');">Не искам да следя този проблем</a>');
        // change status for admins
        if(User.getUser().IsAdmin){
            var chanteStatusHTML = '<div class="styled-select"><select onchange="app.selectUpdatedReport.changeStatus(\''+ report.Id + '\')">';
            problemStatus.forEach(function(el, i){
                if(i == report.Status){
                     chanteStatusHTML += '<option value="'+ i +'" selected>'+ el +'</option>';
                }else{
                     chanteStatusHTML += '<option value="'+ i +'">'+ el +'</option>';
                }
            });
            chanteStatusHTML += '</select></div>';
            $('#ts-changeStatusUpdateReport').html(chanteStatusHTML);
        }
    },
    follow: function(id){
        console.log(id);
        $(".spinner").show();
		Report.followReport(id, function(err){
            if(err){
                console.log(err);
            }else{
                $('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.unFollow(\''+ id + '\');">Не искам да следя този проблем</a>');
            	$(".spinner").hide();
            }
        });
    },
    unFollow: function(id){
        $(".spinner").show();
		Report.unFollowReport(id, function(err){
            if(err){
                console.log(err);
            }else{
                $('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.follow(\''+ id + '\');">Това е проблем и за мен</a>');
            	$(".spinner").hide();
            }
        });
    },
    changeStatus: function(id){
        $(".spinner").show();
        var status = $('#ts-changeStatusUpdateReport option:selected').val();
        Report.changeStatus(id, status, function(err, data){
            if(err){
                console.log(err);
            }else{
            	$(".spinner").hide();
            }
        });
    }
});