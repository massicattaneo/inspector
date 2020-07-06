import { Thread } from './Thread';

jest.useFakeTimers();

describe('THREAD', () => {
    beforeEach(() => {
        jest.clearAllTimers();
    });

    describe('When passing some statements', () => {
        it('should permit to call by statement name', () => {
            const fn = jest.fn(function() {
                expect(this.sharedContext).toEqual(expect.any(Object));
                expect(this.thread).toBe(thread);
                expect(this.threadName).toBe('THREAD test');
            });
            const thread = Thread({ fn }, {}, { name: 'test' });
            thread.main('fn');
            expect(fn).toHaveBeenCalled();
        });

        it('should permit to call with arguments', () => {
            const fn = jest.fn();
            const thread = Thread({ fn });
            thread.main('fn', 1, 2);
            expect(fn).toHaveBeenCalledWith(1, 2);
        });

        it('should permit to call with a function', () => {
            const fn = function(...args) {
                expect(args).toEqual([1, 2]);
            };
            const thread = Thread();
            thread.main(fn, 1, 2);
        });
    });

    describe('when using extend', () => {
        it('should extend the context', () => {
            const fn1 = jest.fn(() => ({ value: 1 }));
            const fn2 = jest.fn(function() {
                expect(this.value).toBe(1);
            });
            const thread = Thread({ fn1, fn2 });
            thread.main('fn1')(thread.extend);
            thread.main('fn2');
            expect(fn2).toHaveBeenCalled();
        });
    });

    describe('when passing a sharedContext', () => {
        it('should add it to the calls', () => {
            const fn = jest.fn(function() {
                expect(this.sharedContext.value).toEqual(1);
            });
            const sharedContext = { value: 1 };
            const thread = Thread({ fn }, sharedContext);
            thread.main('fn');
            expect(fn).toHaveBeenCalled();
        });
    });

    describe('when using before', () => {
        it('should call it before any main call', () => {
            const fn = jest.fn();
            const thread = Thread({ fn });
            thread.before(function(threadName, one, next) {
                next(threadName, 2);
            });
            thread.main('fn', 1);
            expect(fn).toHaveBeenCalledWith(2);
        });
    });

    describe('when returning calculations', () => {
        const fn = jest.fn((a, b) => a * b);
        const thread = Thread({ fn });
        const result = thread.main('fn', 3, 4)();
        expect(result).toEqual(fn(3, 4));
    });

    describe('when using promise', () => {
        it('should return the main promise', async () => {
            const fn = jest.fn(function() {
                return new Promise(resolve => setTimeout(() => resolve(1), 200));
            });
            const result = jest.fn(function(one) {
                expect(one).toEqual(1);
            });
            const thread = Thread({ fn });
            const promise = thread.main('fn')();
            expect(promise).toBeInstanceOf(Promise);
            await jest.runAllTimers();
            await promise.then(result);
            expect(result).toHaveBeenCalled();
        });
    });
});
