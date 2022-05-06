import {
    IViberSendMessageResult,
    IViberSetWebhook,
    IViberSetWebhookResult
} from '../interfaces/api';
import { EventType } from '../interfaces/webhook';
import viberRequest from './viberRequest';

export function setWebhook(
    webhookUrl: string,
    authToken: string,
    events?: EventType[]
): Promise<IViberSetWebhookResult> {
    const body: IViberSetWebhook = {
        url: webhookUrl
    };
    if (events) {
        body['event_types'] = events;
    }
    return viberRequest('set_webhook', body, authToken) as Promise<IViberSetWebhookResult>;
}

export function sendMessage(
    receiver: string,
    messageBody: Record<string, unknown>,
    authToken: string
): Promise<IViberSendMessageResult> {
    const body = {
        receiver,
        ...messageBody
    };

    return viberRequest('send_message', body, authToken) as Promise<IViberSendMessageResult>;
}
