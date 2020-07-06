import { EventEmitter } from './EventEmitter';

describe('EVENT EMITTER', () => {
    describe('On add a listener', () => {
        it('should call when the event is emitted', () => {
            const em = EventEmitter();
            const listener = jest.fn();
            em.on('event', listener);
            em.emit('event', 1, 2);
            expect(listener).toHaveBeenCalledWith(1, 2);
        });

        it('should return a function to remove the listener', () => {
            const em = EventEmitter();
            const listener = jest.fn();
            const remove = em.on('event', listener);
            remove();
            em.emit('event', 1, 2);
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('On removing a listener with off', () => {
        it('should not call the listener', () => {
            const em = EventEmitter();
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            em.on('event', listener1);
            em.on('event', listener2);
            const off = em.off('event', listener2);
            em.emit('event', 1, 2);
            expect(listener2).not.toHaveBeenCalled();
            expect(off).toEqual(listener2);
        });
    });

    describe('On using clear', () => {
        it('should remove all the listeners', () => {
            const em = EventEmitter();
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            em.on('event', listener1);
            em.on('event', listener2);
            em.clear();
            em.emit('event', 1, 2);
            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).not.toHaveBeenCalled();
        });
    });
});
