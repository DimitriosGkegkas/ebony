import { EbonyHandlers, GenericAdapter, GenericAttachment, IRouters } from '@ebenos/framework';
import express, { Request, Response } from 'express';
import { json as bodyParser } from 'body-parser';
import senderFactory from './sender';
import { IViberMessageEvent, IViberSender, WebhookIncomingViberEvent } from './interfaces/webhook';
import { setWebhook } from './api/requests';
import { IViberSetWebhookResult } from './interfaces/api';
import { IUser } from '@ebenos/framework/lib/models/UserSchema';
import { isMediaMessage, IViberTextMessage } from './interfaces/message_types';
import { isPostbackTrackingData } from './interfaces/tracking_data';
import { Wit } from './nlpWit';

export interface IViberOptions {
    route?: string;
    authToken: string;
    welcomeMessage?: Record<string, unknown>;
    nlpKey?: string;
}

export default class ViberAdapter extends GenericAdapter {
    public operations = {
        handover: (): Promise<void> => {
            console.log('Not implemented!');
            return Promise.resolve();
        }
    };

    public sender;

    private welcomeMessage?: Record<string, unknown>;
    private route: string;
    private authToken: string;
    private nlp: Wit | undefined;
    public webhook = express();

    constructor(options: IViberOptions) {
        super();
        const { route = '/viber/webhook', authToken, welcomeMessage, nlpKey } = options;

        this.route = route;
        this.authToken = authToken;
        this.sender = senderFactory(this.authToken);
        this.welcomeMessage = welcomeMessage;
        if (nlpKey) this.nlp = new Wit(nlpKey);
    }

    public initialization(): void {
        this.webhook.use(bodyParser());
        this.webhook.post(
            this.route,
            viberWebhookFactory(this.routers, this.handlers, this.welcomeMessage, this.nlp)
        );
    }

    public setWebhook(url: string): Promise<IViberSetWebhookResult> {
        return setWebhook(url + this.route, this.authToken);
    }
}

function convertViberSenderToUser(sender: IViberSender): IUser {
    return {
        id: sender.id,
        firstName: sender.name,
        lastName: sender.name,
        data: {
            country: sender.country,
            avatar: sender.avatar,
            api_version: sender.api_version,
            language: sender.language
        }
    };
}

async function handleTextOnly(
    m: IViberTextMessage,
    user: IUser,
    textHandler: EbonyHandlers<any>['text'],
    nlp?: Wit
) {
    if (textHandler !== undefined) {
        const nlpResult = await nlp?.meaning(m.text);
        if (m.tracking_data)
            textHandler({ text: m.text, data: JSON.parse(m.tracking_data).data }, nlpResult, user);
        else textHandler({ text: m.text }, nlpResult, user);
        return;
    }

    console.log('No text handler');
    return;
}

function handleTextMessage(
    m: IViberTextMessage,
    user: IUser,
    textHandler: EbonyHandlers<any>['text'],
    routers: IRouters,
    nlp?: Wit
) {
    try {
        const parsedTrackingData = JSON.parse(m.tracking_data) as unknown;
        if (isPostbackTrackingData(parsedTrackingData)) {
            const payload = JSON.stringify({
                type: parsedTrackingData.type,
                text: m.text,
                data: parsedTrackingData.data
            });
            routerExists(routers.PostbackRouter).objectPayloadHandler(payload, user);
            return;
        }

        handleTextOnly(m, user, textHandler, nlp);
        return;
    } catch {
        handleTextOnly(m, user, textHandler, nlp);
        return;
    }
}

function viberWebhookFactory(
    routers: IRouters,
    handlers: EbonyHandlers<any>,
    welcomeMessage?: Record<string, unknown>,
    nlp?: Wit
) {
    function messageWebhook(e: IViberMessageEvent): void {
        const user = convertViberSenderToUser(e.sender);
        switch (e.message.type) {
            case 'text':
                handleTextMessage(e.message, user, handlers.text, routers, nlp);
                return;
            default:
                if (isMediaMessage(e.message)) {
                    if (handlers.attachment !== undefined) {
                        handlers.attachment(user, e.message as unknown as GenericAttachment);
                        return;
                    }
                    console.log('Not implemented!');
                    return;
                }
                console.log('Not implemented!');
                return;
        }
    }

    return (req: Request, res: Response) => {
        const body = req.body as WebhookIncomingViberEvent;

        if (body.event !== 'conversation_started') {
            res.status(200).send();
        }

        switch (body.event) {
            case 'message':
                messageWebhook(body);
                return;
            case 'seen':
                console.log('seen');
                return;
            case 'conversation_started':
                console.log('conversation_started');
                if (welcomeMessage !== undefined) {
                    res.json(welcomeMessage);
                } else {
                    res.status(200).send();
                }
                return;
            case 'delivered':
                console.log('delivered');
                return;
            case 'subscribed':
                console.log('subscribed');
                return;
            case 'unsubscribed':
                console.log('unsubscribed');
                return;
            case 'failed':
                console.log(`Failed: ${body.desc}`);
                return;
            case 'client_status':
                console.log('client_status');
                return;
            case 'webhook':
                console.log('Webhook connected');
                return;
            default:
                console.log('Unknown event type: ' + body);
                return;
        }
    };
}

function routerExists<T>(router: T | undefined): T {
    if (typeof router === 'undefined') {
        throw new Error('Router is undefined');
    }

    return router;
}
