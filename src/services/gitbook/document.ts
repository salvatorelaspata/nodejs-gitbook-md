import { File, GitbookDocument, NodeDocument, Ref } from '../../interfaces'

export const gitbookDocumentToMd = (document: GitbookDocument, file: File[]): any[] => {
  const aTypeMd = []
  document.nodes && document.nodes.forEach(
    node => {
      const typeMd = generateTypeMd(node, file)
      if (Array.isArray(typeMd)) {
        aTypeMd.push(...typeMd)
      } else {
        aTypeMd.push(typeMd)
      }
    }
  )
  return aTypeMd
}

// gestire array (p)
const generateTypeMd = (node: NodeDocument, files: File[]) => {
  let referenceFile, finded
  // const { ref: { file } } =
  if (node.nodes && node.nodes.length > 0 && node.nodes[0].data) {
    referenceFile = (node.nodes[0].data || { ref: { file: '' } }) as Ref
    finded = files.find(f => f.uid === referenceFile) || { downloadURL: 'not working' }
  }

  switch (node.type) {
    case 'heading-1':
    case 'heading-2':
    case 'heading-3':
    case 'heading-4':
    case 'heading-5':
    case 'heading-6':
      return { [`h${node.type.split('-')[1]}`]: node.nodes[0].leaves[0].text }
    // return `#`.repeat(parseInt(i)) + ` ${node.leaves[0].text}`
    case 'paragraph':
      // const paragrafi = node.nodes && node.nodes.map((n) => n.leaves && n.leaves.map(l => { p: l.text }))
      return { p: node.nodes[0].leaves[0].text } // paragrafi
    case 'embed':
      // const { url } = node.data as Ref
      return { link: { title: node.data, source: node.data } }
    case 'images':
      // node.nodes --> 'image'
      return { img: finded.downloadURL }
    case 'code':
      // node.nodes --> 'code-line'
      // const { syntax } = node.data as Ref
      return {
        code: {
          language: node.data || '',
          content: node.nodes.map((n) => n.nodes[0].leaves[0].text)
        }
      }
    case 'hint':
    case 'blockquote':
      // debugger
      // debugger
      if (node.nodes[0].nodes[0].type !== 'list-item') {
        return { blockquote: (node.nodes[0].nodes[0].leaves[0].text).toString() }
      }
      break

    case 'list-ordered':
      // debugger
      // node.nodes --> 'list-item'
      return { ol: node.nodes.map(n => n.nodes[0].nodes[0].leaves[0].text) }
    case 'list-unordered':
      // debugger
      // node.nodes --> 'list-item'
      return { ul: node.nodes.map(n => n.nodes[0].nodes[0].leaves[0].text) }
    // case 'tabs':
    // debugger
    default:
      console.log('default', node)
      break
  }
}
