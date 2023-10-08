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
    // TODO: Lots of duplicated code: DRY
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

    constructor(tag, type=undefined, xpos=290, ypos=10) {
        // class logic
        this.type = type;
        this.text = undefined
        this.edit = false;
        this.draggable = false;

        // element logic
        this.element = $(document.createElement(tag));
        $(this.element).css({top: ypos, left: xpos, position:'absolute'});
        $(this.element).attr('is-node', true);
        if (type) {
            $(this.element).data('type', type);
            $(this.element).addClass(type);
        }

        // add node to list
        NodeType.nodes.push(this);
    }

    text(content) {
        this.text = content;
        this.element = $(this.element).append(`<span>${content}</span>`);
        return this;
    }

    drag() {
        this.draggable = true;
        $(this.element).addClass('draggable');
        $(this.element).draggable();
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
}

class ShapeNode extends NodeType {
    build() {
        $(this.element).addClass('shape');
        this.drag().add();
    }
}

class LabelNode extends NodeType {
    build(content='Placeholder', edit=true) {
        super.text(content).drag().add();

        if (edit) {
            this.editable();
        }
    }
}


class SceneManager {
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
                // TODO: pass label data here to avoid hard-coding
                if (node.type === 'textarea-t' || node.type === 'input-cursor-text') {
                    new LabelNode('p', node.type, node.ypos, node.xpos).build();
                } else {
                    new ShapeNode('span', node.type, node.ypos, node.xpos).build();
                }
            });
        });
    }
}


//
// Node Options
//

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
    // TODO: Shouldn't need to check three times to see if its null
    if (optionType == null) return;

    // check option type
    // TODO: pass label data here to avoid hard-coding
    if (optionType == 'textarea-t' || optionType == 'input-cursor-text') {
        new LabelNode('p', optionType).build();
        return;
    }

    // create and build a shape node
    new ShapeNode('span', optionType).build();
});


// 
// Scene Options
//

$(document).on('click', '.saved-scene', function() {
    const scene = SceneManager.getName($(this));
    SceneManager.activate(scene);
    SceneManager.load(SceneManager.getActiveSceneName());
});


$('#new-scene').click(() => {
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


$('#save-scene').click(() => {
    // get all the nodes on the scene & convert to objects
    const nodes = NodeType.nodes.map(node => ({
        type: node.type,
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


$('#delete-scene').click(event => {
    // TODO: Add confirmation modal

    // get scene name
    const scene_name = SceneManager.getActiveSceneName();

    // send a save request & notify user
    Request.delete(`/scene/${scene_name}`).then(function(response){
        new Toast('Action Completed', response).show();
        SceneManager.delete();
    });
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