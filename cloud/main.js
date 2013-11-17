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
    userTQ.first().then(function(user){

        console.dir(user);
        if (user.get('state') == 'tv')
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

    },function(error){

        response.error(error);
    });

    var userPQ = new AV.Query(User);
    userPQ.equalTo("username", phoneUsername);
//    userQ.include('phone');
//    userQ.include('userFavicon');
    userPQ.first().then(function(user){

        if (user.get('state') == 'tv')
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

    },function(error){

        response.error(error);
    });
}

var bindingPhoneToTV = function(tvUser,phoneUser) {

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

var unbindingPhoneToTV = function(tvUser,phoneUser) {

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

