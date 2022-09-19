/**
 * ebony-framework
 *
 * @module utilities/ReferralMatcher
 * @license MIT
 *
 */
import { IPayload } from '../interfaces/payload';

export interface IReferralRule {
    regex: RegExp;
    action: (user: any, payload?: IPayload, ...args: any[]) => any;
}

/**
 * A Text Matcher
 */
export default class ReferralMatcher {
    private rules: IReferralRule[] = [];
    static ruleMatcher: any;

    /**
     * Adds text rules
     */
    public importRules(rules: IReferralRule[]): void {
        this.rules = this.rules.concat(rules);
    }

    public ruleMatcher(
        referral: string
    ): ((user: any, payload?: IPayload, ...args: any[]) => any) | false {
        const msg = referral.toUpperCase();
        for (const rule of this.rules) {
            const { regex, action } = rule;
            if (regex.test(msg)) {
                regex.lastIndex = 0;
                return action;
            }
        }

        return false;
    }
}
