import { Scheduler } from './Scheduler';

const fn1 = jest.fn();
const fn2 = jest.fn();
const fn3 = jest.fn();
const fn4 = jest.fn();
const fn5 = jest.fn();
const fn6 = jest.fn();
const array = [
    { timestamps: { duration: 40 }, scheduledAction: fn1 },
    { timestamps: { duration: 10 }, scheduledAction: fn2 },
    { timestamps: { duration: 10 }, scheduledAction: fn3 }
];

jest.useFakeTimers();

describe('SCHEDULER', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('When no action is resolved', () => {
        it('Should not call the scheduledActions', async () => {
            const scheduler = Scheduler();
            scheduler.schedule(array);
            await jest.advanceTimersByTime(300);
            expect(fn1).not.toHaveBeenCalled();
        });
    });

    describe('When a action is resolved', () => {
        it('should call the scheduledAction', async () => {
            const scheduler = Scheduler();
            scheduler.schedule(array);
            scheduler.resolve(0, 'test');
            await jest.advanceTimersByTime(1000);
            expect(fn1).toHaveBeenCalledWith('test');
            expect(fn2).not.toHaveBeenCalled();
        });

        it('should call the scheduledAction after the correct time', async () => {
            const scheduler = Scheduler();
            scheduler.schedule(array);
            let promise;
            scheduler.resolve(0)(inner => promise = inner);
            expect(promise).toBeInstanceOf(Promise);
            await jest.advanceTimersByTime(300);
            expect(fn1).toHaveBeenCalled();
            await promise;
            await jest.advanceTimersByTime(300);
            scheduler.resolve(1);
            expect(fn2).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(11);
            expect(fn2).toHaveBeenCalled();
        });
    });

    describe('When a new set of actions is scheduled', () => {
        it('should clear and not fire the previous ones', async () => {
            const scheduler = Scheduler();
            scheduler.schedule(array);
            scheduler.resolve(0);
            scheduler.schedule([{}]);
            await jest.advanceTimersByTime(100);
            expect(fn1).not.toHaveBeenCalled();
        });
    });

    describe('When creating a list with some element autoresolved', () => {
        it('should fire them automatically', async () => {
            const arrayAutoResolve = [
                { timestamps: { duration: 40 }, scheduledAction: fn1, autoResolve: true, item: 1 },
                { timestamps: { duration: 10 }, scheduledAction: fn2, autoResolve: true, item: 2 },
                { timestamps: { duration: 10 }, scheduledAction: fn3, item: 3 },
                { timestamps: { duration: 10 }, scheduledAction: fn4, autoResolve: true, item: 4 },
                { timestamps: { duration: 10 }, scheduledAction: fn5, autoResolve: true, item: 5 },
                { timestamps: { duration: 10 }, scheduledAction: fn6, autoResolve: true, item: 6 }
            ];

            const scheduler = Scheduler();
            scheduler.schedule(arrayAutoResolve);
            expect(scheduler.findNextIndex()).toEqual(1);
            await jest.advanceTimersByTime(60000);
            expect(fn1).toHaveBeenCalled();
            expect(fn2).toHaveBeenCalled();
            expect(scheduler.findNextIndex()).toEqual(2);
            expect(fn3).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(110000000);
            expect(scheduler.findNextIndex()).toEqual(2);
            scheduler.resolve(2);
            expect(fn3).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(11);
            expect(fn3).toHaveBeenCalled();
            expect(fn4).not.toHaveBeenCalled();
            expect(fn5).not.toHaveBeenCalled();
            expect(fn6).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(11);
            expect(fn4).toHaveBeenCalled();
            expect(fn5).not.toHaveBeenCalled();
            expect(fn6).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(11);
            expect(fn4).toHaveBeenCalled();
            expect(fn5).toHaveBeenCalled();
            expect(fn6).not.toHaveBeenCalled();
            await jest.advanceTimersByTime(11);
            expect(fn4).toHaveBeenCalled();
            expect(fn5).toHaveBeenCalled();
            expect(fn6).toHaveBeenCalled();
        });
    });
});
