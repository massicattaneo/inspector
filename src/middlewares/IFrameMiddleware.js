import { Middleware } from '../core/Middleware';
import { HttpRequestMiddleware } from './HttpRequestMiddleware';

export function IFrameMiddleware(context) {
    const { params } = context;
    const middleware = Middleware();

    middleware.timestamps();
    const iframeMiddleware = {
        beforeSend: middleware.before(),
        afterSend: middleware.after(),
        send: middleware.use(function (request, data, next) {
            request.sendNext = () => {
                next(request, data);
            };
        })
    };

    const _old = HTMLIFrameElement.prototype.setAttribute;
    HTMLIFrameElement.prototype.setAttribute = function (name, value) {
        const original = '/';
        const receiver = '/';
        _old.call(this, name, value.replace(original, receiver));
    };

    const _createElement = document.createElement;
    document.createElement = function (elementName = '') {
        const iframe = _createElement.call(this, elementName);
        let activeObj = {};

        if (elementName.toLowerCase() === 'iframe') {
            iframe.addEventListener('load', function () {
                try {
                    iframe.contentWindow.addEventListener('message', (event) => {
                        let data = {};
                        try {
                            data = JSON.parse(event.data);
                        } catch (e) {
                        }
                        if (data.signature === 'inspector' && data.request) {
                            activeObj = {
                                url: data.url
                            };
                            iframeMiddleware.send(activeObj, data.request);
                        }
                        if (data.signature === 'inspector' && data.response) {
                            Object.assign(activeObj, {
                                responseText: data.response,
                                getAllResponseHeaders: () => {
                                    return data.headers;
                                }
                            });
                            activeObj.sendNext();
                        }
                    });
                    if (params.isReplaying) {
                        HttpRequestMiddleware(context, iframe.contentWindow);
                    }
                } catch (e) {
                    console.warn('CANNOT ACCESS', iframe.getAttribute('src'))
                }


            });
        }
        return iframe;
    };

    return iframeMiddleware;
}
