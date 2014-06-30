require("cloud/app.js");
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
    // request.user: 见https://cn.avoscloud.com/docs/cloud_code_guide.html#%E8%B0%83%E7%94%A8%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0
    if (null != request.user) {
        var location = new AV.GeoPoint({latitude: parseFloat(request.params.lat), longitude: parseFloat(request.params.lng)});
        if (0.5 > location.kilometersTo(new AV.GeoPoint({latitude: 31.204736, longitude: 121.441307}))) {
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
    } else {
        response.error("尚未登录无法签到");
    }
});
