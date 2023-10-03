/**
 * Global.js
 * 
 * Generic functions which can be used by any webpage.
 */

class Node {
    constructor(tag, type=undefined, draggable=true) {
        this.instance = $(document.createElement(tag));
        if (type) {
            $(this.instance).addClass(type);
        }
    }

    text(content) {
        this.instance = $(this.instance).add(`<span>${content}</span>`);
        return this;
    }

    drag() {
        $(this.instance).addClass('draggable');
        $(this.instance).draggable();
        return this;
    }

    add(target='sandbox') {
        $(`#${target}`).append(this.instance);
        return this;
    }

    editable() {
        $(this.instance).prop('contenteditable', true);
    }

    build() {
        throw new Error('Method Not Implemented');
    }
}

class ShapeNode extends Node {
    build() {
        $(this.instance).addClass('shape');
        this.drag().add();
    }
}

class LabelNode extends Node {
    build(content='Placeholder', edit=true) {
        this.text(content).drag().add();

        if (edit) {
            this.editable();
        }
    }
}


$('.draggable').draggable({
    containment: 'parent',
    start: (event, ui) => {},
    drag : (event, ui) => {},
    stop : (event, ui) => {},
});

$('.option-card').click((event) => {
    // get the option type
    // TODO: have option-type field as generic type and add a detailed type field for specifics
    const optionType = $(event.target).data('option-type');
    if (optionType == null) {
        $($(event.target).children('i')[0]).data('option-type');
    }

    // check option type
    // TODO: pass label data here to avoid hard-coding
    if (optionType == 'textarea-t' || optionType == 'input-cursor-text') {
        new LabelNode('p').build();
        return;
    }

    // create and build a shape node
    new ShapeNode('span', optionType).build();
});