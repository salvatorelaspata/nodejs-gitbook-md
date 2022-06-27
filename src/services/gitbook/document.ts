import { File, GitbookDocument, Image, NodeDocument, Ref } from '../../interfaces';

export const gitbookDocumentToMd = (document: GitbookDocument, file: File[]): any[] => {
    const aTypeMd = [];
    document.nodes && document.nodes.map(
        node => {
            const typeMd = generateTypeMd(node, file);
            if (Array.isArray(typeMd)) {
                debugger;
                aTypeMd.push(...typeMd);
            } else {
                aTypeMd.push(typeMd);
            }
        }
    );
    return aTypeMd;
}

// gestire array (p)

const generateTypeMd = (node: NodeDocument, files: File[]) => {
    switch (node.type) {
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
        case 'heading-4':
        case 'heading-5':
        case 'heading-6':
            const i = node.type.split('-')[1]
            return { [`h${i}`]: node.nodes[0].leaves[0].text };
        //return `#`.repeat(parseInt(i)) + ` ${node.leaves[0].text}`;
        case 'paragraph':
            // const paragrafi = node.nodes && node.nodes.map((n) => n.leaves && n.leaves.map(l => { p: l.text }))
            return { p: node.nodes[0].leaves[0].text }; //paragrafi;
        case 'embed':
            const { url } = node.data as Ref;
            return { link: { title: url, source: url } };
        case 'images':
            // node.nodes --> 'image'
            const { ref: { file } } = node.nodes[0].data as Ref;
            const finded = files.find(f => f.uid === file)
            return { img: finded.downloadURL };
        case 'code':
            // node.nodes --> 'code-line'
            const { syntax } = node.data as Ref;
            return {
                code: {
                    language: syntax || '',
                    content: node.nodes.map((n) => n.nodes[0].leaves[0].text)
                }
            }
        case 'hint':
        case 'blockquote':
            // debugger;
            // debugger;
            if (node.nodes[0].nodes[0].type !== 'list-item') {
                return { blockquote: (node.nodes[0].nodes[0].leaves[0].text).toString() };
            }
            break;

        case 'list-ordered':
            // debugger
            // node.nodes --> 'list-item'
            return { ol: node.nodes.map(n => n.nodes[0].nodes[0].leaves[0].text) };
        case 'list-unordered':
            // debugger
            // node.nodes --> 'list-item'
            return { ul: node.nodes.map(n => n.nodes[0].nodes[0].leaves[0].text) };
        // case 'tabs':
        // debugger
        default:
            console.log('default', node);
            break;
    }
}