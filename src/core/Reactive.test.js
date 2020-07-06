import { create, connect, use } from './Reactive';

describe('REACTIVE', () => {
    describe('When creating a store', () => {
        it('should loop through all the object props', () => {
            const rx = create({ a: 1, b: { c: 2 } });
            expect(rx.a).toEqual(expect.any(Object));
            expect(rx.b).toEqual(expect.any(Object));
            expect(rx.b.c).toEqual(expect.any(Object));
        });

        it('should transform values to observables', () => {
            const rx = create({ a: 1 });
            expect(rx.a.get()).toEqual(1);
        });

        it('should consider observables as values', () => {
            const rx = create({ a: 1 });
            expect(rx.a + 1).toEqual(2);
        });

        it('should consider observables as strings', () => {
            const rx = create({ a: 1 });
            expect(`value: ${rx.a}`).toEqual('value: 1');
        });

        it('should permit to set the value', () => {
            const rx = create({ a: 1 });
            rx.a.set(2);
            expect(rx.a.get()).toEqual(2);
        });

        it('should permit to compare the value', () => {
            const rx = create({ a: 1 });
            expect(rx.a.is(1)).toEqual(true);
            expect(rx.a.is('1')).toEqual(false);
        });

        it('should permit to reverse the value', () => {
            const rx = create({ a: false });
            rx.a.reverse();
            expect(rx.a.get()).toEqual(true);
        });
    });

    describe('when connecting a store', () => {
        it('should react to changes', () => {
            const rx = create({ a: 1 });
            let times = 1;
            const reaction = jest.fn(({ change }) => {
                expect(change.get()).toEqual(times++);
            });
            connect({ change: rx.a }, reaction);
            rx.a.set(2);
            expect(reaction).toHaveBeenCalledTimes(2);
        });

        it('should return a function for removing reaction', () => {
            const rx = create({ a: 1 });
            const reaction = jest.fn();
            const remove = connect({ change: rx.a }, reaction);
            remove();
            rx.a.set(2);
            expect(reaction).toHaveBeenCalledTimes(1);
        });
    });

    describe('when using a before filter', () => {
        it('should call use fn before (1)', () => {
            const rx = create({ a: 1 });
            const useFn = jest.fn(function(store, next) {
                expect(store.a.get()).toEqual(1);
                store.a.update(2);
                next();
            });
            const connectFn = jest.fn(function({ a }) {
                expect(a.get()).toEqual(2);
            });
            use(rx, useFn);
            connect(rx, connectFn);
            expect(useFn).toHaveBeenCalled();
            expect(connectFn).toHaveBeenCalled();
        });

        it('should call use fn before (2)', () => {
            const rx = create({ a: 1 });
            let times = 1;
            const useFn = jest.fn(function(store, next) {
                store.a.update(2);
                next();
            });
            const connectFn = jest.fn(function({ a }) {
                expect(a.get()).toEqual(times++);
            });
            connect(rx, connectFn);
            use(rx, useFn);
            rx.a.set(3);
            expect(useFn).toHaveBeenCalled();
            expect(connectFn).toHaveBeenCalled();
        });
    });

    describe('When creating a store with and array', () => {
        it('should have the push methods reacting', () => {
            const rx = create({ array: [] });
            const connectFn = jest.fn(function({ array }) {
                expect(array.get()).toEqual(rx.array.get());
            });
            connect(rx, connectFn);
            rx.array.push(1);
            expect(connectFn).toHaveBeenCalledTimes(2);
        });
        it('should have the splice methods reacting', () => {
            const rx = create({ array: [1] });
            const connectFn = jest.fn(function({ array }) {
                expect(array.get()).toEqual(rx.array.get());
            });
            connect(rx, connectFn);
            rx.array.splice(0, 1);
            expect(connectFn).toHaveBeenCalledTimes(2);
        });
        it('should have the unshift methods reacting', () => {
            const rx = create({ array: [1] });
            const connectFn = jest.fn(function({ array }) {
                expect(array.get()).toEqual(rx.array.get());
            });
            connect(rx, connectFn);
            rx.array.unshift(2);
            expect(connectFn).toHaveBeenCalledTimes(2);
        });
    });
});
