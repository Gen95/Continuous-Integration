const http = require('http');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { exec } = require('child_process');
const spawn = require('cross-spawn');


const configFile = require('./config.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = configFile.agentPort;
const SERVERPORT = configFile.serverPort;

let timeStart;
let timeEnd;

request.post(
    `http://localhost:${SERVERPORT}/notify_agent`, {
        json: {
            host: HOST,
            port: PORT
        }
    }, (error, res, body) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(res.statusCode, body);
        }
    })


app.post('/build', (req, res) => {
    console.log('build request');
    console.log(req.body);
    const { repo, hash, command } = req.body;

    exec(`cd test-repo && git checkout ${hash}`, (err, out) => {
        timeStart = (new Date).toLocaleString();
        if (err) {
            console.error('checkout error\n', err);
            res.end('[AGENT] CLOSED POST /build');
            console.log('sendBuildInfo')
            sendBuildInfo(err);
        }
        else {
            res.end('[AGENT] CLOSED POST /build');
            console.log('buildAction')
            buildAction(repo, command);
        }
    })
})


app.listen(PORT, HOST, () => {});

function buildAction(repo, command) {
    console.log('[buildAction]');

    let arrCom = command.trim().split(' ');
    
    
    const firstCom = arrCom.shift();
    let result = '';

    const child = spawn(firstCom, arrCom, {  stdio: ['pipe', 'pipe', process.stderr],  cwd: 'test-repo'});

    child.stdout.on('data', data => {
        result += data.toString();
    });

    child.on('close', code => {
        console.log(`Exit with code ${code}`);
        console.log('final result\n', result);
        sendBuildInfo(result, code);
    });
}


function sendBuildInfo(result, code = -1) {
    timeEnd = (new Date).toLocaleString();
    const url = `http://localhost:${SERVERPORT}/notify_build_result`;
    const json = { code: code, timeStart: timeStart, timeEnd: timeEnd, result: result };
    sendPostRequest(url, json);
}

function sendPostRequest(url, json) {
    request.post(
        url, {
            json: json
        }, (error, res, body) => {
            if (error) {
                console.log('request ERROR\n', error);
            }
            else {
                console.log(res.statusCode, body);
            }
        })
}