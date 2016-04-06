import {RtmClient, CLIENT_EVENTS} from '@slack/client';
import {every} from 'schedule';

function main(config) {
    let client = new RtmClient(config.token);
    client.start();

    let _schedule;
    client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        _schedule = every('5s').do(() => {
            client.sendMessage('hello world', config.channel);
        });
    });

    process.on('uncaughtException', function() {
        _schedule.stop();
    });
}

import yargs from 'yargs';
let argv = yargs
    .default('token', process.env.SLACK_TOKEN)
    .default('channel', process.env.CHANNEL_ID)
    .argv;

main(argv);
