import { createModule, InMemoryUser, Module } from '@ebenos2/framework';

import { preMiddlewares } from './middlewares';

const getStartedModule: Module<InMemoryUser> = createModule('getStarted');
getStartedModule.preMiddlewares = preMiddlewares;

export default getStartedModule;

import './actions';
