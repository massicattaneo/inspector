export const Node = markup => {
    const innerHtml = markup.replace(/^\s*/g, '').replace(/\n/g, '');
    const isTrElement = innerHtml.startsWith('<tr');
    const element = document.createElement(isTrElement ? 'table' : 'div');
    element.innerHTML = innerHtml;
    return isTrElement ? element.children[0].children[0] : element.children[0];
};

export const addHeadStyle = css => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
};

export const addCssClass = (...args) => {
    const [element, ...classes] = args;
    classes.forEach(className => {
        if (element.className) {
            if (!element.className.match(className)) {
                element.className += ` ${className}`;
            }
        } else {
            element.className = className;
        }
    });
};

export const removeCssClass = (...args) => {
    const [element, ...classes] = args;
    classes.forEach(className => {
        if (element.className.match(className)) {
            element.className = element.className
                .replace(className, '')
                .replace(/\s\s/g, ' ')
                .trim();
        }
    });
};

export const hasCssClass = (element, className) => {
    return element.className.match(className) !== null;
};

const supportsTouch = 'ontouchstart' in document.documentElement;
export const draggable = (node, draggableNode, onChange = event => event) => {
    let endPositionX = 0;
    let endPositionY = 0;
    let startPositionX = 0;
    let startPositionY = 0;

    const pointerMove = event => {
        const data = supportsTouch ? event.targetTouches[0] : event || window.event;
        endPositionX = startPositionX - data.clientX;
        endPositionY = startPositionY - data.clientY;
        startPositionX = data.clientX;
        startPositionY = data.clientY;
        const y = node.offsetTop - endPositionY;
        const x = node.offsetLeft - endPositionX;
        onChange(Math.round(x), Math.round(y));
    };

    const pointerUpEvent = supportsTouch ? 'touchend' : 'pointerup';
    const pointerMoveEvent = supportsTouch ? 'touchmove' : 'pointermove';
    const pointerDownEvent = supportsTouch ? 'touchstart' : 'pointerdown';

    const pointerUp = () => {
        document.removeEventListener(pointerUpEvent, pointerUp);
        document.removeEventListener(pointerMoveEvent, pointerMove);
    };

    const pointerDown = event => {
        event.preventDefault();
        const data = supportsTouch ? event.targetTouches[0] : event || window.event;
        startPositionX = data.clientX;
        startPositionY = data.clientY;
        document.addEventListener(pointerUpEvent, pointerUp);
        document.addEventListener(pointerMoveEvent, pointerMove);
    };

    draggableNode.addEventListener(pointerDownEvent, pointerDown);

    return node;
};

export const getQuerySelector = element => {
    const path = [element];
    const querySelector = [];
    let node = element;
    while (node.parentNode) {
        node = node.parentNode;
        path.push(node);
    }
    path.reverse()
        .filter(item => item.tagName)
        .filter(item => item.tagName !== 'HTML')
        .filter(item => item.tagName !== 'BODY')
        .filter(item => item)
        .filter(item => item.parentElement)
        .map(item => {
            const all = item.parentElement.querySelectorAll(item.tagName.toLowerCase());
            const arr = [];
            all.forEach(el => arr.push(el));
            const nth = arr.findIndex(el => el === item);
            querySelector.push({ selector: item.tagName.toLowerCase(), nth, id: item.id, className: item.className });
        });
    return querySelector;
};

export const bullets = (columns, rows) => {
    return new Array(columns)
        .fill(0)
        .map((first, row) => {
            return new Array(rows)
                .fill(0)
                .map((second, col) => `<div class="inspector-bullet" style="left: ${col * 8}px; top: ${row * 8}px"></div>`)
                .join('');
        })
        .join('');
};

export function copyTextToClipboard(value) {
    const copyText = document.createElement('textarea');
    copyText.style.position = 'absolute';
    copyText.style.left = '-99999px';
    document.body.appendChild(copyText);
    copyText.value = value;
    copyText.select();
    copyText.setSelectionRange(0, 99999999);
    document.execCommand('copy');
    document.body.removeChild(copyText);
}

export function downLoadJsonFile({ productInfo }, title, recording) {
    const name = productInfo.name || '';
    const jsonName = `${name.replace(/\\s/g, '_')}-recording-${title}.json`;
    const element = Node(`<a style="display:none" download="${jsonName}"></a>`);
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(recording, null, 4))}`;
    element.setAttribute('href', dataStr);
    element.click();
}
