import { Bot, TestAdapter, InMemoryUser } from '@ebenos2/framework';

import getStartedModule from './modules/getStarted';

export const adapter = new TestAdapter();
export const bot = new Bot<InMemoryUser>(adapter, {});

bot.addModule(getStartedModule);
