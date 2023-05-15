import requests
import sys
import json

url = ""
my_text = ""
myobj = {}

url = 'http://127.0.0.1:3000/doTask'
# url = "https://demo-deploy-app-01.onrender.com/doTask"
if sys.argv[1] == 'doReport':
    print(sys.argv[1])
    data = {}
    data["text"] = "Reporting for anh.nguyenviet6@**.com:\n- Update UC and 333 SDK"
    data["user_name"] = "trung.maiduc2"
    myobj = data
elif sys.argv[1] == 'doRavenChat':
    print("asdasds")
    print(sys.argv[1])
    data = {}
    data["text"] = "Raven Chat: hello"
    data["user_name"] = "anh.nguyenviet6"
    myobj = data    
elif sys.argv[1] == 'doShowReport':
    data = {}
    data["text"] = "Raven Show Reports"
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'doShowScore':
    data = {}
    data["text"] = "Raven Show Score"
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'doRemind':
    data = {}
    data["text"] = "raven-sendcontest"
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'doThank':
    data = {}
    data["text"] = "Raven Thank"
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'sendBuildToQA':
    data = {}
    data["text"] = 'Raven SendToQA: giúp tôi gửi lời chúc mừng sinh nhật thật hay, thật ý nghĩa, thật vui đến Giang'
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'doHelp':
    data = {}
    data["text"] = 'Raven Help'
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
    # url = 'http://127.0.0.1:3000/doHelp'
elif sys.argv[1] == 'doChat':
    data = {}
    data["text"] = ''
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
    # url = 'http://127.0.0.1:3000/doHelp'
elif sys.argv[1] == 'doPiggy':
    data = {}
    data["text"] = 'raven-piggybank: phạt thao.lethithu'
    # data["text"] = 'raven-getpiggybank: sumup'
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
elif sys.argv[1] == 'doCreateVersion':
    data = {}
    # data["text"] = 'Raven-jira: create\ngame_version:7.3.0eb\nepic_link:DMLCNQA-1651'
    data["text"] = 'Raven-Jira: create tasks for the data\n```\ngame_version:7.3.0cb\nepic_link:DMLCNQA-165\n```'
    data["user_name"] = "anh.nguyenviet6"
    myobj = data
    url = 'http://127.0.0.1:3000/doTask'


x = requests.post(url, json = myobj)


print(x.text)
