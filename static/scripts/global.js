/**
 * Global.js
 * 
 * Generic functions which can be used by any webpage.
 */

//
// Utility Functions
//

function titleCase(str) {
    str = str.toLowerCase();
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}


function hashId() {
    return "10000000-1000-40".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


//
// Classes
//

class Toast {
    constructor(title, body, status=200) {
        // set the fields
        $('#toast-title').text(titleCase(title));
        $('#toast-body').text(body);
        $('#toast-status').text(status);
        // set the type of toast
        $('#toast-icon').removeClass('bi-exclamation-triangle').removeClass('bi-check-circle');
        $('#toast-header').removeClass('bg-danger').removeClass('bg-success');
        if (status >= 200 && status < 300) {
            $('#toast-header').addClass('bg-success');
            $('#toast-icon').addClass('bi-check-circle');
        } else {
            $('#toast-icon').addClass('bi-exclamation-triangle');
            $('#toast-header').addClass('bg-danger');
        }
    }

    static show() {
        new bootstrap.Toast($('#toast')).show();
    }

    show() {
        Toast.show();
    }
}


class Request {
    static post(endpoint, data, contentType='application/json') {
        return new Promise(function(resolve, _) {
            $.ajax({
                type: 'POST',
                url:  endpoint,
                data: JSON.stringify(data),
                contentType: contentType,
            }).done(function(data){
                // return a resolved promise with response
                resolve(data);
            }).fail(function(data){
                // handle failure via toasts
                new Toast(data.statusText, data.responseText, data.status).show();
            });
        });
    }

    static get(endpoint) {
        return new Promise(function(resolve, _) {
            $.ajax({
                type: 'GET',
                url:  endpoint
            }).done(function(data){
                // return a resolved promise with response
                resolve(data);
            }).fail(function(data){
                // handle failure via toasts
                new Toast(data.statusText, data.responseText, data.status).show();
            });
        });
    }

    static delete(endpoint) {
        return new Promise(function(resolve, _) {
            $.ajax({
                type: 'DELETE',
                url:  endpoint
            }).done(function(data){
                // return a resolved promise with response
                resolve(data);
            }).fail(function(data){
                // handle failure via toasts
                new Toast(data.statusText, data.responseText, data.status).show();
            });
        });
    }
}


class NodeType {
    static nodes = [];

    static isLabelNode(type) {
        return type === 'textarea-t' || type === 'input-cursor-text';
    }

    constructor(
        tag,
        type=undefined,
        xpos=290,
        ypos=10,
        text=undefined,
        font = 'Arial',
        size = 16,
        color='#343a40',
    ) {
        // class logic
        this.type = type;
        this.text = text
        this.edit = false;
        this.draggable = false;
        this.color = color;
        this.font = font;
        this.size = size;

        // element logic
        this.element = $(document.createElement(tag));
        $(this.element).css({top: ypos, left: xpos, position:'absolute', 'font-family':font});
        $(this.element).attr('is-node', true);
        this._init_context_menu();
        if (type) {
            $(this.element).data('type', type);
            $(this.element).addClass(type);
        }

        // add node to list
        NodeType.nodes.push(this);
    }

    _init_context_menu() {
        $(this.element).on('contextmenu', {instance: this}, function(event) {
            event.preventDefault();
            // assign colour functionality
            $('#colorpicker').val(event.data.instance.color);
            $('#colorpicker').off('input').on('input', {instance: event.data.instance}, function(event){
                event.data.instance.setColor(event.target.value);
            });

            // assign size functionality
            $('#node-size').val(event.data.instance.size);
            $('#node-size').off('change').change({instance: event.data.instance}, function(event){
                event.data.instance.setSize(event.target.value);
            });

            // assign font type functionality
            if (NodeType.isLabelNode(event.data.instance.type)) {
                $('#font-type-list').removeClass('d-none').addClass('d-flex');
                $('#font-type').val('');
                $('#font-type').attr('placeholder', event.data.instance.font);
                $('#font-type').off('change').change({instance: event.data.instance}, function(event) {
                    $(event.data.instance.element).css('font-family', event.target.value);
                    event.data.instance.font = event.target.value;
                });
            } else {
                $('#font-type-list').removeClass('d-flex').addClass('d-none');
            }

            // assign delete functionality
            $('#delete-node').off('click').on('click', {instance: event.data.instance}, function(event){
                $(event.data.instance.element).remove();
                $('#contextmenu').removeClass('show');

                // remove instance from array
                NodeType.nodes = NodeType.nodes.filter(function(e){
                    return e !== event.data.instance;
                 });
            });

            // move the menu & reveal it
            $('#contextmenu').css({top: event.pageY, left: event.pageX});
            $('#contextmenu').addClass('show');
        });
    }

    text(content) {
        this.text = content;
        this.element = $(this.element).html(content);
        return this;
    }

    drag() {
        this.draggable = true;
        $(this.element).addClass('draggable');
        $(this.element).draggable({containment: 'parent'});
        return this;
    }

    add(target='sandbox') {
        $(`#${target}`).append(this.element);
        return this;
    }

    editable() {
        this.edit = true;
        $(this.element).prop('contenteditable', true);
    }

    build() {
        throw new Error('Method Not Implemented');
    }

    setColor(value) {
        throw new Error('Method Not Implemented');
    }

    setSize(value) {
        throw new Error('Method Not Implemented');
    }
}

class ShapeNode extends NodeType {
    build() {
        $(this.element).addClass('shape');
        this.setSize(100);
        this.setColor(this.color);
        this.drag().add();
    }
    
    setColor(value) {
        this.color = value;
        $(this.element).css('background-color', value);
    }

    setSize(value) {
        this.size = value;
        $(this.element).width(value).height(value);
    }
}

class TriangleNode extends ShapeNode {
    setColor(value) {
        this.color = value;
        $(this.element).css('border-bottom', `${this.size}px solid ${value}`);
    }

    setSize(value) {
        this.size = value;
        $(this.element).css('border', `${value / 2}px solid transparent`);
        $(this.element).css('border-bottom', `${value}px solid ${this.color}`);
    }
}

class LabelNode extends NodeType {
    build(content='Placeholder', edit=true) {
        $(this.element).addClass('label');
        this.setSize(this.size);
        this.setColor(this.color);
        super.text(content).drag().add();

        if (edit) {
            this.editable();
        }
    }

    setColor(value) {
        this.color = value;
        $(this.element).css('color', value);
    }

    setSize(value) {
        this.size = value;
        $(this.element).css('font-size', `${value}px`);
    }
}


class SceneManager {
    static autosave = false;
    static template = '\
        <li class="list-group-item saved-scene" aria-current="true"> \
            <i class="bi bi-window me-2 text-white" width="8" height="8"></i> \
            <span>placeholder</span> \
        </li>';

    static getName(element) {
        return element.find('span').html();
    }

    static add(name=hashId()) {
        const scene = SceneManager.template.replace('placeholder', name); 
        $('#scene-list').prepend($.parseHTML(scene));
        this.activate(name);
        return name;
    }

    static activate(name) {
        const scenes = Object.values($('.saved-scene'));
        scenes.forEach(scene => {
            scene = $(scene);
            if (this.getName(scene) === name) {
                scene.addClass('active');
            } else {
                scene.removeClass('active');
            }
        });
    }

    static getActiveScene() {
        return $('.saved-scene.active')[0];
    }

    static getActiveSceneName() {
        return SceneManager.getName($(SceneManager.getActiveScene()));
    }

    static delete() {
        // delete this scene
        this.getActiveScene().remove();

        // choose the next active scene
        const scene = $($('.saved-scene')[0]);
        if (scene == null) {
            // node scenes left
            $('[is-node]').remove();
            NodeType.nodes = [];
        }
        const name = SceneManager.getName(scene);
        SceneManager.activate(name);

        // load the active scene
        SceneManager.load(name);
    }

    static load(scene_name) {
        // remove existing nodes
        $('[is-node]').remove();
        NodeType.nodes = [];

        if (scene_name == null) {
            return;
        }

        // load new scene
        Request.get(`/load/scene/${scene_name}`).then(function(response){
            // load the nodes onto the scene
            const nodes = JSON.parse(response['nodes']);
            nodes.forEach(node => {
                if (NodeType.isLabelNode(node.type)) {
                    new LabelNode(
                        'h1',
                        node.type,
                        node.ypos,
                        node.xpos,
                        node.text,
                        node.font,
                        node.size,
                        node.color
                    ).build(node.text);
                } else if (node.type === 'triangle') {
                    new TriangleNode(
                        'span',
                        node.type,
                        node.ypos,
                        node.xpos,
                        node.text,
                        node.font,
                        node.size,
                        node.color
                    ).build();
                } else {
                    new ShapeNode(
                        'span',
                        node.type,
                        node.ypos,
                        node.xpos,
                        node.text,
                        node.font,
                        node.size,
                        node.color
                    ).build();
                }
            });
        });
    }
}


//
// Node Options
//

$('.option-card').click((event) => {
    // get the option type
    let optionType = $(event.target).data('option-type');
    if (optionType == null) {
        optionType = $($(event.target).children('i')[0]).data('option-type');
    }

    // check option type
    if (NodeType.isLabelNode(optionType)) {
        return new LabelNode('h1', optionType).build();
    }

    if (optionType === 'triangle') {
        return new TriangleNode('span', optionType).build();
    }

    // create and build a shape node
    return new ShapeNode('span', optionType).build();
});


// 
// Scene Options
//

$(document).on('click', '.saved-scene', function() {
    // save the existing scene if enabled
    if (SceneManager.autosave) {
        $('#save-scene').click();
    }

    const scene = SceneManager.getName($(this));
    SceneManager.activate(scene);
    SceneManager.load(SceneManager.getActiveSceneName());
});


$('#new-scene').click(() => {
    // save the existing scene if enabled
    if (SceneManager.autosave) {
        $('#save-scene').click();
    }

    // add a new scene to sidebar
    const scene_name = SceneManager.add();
    
    // remove existing nodes
    $('[is-node]').remove();
    NodeType.nodes = [];

    // save the scene
    Request.post('/save/scene', {scene_id: scene_name}).then(function(response){
        new Toast('Action Complete', response).show();
    });
});


$('#save-scene').click(event => {
    // no scenes to save
    if ($('.saved-scene').length < 1) {
        return;
    }

    // update the text values
    NodeType.nodes.forEach(n => {
        n.text = $(n.element).html();

        // remove blank label nodes
        if (n instanceof LabelNode && n.text.length <  1) {
            $(n.element).remove();

            // remove instance from array
            NodeType.nodes = NodeType.nodes.filter(function(e){
                return e !== n;
            });
        }
    });

    // get all the nodes on the scene & convert to objects
    const nodes = NodeType.nodes.map(node => ({
        type: node.type,
        font: node.font,
        size: node.size,
        text: node.text,
        color: node.color,
        xpos: $(node.element).position().top,
        ypos: $(node.element).position().left,
    }));

    // create the post data
    const data = {
        'scene_id': SceneManager.getActiveSceneName(),
        'nodes': nodes
    }

    // send a save request & notify user
    Request.post('/save/scene', data).then(function(response){
        new Toast('Action Complete', response).show();
    });
});


$('#delete-scene').click(() => {
    // no scenes to delete
    if ($('.saved-scene').length < 1) {
        return;
    }

    // Show confirmation modal
    $('#confirmation-modal').modal('show');
});


$('#delete-scene-confirm').click(() => {
    // get scene name
    const scene_name = SceneManager.getActiveSceneName();

    // send a save request & notify user
    Request.delete(`/scene/${scene_name}`).then(function(response){
        new Toast('Action Completed', response).show();
        SceneManager.delete();
    });

    $('#confirmation-modal').modal('hide');
});

//
// Page Options
//
$(document).ready(function() {
    // set up tooltips
    const tooltips = [].slice.call($('[data-bs-toggle="tooltip"]'));
    tooltips.map(function(tooltip) {
        return new bootstrap.Tooltip(tooltip);
    });

    // check whether there are scenes to load
    if ($('.saved-scene').length < 1) {
        return;
    }

    // load the first scene
    const scene_name = SceneManager.getActiveSceneName();
    SceneManager.load(scene_name);
});


$(document).click(function(event) {
    // hide the context menu if user clicks outside of it
    if (!$(event.target).parents('#contextmenu').length
        && event.target.id !== 'contextmenu') {
        $('#contextmenu').removeClass('show');
    }
});


$('#autosave').click(function() {
    SceneManager.autosave = $(this).prop('checked');
    if (SceneManager.autosave) {
        $('#save-scene').click();
    }
});