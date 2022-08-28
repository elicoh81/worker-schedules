import { Controller, Get } from '@nestjs/common';
import axios from 'axios';
import e from 'express';
import { AppService } from './app.service';

const moment = require('moment');

export type Experience = {
    jobDescription: string,
    startDate: Date
    endDate: Date
}
export type WorkerData = {
    name: string,
    experience: Experience[]
};



@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get('worker-exp')
    async getWorkerExperience(): Promise<any> {
        let res = await axios.get('https://hs-resume-data.herokuapp.com/v3/candidates/all_data_b1f6-acde48001122');
        let data: any[] = res.data.map(e => ({
            name: e.contact_info.name.formatted_name,
            experience: e.experience.map(t => ({ title: t.title, startDate: t.start_date, endDate: t.end_date }))
        }));

        data = data.reduce((arr, elm) => [...arr, { ...elm, experience: elm.experience.sort((a, b) => moment(a.startDate).diff(moment(b.startDate), 'days')) }], [])

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].experience.length; j++) {
                let end = moment(data[i].experience[j].endDate);
                let start = moment();
                if (j + 1 < data[i].experience.length) {
                    start = moment(data[i].experience[j + 1].startDate);
                }
                let diff = start.diff(end, 'days');
                data[i].experience[j].gap = diff === 0 ? undefined : diff;
            }
        }

        return data;
    }
}
