import React from 'react';
import MediaUpload from './MediaUpload';

export class DragDropUpload extends MediaUpload {
	componentDidMount() {
		this.root.addEventListener('dragenter', this.onHighlight, false);
		this.root.addEventListener('dragover', this.onHighlight, false);
		this.root.addEventListener('dragleave', this.onUnhighlight, false);
		this.root.addEventListener('drop', this.onDrop, false);
	}

	componentWillUnmount() {
		this.root.removeEventListener('dragenter', this.onHighlight);
		this.root.removeEventListener('dragover', this.onHighlight);
		this.root.removeEventListener('dragleave', this.Unhighlight);
		this.root.removeEventListener('drop', this.onDrop);
	}

	onHighlight = event => {
        event.preventDefault();
		this.setState({ highlight: true });
	};

	onUnhighlight = event => {
        event.preventDefault();
		this.setState({ highlight: false });
	};

	onDrop = event => {
        event.preventDefault();
		this.setState({ highlight: false });
        this.onSelectFile(this.props, event.dataTransfer.files[0]);
	};

	render() {
		return (
			<div
				ref={el => (this.root = el)}
				data-drag-highlight={this.state.highlight}
			>
				{this.props.children}
			</div>
		);
	}
}
