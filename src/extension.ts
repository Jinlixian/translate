// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { subscribeToDocumentChanges, EMOJI_MENTION } from './diagnostics';
import * as humps from "humps";
import * as bTranslate from "baidu-translate-api";

// const COMMAND = 'translate.command';
const COMMAND_LINE = 'translate.line';
const COMMAND_WORD = 'translate.word';
var gLineText = '';
var gWordText = '';
const translation = (word: string) => {
	const { translator: { targetLanguage, detection, fromLanguage } } = vscode.workspace.getConfiguration();
	return bTranslate(word, { from: fromLanguage, to: targetLanguage });

};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// context.subscriptions.push(
	// 	vscode.languages.registerCodeActionsProvider('markdown', new Emojizer(), {
	// 		providedCodeActionKinds: Emojizer.providedCodeActionKinds
	// 	}));

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('*', new DoTran(), {
			providedCodeActionKinds: DoTran.providedCodeActionKinds
		}));



	// const emojiDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
	// context.subscriptions.push(emojiDiagnostics);

	// subscribeToDocumentChanges(context, emojiDiagnostics);

	// // context.subscriptions.push(
	// // 	vscode.languages.registerCodeActionsProvider('markdown', new Emojinfo(), {
	// // 		providedCodeActionKinds: Emojinfo.providedCodeActionKinds
	// // 	})
	// // );

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMAND_LINE, () => {
			const word = gLineText;
			// const word = gWordText;
			if (word) {
				const camelize = humps.camelize(word); // 转换为驼峰 'forBarBaz'
				const _word = humps.decamelize(camelize, {
					separator: ' ',
					// process: function (key, convert, options) {
					// 	return /^[A-Z0-9_]+$/.test(key) ? key : convert(key, options);
					//   }
				}); // 'foo bar baz'
				translation(_word).then(res => {
					vscode.window.showInformationMessage(res.trans_result.dst + " <= " + _word);
				});
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMAND_WORD, () => {
			// const word = gLineText;
			const word = gWordText;
			if (word) {
				const camelize = humps.camelize(word); // 转换为驼峰 'forBarBaz'
				const _word = humps.decamelize(camelize, {
					separator: ' ',
					// process: function (key, convert, options) {
					// 	return /^[A-Z0-9_]+$/.test(key) ? key : convert(key, options);
					//   }
				}); // 'foo bar baz'
				translation(_word).then(res => {
					vscode.window.showInformationMessage(res.trans_result.dst + " <= " + _word);
				});
			}
		})
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "translate.translate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('translate.translate', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('hello from translate.translate!');
		// translateWord();

		const word = gWordText;
		if (word) {
			const camelize = humps.camelize(word); // 转换为驼峰 'forBarBaz'
			const _word = humps.decamelize(camelize, {
				separator: ' ',
				// process: function (key, convert, options) {
				// 	return /^[A-Z0-9_]+$/.test(key) ? key : convert(key, options);
				//   }
			}); // 'foo bar baz'
			// vscode.window.showInformationMessage(_word + ' translate.translate!');
			translation(_word).then(res => {
				// vscode.window.showInformationMessage(_word + ' translate.translate!');
				vscode.window.showInformationMessage(res.trans_result.dst + " <= " + _word);
			});
		}
	});

	context.subscriptions.push(disposable);


}


export class DoTran implements vscode.CodeActionProvider {

	// public static readonly providedCodeActionKinds = [
	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		const trLine = new vscode.CodeAction(`Translate Line`, vscode.CodeActionKind.QuickFix);
		const trWord = new vscode.CodeAction(`Translate Word`, vscode.CodeActionKind.QuickFix);
		const start = range.start;
		const line = document.lineAt(start.line);
		// start.with
		gWordText = document.getText(document.getWordRangeAtPosition(start));
		// gWordText = document.getText(range);
		// return
		// line.text[start.character] === ':' && line.text[start.character + 1] === ')';

		// const t = line.text;

		gLineText = line.text;
		trLine.command = { command: COMMAND_LINE, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
		trWord.command = { command: COMMAND_WORD, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
		// const moveDefinitionToCppfile = trLine;

		// const word = document.getText(vscode.window.activeTextEditor?.selection);

		// const word = "test";
		// if (word) {
		// 	const _world = humps.camelize(word);
		// 	// return translation(_world).then(res => {
		// 	// 	const content = new vscode.MarkdownString(`#### ${res.trans_result.dst}`);
		// 	// 	return new vscode.Hover(content);
		// 	// });

		// 	 translation(_world).then(res => {
		// 		const content = new vscode.MarkdownString(`#### ${res.trans_result.dst}`);
		// 		return new vscode.Hover(content);
		// 	});
		// }

		return [
			// replaceWithSmileyCatFix,	
			// moveDefinitionToCppfile
			trWord,
			trLine,
		];


	}


	// TODO: 判断是不是头文件中的function。
	private isCppFunctionInH(document: vscode.TextDocument, range: vscode.Range) {
		// const start = range.start;
		// const line = document.lineAt(start.line);
		// return line.text[start.character] === ':' && line.text[start.character + 1] === ')';
		return true;
	}

	private createFix(document: vscode.TextDocument, range: vscode.Range, emoji: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
		// fix.command = { command: COMMAND, title: 'hello' };

		// fix.edit = new vscode.WorkspaceEdit();
		// fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
		return fix;
	}

	// private createCommand(): vscode.CodeAction {
	// 	const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.Empty);
	// 	action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
	// 	return action;
	// }

}

function translateWord() {
	const word = gWordText;
	if (word) {
		const camelize = humps.camelize(word); // 转换为驼峰 'forBarBaz'
		const _word = humps.decamelize(camelize, {
			separator: ' ',
			// process: function (key, convert, options) {
			// 	return /^[A-Z0-9_]+$/.test(key) ? key : convert(key, options);
			//   }
		}); // 'foo bar baz'
		translation(_word).then(res => {
			vscode.window.showInformationMessage(res.trans_result.dst + " <= " + _word);
		});
	}

}
// export class Emojizer implements vscode.CodeActionProvider {

// 	public static readonly providedCodeActionKinds = [
// 		vscode.CodeActionKind.QuickFix
// 	];

// 	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
// 		if (!this.isAtStartOfSmiley(document, range)) {
// 			return;
// 		}

// 		const replaceWithSmileyCatFix = this.createFix(document, range, '😺');

// 		const replaceWithSmileyFix = this.createFix(document, range, '😀');
// 		// Marking a single fix as `preferred` means that users can apply it with a
// 		// single keyboard shortcut using the `Auto Fix` command.
// 		replaceWithSmileyFix.isPreferred = true;

// 		const replaceWithSmileyHankyFix = this.createFix(document, range, '💩');

// 		const commandAction = this.createCommand();

// 		return [
// 			replaceWithSmileyCatFix,
// 			replaceWithSmileyFix,
// 			replaceWithSmileyHankyFix,
// 			commandAction
// 		];
// 	}

// 	private isAtStartOfSmiley(document: vscode.TextDocument, range: vscode.Range) {
// 		const start = range.start;
// 		const line = document.lineAt(start.line);
// 		return line.text[start.character] === ':' && line.text[start.character + 1] === ')';
// 	}

// 	private createFix(document: vscode.TextDocument, range: vscode.Range, emoji: string): vscode.CodeAction {
// 		const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
// 		fix.edit = new vscode.WorkspaceEdit();
// 		fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
// 		return fix;
// 	}

// 	private createCommand(): vscode.CodeAction {
// 		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.Empty);
// 		action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
// 		return action;
// 	}
// }

/**
 * Provides code actions corresponding to diagnostic problems.
 */
// export class Emojinfo implements vscode.CodeActionProvider {

// 	public static readonly providedCodeActionKinds = [
// 		vscode.CodeActionKind.QuickFix
// 	];

// 	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
// 		// for each diagnostic entry that has the matching `code`, create a code action command
// 		return context.diagnostics
// 			.filter(diagnostic => diagnostic.code === EMOJI_MENTION)
// 			.map(diagnostic => this.createCommandCodeAction(diagnostic));
// 	}

// 	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
// 		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.QuickFix);
// 		action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
// 		action.diagnostics = [diagnostic];
// 		action.isPreferred = true;
// 		return action;
// 	}
// }

// this method is called when your extension is deactivated
export function deactivate() { }
