import { Stack } from './Stack';

describe('STACK', () => {
    describe('When calling add', () => {
        it('should add the function to the stack', () => {
            const stack = Stack();
            const first = jest.fn(next => next());
            stack.add(first);
            stack.run();
            expect(first).toHaveBeenCalledTimes(1);
        });

        it('should run async callbacks in order', done => {
            const stack = Stack();
            const first = jest.fn(next => setTimeout(next, 200));
            const second = jest.fn(next => next());
            stack.add(first);
            stack.run();
            stack.add(second);
            stack.run(() => {
                expect(second).toHaveBeenCalledTimes(1);
                done();
            });
            expect(first).toHaveBeenCalledTimes(1);
            expect(second).not.toHaveBeenCalledTimes(1);
        });
    });

    describe('When calling run', () => {
        it('should return the result of the function', () => {
            const stack = Stack();
            const res = stack.run(() => 1);
            expect(res).toBe(1);
        });

        it('should maintain a context through callbacks', () => {
            const stack = Stack();
            stack.add(function(next) {
                this.value = 1;
                next();
            });
            stack.add(function(next) {
                next();
            });
            stack.run(function() {
                expect(this.value).toBe(1);
            });
        });
    });

    describe('When calling next with arguments', () => {
        it('should pass the arguments to the next callback', () => {
            const stack = Stack();
            const first = jest.fn(next => next(1, 2));
            const second = jest.fn((one, two, next) => {
                expect(one).toBe(1);
                expect(two).toBe(2);
                expect(next).toEqual(expect.any(Function));
            });
            stack.add(first);
            stack.add(second);
            stack.run();
        });

        it('should remember last arguments', () => {
            const stack = Stack();
            const first = jest.fn(next => next(1));
            const second = jest.fn((one, next) => {
                expect(one).toBe(1);
                expect(next).toEqual(expect.any(Function));
            });
            stack.run(first);
            stack.run(second);
        });
    });

    describe('When calliung the method clear', () => {
        it('should remove any action from the stack', () => {
            const stack = Stack();
            const first = jest.fn(next => next(1));
            stack.add(first);
            stack.clear();
            stack.run();
            expect(first).not.toHaveBeenCalled();
        });
    });
});
