import { SERVER, VERSION } from '../../core/constants';

const { Css = e => e, Font = e => e, Http = e => e, Script = e => e } = {};

function getVendorManifest() {
    return [
        {
            url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/fonts/fontawesome.ttf`,
            name: 'fontawesome',
            type: 'font',
            stage: 'inspector-resources'
        }
    ];
}

export default function () {
    const { system, params } = this;

    document.addEventListener('DOMContentLoaded', () => {
        system
            .addFileLoader(['css'], Css(system.info()))
            .addFileLoader(['script'], Script(system.info()))
            .addFileLoader(['font'], Font({ extraChars: ' &#xf06e;' }))
            .addFileLoader(['json'], Http(system.info()))
            .addFileManifest(getVendorManifest())
            .loadStageFiles('inspector-resources')
            .start()
            .then(function () {
                const vendors = [
                    {
                        url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/vis-timeline-graph2d.min.js`,
                        type: 'script',
                        stage: 'vendors'
                    },
                    {
                        qualities: { '0.5': { url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/vis-timeline-graph2d.min.css` } },
                        type: 'css',
                        stage: 'vendors'
                    },
                    {
                        url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/jsoneditor.min.js`,
                        type: 'script',
                        stage: 'vendors'
                    },
                    {
                        qualities: { '0.5': { url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/jsoneditor.min.css` } },
                        type: 'css',
                        stage: 'vendors'
                    },
                    {
                        url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/codemirror.js`,
                        type: 'script',
                        stage: 'vendors'
                    },
                    {
                        qualities: { '0.5': { url: `${SERVER.DEPLOY_PATHNAME}/${VERSION}/assets/js/codemirror.css` } },
                        type: 'css',
                        stage: 'vendors'
                    }
                ];
                system
                    .addFileManifest(vendors)
                    .loadStageFiles('vendors')
                    .start();
            });
    });
}
