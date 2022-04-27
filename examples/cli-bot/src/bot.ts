import 'reflect-metadata';

import { Bot, InMemoryUser } from '@ebenos2/framework';
import { CliAdapter } from '@ebenos2/cli-adapter';

import getStartedModule from './modules/getStarted';

export const adapter = new CliAdapter();
export const bot = new Bot<InMemoryUser>(adapter, {});

bot.addModule(getStartedModule);
