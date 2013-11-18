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

    console.log('注册');

    register(request,response,10,null,'tv');

});

//Phone注册
AV.Cloud.define('phone_register', function(request, response) {

    console.log('Phone注册');

    register(request,response,10,null,'phone');

});

//全新注册
AV.Cloud.define('register', function(request, response) {

    console.log('注册');

    register2(request,response,10,null);

});

var register2 = function(request,response,count,error)
{
    if (count<=0) response.error(error);

    var username = request.params.guid;

    if (!username)
    {
        username = newGuid();
    }

    var email = username + "@qq.com";

    if (username && password && email)
    {
        //创建用户关系
//        var userRelation = new UserRelation();
//        userRelation.save().then(function(userRelation){

        var user = new AV.User();
        user.set("username",username);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function(user) {
                console.log('注册3');

                var userRelation = new UserRelation();
                user.set('userRelation', userRelation);

                var userInfo = new UserInfo();
                user.set('userInfo', userInfo);

                user.save().then(function(user){
                    console.log('headView');
                    //注册云通信
                    cloopenSignUp(request, response, user);

                },function(error) {

                    console.log('注册6');
                    response.error(error);
                });

            },
            error: function(user, error) {
                console.log('注册5');
//                        console.log(error);
//                register(response,--count,error);
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
            console.dir(user);
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
                response.error(error+'不是tv的code');
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
                response.error(error+'不是phone的code');
            }
        },
        error: function(error) {
        alert("Error: " + error.code + " " + error.message);
    }
    });
}

var bindingPhoneToTV = function(response,tvUser,phoneUser) {

    console.log('开始绑定');
    if (tvUser && phoneUser)
    {
        tvUser.relation('phones').add(phoneUser);
        tvUser.save().then(function(tvUser){
            response.success(tvUser);
        },function(error){
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
            response.success(tvUser);
        },function(error){
            response.error(error);
        });
    }
}

var register = function(request,response,count,error,type)
{
    if (count<=0) response.error(error);

    console.log('注册');

    var username = request.params.guid;

    if (!username)
    {
        username = newGuid();
    }

    var email = username + "@qq.com";

    if (username && password && email)
    {
        //创建用户关系
//        var userRelation = new UserRelation();
//        userRelation.save().then(function(userRelation){

        var user = new AV.User();
        user.set("username",username);
        user.set("password", password);
        user.set("email", email);
        user.set('type',type);

        user.signUp(null, {
            success: function(user) {

//                var userRelation = new UserRelation();
//                user.set('userRelation', userRelation);
//
//                var userInfo = new UserInfo();
//                user.set('userInfo', userInfo);

//                user.save().then(function(user){

//                    response.success(user);
//                    console.dir(user);
//                    return {"user":user};
                    response.success(user);

//                },function(error) {
//
////                    response.error(error);
//                    response.error(error);
////                    return {"error":error};
////                });
            },
            error: function(user, error) {

//                return {"error":error};
                response.error(error);
            }

        });
    }
}

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


//注册云通讯
var cloopenSignUp = function(request, response, user)
{
    console.log('注册云通讯');
//    console.log('注册云通讯' +user.id);

    var timeStr = moment().format('YYYYMMDDHHmmss');
//    console.log('timestr:' + timeStr);

    var authorizationStr = 'aaf98f894032b237014047963bb9009d'+':'+timeStr;
//    console.log('authorizationStr:' + authorizationStr);

    var authorization64 = base64(authorizationStr);
//    console.log('authorization64:' + authorization64);

    var sigstr = 'aaf98f894032b237014047963bb9009d'+'bbc381b9a024443da462307cec93ce0b'+timeStr;
//    console.log('sigstr:' + sigstr);

    var sig = md5(sigstr);
//    console.log('sig:' + sig    );

    var bodyxml = '<?xml version="1.0" encoding="utf-8"?><SubAccount><appId>aaf98f894032b2370140482ac6dc00a8</appId><friendlyName>' + user.get('username') + '</friendlyName><accountSid>aaf98f894032b237014047963bb9009d</accountSid></SubAccount>';

//    console.log('body:' + bodyxml);

    AV.Cloud.httpRequest({
        method: 'POST',
        url: 'https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase(),
        headers: {
            'Content-Type': 'application/xml;charset=utf-8',
            'Accept': 'application/xml',
            'Authorization': authorization64
        },
        body: bodyxml,
        success:function(httpResponse) {

//            console.log(httpResponse.text);
//            console.log(username);

//            var xml = '<data>'+httpResponse.text+'<guid>'+username+'</guid>'+'</data>';
//            console.log(xml);

//            console.log('username0=' +currentUser.get('username'));
//            console.log('注册云通讯1' +user.id);
            parseString(httpResponse.text, function (error, result) {
//                console.log('username1=' + currentUser.get('username'));
                if (result)
                {
//                    console.log( '类型' +typeof (result) );
//                    console.log('注册云通讯2' +user.id);

                    cloopen2avos(request, response, user, result);
                }
                else
                {
//                    console.error('Request failed with response code ' + httpResponse.text);
                    response.error('Request failed with response code ' + error);
                }
            });

        },
        error:function(httpResponse) {

            console.error('Request failed with response code ' + httpResponse.text);
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
}

var cloopen2avos = function(request, response, user, xmppInfo)
{

    var subAccountSid = xmppInfo.Response.SubAccount[0].subAccountSid[0];
    var subToken = xmppInfo.Response.SubAccount[0].subToken[0];
    var voipAccount = xmppInfo.Response.SubAccount[0].voipAccount[0];
    var voipPwd = xmppInfo.Response.SubAccount[0].voipPwd[0];

    if (subAccountSid && subToken && voipAccount && voipPwd)
    {
        user.set("subAccountSid", subAccountSid);
        user.set("subToken", subToken);
        user.set("voipAccount", voipAccount);
        user.set("voipPwd", voipPwd);
        user.save().then(function(userInfo) {

            var dict = {'guid':user.get('username'),'password':password,'subAccountSid':subAccountSid,'subToken':subToken,'voipAccount':voipAccount,'voipPwd':voipPwd};

//                console.dir(dict);
//                console.log('dict2='+dict.toString());

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

