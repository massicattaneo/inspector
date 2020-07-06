import { Middleware } from './Middleware';

describe('MIDDLEWARE', () => {
    describe('On creating a middleware', () => {
        it('should have use, before, after methods', () => {
            const mw = Middleware();
            expect(mw.after()).toEqual(expect.any(Function));
            expect(mw.before()).toEqual(expect.any(Function));
            expect(mw.use()).toEqual(expect.any(Function));
        });
    });

    describe('On using the method before', () => {
        it('should not call the original if before do not go to next', () => {
            const mw = Middleware();
            const before = jest.fn();
            const original = jest.fn();
            const use = mw.use(original);
            mw.before()(before);
            use();
            expect(before).toHaveBeenCalledWith(expect.any(Function));
            expect(original).not.toHaveBeenCalled();
        });

        it('should call the original if before do go to next', () => {
            const mw = Middleware();
            const before = jest.fn((one, next) => next());
            const original = jest.fn();
            const overridden = mw.use(original);
            mw.before()(before);
            overridden(1);
            expect(before).toHaveBeenCalledWith(1, expect.any(Function));
            expect(original).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should call the original with arguments', () => {
            const mw = Middleware();
            const before = jest.fn((one, next) => next(one));
            const original = jest.fn();
            const overridden = mw.use(original);
            mw.before()(before);
            overridden(1);
            expect(before).toHaveBeenCalledWith(1, expect.any(Function));
            expect(original).toHaveBeenCalledWith(1, expect.any(Function));
        });

        it('should call all the before functions', () => {
            const mw = Middleware();
            const before1 = jest.fn(next => next());
            const before2 = jest.fn(next => next());
            const original = jest.fn();
            const overridden = mw.use(original);
            mw.before()(before1);
            mw.before()(before2);
            overridden();
            expect(before1).toHaveBeenCalledWith(expect.any(Function));
            expect(before2).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should return a function to add a stack callback', () => {
            const mw = Middleware();
            const before = jest.fn(next => next());
            const original = jest.fn(next => {
                next();
                return 'result';
            });
            const overridden = mw.use(original);
            mw.before()(before);
            const result = overridden();
            expect(result).toEqual(expect.any(Function));
            const fn = jest.fn();
            const value = result(fn);
            expect(fn).toHaveBeenCalled();
            expect(value).toEqual('result');
        });
    });

    describe('On using the method after', () => {
        it('should not call if the original do no go to after', () => {
            const mw = Middleware();
            const after = jest.fn();
            const original = jest.fn();
            const use = mw.use(original);
            mw.after()(after);
            use();
            expect(after).not.toHaveBeenCalled();
        });

        it('should call if the original go to after', () => {
            const mw = Middleware();
            const after = jest.fn();
            const original = jest.fn(next => next(1));
            const use = mw.use(original);
            mw.after()(after);
            use();
            expect(after).toHaveBeenCalledWith(1, expect.any(Function));
        });
    });

    describe('On instantiating with autoProceedToAfter option', () => {
        it('should call after also if the original do no go to after', () => {
            const mw = Middleware({ autoProceedToAfter: true });
            const after = jest.fn();
            const original = jest.fn(() => 1);
            const use = mw.use(original);
            mw.after()(after);
            use(1);
            expect(after).toHaveBeenCalledWith(1, expect.any(Function));
        });
    });

    describe('On using timestamps', () => {
        it('should add the timestamps to the context', () => {
            const mw = Middleware();
            mw.timestamps();
            const before = jest.fn((one, next) => next(one));
            const original = jest.fn((one, next) => next(one));
            const use = mw.use(original);
            mw.before()(before);
            use(1)(function() {
                expect(this).toEqual({
                    timestamps: {
                        start: expect.any(Number),
                        end: expect.any(Number),
                        duration: expect.any(Number)
                    }
                });
            });
        });
    });

    describe('On using the context', () => {
        it('should maintain it to the calls stack', () => {
            const mw = Middleware({ autoProceedToAfter: true });
            const original = jest.fn();
            const use = mw.use(original);
            mw.before()(
                jest.fn(function(next) {
                    this.value = 1;
                    next();
                })
            );
            const second = jest.fn(function() {
                expect(this.value).toEqual(1);
            });
            mw.before()(second);
            use();
            expect(second).toHaveBeenCalled();
        });
    });
});
