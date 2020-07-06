import { Middleware } from '../core/Middleware';

export function LocalStorageMiddleware() {
    const _setItem = window.Storage.prototype.setItem;
    const middleware = Middleware();
    middleware.timestamps();

    const localStorageMiddleware = {
        beforeSetItem: middleware.before(),
        setItem: middleware.use(function(key, value, context, next) {
            _setItem.call(context, key, value);
            next();
        })
    };

    window.Storage.prototype.setItem = function(key, value) {
        localStorageMiddleware.setItem(key, value, this);
    };

    window.Storage.prototype.originalSetItem = function(key, value) {
        _setItem.call(this, key, value);
    };

    return localStorageMiddleware;
}
