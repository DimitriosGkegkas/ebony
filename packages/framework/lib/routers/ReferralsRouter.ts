/**
 * ebony-framework
 *
 * @module routers/ReferralsRouter
 * @author Christos Panagiotakopoulos <chrispanag@gmail.com>
 * @copyright Copyright(c) 2020 Christos Panagiotakopoulos
 * @license MIT
 *
 */

import ReferralMatcher from './ReferralMatcher';

export default class ReferralsRouter extends ReferralMatcher {
    public referralsRouter<U>(user: U, referral: Record<string, any>): any {
        const { ref, referer_uri } = referral;
        const refId = ref || referer_uri || 'default';

        const func = this.ruleMatcher(refId);
        if (func) {
            return func(user, refId);
        }

        const defaultFunc = this.ruleMatcher(refId);
        if (defaultFunc) {
            return defaultFunc(user, refId);
        }

        throw new Error('Unkown referral type ' + refId);
    }
}
