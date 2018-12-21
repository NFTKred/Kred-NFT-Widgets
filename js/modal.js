import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { errorNotification } from './notification';

export function openModal(Modal, props = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // for all other modals, remove them once hidden
    $(container).on('hidden.bs.modal', () => {
        container.remove();
    });

    ReactDOM.render(<Modal {...props} />, container);

    $(container).children().modal('show');
}

export async function openAsyncModal(componentPromise, props = {}) {
    const placeholder = getPlaceholder();

    const container = document.createElement('div');
    container.appendChild(placeholder);
    document.body.appendChild(container);

    $(placeholder).modal('show');
    
    // for all other modals, remove them once hidden
    $(container).on('hidden.bs.modal', () => {
        container.remove();
    });

    try {
        const result = await componentPromise;

        // use the default export by default, otherwise use the promise result
        const Modal = result.default || result;

        // hide the placeholder so we can add and show the real one
        $(placeholder).modal('hide');

        ReactDOM.render(<Modal {...props} />, container);

        $(container).children().modal('show');

    } catch (error) {
        errorNotification(error);
    }
}

function getPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'modal';

    // when the placeholder is hidden, remove it immediately
    $(placeholder).on('hide.bs.modal', () => {
        placeholder.remove();
    });

    return placeholder;
}