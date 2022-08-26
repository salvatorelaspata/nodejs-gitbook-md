/* eslint-disable @typescript-eslint/no-explicit-any */
import { File, GitbookDocument, NodeDocument, Ref } from "../../interfaces";

export const gitbookDocumentToMdTS = (
	document: GitbookDocument,
	file: File[]
): any[] => {
	const aTypeMd: any[] = [];
	document.nodes &&
		document.nodes?.forEach((node) => {
			const typeMd = generateTypeMd(node, file);
			if (Array.isArray(typeMd)) {
				aTypeMd.push(...typeMd);
			} else {
				aTypeMd.push(typeMd);
			}
		});
	return aTypeMd;
};

// gestire array (p)
const generateTypeMd = (node: NodeDocument, files: File[]) => {
	let referenceFile: string | Ref, finded;
	const { nodes, type } = node;
	const firstNode = nodes && nodes[0];
	const firstLeaves = firstNode && firstNode.leaves && firstNode.leaves[0];
	const fNode =
		nodes && nodes.length > 0 && nodes[0].nodes && nodes[0].nodes[0];
	// const { ref: { file } } =
	if (nodes && nodes?.length > 0 && nodes[0].data) {
		referenceFile = (nodes[0].data || { ref: { file: "" } }) as Ref;
		finded = files.find((f) => f.uid === referenceFile) || {
			downloadURL: "not working",
		};
	}

	switch (type) {
		case "heading-1":
		case "heading-2":
		case "heading-3":
		case "heading-4":
		case "heading-5":
		case "heading-6":
			return { [`h${type.split("-")[1]}`]: firstLeaves?.text };
		// return `#`.repeat(parseInt(i)) + ` ${node.leaves[0].text}`
		case "paragraph":
			return { p: firstLeaves?.text };
		case "embed":
			// const { url } = node.data as Ref
			return { link: { title: node.data, source: node.data } };
		case "images":
			// nodes --> 'image'
			return { img: finded?.downloadURL };
		case "code":
			// nodes --> 'code-line'
			// const { syntax } = node.data as Ref
			return {
				code: {
					language: node.data || "",
					content: nodes?.map((n) => _codeDemm(n)),
				},
			};
		case "hint":
		case "blockquote":
			if (fNode && fNode.type !== "list-item" && fNode.leaves) {
				return { blockquote: fNode.leaves[0].text.toString() };
			}
			break;
		case "list-ordered":
			// nodes --> 'list-item'
			return { ol: nodes?.map((n) => _listDemm(n)) };
		case "list-unordered":
			// nodes --> 'list-item'
			return { ul: nodes?.map((n) => _listDemm(n)) };
		case "table":
			return { p: "DEBUG::NOT_WORKING - TABLE" };
		case "tabs":
			return { p: "DEBUG::NOT_WORKING - TABS" };
		case "tabs-item":
			return { p: "DEBUG::NOT_WORKING - TABS-ITEM" };
		case "file":
			return { p: "DEBUG::NOT_WORKING - FILE" };
		case "drawing":
			return { p: "DEBUG::NOT_WORKING - DRAWING" };
		default:
			console.log("default", node);
			break;
	}
};

const _listDemm = (n: NodeDocument) => {
	return n.nodes &&
		n.nodes.length > 0 &&
		n.nodes[0].nodes &&
		n.nodes[0].nodes.length > 0 &&
		n.nodes[0].nodes[0].leaves
		? n.nodes[0].nodes[0].leaves[0].text
		: "";
};

const _codeDemm = (n: NodeDocument) => {
	return n.nodes &&
		n.nodes.length > 0 &&
		n.nodes[0].leaves &&
		n.nodes[0].leaves.length > 0
		? n.nodes[0].leaves[0].text
		: "";
};
