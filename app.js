const express = require('express');
var app = express();
const fs = require("fs");
const request = require('request')
const openai = require("openai");
const queryString = require('querystring');
const log = require("./utilities/log.js")
const printLog = log.printLog

// decrypt my secret
const { encrypt, decrypt } = require('./utilities/crypto.js')
const mySecret = { iv: '4388414024c6272a28c5522e12fd16ba', content: '440e109ca43972a1' }
const myDecryptSecret = decrypt(mySecret)

// Server
// var ENV_SERVER = "http://127.0.0.1:3000/"
const ENV_SERVER = "https://demo-deploy-app-01.onrender.com/"

const MM_DEST = `https://chat.${myDecryptSecret}.org/hooks/3xuqbiou1iyo9rc5otwkg7zywa`// vietanhtest
// const MM_DEST = `https://chat.${myDecryptSecret}.org/hooks/zgzs61kbmtbiuradjy6ut6oi8a` // raven
// const MM_DEST = `https://chat.${myDecryptSecret}.org/hooks/qbfdp4ftufboxkx4ek6xsah1jh`



const AWS = require('aws-sdk');

// --
// -- AWS: init
// --
const ACCESS_KEY_1 = "AKIA6JEDQFAH5UBN"
const ACCESS_KEY_2 = "Z75K"
const ACCESS_KEY_ID = ACCESS_KEY_1 + ACCESS_KEY_2

const SECRET_KEY_1 = "HMH+hRFDQKCdR4cOleJr9KqqfueaOxdanzn"
const SECRET_KEY_2 = "NgwnR"
const SECRET_ACCESS_KEY = SECRET_KEY_1 + SECRET_KEY_2

// --
// -- openAPI: init
// --
const MODEL_GPT = "text-davinci-003"
// const MODEL_GPT = "gpt-3.5-turbo"
const Configuration = openai.Configuration;
const OpenAIApi = openai.OpenAIApi;
let key = "sk-asS9galzYYC5UMA7L9GwT3BlbkFJoIVxm7rWdozCwBKD"
let key2 = "kS6F"
const configuration = new Configuration({
    organization: "org-2o8ObxPxH4WWOZtnUCmqrMEL",
    apiKey: key + key2,
});
const openaiObj = new OpenAIApi(configuration);
// init openAPI done

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

team_member = {
    "anh.nguyenviet6": {
        "name": "anh.nguyenviet6",
        "alias": "vietanh6"
    },
    "quy.nguyenngoc": {
        "name": "quy.nguyenngoc",
        "alias": "quynn"
    },
    "duc.luutrong": {
        "name": "duc.luutrong",
        "alias": "ducdoo"
    },
    "trung.maiduc2": {
        "name": "trung.maiduc2",
        "alias": "trungtrau"
    },
    "giang.trinhthuy": {
        "name": "giang.trinhthuy",
        "alias": "alextrinh"
    },
    "anh.buithingoc": {
        "name": "anh.buithingoc",
        "alias": "ngocanh"
    },
    "thao.lethithu": {
        "name": "thao.lethithu",
        "alias": "mika"
    }
}

const port = process.env.PORT || 3000
const data_path = "./member_data.json";
const piggy_bank_path = "./data/piggy_bank.json";

function getUserDataFromFile(file_path) {

    let readDataStr = ""
    let readDataJson = ""
    try {
        readDataStr = fs.readFileSync(file_path, 'utf8')
        readDataJson = JSON.parse(readDataStr)
    } catch (err) {
    }

    return readDataJson
}

function getMemberMissingRecord() {
    let missingRec = []
    let membersData = getUserDataFromFile(data_path)
    for (var member of Object.keys(team_member)) {
        team_member_email = team_member[member]["email"]
        number_records = 0
        if (!membersData[getCurrentDate()][team_member_email]) {
            missingRec.push(team_member[member]["email"])
        }
    }
    return missingRec
}

function getCurrentDate() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${year}-${month}-${day}`
}

function getDestinationMMUrl() {
    return MM_DEST
    // return `https://chat.${myDecryptSecret}.org/hooks/zgzs61kbmtbiuradjy6ut6oi8a`
    // return `https://chat.${myDecryptSecret}.org/hooks/3xuqbiou1iyo9rc5otwkg7zywa`
    //https://chat.${myDecryptSecret}.org/hooks/qbfdp4ftufboxkx4ek6xsah1jh
}


//
function getNumRecords() {
    let all_data = getUserDataFromFile(data_path)

    let all_records = {}

    for (var member of Object.keys(team_member)) {
        team_member_email = team_member[member]["name"]
        number_records = 0
        for (var date of Object.keys(all_data)) {
            if (all_data[date][team_member[member]["name"]]) {
                number_records += 1
            }
        }
        all_records[team_member[member]["alias"]] = number_records

    }

    var sortedData = Object.entries(all_records).sort((a, b) => b[1] - a[1]);
    const result = sortedData.reduce((acc, item) => {
        acc[item[0]] = item[1];
        return acc;
    }, {});

    printLog(arguments.callee.name, JSON.stringify(result, null, 3))
    return result
}

function getUserScore() {
    let all_data = getUserDataFromFile(data_path)

    let all_records = {}

    let highest_record = 0
    for (var member of Object.keys(team_member)) {
        team_member_email = team_member[member]["name"]
        number_records = 0
        score = 0
        for (var date of Object.keys(all_data)) {
            if (all_data[date][team_member[member]["name"]]) {
                score += all_data[date][team_member[member]["name"]]["score"]
                number_records += 1
            }
        }
        if (highest_record < number_records) {
            highest_record = number_records
        }
        all_records[team_member[member]["alias"]] = {}
        all_records[team_member[member]["alias"]]["score"] = (score / number_records).toFixed(2)
        all_records[team_member[member]["alias"]]["num_records"] = number_records

    }

    printLog(arguments.callee.name, JSON.stringify(all_records, null, 3))

    final_score = {}
    for (var member of Object.keys(all_records)) {
        final_score[member] = 0.7 * (all_records[member]["score"]) + 0.3 * (10 * all_records[member]["num_records"] / highest_record)
    }

    var sortedData = Object.entries(final_score).sort((a, b) => b[1] - a[1]);

    const result = sortedData.reduce((acc, item) => {
        acc[item[0]] = item[1];
        return acc;
    }, {});


    printLog(arguments.callee.name, "result===");
    printLog(arguments.callee.name, result);

    return result
    // return number_records
}


async function sendChartAsImage(chartName, chartType) {
    printLog(arguments.callee.name, "sendChartAsImage")
    const width = 600; //px
    const height = 400; //px
    const backgroundColour = 'white';
    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    // Define the chart options
    const options = {
        plugins: {
            title: {
                display: true,
                text: chartName
            }
        },
        indexAxis: 'y',
        scales: {
            xAxes: [
                {
                    type: "3d",
                    position: "bottom",
                    gridLines: {
                        drawOnChartArea: false
                    }
                }
            ],
            yAxes: [
                {
                    type: "linear",
                    position: "left",
                    gridLines: {
                        drawOnChartArea: false
                    }
                }
            ]
        },
        animation: {
            duration: 2000,
            easing: "easeOutQuart"
        }
    };
    var myLabel = []
    var myLabelName = 'Nums of Reports'
    var myLabelRecords = []
    var myLabelRecordsBackground = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(177, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(67, 111, 64, 0.2)',
        'rgba(22, 11, 64, 0.2)',
    ]
    var myLabelRecordsBorder = [
        'rgba(255, 99, 132, 1)',
        'rgba(177, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(67, 111, 64, 1)',
        'rgba(22, 11, 64, 1)',
    ]

    if (chartType == SCORE_CHART_TYPE) {
        recoredData = getUserScore()
        myLabelName = 'Scores'
    } else if (chartType == REPORT_CHART_TYPE) {
        recoredData = getNumRecords()
        myLabelName = 'Nums of Reports'
    }

    for (var name of Object.keys(recoredData)) {
        myLabel.push(name)
        myLabelRecords.push(recoredData[name])
    }
    const configuration2 = {
        type: 'bar',
        data: {
            labels: myLabel,
            datasets: [{
                label: myLabelName,
                data: myLabelRecords,
                backgroundColor: myLabelRecordsBackground,
                borderColor: myLabelRecordsBorder,
                borderWidth: 1
            }]
        },
        options: options
    };

    const bufferImg = await chartJSNodeCanvas.renderToBuffer(configuration2);

    AWS.config.update({
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: 'ap-northeast-1'
    });

    // Create an S3 instance
    const s3 = new AWS.S3();
    // const file = fs.readFileSync('screenshot.png');
    const uploadParams = {
        Bucket: 'myvietanhbot3',
        Key: 'screenshot.png',
        Body: bufferImg,
        ContentType: 'image/png'
    }
    var signUrlParams = {
        Bucket: 'myvietanhbot3',
        Key: 'screenshot.png',
        Expires: 6000000 // URL will expire in 60 seconds
    };

    const waitForAllFunctions = async () => {
        let url_img
        const signedUrlPromise = new Promise((resolve, reject) => {
            s3.getSignedUrlPromise('getObject', signUrlParams, function (err, url) {
                if (err) {
                    reject(err);
                } else {
                    printLog(arguments.callee.name, 'The URL for the image is: ', url);
                    // sendMessageToMM("# This is your chart\n" + url)
                    sendMessageToMM(url)
                    url_img = url
                    resolve(url);
                }
            });
        });

        const results = await Promise.all([
            s3.upload(uploadParams).promise(),
            signedUrlPromise
        ]);

        printLog(arguments.callee.name, results);
        printLog(arguments.callee.name, url_img);
        return url_img
    };

    return await waitForAllFunctions();
}
// postContest()
async function postContest() {
    console.log("postContest")
    AWS.config.update({
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: 'ap-northeast-1'
    });

    var dataBuffer = fs.readFileSync('Capture.PNG', async (err, data) => {
        console.log("readFileSync 0")
    });

    // Create an S3 instance
    const s3 = new AWS.S3();
    // const file = fs.readFileSync('screenshot.png');
    const uploadParams = {
        Bucket: 'myvietanhbot3',
        Key: 'DragonContest.png',
        Body: dataBuffer,
        ContentType: 'image/png'
    }
    var signUrlParams = {
        Bucket: 'myvietanhbot3',
        Key: 'DragonContest.png',
        Expires: 600000 // URL will expire in 60 seconds
    };

    const waitForAllFunctions = async () => {
        console.log("waitForAllFunctions")
        let url_img
        const signedUrlPromise = new Promise((resolve, reject) => {
            s3.getSignedUrlPromise('getObject', signUrlParams, function (err, url) {
                console.log("getSignedUrlPromise")
                if (err) {
                    reject(err);
                } else {
                    printLog(arguments.callee.name, 'The URL for the image is: ', url);
                    // sendMessageToMM("# This is your chart\n" + url)
                    printLog(arguments.callee.name, "send contest")
                    var preDataBuild = "Tôi là Dev-Chan. "
                    var msg = "Giúp tôi gửi thông tin buổi contest dưới đây tới các bạn thân mến một cách hài hước, kèm theo 9 cái emoji cực kỳ dễ thương. Sau đó, nhắn với các bạn hãy chuẩn bị tốt và chúc các bạn một ngày tốt lành.\n Sắp tới chúng ta sẽ một cuộc thi dành cho những chú rồng thông thái\n Rất mong có sự tham gia của các bạn!!!"
                    var myQuestion = preDataBuild + msg;
                    printLog(arguments.callee.name, myQuestion)
                    var suff = "\n\n|Cuộc thi|The Wise Dragons | |\n|--- | --- | --- |---|\n|Thời gian|30 phút, 3h chiều thứ 6 31/03/2023 ||\n|Tool| use poll everywhere app -> link contest https://pollev.com/anhnguyenviet6718 ||\n|Phạm vi tham dự| DMLCN team :dragon_face: :dragon_face: :dragon_face: | |\n|Nội dung| 40 câu hỏi về gameplay, technical, team members, china... của DML| |\n|Giải thưởng|#1: 500k + :gift:| |\n||#2: 300k| |\n||# 3: 200k| ||\n|Note| Mọi người cài thử poll everywhere app rùi vào link thử xem được không nha | |"
                    // requestGetOpenAIMsg(myQuestion, `https://chat.${myDecryptSecret}.org/hooks/3xuqbiou1iyo9rc5otwkg7zywa`, suff + "\n" + url)
                    requestGetOpenAIMsg(myQuestion, `https://chat.${myDecryptSecret}.org/hooks/mzzto39n73g35dmn7rd5e4i3qo`, suff)
                    url_img = url
                    resolve(url);
                }
            });
        });

        const results = await Promise.all([
            s3.upload(uploadParams).promise(),
            signedUrlPromise
        ]);
    }
    return await waitForAllFunctions()
}
function getRecords() {
    let missRec = []
    let doneRec = []
    let membersData = getUserDataFromFile(data_path)
    for (var member of Object.keys(team_member)) {
        team_member_email = team_member[member]["name"]
        number_records = 0
        if (!membersData[getCurrentDate()][team_member_email]) {
            missRec.push(team_member[member]["name"])
        } else {
            doneRec.push(team_member[member]["name"])
        }
    }
    let rec_today = {}
    rec_today["miss"] = missRec
    rec_today["done"] = doneRec
    printLog(arguments.callee.name, JSON.stringify(rec_today, null, 3))
    return rec_today
}

async function sendReport(jsonData) {
    printLog(arguments.callee.name, "sendReport")
    if (jsonData.text.startsWith("Reporting")) {
        var membersData = jsonData.text.split('\n');
        var myname = ""
        var myData = {}
        let currentDate = getCurrentDate()
        myData[currentDate] = {}

        const reName = /(Reporting for)(.*)/gi;
        const reReports = /(.*)/
        membersData.forEach(readData)
        function readData(value, index, array) {
            if (filters = value.match(reName)) {
                myname = jsonData.user_name
                myData[currentDate][myname] = {}
            } else if (filters = value.match(reReports)) {
                if (myname != "" && !myData[currentDate][myname]["reports"]) myData[currentDate][myname]["reports"] = [];
                filters[0] = filters[0].replace(myDecryptSecret, 'g***')
                myData[currentDate][myname]["reports"].push(filters[0])
            }
        }

        printLog(arguments.callee.name, JSON.stringify(myData, null, 3))

        const fs = require('fs');
        let readDataStr = ""
        let readDataJson = {}
        try {
            readDataStr = fs.readFileSync(data_path, 'utf8');
            readDataJson = JSON.parse(readDataStr);
        } catch (err) {
            printLog(arguments.callee.name, "have error")
        }

        const JSONObjectMerge = require("json-object-merge");
        const merged = JSONObjectMerge.default(readDataJson, myData);

        if (fs.existsSync(data_path)) {
            printLog(arguments.callee.name, "existsSync")
            let myJSON = JSON.stringify(merged, null, 3);
            fs.writeFileSync(data_path, myJSON)
            printLog(arguments.callee.name, "1")
            printLog(arguments.callee.name, "2")

            push();

        } else {
            printLog(arguments.callee.name, "Report: not found data_path=" + data_path)
        }

        const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        const hours = new Date(now).getHours();

        if (hours >= 10) {
            console.log("hello");
            piggyBank(jsonData)
        } else {
            console.log("It's not yet 10AM.");
        }

        return "sendReport done"
    } else {
        return "sendReport failed"
    }
}

function push() {
    var execProcess = require("./exec_process.js");
    execProcess.result('git config user.name "vietanh1111"', function (err, response) {
        if (!err) {
            printLog(arguments.callee.name, "push 1 OK")
            printLog(arguments.callee.name, response);

            execProcess.result('git config user.email "anh.nguyenviet6gl@gmail.com"', function (err, response) {
                if (!err) {
                    printLog(arguments.callee.name, "push 2 OK")
                    printLog(arguments.callee.name, response);

                    execProcess.result('git add .', function (err, response) {
                        if (!err) {
                            printLog(arguments.callee.name, "push 2 OK")
                            printLog(arguments.callee.name, response);
                            const { exec } = require('child_process');

                            // Define the Git commit message
                            const commitMessage = 'My commit message';

                            // Execute the Git commit command
                            exec('git commit -m "[auto-commit] update data"', (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Error: ${error.message}`);
                                    return;
                                }
                                if (stderr) {
                                    console.error(`stderr: ${stderr}`);
                                    return;
                                }
                                console.log(`stdout: ${stdout}`);
                                printLog(arguments.callee.name, "push 3 OK")
                                printLog(arguments.callee.name, response);
                                var a = "ghp_vzTuJkvYcDcpa9ujt4Y"
                                var b = "FwqOaRnhMEO3u"
                                var c = "JV4J"
                                var d = a + b + c
                                var push_cmd = 'git push -f https://vietanh1111:' + d + '@github.com/vietanh1111/RavenBot.git HEAD:main'

                                execProcess.result(push_cmd, function (err, response) {
                                    if (!err) {
                                        printLog(arguments.callee.name, "push 4 OK")
                                        printLog(arguments.callee.name, response);
                                    } else {
                                        printLog(arguments.callee.name, "push 4 failed")
                                        printLog(arguments.callee.name, err);
                                        return "push failed"
                                    }
                                });
                            });
                        } else {
                            printLog(arguments.callee.name, "push 2 failed")
                            printLog(arguments.callee.name, err);
                            return "push failed"
                        }
                    });

                } else {
                    printLog(arguments.callee.name, "push 2 failed")
                    printLog(arguments.callee.name, err);
                    return "push failed"
                }
            });

        } else {
            printLog(arguments.callee.name, "push 1 failed")
            printLog(arguments.callee.name, err);
            return "push failed"
        }
    });
}
async function sendDragonContest() {
    printLog(arguments.callee.name, "sendDragonContest")
    if (jsonData["user_name"] !== "dat.letien2" && jsonData["user_name"] !== "anh.nguyenviet6") {
        failed_msg = "You couldn't do the action. Please ask your Manager"
        sendMessageToMM(failed_msg)
        return "no permission"
    } else {
        const result = await postContest()
        return result;
    }
}

async function sendMsgToRavenRoom() {
    printLog(arguments.callee.name, "sendMsgToRavenRoom")
    requestGetOpenAIMsg("Giúp tôi nhắc nhở mọi người tham dự cuôc họp dev lúc 10h30", `https://chat.${myDecryptSecret}.org/hooks/zgzs61kbmtbiuradjy6ut6oi8a`)
}

async function sendDailyRemind() {
    printLog(arguments.callee.name, "sendDailyRemind")
    let msg = "On behalf of \"Dragon Mania Legends China Team\". Help me say hi and a polite reminder email to my friends that \"you need to fill out the daily task today\""
    requestGetOpenAIMsg(msg)
}

async function sendThank() {
    printLog(arguments.callee.name, "sendThank")
    let rec = getRecords();
    let msg = "On behalf of \"Dragon Mania Legends China Team\". Send a short email to thank my team for reporting" + " then warning " + rec["miss"] + " because missing daily report."
    requestGetOpenAIMsg(msg)
}

const SCORE_CHART_TYPE = "score_chart"
const REPORT_CHART_TYPE = "report_chart"

async function getReportChart() {
    const result = await sendChartAsImage("Team Records", REPORT_CHART_TYPE);
    return result;
}

async function getScoreChart() {
    const result = await sendChartAsImage("Team Scores", SCORE_CHART_TYPE);
    return result;
}

async function chatBot(jsonData) {
    printLog(arguments.callee.name, "chatBot")
    return requestGetOpenAIMsgForChatBotRaven(jsonData)
}

async function sendBuildToQA(jsonData) {
    printLog(arguments.callee.name, "sendBuildToQA")
    var preDataBuild = "Tôi là Dev-Chan."
    var myQuestion = preDataBuild + jsonData;
    printLog(arguments.callee.name, myQuestion)
    return requestGetOpenAIMsg(myQuestion, `https://chat.${myDecryptSecret}.org/hooks/mzzto39n73g35dmn7rd5e4i3qo`)
    // return requestGetOpenAIMsg(myQuestion, `https://chat.${myDecryptSecret}.org/hooks/3xuqbiou1iyo9rc5otwkg7zywa`)
}



OPENAI_COMPLETIONS_MAX_TOKEN = 2000
OPENAI_COMPLETIONS_ALLOW_WORDS = 1200 // ~75% MAX TOKEN
let conversationRaven = "The following is a conversation with an AI assistant. The assistant have 200-IQ, is helpful, creative, clever, and very friendly."
let conversationQa = "The following is a conversation with an AI assistant. The assistant have 200-IQ, is helpful, creative, clever, and very friendly."
async function requestGetOpenAIMsgForChatBotRaven(input_question, user_name, addQuestion) {
    printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotRaven ")

    let question = "\nHuman:" + input_question + "\nAI:"
    conversationRaven = conversationRaven + question

    printLog(arguments.callee.name, "begin conversation=" + conversationRaven)
    printLog(arguments.callee.name, "words in conversation=" + conversationRaven.split(" ").length)
    if (conversationRaven.split(" ").length < OPENAI_COMPLETIONS_ALLOW_WORDS) {
        let request_data = {
            model: MODEL_GPT,
            prompt: conversationRaven,
            temperature: 0.2,
            max_tokens: OPENAI_COMPLETIONS_MAX_TOKEN,
            // top_p: 1,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.6,
            stop: [" Human:", " AI:"],
        }

        let userQuestion = ""
        if (addQuestion) {
            let name = user_name
            userQuestion = "**" + name + ": **" + input_question
        }

        try {
            let completion = await openaiObj.createCompletion(request_data);
            let res = completion.data.choices[0].text
            res = res.trim()
            conversationRaven = conversationRaven + res

            printLog(arguments.callee.name, "end conversationRaven=" + conversationRaven)

            // let messageMM = "**Tớ: **" + input_question + "\n**IQ-200: **" + res
            let messageMM = userQuestion + "\**IQ-200: **" + res
            res = await sendMessageToMM(messageMM)
            printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotRaven get done")
            return res

        } catch (error) {
            printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotRaven get error")
            printLog(arguments.callee.name, error)
            // let messageMM = "**Tớ: **" + input_question + "\n**IQ-200: **" + "Sorry, request Failed"
            let messageMM = "**IQ-200: **" + "Xin lỗi, tôi bận"
            res = await sendMessageToMM(messageMM)
            return res
        }
    } else {
        conversationRaven = "The following is a conversation with an AI assistant. The assistant have 200-IQ, is helpful, creative, clever, and very friendly."
        let messageMM = "**IQ-200: **" + "Rất tiếc, tôi không thể nhớ được tất cả những gì bạn nói, tôi đang xóa ký ức và chúng ta sẽ bắt đầu lại nha :hugging_face: :hugging_face: :hugging_face: "
        await sendMessageToMM(messageMM)
        return "ok and clear conversation"
    }

}

async function requestGetOpenAIMsgForChatBotQA(input_question, user_name, addQuestion) {
    printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotQA ")
    let qaRoom = `https://chat.${myDecryptSecret}.org/hooks/mzzto39n73g35dmn7rd5e4i3qo`
    let question = "\nHuman:" + input_question + "\nAI:"
    conversationQa = conversationQa + question

    printLog(arguments.callee.name, "begin conversation=" + conversationQa)
    printLog(arguments.callee.name, "words in conversation=" + conversationQa.split(" ").length)
    if (conversationQa.split(" ").length < OPENAI_COMPLETIONS_ALLOW_WORDS) {
        let request_data = {
            model: MODEL_GPT,
            prompt: conversationQa,
            temperature: 0.2,
            max_tokens: OPENAI_COMPLETIONS_MAX_TOKEN,
            // top_p: 1,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.6,
            stop: [" Human:", " AI:"],
        }

        let userQuestion = ""
        if (addQuestion) {
            let name = user_name
            userQuestion = "**" + name + ": **" + input_question
        }

        try {
            let completion = await openaiObj.createCompletion(request_data);
            let res = completion.data.choices[0].text
            res = res.trim()
            conversationQa = conversationQa + res

            printLog(arguments.callee.name, "end conversationQa=" + conversationQa)

            // let messageMM = "**Tớ: **" + input_question + "\n**IQ-200: **" + res
            let messageMM = userQuestion + "\n**dragon_sender: **" + res
            res = await sendMessageToMM(messageMM, qaRoom)
            printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotQA get done")
            return res

        } catch (error) {
            printLog(arguments.callee.name, "requestGetOpenAIMsgForChatBotQA get error")
            printLog(arguments.callee.name, error)
            // let messageMM = "**Tớ: **" + input_question + "\n**IQ-200: **" + "Sorry, request Failed"
            let messageMM = "**dragon_sender: **" + "Sorry, request Failed"
            res = await sendMessageToMM(messageMM, qaRoom)
            return res
        }
    } else {
        conversationQa = "The following is a conversation with an AI assistant. The assistant have 200-IQ, is helpful, creative, clever, and very friendly."
        let messageMM = "**dragon_sender: **" + "Rất tiếc, tôi không thể nhớ được tất cả những gì bạn nói, tôi đang xóa ký ức và chúng ta sẽ bắt đầu lại nha :hugging_face: :hugging_face: :hugging_face: "
        await sendMessageToMM(messageMM, qaRoom)
        return "ok and clear conversation"
    }

}

async function sendMessageToMM(msg, url) {
    printLog(arguments.callee.name, "sendMessageToMM")
    let req_method = "POST"
    let req_url = getDestinationMMUrl()
    if (url) {
        req_url = url
    }
    let req_data = JSON.stringify({
        text: msg,
        user_name: "anh.nguyenviet6"
    })
    let result = await getRequestResponse(req_method, req_url, req_data)
    return result
}

async function makeRequest(req_method, req_url, req_data) {
    printLog(arguments.callee.name, "makeRequest START")
    const options = {
        url: req_url,
        method: req_method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: req_data
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

async function getRequestResponse(req_method, req_url, req_data) {
    console.log("getRequestResponse START")
    try {
        const response = await makeRequest(req_method, req_url, req_data);
        printLog(arguments.callee.name, "parseResponse");
        printLog(arguments.callee.name, response);
        // Do something with the response
        return response
    } catch (error) {
        printLog(arguments.callee.name, "parseResponse error");
        printLog(arguments.callee.name, error);
        return "getRequestResponse error"
    }
}

MSG_CREATE_DONE = "Create Done!!"
MSG_CREATE_FAILED = "Create Failed~~"
function CreateAndAddTasks(jsonData) {
    printLog(arguments.callee.name, "CreateAndAddTasks")
    if (jsonData["user_name"] !== "dat.letien2" && jsonData["user_name"] !== "anh.nguyenviet6") {
        failed_msg = "You couldn't do the action. Please ask your Manager"
        sendMessageToMM(failed_msg)
    } else {
        printLog(arguments.callee.name, "parse data")
        var dataInLines = jsonData.text.split('\n');

        var requestData = {}
        const reVersion = /(game_version:)(.*)/;
        const reEpicLinks = /(epic_link:)(.*)/
        dataInLines.forEach(readData)
        function readData(value, index, array) {
            printLog(arguments.callee.name, value)
            if (filters = value.match(reVersion)) {
                requestData["gameVersion"] = filters[2]
            } else if (filters = value.match(reEpicLinks)) {
                requestData["epicLink"] = filters[2]
            }
        }
        printLog(arguments.callee.name, JSON.stringify(requestData, null, 3))
        var url = `https://jira.${myDecryptSecret}.org/rest/cb-automation/latest/hooks/11ab6d4646e1a816c474ff572518a7b3fd2c7084`

        request.post(
            url,
            { json: requestData },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    printLog(arguments.callee.name, "CreateAndAddTasks Success");

                    sendMessageToMM(MSG_CREATE_DONE)
                } else {
                    printLog(arguments.callee.name, "CreateAndAddTasks Err");
                    printLog(arguments.callee.name, error);
                    printLog(arguments.callee.name, response);
                    sendMessageToMM(MSG_CREATE_FAILED)
                }
            }
        );
    }
}

async function piggyBank(jsonData) {
    printLog(arguments.callee.name, "piggyBank")
    var myname = jsonData["user_name"]
    var myData = {}
    let currentDate = getCurrentDate()
    myData[currentDate] = {}
    myData[currentDate][myname] = 3

    printLog(arguments.callee.name, JSON.stringify(myData, null, 3))

    const fs = require('fs');
    let readDataStr = ""
    let readDataJson = {}
    try {
        readDataStr = fs.readFileSync(piggy_bank_path, 'utf8');
        readDataJson = JSON.parse(readDataStr);
    } catch (err) {
        printLog(arguments.callee.name, "have error")
    }

    const JSONObjectMerge = require("json-object-merge");
    const merged = JSONObjectMerge.default(readDataJson, myData);

    if (fs.existsSync(piggy_bank_path)) {
        printLog(arguments.callee.name, "existsSync")
        let myJSON = JSON.stringify(merged, null, 3);
        fs.writeFileSync(piggy_bank_path, myJSON)
        printLog(arguments.callee.name, "1")
        printLog(arguments.callee.name, "2")

        push();
        getPiggyBank(myname)


    } else {
        printLog(arguments.callee.name, "Report: not found piggy_bank_path=" + piggy_bank_path)
    }
    return "piggyBank"
}


async function GetHelp(jsonData) {
    var msg = "#### Raven Options.\n\n| Option  | Command   | Note |"
        + "\n|:-----------|:-----------:|:-----------------------------------------------|"
        + "\n| To Show Report | Raven Show Reports | ✅ |"
        + "\n| To Show Score | Raven Show Score | ✅  |"
        + "\n| To Daily Remind | Raven Daily Remind | ✅ |"
        + "\n| To Send Thank For Reports | Raven Thank |  ✅ |"
        + "\n| To Reporting | Reporting for <data> |  ✅ |"
        + "\n| To Send Msg to QA | Raven SendToQA: |  ✅ |"
        + "\n| To Chat with Raven | Raven Chat |  ✅ |"
        + "\n| To Create Jira GameVersion and Relating Tasks | Raven-Jira: Create <data> |  only availble for managers |"
    // msg = msg + "\n" + "`To Show Report` -> `Raven Show Reports`"
    // msg = msg + "\n" + "`To Show Score` -> `Raven Show Score`"
    // msg = msg + "\n" + "`To Daily Remind` -> `Raven Daily Remind`"
    // msg = msg + "\n" + "`To Send Thank For Reports` -> `Raven Thank`"
    // msg = msg + "\n" + "`To Reporting` -> `Reporting for <data>`"
    // msg = msg + "\n" + "`To Send Build to QA` -> `Giúp tôi gửi thông tin build này tới các bạn QAs + <data>`"
    // msg = msg + "\n" + "`To Chat with Raven` -> `Raven Chat` "

    printLog(arguments.callee.name, msg)
    return sendMessageToMM(msg)
}


async function requestGetOpenAIMsg(question, mmUrl, suffix_msg) {
    printLog(arguments.callee.name, "hello ")
    printLog(arguments.callee.name, question)
    let request_data = {
        "model": MODEL_GPT,
        "prompt": question,
        "max_tokens": 2000,
        "top_p": 0.6,
    }

    try {
        let msg = ""
        const completion = await openaiObj.createCompletion(request_data);
        msg = completion.data.choices[0].text
        printLog(arguments.callee.name, "msg=" + msg)
        msg = msg.trim()
        if (suffix_msg)
            msg = msg + suffix_msg
        return await sendMessageToMM(msg, mmUrl)
    } catch (error) {
        printLog(arguments.callee.name, "get error")
        printLog(arguments.callee.name, error)
        return arguments.callee.name + " get error"
    }
}


app.post('/doTask', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            printLog(arguments.callee.name, "doTask for the data")
            printLog(arguments.callee.name, data)
            jsonData = JSON.parse(data)
            let result = "result nonwe"
            if (jsonData["text"]) {
                if (jsonData["text"].toLowerCase().startsWith("reporting for")) {
                    result = await sendReport(jsonData)
                } else if (jsonData["text"].toLowerCase().startsWith("raven show reports")) {
                    result = await getReportChart()
                } else if (jsonData["text"].toLowerCase().startsWith("raven show score")) {
                    result = await getScoreChart()
                } else if (jsonData["text"].toLowerCase().startsWith("raven thank")) {
                    result = await sendThank()
                } else if (jsonData["text"].toLowerCase().startsWith("raven daily remind")) {
                    result = await sendDailyRemind()
                } else if (jsonData["text"].toLowerCase().startsWith("raven chat:")) {
                    let regex = /raven chat:/gi;
                    result = await chatBot(jsonData["text"].replace(regex, ""))
                } else if (jsonData["text"].toLowerCase().startsWith("raven sendtoqa:")) {
                    let regex = /raven sendtoqa:/gi;
                    result = await sendBuildToQA(jsonData["text"].replace(regex, ""))
                } else if (jsonData["text"].toLowerCase().startsWith("raven help")) {
                    let regex = /raven help/gi;
                    result = await GetHelp(jsonData["text"].replace(regex, ""))
                } else if (jsonData["text"].toLowerCase().startsWith("raven-jira: create")) {
                    let regex = /raven-jira: create/gi;
                    result = await CreateAndAddTasks(jsonData["text"].replace(regex, ""))
                } else if (jsonData["text"].toLowerCase().startsWith("raven-localroom:")) {
                    let regex = /raven-localroom:/gi;
                    result = await requestGetOpenAIMsgForChatBotQA(jsonData["text"].replace(regex, ""))
                } else if (jsonData["text"].toLowerCase().startsWith("raven-sendcontest")) {
                    let regex = /raven-sendcontest/gi;
                    result = await sendDragonContest()
                } else if (jsonData["text"].toLowerCase().startsWith("raven-sendraven")) {
                    console.log("sendRaven")
                    let regex = /raven-sendraven/gi;
                    result = await sendMsgToRavenRoom()
                } else if (jsonData["text"].toLowerCase().startsWith("raven-piggybank:")) {
                    result = await piggyBank(jsonData)
                } else if (jsonData["text"].toLowerCase().startsWith("raven-getpiggybank")) {
                    result = await getPiggyBank(jsonData.user_name)
                }

            }

            res.end(result)
        })
    }
})

app.post('/doChatOpenAI_slash', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)

            let params = queryString.parse(data);
            let question = params.text;
            let userName = params.user_name;
            let response = await requestGetOpenAIMsgForChatBotQA(question, userName, true)
            console.log("DONE")
            res.end(response)
        })
    }
})
async function getPiggyBank(current_user) {
    let all_data = getUserDataFromFile(piggy_bank_path)

    let all_records = {}
    let msg = "Cảm ơn " + team_member[current_user]["alias"] + " đã cống hiến thêm 3 chiếc bánh gà cho Piggy Bank. \nDanh sách mạnh các thường quân:"
        + "\n\n| Tên  | Số bánh gà | Note |"
        + "\n|:-----------|:-----------:|:-----------------------------------------------|"

    for (var member of Object.keys(team_member)) {
        team_member_email = team_member[member]["name"]
        number_records = 0
        for (var date of Object.keys(all_data)) {
            if (all_data[date][team_member[member]["name"]]) {
                number_records += 3
            }
        }
        if (number_records > 0) {
            all_records[team_member[member]["alias"]] = number_records
            msg = msg + "\n| " + team_member[member]["alias"] + " | " + number_records + " |  |"
        }
    }

    var sortedData = Object.entries(all_records).sort((a, b) => b[1] - a[1]);
    const result = sortedData.reduce((acc, item) => {
        acc[item[0]] = item[1];
        return acc;
    }, {});

    printLog(arguments.callee.name, JSON.stringify(result, null, 3))



    sendMessageToMM(msg)
    return result
}

var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    // http://127.0.0.1:3000/listUsers
    console.log("Example app listening at http://%s:%s", host, port)
})