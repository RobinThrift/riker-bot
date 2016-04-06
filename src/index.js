import {RtmClient, CLIENT_EVENTS} from '@slack/client';
import {CronJob} from 'cron';
import jpickle from 'jpickle';
import {readFile} from 'fs';
import {sample, reject} from 'lodash';

function getPickledData(path) {
    return new Promise((resolve, rej) => {
        readFile(path, (err, data) => {
            if (err) { return rej(err); }

            data = data.toString();

            let _d = jpickle.loads(data);
            resolve(reject(_d, (i) => {return i.word_count <= 5;}));
        });
    });
}

function startSchedule(schedule, sentences, channel, sendMsg) {
    return () => {
        sendMsg(sample(sentences).text, channel);
        let job = new CronJob(schedule, () => {
            sendMsg(sample(sentences).text, channel);
        }, null, false, 'Europe/Berlin');
        job.start();
    };
}

async function main(config) {
    let client = new RtmClient(config.token);

    let sentences = await getPickledData(config.data);

    client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, startSchedule(config.schedule, sentences, config.channel, client.sendMessage.bind(client)));

    process.on('SIGINT', () => {
        client.disconnect();
        process.exit();
    });

    client.start();
}

import yargs from 'yargs';
let argv = yargs
    .default('token', process.env.SLACK_TOKEN)
    .default('channel', process.env.CHANNEL_ID)
    .default('data', './data.pickle')
    .default('schedule', '*/5 * * * * *')
    .argv;

main(argv)
    .then(() => {
        console.log('starting client...');
    })
    .catch((err) => {
        console.error(err);
    })
