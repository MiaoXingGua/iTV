// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
var User = AV.Object.extend('_User');
var password = 'qweqwe123';

AV.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});

//生成guid
function newGuid()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid += n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}

//TV注册
AV.Cloud.define('tv_register', function(request, response) {

    console.log('TV注册');

//    register(request,response,10,null,'tv');
    register2(request,response,10,null,'tv');

});

//Phone注册
AV.Cloud.define('phone_register', function(request, response) {

    console.log('Phone注册');

//    register(request,response,10,null,'phone');
    register2(request,response,10,null,'phone');
});

var register1 = function(request,response,count,error,type)
{
    if (count<=0) response.error(error);

    var username = request.params.guid;
    var subAccountSid = request.params.subAccountSid;
    var subToken = request.params.subToken;
    var voipAccount = request.params.voipAccount;
    var voipPwd = request.params.voipPwd;

    console.log(username);

    if (!username)
    {
        username = newGuid();
    }

    var user = new AV.User();
    user.set("username",username);
    user.set("password", username);
//    user.set("subAccountSid", subAccountSid);
//    user.set("subToken", subToken);
//    user.set("voipAccount", voipAccount);
//    user.set("voipPwd", voipPwd);
    user.set('type', type);

    user.signUp(null, {
        success: function(user) {
            console.log('注册3');

            var dict = {'guid':user.get('username')};

            console.dir(dict);

            response.success(dict);

        },
        error: function(user, error) {
            console.log('注册5');
            console.dir(error);
            register2(response,--count,error);
        }
    });



}

var register2 = function(request,response,count,error,type)
{
    if (count<=0) response.error(error);

    var username = request.params.guid;

    console.log(username);

    if (!username)
    {
        username = newGuid();
    }

    var email = username + "@" + "qq" + ".com";

    if (username && email)
    {
        //创建用户关系
//        var userRelation = new UserRelation();
//        userRelation.save().then(function(userRelation){

        var user = new AV.User();
        user.set("username",username);
        user.set("password", username);
        user.set("email", email);
        user.set('type', type);

        user.signUp(null, {
            success: function(user) {

                console.log('注册3');
                //注册云通信
                cloopenSignUp(request, response, user);

            },
            error: function(user, error) {

                console.log('注册5');
                console.dir(error);
                register2(response,--count,error);
            }
        });
//        });

    }
}

//绑定设备
AV.Cloud.define('phone_binding', function(request, response) {

    relationOfPhoneTV(request, response, 1);

});

//解除绑定方法
AV.Cloud.define('phone_unbinding', function(request, response) {

    relationOfPhoneTV(request, response, 0);

});


var relationOfPhoneTV = function(request, response, isBinding) {

    console.log('绑定设备');
    var tvUsername = request.params.tvCode;
    var phoneUsername = request.params.phoneCode;

    var tvUser;
    var phoneUser;

    var userTQ = new AV.Query(User);
    userTQ.equalTo("username", tvUsername);
//    userQ.include('phone');
//    userQ.include('userFavicon');
    userTQ.first({
        success: function(user) {

            if (user.get('type') == 'tv')
            {
                tvUser = user;

                if (isBinding)
                {
                    bindingPhoneToTV(response,tvUser,phoneUser);
                }
                else
                {
                    unbindingPhoneToTV(response,tvUser,phoneUser);
                }
            }
            else
            {
                response.error('不是tv的code');
            }

        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });

    var userPQ = new AV.Query(User);
    userPQ.equalTo("username", phoneUsername);
//    userQ.include('phone');
//    userQ.include('userFavicon');
    userPQ.first({
        success: function(user) {
            console.dir(user);
            if (user.get('type') == 'phone')
            {
                phoneUser = user;

                if (isBinding)
                {
                    bindingPhoneToTV(response,tvUser,phoneUser);
                }
                else
                {
                    unbindingPhoneToTV(response,tvUser,phoneUser);
                }
            }
            else
            {
                response.error('不是phone的code');
            }
        },
        error: function(error) {
        alert("Error: " + error.code + " " + error.message);
    }
    });
}

var bindingPhoneToTV = function(response,tvUser,phoneUser) {


    if (tvUser && phoneUser)
    {
        console.log('开始绑定');
        tvUser.relation('phones').add(phoneUser);
        tvUser.save().then(function(tvUser){

            tvUserId = AV.Object.createWithoutData("_User", tvUser.id);
            phoneUser.set('tv',tvUserId);
            return phoneUser.save();

        }).then(function(phoneUser){

            console.log('绑定成功');
            response.success(phoneUser);

        },function(error){
            console.log('绑定失败');
            response.error(error);
        });
    }
}

var unbindingPhoneToTV = function(response,tvUser,phoneUser) {

    console.log('解除绑定');
    if (tvUser && phoneUser)
    {
        tvUser.relation('phones').remove(phoneUser);
        tvUser.save().then(function(tvUser){

            phoneUser.set('tv',Null);
            return phoneUser.save();

        }).then(function(phoneUser){

                console.log('绑定成功');
                response.success(phoneUser);
        },function(error){
            response.error(error);
        });
    }
}

//var register = function(request,response,count,error,type)
//{
//    if (count<=0) response.error(error);
//
//    console.log('注册');
//
//    var username = request.params.guid;
//
//    if (!username)
//    {
//        username = newGuid();
//    }
//
//    var email = username + "@qq.com";
//
//    if (username && password && email)
//    {
//        //创建用户关系
////        var userRelation = new UserRelation();
////        userRelation.save().then(function(userRelation){
//
//        var user = new AV.User();
//        user.set("username",username);
//        user.set("password", password);
//        user.set("email", email);
//        user.set('type',type);
//
//        user.signUp(null, {
//            success: function(user) {
//
////                var userRelation = new UserRelation();
////                user.set('userRelation', userRelation);
////
////                var userInfo = new UserInfo();
////                user.set('userInfo', userInfo);
//
////                user.save().then(function(user){
//
////                    response.success(user);
////                    console.dir(user);
////                    return {"user":user};
//                    response.success(user);
//
////                },function(error) {
////
//////                    response.error(error);
////                    response.error(error);
//////                    return {"error":error};
//////                });
//            },
//            error: function(user, error) {
//
////                return {"error":error};
//                response.error(error);
//            }
//
//        });
//    }
//}

//云通讯
var crypto = require('crypto');
var moment = require('moment');
var Buffer = require('buffer').Buffer;

function md5 (text)
{
    return crypto.createHash('md5').update(text).digest('hex');
}

function base64 (text)
{
    return new Buffer(text).toString('base64');
}

var parseString = require('xml2js').parseString;
var parse = require('xml2js').Parser();


AV.Cloud.define('cloopenSignUp', function(request, response) {


    cloopenSignUp(request,response,request.params.email);

});

//注册云通讯
var cloopenSignUp = function(request, response, user)
{
    console.log('注册云通讯');
    console.dir(user);

    var timeStr = moment().format('YYYYMMDDHHmmss');
//    console.log('timestr:' + timeStr);

    //APP参数:
    //应用id
    var appid = 'aaf98fda42d6912d0142dbdf2d480081';
    //主账户id
    var accountSid = 'aaf98f894081692201409b479f6f04b6';
    //主账户授权令牌
    var authToken = '8705aa2c6011420b939146447c6f3dc8';

    //1. sig参数 :主账户id + 主账户授权令牌 + 时间戳
    var sigstr = accountSid + authToken + timeStr;
    var sig = md5(sigstr);
//    console.log(timeStr);

    //2.生成请求url : https:// 服务器地址 / REST API版本 / Accounts / 主账户id / SubAccounts?sig= + sig
    var url = 'https://app.cloopen.com:8883/2013-03-22/Accounts/'+accountSid+'/SubAccounts?sig='+sig.toUpperCase();

    // 3.生成授权 : 主账户Id + 英文冒号 + 时间戳。
    var authorizationStr = accountSid + ':' + timeStr;
    var authorization64 = base64(authorizationStr);
//    console.log(authorization64);


    // 生成header

    // 生成body
    var bodyxml = '<?xml version="1.0" encoding="utf-8"?><SubAccount><appId>' + appid + '</appId><friendlyName>' + user.get('email') + '</friendlyName><accountSid>'+accountSid+'</accountSid></SubAccount>';

//    console.log('body:' + bodyxml);

    AV.Cloud.httpRequest({
        method: 'POST',
        secureProtocol : 'TLSv1_method',
        rejectUnhauthorized : false,
        url: url,
        headers: {
            'Content-Type' : 'application/xml;charset=utf-8',
            'Accept' : 'application/xml',
            'Authorization' : authorization64
        },
        body: bodyxml,
        success:function(httpResponse) {

//            console.dir(httpResponse.buffer);
//            console.log(httpResponse.buffer.toString());
//            console.log(httpResponse.buffer.toString());
            console.log('成功了！！！');
            parseString(httpResponse.text, function (error, result) {

                console.dir(result);
                if (result)
                {
                    cloopen2avos(request, response, user, result);
                }
                else
                {
                    response.error('Request failed with response code ' + error);
                }
            });
        },
        error:function(httpResponse) {

            console.log('失败了！！！');
            console.error('Request failed with response code : ' + httpResponse.text);
            response.error('Request failed with response code : ' + httpResponse.status);
        }
    });
}

var cloopen2avos = function(request, response, user, xmppInfo)
{



    var subAccountSid = xmppInfo.Response.SubAccount[0].subAccountSid[0];
    var subToken = xmppInfo.Response.SubAccount[0].subToken[0];
    var voipAccount = xmppInfo.Response.SubAccount[0].voipAccount[0];
    var voipPwd = xmppInfo.Response.SubAccount[0].voipPwd[0];

    console.log('subAccountSid' + subAccountSid);
    console.log('subToken' + subToken);
    console.log('voipAccount' + voipAccount);
    console.log('voipPwd' + subAccountSid);

    if (subAccountSid && subToken && voipAccount && voipPwd)
    {
        user.set("subAccountSid", subAccountSid);
        user.set("subToken", subToken);
        user.set("voipAccount", voipAccount);
        user.set("voipPwd", voipPwd);
        user.save().then(function(user) {

            var dict = {'guid':user.get('username'),'password':password,'subAccountSid':subAccountSid,'subToken':subToken,'voipAccount':voipAccount,'voipPwd':voipPwd};

            console.dir(dict);

            response.success(dict);

        }, function(response,error) {

//                console.error(error);
            response.error(error);

        });
    }
    else
    {
        console.error('Request failed with response code ' + xmppInfo);
        response.error('Request failed with response code ' + xmppInfo);
    }
}

