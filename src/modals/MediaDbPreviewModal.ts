import {ButtonComponent, MarkdownRenderer, Modal, Setting} from 'obsidian';
import MediaDbPlugin from 'src/main';
import {MediaTypeModel} from 'src/models/MediaTypeModel';
import {PREVIEW_MODAL_DEFAULT_OPTIONS, PreviewModalData, PreviewModalOptions} from '../utils/ModalHelper';
import {CreateNoteOptions} from '../utils/Utils';

export class MediaDbPreviewModal extends Modal {
	plugin: MediaDbPlugin;

	createNoteOptions: CreateNoteOptions;
	elements: MediaTypeModel[];
	isBusy: boolean;
	title: string;
	cancelButton: ButtonComponent;
	submitButton: ButtonComponent;

	submitCallback: (previewModalData: PreviewModalData) => void;
	closeCallback: (err?: Error) => void;

	constructor(plugin: MediaDbPlugin, previewModalOptions: PreviewModalOptions) {
		previewModalOptions = Object.assign({}, PREVIEW_MODAL_DEFAULT_OPTIONS, previewModalOptions);

		super(plugin.app);

		this.plugin = plugin;
		this.title = previewModalOptions.modalTitle;
		this.elements = previewModalOptions.elements;
		this.createNoteOptions = previewModalOptions.createNoteOptions;
	}

	setSubmitCallback(submitCallback: (previewModalData: PreviewModalData) => void): void {
		this.submitCallback = submitCallback;
	}

	setCloseCallback(closeCallback: (err?: Error) => void): void {
		this.closeCallback = closeCallback;
	}

	async preview(): Promise<void> {
		let {contentEl} = this;
		contentEl.addClass('media-db-plugin-preview-modal');

		contentEl.createEl('h2', {text: this.title});

		const previewWrapper = contentEl.createDiv({cls: 'media-db-plugin-preview-wrapper'});

		for (let result of this.elements) {
			previewWrapper.createEl('h3', {text: result.englishTitle});
			const fileDiv = previewWrapper.createDiv();

			let fileContent = await this.plugin.generateMediaDbNoteContents(result, this.createNoteOptions);
			fileContent = `\n${fileContent}\n`;

			MarkdownRenderer.renderMarkdown(fileContent, fileDiv, null, null);
		}

		contentEl.createDiv({cls: 'media-db-plugin-spacer'});

		const bottomSettingRow = new Setting(contentEl);
		bottomSettingRow.addButton(btn => {
			btn.setButtonText('Cancel');
			btn.onClick(() => this.closeCallback());
			btn.buttonEl.addClass('media-db-plugin-button');
			this.cancelButton = btn;
		});
		bottomSettingRow.addButton(btn => {
			btn.setButtonText('Ok');
			btn.setCta();
			btn.onClick(() => this.submitCallback({confirmed: true}));
			btn.buttonEl.addClass('media-db-plugin-button');
			this.submitButton = btn;
		});
	}

	onOpen(): void {
		this.preview();
	}

	onClose(): void {
		this.closeCallback();
	}
}
