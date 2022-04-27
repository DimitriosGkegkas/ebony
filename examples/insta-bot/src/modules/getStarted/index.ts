import { createModule, InMemoryUser, Module } from '@ebenos2/framework';

const getStartedModule: Module<InMemoryUser> = createModule('getStarted');

export default getStartedModule;

import './actions';
