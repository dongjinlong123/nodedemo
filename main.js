var express = require("express");
var app = express();

var expressWs = require("express-ws")(app);


var server = app.listen(8081, function () {
    console.log("server loading.....");
});


// all 方法 所有来源的客户端，发送报文之前加上头信息，报文加上识别（可以跨域）
app.all("/first/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Header", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", "3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.use("/image", express.static("image"));//指定静态资源的位置

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var first = require("./route/first");

app.use("/first", first.first);


/*ws*/
var homeClients = [];

app.ws('/ws', function (ws, req) {

    ws.on('message', function (msg) {

        receiveCmd(ws, msg);
    });
    ws.on("close", function (msg) {
        console.log("client is closed", msg);
    });
});
function receiveCmd(ws, msg) {

    var msg = JSON.parse(msg);

    switch (msg.type) {
        case "open":
            var count = msg.data;
            var owner = msg.owner;
            //判断是否存在房间
            if(homeClients[count]){
                homeClients[count].clients.push(ws)

            }else{
                var clients = [];
                clients.push(ws);
                homeClients.push({count: count, clients: clients})
            }
            //发送人数信息
            var homePeopleNum = homeClients[count].clients.length;
            var userInfoList =first.homeList[count].userInfoList;

            var msg = '{ "type": "'+msg.type+'", "userInfoList":' +JSON.stringify(userInfoList)+', "homePeopleNum":"' + homePeopleNum +'"}'

            sendMsgAll(count,msg)

            break;
        case "close":
            var count = msg.data;
            console.log("=============="+count)
            var userCode = msg.userCode;
            console.log("=============="+userCode)
            var userInfoList =first.homeList[count].userInfoList;
            var owner = msg.owner;
            for (var index = 0; index < homeClients.length; index++) {
                if(homeClients[index] .count == count){ //房间号相等
                    for (var i = 0; i < homeClients[index].clients.length; i++) {
                        if ( homeClients[index].clients[i] == ws) {
                             homeClients[index].clients.splice(i, 1);
                            break;
                        }
                    }
                    var c_num = 0;
                    if(userInfoList.length == 1){
                        first.homeList.splice(count, 1);
                    }else{
                        for (var i = 0; i < userInfoList.length; i++) {
                            //用户退出了删除用户的信息
                            if(owner == "true" && userInfoList[i].userInfo.userCode != userCode && c_num == 0){
                                //如果是房主
                                userInfoList[i].userInfo.owner = "true";
                                c_num ++
                            }
                            if(userInfoList[i].userInfo.userCode == userCode){
                                first.homeList[count].userInfoList.splice(i, 1)
                            }

                        }

                    }

                }
            }
            //发送人数信息
            var homePeopleNum = homeClients[count].clients.length;
            var userInfoList =first.homeList[count].userInfoList;
            var msg = '{ "type": "open", "userInfoList":' +JSON.stringify(userInfoList)+', "homePeopleNum":"' + homePeopleNum +'"}'
            sendMsgAll(count,msg)
            break;
        case "changeChar":
            var count = msg.data;
            var userInfoList = msg.userInfoList;
            first.homeList[count].userInfoList = userInfoList;
            var msg = '{ "type": "'+msg.type+'", "userInfoList":' +JSON.stringify(userInfoList)+'}'
            sendMsgAll(count,msg)
            break;
    }

}

function  sendMsgAll(count,msg) {
    //发送人数信息
    var homePeopleNum = homeClients[count].clients.length;

    for(var i =0;i<homePeopleNum;i++){
        try{
            homeClients[count].clients[i].send(msg);
        }catch (e){
            console.log(e);
        }
    }
}

