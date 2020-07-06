import { Middleware } from '../core/Middleware';

export function ImageMiddleware() {
    const middleware = Middleware();
    middleware.timestamps();
    const imageMiddleware = {
        beforeLoad: middleware.before(),
        afterLoad: middleware.after(),
        load: middleware.use(function (onload, ctx, next) {
            ctx.loadNext = function () {
                onload.call(ctx);
                next(ctx);
            };
        })
    };

    /**
     * Image Override
     */

    class _Image extends Image {
        set onload(onload) {
            const self = this;
            imageMiddleware.load(onload, self);
            Object.defineProperty(this, 'onload', {
               value: onload
            });
            super.onload = function () {
                self.loadNext();
            };
        }
    }

    window.Image = _Image;

    return imageMiddleware;
}
