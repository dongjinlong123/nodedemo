var express = require("express");
var first = express.Router();


var User = function (userCode,avatarUrl, city, country, gender, language, nickName, province,owner) {
    this.userCode = userCode;
    this.avatarUrl = avatarUrl;
    this.city = city;
    this.country = country;
    this.gender = gender;
    this.language = language;
    this.nickName = nickName;
    this.province = province;
    this.owner = "false";
};

var homeList = []; //房间信息列表

/*创建房间后初始化20个位置*/

function createHome(homeName, homePassword, user) {
    var userInfoList = [];
   // for (var i = 0; i < 20; i++) {
        var obj = {
        hasPeople: false,
        userInfo:new User(),
        charnum:-1 //当前用户所在的座位号
    }
        userInfoList.push(obj)
 //   }
    //房主信息
    user.owner = "true";
    userInfoList[0].userInfo = user;
    userInfoList[0].hasPeople = true;
    userInfoList[0].charnum = 0;
    var homeCount = homeList.length; //房间号
    //home 房间中的人员列表信息
    homeList.push({count: homeCount, homeName: homeName, homePassword: homePassword, userInfoList: userInfoList, userNum: 1});

    return homeCount;
}


first.post("/createHome", function (req, res, next) {
    console.log("创建房间-----");
    var homeName = req.body.homeName;
    var homePassword = req.body.homePassword;
    var user = req.body.userInfo;
    var homeCount = createHome(homeName, homePassword, user);
    console.log(user.userCode + "====================")
    res.json({code: "00", msg: "success", "myHome": homeList[homeCount]});//返回我的房间信息
});

first.get("/getHomeList", function (req, res, next) {
    res.json({code: "00", msg: "success", homeList: homeList})
});

first.post("/getCharNumByUserCode",function (req,res,next) {
    var charnum = -1;
   var userCode = req.body.userCode;
    console.log(userCode);
    var homeCount = req.body.homeCount;
    console.log(homeCount);
    var idx = 0;
    for(var i =0;i< homeList[homeCount].userInfoList.length;i++){
        if(homeList[homeCount].userInfoList[i].userInfo.userCode == userCode){
            idx = i
            charnum = homeList[homeCount].userInfoList[i].charnum;
            console.log(charnum + "--------" + i );
            break;
        }
    }
    res.json({code: "00", msg: "success","charnum":charnum ,"idx":i})
});

first.post("/joinHome",function (req,res,next) {
    console.log("用户加入房间");
    var user = req.body.userInfo;
    var homeCount = req.body.homeCount;
    console.log(user);
    console.log(homeCount);
    user.owner = "false";
    var obj = {
        hasPeople: true,
        userInfo:user,
        charnum:homeList[homeCount].userInfoList.length //当前用户所在的座位号
    }
    homeList[homeCount].userInfoList.push(obj)
    // for(var i =0;i< homeList[homeCount].userInfoList.length;i++){
    //    if(homeList[homeCount].userInfoList[i].hasPeople == false){
    //        homeList[homeCount].userInfoList[i].hasPeople = true;
    //        homeList[homeCount].userInfoList[i].userInfo = user;
    //        homeList[homeCount].userInfoList[i].charnum = i;
    //        break;
    //    }
    // }

    res.json({code: "00", msg: "success"})
});

var charList = [];//座位列表
first.get("/getCharList",function (req,res,next) {
    res.json({code: "00", msg: "success","charList":charList})
})
function initChar(){
    var colorList = ["#FDF5E6", "#FFEFD5", "#FFF8DC","#FAEBD7"];
    var home = [];
    for (var i =0;i<5;i++){
        home = home.concat(colorList)
    }
    for(var i =0;i<home.length;i++){
        var obj = {
            color: home[i],//颜色
            userInfo:{}
        }
        charList.push(obj)
    }
}
initChar();

module.exports = {first: first,homeList:homeList,charList:charList};
