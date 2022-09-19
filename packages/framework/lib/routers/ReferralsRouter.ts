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

        const func = this.ruleMatcher(referer_uri || ref);
        if (func) {
            return func(user, referer_uri || ref);
        }

        const defaultFunc = this.ruleMatcher('default');
        if (defaultFunc) {
            return defaultFunc(user, referer_uri || ref);
        }

        throw new Error('Unkown referral type ' + referer_uri || ref);
    }
}
