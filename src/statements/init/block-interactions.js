import { Node } from '../../utils/html-utils';

export default function () {
    const blockInteractions = Node('<marquee class="inspector-block-interactions">INSPECTOR WAITING FOR ASSETS LOADED</marquee>');
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(blockInteractions);
    })
    return { blockInteractions };
}
