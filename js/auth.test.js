import { expect } from 'chai';
import { setUser, getUser } from './auth';

describe('auth', () => {
    describe('setUser', () => {
        it('should change the user returned by getUser', () => {
            setUser({ id: 123 });

            expect(getUser().id).to.equal(123);
        })
    })
})