require("cloud/app.js");
var moment = require("moment");

// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});

AV.Cloud.define("checkIn", function(request, response) {
    // request.params.lat
    // request.params.lng
    // request.params.ssid
    // request.params.mac
    // request.params.email
    // request.user: 见https://cn.avoscloud.com/docs/cloud_code_guide.html#%E8%B0%83%E7%94%A8%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0
    var LAT = 31.204754;
    var LNG = 121.441255;
    if (null != request.user) {
        var currentTime = moment();
        var startAM = currentTime.clone().hours(8).minutes(59).seconds(59);
        var endAM = currentTime.clone().hours(11).minutes(0).seconds(0);
        var startPM = currentTime.clone().hours(12).minutes(59).seconds(59);
        var endPM = currentTime.clone().hours(15).minutes(0).seconds(0);
        if (currentTime.isAfter(startAM) && currentTime.isBefore(endAM)
            || currentTime.isAfter(startPM) && currentTime.isBefore(endPM)) {
            var CheckIn = AV.Object.extend("CheckIn");
            var query = new AV.Query(CheckIn);
            query.equalTo("email", request.params.email);
            var startTime, endTime;
            if (currentTime.isAfter(startAM) && currentTime.isBefore(endAM)) {
                startTime = startAM.toDate();
                endTime = endAM.toDate();
            } else {
                startTime = startPM.toDate();
                endTime = endPM.toDate();
            }
            query.greaterThan("createdAt", startTime);
            query.lessThanOrEqualTo("createdAt", endTime);
            query.first().then(function(checkIn) {
                return null != checkIn;
            }).then(function(checked) {
                if (checked) {
                    response.error("不用狂刷存在感的");
                } else {
                    var location = new AV.GeoPoint({latitude: parseFloat(request.params.lat), longitude: parseFloat(request.params.lng)});
                    if (0.5 > location.kilometersTo(new AV.GeoPoint({latitude: LAT, longitude: LNG}))) {
                        var CheckIn = AV.Object.extend("CheckIn");
                        var checkIn = new CheckIn();
                        checkIn.save({
                            employee: request.user,
                            location: location,
                            ssid: request.params.ssid,
                            mac: request.params.mac,
                            email: request.params.email
                        }, {
                            success: function(checkIn) {
                                response.success(checkIn);
                            },
                            error: function(checkIn, error) {
                                response.error(error);
                            }
                        });
                    } else {
                        response.error("我读得书少，你不要骗我！");
                    }
                }
            });
        } else {
            response.error("恭喜你，错过签到时间了~");
        }
    } else {
        response.error("尚未登录无法签到");
    }
});
