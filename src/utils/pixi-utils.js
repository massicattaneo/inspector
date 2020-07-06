export function getPIXIELement(name, child = window.qa.screen.stage) {
    if (child.getChildByName(name)) return child;
    let ret;
    for (let i = 0; i < child.children.length; i++) {
        ret = getPIXIELement(name, child.children[i]);
        if (ret) break;
    }
    return ret;
}
