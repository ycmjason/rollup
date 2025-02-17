import type MagicString from 'magic-string';
import { type RenderOptions } from '../../utils/renderHelpers';
import { type CallOptions, NO_ARGS } from '../CallOptions';
import type { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH } from '../utils/PathTracker';
import type Identifier from './Identifier';
import * as NodeType from './NodeType';
import type TemplateLiteral from './TemplateLiteral';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class TaggedTemplateExpression extends NodeBase {
	declare quasi: TemplateLiteral;
	declare tag: ExpressionNode;
	declare type: NodeType.tTaggedTemplateExpression;

	private declare callOptions: CallOptions;

	bind(): void {
		super.bind();
		if (this.tag.type === NodeType.Identifier) {
			const name = (this.tag as Identifier).name;
			const variable = this.scope.findVariable(name);

			if (variable.isNamespace) {
				this.context.warn(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${name}')`
					},
					this.start
				);
			}
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		return (
			super.hasEffects(context) ||
			this.tag.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
		);
	}

	initialise(): void {
		this.callOptions = {
			args: NO_ARGS,
			thisParam: null,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions): void {
		this.tag.render(code, options, { isCalleeOfRenderedParent: true });
		this.quasi.render(code, options);
	}
}
